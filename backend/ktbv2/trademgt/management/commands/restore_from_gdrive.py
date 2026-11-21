"""
Restore the PostgreSQL database and/or uploaded media from the Google Drive backups
produced by `backup_db_to_gdrive` and `backup_media_to_gdrive`.

Examples
--------
  # What is available?
  python manage.py restore_from_gdrive --list

  # Restore the newest DB backup into a *scratch* database first (safe dry run)
  python manage.py restore_from_gdrive --db latest --target-db ktbv2_restore_test

  # Restore the newest DB backup over the live database (asks for confirmation)
  python manage.py restore_from_gdrive --db latest

  # Restore a specific backup, or a local .sql.gz file
  python manage.py restore_from_gdrive --db ktbv2_db_backup_2026-11-21_02-00-04.sql.gz
  python manage.py restore_from_gdrive --db-file /path/to/dump.sql.gz

  # Download media files back into MEDIA_ROOT (skips files already present)
  python manage.py restore_from_gdrive --media

  # Only check which files referenced in the DB are missing on disk
  python manage.py restore_from_gdrive --verify-media

Stop the backend, celery worker and celery beat before restoring over the live DB.
The DB restore runs in ONE transaction: if anything fails, the database is left untouched.
"""
import gzip
import hashlib
import io
import os
import re
import shutil
import subprocess
import tempfile
from collections import defaultdict
from datetime import datetime

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from trademgt.gdrive_service import FOLDER_MIME, folders_named, index_tree, list_children

DB_BACKUP_FOLDER = 'Database_Backups'
# Top-level folders under the Drive root that mirror MEDIA_ROOT 1:1
# (written by the nightly `backup_media_to_gdrive` sweep).
DEFAULT_MEDIA_FOLDERS = ['uploads', 'company']

# psql versions that understand the `\restrict` meta-command emitted by newer pg_dump
_RESTRICT_MIN_MINOR = {13: 22, 14: 19, 15: 14, 16: 10, 17: 6}

# Dropped inside the restore transaction before the dump is replayed.
# Only touches objects in the public schema; does not need schema ownership.
WIPE_PUBLIC_SQL = r"""
SET lock_timeout = '30s';
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT matviewname AS n FROM pg_matviews WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP MATERIALIZED VIEW IF EXISTS public.%I CASCADE', r.n);
  END LOOP;
  FOR r IN SELECT viewname AS n FROM pg_views WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP VIEW IF EXISTS public.%I CASCADE', r.n);
  END LOOP;
  FOR r IN SELECT tablename AS n FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', r.n);
  END LOOP;
  FOR r IN SELECT sequence_name AS n FROM information_schema.sequences WHERE sequence_schema = 'public' LOOP
    EXECUTE format('DROP SEQUENCE IF EXISTS public.%I CASCADE', r.n);
  END LOOP;
END $$;
"""


class Command(BaseCommand):
    help = 'Restore the PostgreSQL database and/or media files from Google Drive backups.'

    def add_arguments(self, parser):
        parser.add_argument('--list', action='store_true', help='List available DB backups on Google Drive.')
        parser.add_argument('--db', metavar='NAME|latest',
                            help="Restore a DB backup from Drive ('latest' or an exact file name).")
        parser.add_argument('--db-file', metavar='PATH', help='Restore from a local .sql or .sql.gz file.')
        parser.add_argument('--target-db', metavar='DBNAME',
                            help='Restore into this database instead of the configured one '
                                 '(created if missing). Use it to test a backup safely.')
        parser.add_argument('--no-safety-backup', action='store_true',
                            help='Skip the local pg_dump of the current DB taken before overwriting it.')
        parser.add_argument('--media', action='store_true', help='Restore media files from Drive into MEDIA_ROOT.')
        parser.add_argument('--media-dest', metavar='DIR',
                            help='Directory to restore media into (default: MEDIA_ROOT).')
        parser.add_argument('--media-folders', nargs='+', default=DEFAULT_MEDIA_FOLDERS, metavar='FOLDER',
                            help=f'Top-level Drive folders that mirror MEDIA_ROOT (default: {DEFAULT_MEDIA_FOLDERS}).')
        parser.add_argument('--overwrite', action='store_true',
                            help='Re-download media files even if a local file with the same size exists.')
        parser.add_argument('--no-fallback', action='store_true',
                            help="Don't search the per-TRN/KYC folders for DB-referenced files missing from the mirror.")
        parser.add_argument('--verify-media', action='store_true',
                            help='Report files referenced in the DB that are missing on disk.')
        parser.add_argument('--yes', action='store_true', help='Do not ask for confirmation.')
        parser.add_argument('--force', action='store_true',
                            help='Proceed even if other sessions are connected to the target database.')

    # ------------------------------------------------------------------ entry
    def handle(self, *args, **opts):
        if not any([opts['list'], opts['db'], opts['db_file'], opts['media'], opts['verify_media']]):
            raise CommandError('Nothing to do. Use --list, --db, --db-file, --media or --verify-media (see --help).')
        if opts['db'] and opts['db_file']:
            raise CommandError('Use either --db or --db-file, not both.')

        self._service = None
        if opts['list']:
            self.list_db_backups()
        if opts['db'] or opts['db_file']:
            self.restore_db(opts)
        if opts['media']:
            self.restore_media(opts)
        if opts['verify_media'] and not opts['media']:
            self.verify_media(opts.get('media_dest') or settings.MEDIA_ROOT)

    # ------------------------------------------------------------ drive utils
    @property
    def service(self):
        if self._service is None:
            from trademgt.gdrive_service import get_drive_service
            self._service = get_drive_service()
        return self._service

    @property
    def root_id(self):
        root = getattr(settings, 'GOOGLE_DRIVE_FOLDER_ID', None)
        if not root:
            raise CommandError('GOOGLE_DRIVE_FOLDER_ID is not configured.')
        return root

    def _list_children(self, parent_ids, extra_q=''):
        return list_children(self.service, parent_ids, extra_q)

    def _folders_named(self, parent_id, name):
        return folders_named(self.service, parent_id, name)

    def _download(self, file_id, dest_path, expected_md5=None):
        from googleapiclient.http import MediaIoBaseDownload
        os.makedirs(os.path.dirname(dest_path) or '.', exist_ok=True)
        tmp_path = dest_path + '.part'
        md5 = hashlib.md5()
        with open(tmp_path, 'wb') as fh:
            request = self.service.files().get_media(fileId=file_id, supportsAllDrives=True)
            buf = io.BytesIO()
            downloader = MediaIoBaseDownload(buf, request, chunksize=8 * 1024 * 1024)
            done = False
            while not done:
                _, done = downloader.next_chunk()
                data = buf.getvalue()
                fh.write(data)
                md5.update(data)
                buf.seek(0)
                buf.truncate()
        if expected_md5 and md5.hexdigest() != expected_md5:
            os.remove(tmp_path)
            raise CommandError(f'Checksum mismatch downloading {dest_path}')
        os.replace(tmp_path, dest_path)

    def _db_backups(self):
        folders = self._folders_named(self.root_id, DB_BACKUP_FOLDER)
        if not folders:
            raise CommandError(f"No '{DB_BACKUP_FOLDER}' folder found in the Drive backup folder.")
        files = [f for f in self._list_children([f['id'] for f in folders])
                 if f['mimeType'] != FOLDER_MIME and f['name'].endswith(('.sql.gz', '.sql'))]
        return sorted(files, key=lambda f: f['modifiedTime'], reverse=True)

    # ------------------------------------------------------------------- list
    def list_db_backups(self):
        backups = self._db_backups()
        self.stdout.write(self.style.NOTICE(f'{len(backups)} database backups on Google Drive (newest first):'))
        for f in backups:
            size_mb = int(f.get('size', 0)) / (1024 * 1024)
            self.stdout.write(f"  {f['name']:<50} {size_mb:7.2f} MB   uploaded {f['modifiedTime']}")

    # --------------------------------------------------------------- DB restore
    def _pg_env(self, db):
        env = os.environ.copy()
        if db.get('PASSWORD'):
            env['PGPASSWORD'] = str(db['PASSWORD'])
        return env

    def _psql_args(self, db, dbname):
        return ['psql', '-X', '-q', '-h', str(db.get('HOST') or 'localhost'), '-p', str(db.get('PORT') or 5432),
                '-U', str(db['USER']), '-d', dbname]

    def _psql_scalar(self, db, dbname, sql):
        res = subprocess.run(self._psql_args(db, dbname) + ['-At', '-v', 'ON_ERROR_STOP=1', '-c', sql],
                             env=self._pg_env(db), capture_output=True, text=True)
        if res.returncode != 0:
            raise CommandError(f'psql failed: {res.stderr.strip()}')
        return res.stdout.strip()

    @staticmethod
    def _psql_supports_restrict():
        try:
            out = subprocess.run(['psql', '--version'], capture_output=True, text=True).stdout
        except FileNotFoundError:
            raise CommandError('psql not found. Install postgresql-client.')
        m = re.search(r'(\d+)\.(\d+)', out)
        if not m:
            return False
        major, minor = int(m.group(1)), int(m.group(2))
        return major >= 18 or (major in _RESTRICT_MIN_MINOR and minor >= _RESTRICT_MIN_MINOR[major])

    def _open_dump(self, path):
        with open(path, 'rb') as fh:
            is_gzip = fh.read(2) == b'\x1f\x8b'
        return gzip.open(path, 'rb') if is_gzip else open(path, 'rb')

    def _validate_dump(self, path):
        """Read the whole file (catches truncated/corrupt gzip) and check it is a complete pg_dump."""
        tail = b''
        with self._open_dump(path) as fh:
            head = fh.read(4096)
            tail = head
            for chunk in iter(lambda: fh.read(1024 * 1024), b''):
                tail = (tail + chunk)[-4096:]
        if b'PostgreSQL database dump' not in head:
            raise CommandError(f'{path} does not look like a plain-format pg_dump file.')
        if b'PostgreSQL database dump complete' not in tail:
            raise CommandError(f'{path} is incomplete (missing "dump complete" footer). Pick another backup.')

    def _safety_dump(self, db, dbname):
        out_dir = os.path.join(settings.BASE_DIR, 'backups')
        os.makedirs(out_dir, exist_ok=True)
        path = os.path.join(out_dir, f"pre_restore_{dbname}_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.sql.gz")
        self.stdout.write(f'Taking safety backup of current "{dbname}" -> {path}')
        cmd = ['pg_dump', '-h', str(db.get('HOST') or 'localhost'), '-p', str(db.get('PORT') or 5432),
               '-U', str(db['USER']), '-d', dbname, '--no-owner', '--no-privileges']
        with gzip.open(path, 'wb') as gz:
            proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=self._pg_env(db))
            shutil.copyfileobj(proc.stdout, gz, 1024 * 1024)
            err = proc.stderr.read().decode(errors='ignore')
            proc.wait()
        if proc.returncode != 0:
            os.remove(path)
            raise CommandError(f'Safety backup failed, aborting restore:\n{err}')
        return path

    def restore_db(self, opts):
        db = settings.DATABASES['default']
        if 'postgresql' not in db.get('ENGINE', ''):
            raise CommandError('Only PostgreSQL is supported.')
        target = opts.get('target_db') or db['NAME']
        is_live = target == db['NAME']

        tmpdir = tempfile.mkdtemp(prefix='ktb_restore_')
        try:
            # 1. Get the dump file
            if opts.get('db_file'):
                dump_path = opts['db_file']
                if not os.path.exists(dump_path):
                    raise CommandError(f'File not found: {dump_path}')
                label = dump_path
            else:
                backups = self._db_backups()
                if not backups:
                    raise CommandError('No database backups found on Google Drive.')
                if opts['db'] == 'latest':
                    chosen = backups[0]
                else:
                    matches = [f for f in backups if f['name'] == opts['db']]
                    if not matches:
                        raise CommandError(f"Backup '{opts['db']}' not found. Use --list to see names.")
                    chosen = matches[0]
                label = chosen['name']
                dump_path = os.path.join(tmpdir, chosen['name'])
                self.stdout.write(f"Downloading {chosen['name']} ({int(chosen.get('size', 0)) / 1048576:.2f} MB)...")
                self._download(chosen['id'], dump_path, chosen.get('md5Checksum'))

            self.stdout.write('Validating dump...')
            self._validate_dump(dump_path)

            # 2. Make sure target DB exists
            exists = self._psql_scalar(
                db, 'postgres', f"SELECT 1 FROM pg_database WHERE datname = '{target.replace(chr(39), '')}'") == '1'
            if not exists:
                if is_live:
                    raise CommandError(f'Configured database "{target}" does not exist. Create it first.')
                self.stdout.write(f'Creating database "{target}"...')
                self._psql_scalar(db, 'postgres', f'CREATE DATABASE "{target}"')

            server_ver = int(self._psql_scalar(db, target, 'SHOW server_version_num'))
            n_tables = int(self._psql_scalar(
                db, target, "SELECT count(*) FROM pg_tables WHERE schemaname = 'public'"))
            others = self._psql_scalar(
                db, target,
                "SELECT string_agg(coalesce(nullif(application_name,''),'?') || '@' || coalesce(client_addr::text,'local'), ', ') "
                "FROM pg_stat_activity WHERE datname = current_database() AND pid <> pg_backend_pid()")

            # 3. Confirm
            self.stdout.write(self.style.WARNING(
                f'\nAbout to restore  {label}\n'
                f'          into    database "{target}" on {db.get("HOST")}:{db.get("PORT")} '
                f'(PostgreSQL {server_ver // 10000})\n'
                f'This DROPS all {n_tables} existing tables in the public schema of "{target}".'))
            if others:
                msg = f'Other sessions are connected to "{target}": {others}'
                if not opts['force']:
                    raise CommandError(msg + '\nStop the backend / celery (or pass --force) and retry.')
                self.stdout.write(self.style.WARNING(msg))
            if not opts['yes']:
                answer = input(f'Type the database name ({target}) to continue: ').strip()
                if answer != target:
                    raise CommandError('Aborted.')

            # 4. Safety backup of what we are about to overwrite
            if n_tables and not opts['no_safety_backup']:
                safety = self._safety_dump(db, target)
                self.stdout.write(self.style.SUCCESS(f'  safety backup saved: {safety}'))

            # 5. Replay the dump in a single transaction
            self._replay(db, target, dump_path, strip_tx_timeout=server_ver < 170000)

            restored = self._psql_scalar(db, target, "SELECT count(*) FROM pg_tables WHERE schemaname = 'public'")
            last_mig = self._psql_scalar(db, target, 'SELECT max(applied)::text FROM django_migrations')
            self.stdout.write(self.style.SUCCESS(
                f'\n✓ Restored {label} into "{target}" ({restored} tables, last migration applied {last_mig}).'))
            self.stdout.write('  If the code is newer than the backup, run:  python manage.py migrate')
        finally:
            shutil.rmtree(tmpdir, ignore_errors=True)

    def _replay(self, db, target, dump_path, strip_tx_timeout):
        keep_restrict = self._psql_supports_restrict()
        skip = [re.compile(rb'^COMMENT ON SCHEMA public IS ')]  # needs schema ownership; cosmetic
        if strip_tx_timeout:
            skip.append(re.compile(rb'^SET transaction_timeout'))  # PG17+ only setting
        if not keep_restrict:
            skip.append(re.compile(rb'^\\(un)?restrict '))  # meta-command unknown to older psql

        cmd = self._psql_args(db, target) + ['-v', 'ON_ERROR_STOP=1', '--single-transaction']
        self.stdout.write('Restoring (single transaction — all or nothing)...')
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL,
                                stderr=subprocess.PIPE, env=self._pg_env(db))
        try:
            proc.stdin.write(WIPE_PUBLIC_SQL.encode())
            with self._open_dump(dump_path) as fh:
                for line in fh:
                    if any(p.match(line) for p in skip):
                        continue
                    proc.stdin.write(line)
            proc.stdin.close()
        except BrokenPipeError:
            pass  # psql stopped early; error is reported below
        err = proc.stderr.read().decode(errors='ignore')
        proc.wait()
        if proc.returncode != 0:
            errors = [l for l in err.splitlines() if re.match(r'^(psql:.*)?(ERROR|FATAL|LINE \d+)', l)]
            raise CommandError(f'Restore FAILED and was rolled back — database "{target}" is unchanged.\n'
                               + '\n'.join(errors[-10:] or err.splitlines()[-10:]))

    # ------------------------------------------------------------ media restore
    def _walk(self, folder_ids, prefix, files_out):
        index_tree(self.service, folder_ids, prefix, files_out)

    def restore_media(self, opts):
        dest_root = opts.get('media_dest') or settings.MEDIA_ROOT
        os.makedirs(dest_root, exist_ok=True)
        self.stdout.write(self.style.NOTICE(f'Indexing media mirror on Google Drive ({", ".join(opts["media_folders"])})...'))

        mirror = defaultdict(list)
        for name in opts['media_folders']:
            folders = self._folders_named(self.root_id, name)
            if not folders:
                self.stdout.write(self.style.WARNING(f"  no '{name}' folder on Drive, skipping"))
                continue
            self._walk([f['id'] for f in folders], name, mirror)
        copies = sum(len(v) for v in mirror.values())
        self.stdout.write(f'  {len(mirror)} unique files ({copies} copies on Drive)')

        stats = self._download_set({rel: newest(items) for rel, items in mirror.items()}, dest_root, opts['overwrite'])

        if not opts['no_fallback']:
            missing = self._missing_db_files(dest_root)
            if missing:
                self.stdout.write(self.style.NOTICE(
                    f'{len(missing)} DB-referenced files not in the mirror; searching per-TRN/KYC folders by file name...'))
                fallback = self._fallback_lookup(missing, set(opts['media_folders']))
                fstats = self._download_set(fallback, dest_root, opts['overwrite'])
                for k in stats:
                    stats[k] += fstats[k]

        self.stdout.write(self.style.SUCCESS(
            f"\n✓ Media restore done: {stats['downloaded']} downloaded, {stats['skipped']} already present, "
            f"{stats['failed']} failed → {dest_root}"))
        self.verify_media(dest_root)

    def _download_set(self, wanted, dest_root, overwrite):
        stats = {'downloaded': 0, 'skipped': 0, 'failed': 0}
        total = len(wanted)
        for i, (rel, item) in enumerate(sorted(wanted.items()), 1):
            dest = os.path.join(dest_root, *rel.split('/'))
            if (not overwrite and os.path.exists(dest)
                    and str(os.path.getsize(dest)) == str(item.get('size'))):
                stats['skipped'] += 1
                continue
            try:
                self._download(item['id'], dest, item.get('md5Checksum'))
                stats['downloaded'] += 1
                self.stdout.write(f'  [{i}/{total}] {rel}')
            except Exception as e:  # keep going; report at the end
                stats['failed'] += 1
                self.stdout.write(self.style.ERROR(f'  [{i}/{total}] FAILED {rel}: {e}'))
        return stats

    def _fallback_lookup(self, missing_paths, mirror_folder_names):
        """Files uploaded since the last nightly sweep only exist in the per-TRN/KYC folders
        (named by the post_save signals). Match them by file name when the match is unambiguous."""
        top = [f for f in self._list_children([self.root_id], f" and mimeType = '{FOLDER_MIME}'")
               if f['name'] not in mirror_folder_names and f['name'] != DB_BACKUP_FOLDER]
        index = defaultdict(list)
        if top:
            by_path = defaultdict(list)
            self._walk([f['id'] for f in top], '', by_path)
            for items in by_path.values():
                for it in items:
                    index[it['name']].append(it)
        found = {}
        for rel in missing_paths:
            candidates = index.get(os.path.basename(rel), [])
            distinct = {c.get('md5Checksum') or c['id'] for c in candidates}
            if len(distinct) == 1:
                found[rel] = newest(candidates)
            elif len(distinct) > 1:
                self.stdout.write(self.style.WARNING(f'  ambiguous: {rel} has {len(distinct)} different matches, skipped'))
        self.stdout.write(f'  recovered {len(found)} of {len(missing_paths)} from per-TRN/KYC folders')
        return found

    # ------------------------------------------------------------------ verify
    def _missing_db_files(self, media_root):
        """Paths stored in FileField/ImageField columns that don't exist under media_root."""
        from django.apps import apps
        from django.db import models
        from django.db.utils import DatabaseError

        missing = set()
        for model in apps.get_models():
            fields = [f.name for f in model._meta.get_fields()
                      if isinstance(f, models.FileField) and not f.many_to_many]
            if not fields:
                continue
            try:
                for row in model._default_manager.values_list(*fields).iterator():
                    for name in row:
                        if name and not os.path.exists(os.path.join(media_root, name)):
                            missing.add(name)
            except DatabaseError as e:
                self.stdout.write(self.style.WARNING(f'  could not check {model.__name__}: {e}'))
        return sorted(missing)

    def verify_media(self, media_root):
        missing = self._missing_db_files(media_root)
        if not missing:
            self.stdout.write(self.style.SUCCESS('✓ Every file referenced in the database exists on disk.'))
            return
        self.stdout.write(self.style.WARNING(f'{len(missing)} files referenced in the database are missing on disk:'))
        for name in missing[:50]:
            self.stdout.write(f'  - {name}')
        if len(missing) > 50:
            self.stdout.write(f'  ... and {len(missing) - 50} more')


def newest(items):
    return max(items, key=lambda f: f['modifiedTime'])
