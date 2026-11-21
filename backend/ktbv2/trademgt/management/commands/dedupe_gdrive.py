"""
Remove duplicate copies from the Google Drive backup folder.

A file is a duplicate only if another copy exists at the SAME path (after merging
same-named duplicate folders) with the SAME MD5 checksum. Distinct versions are always kept.
Duplicates are moved to Drive's trash (recoverable for ~30 days), never permanently deleted.

Which copy is kept: the one inside the "canonical" folder chain (the oldest folder of each
name, which is where new uploads go), otherwise the newest copy. Folders whose contents are
all duplicates are trashed as a whole, which takes far fewer API calls than file-by-file.

  python manage.py dedupe_gdrive                 # report only (dry run)
  python manage.py dedupe_gdrive --execute       # actually move duplicates to trash
  python manage.py dedupe_gdrive --mirror-only   # only the uploads/ + company/ mirror

Stop celery worker/beat while running with --execute so no uploads happen mid-cleanup.
"""
import time
from collections import defaultdict

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from trademgt.gdrive_service import FOLDER_MIME, get_drive_service, list_children

DB_BACKUP_FOLDER = 'Database_Backups'
MIRROR_FOLDERS = ['uploads', 'company']
BATCH_SIZE = 50
RETRYABLE_REASONS = {'rateLimitExceeded', 'userRateLimitExceeded', 'backendError', 'internalError'}


class Command(BaseCommand):
    help = 'Move exact duplicate files (same path + MD5) in the Google Drive backup folder to trash.'

    def add_arguments(self, parser):
        parser.add_argument('--execute', action='store_true',
                            help='Actually move duplicates to trash (default is a dry-run report).')
        parser.add_argument('--mirror-only', action='store_true',
                            help=f'Only clean the media mirror folders {MIRROR_FOLDERS}, '
                                 'not the per-TRN/KYC folders.')
        parser.add_argument('--yes', action='store_true', help='Do not ask for confirmation with --execute.')

    # ------------------------------------------------------------------ index
    def _index(self, service, root_id, mirror_only):
        """Walk the tree. Returns (folders, files):
        folders[id] = {'id', 'name', 'rel', 'parent', 'created', 'canonical'}
        files = list of Drive file dicts with an added 'rel' and 'parent'."""
        top = [f for f in list_children(service, [root_id], f" and mimeType = '{FOLDER_MIME}'")
               if f['name'] != DB_BACKUP_FOLDER and (not mirror_only or f['name'] in MIRROR_FOLDERS)]

        folders, files = {}, []
        canonical_ids = {root_id}
        level = [(f, root_id, '') for f in top]
        depth = 0
        while level:
            depth += 1
            # Register this level's folders and decide which one of each name is canonical:
            # the oldest folder whose parent is itself canonical.
            groups = defaultdict(list)
            for f, parent, parent_rel in level:
                rel = f"{parent_rel}/{f['name']}" if parent_rel else f['name']
                folders[f['id']] = {'id': f['id'], 'name': f['name'], 'rel': rel, 'parent': parent,
                                    'created': f.get('createdTime', ''), 'canonical': False}
                groups[rel].append(folders[f['id']])
            for group in groups.values():
                candidates = [g for g in group if g['parent'] in canonical_ids]
                if candidates:
                    winner = min(candidates, key=lambda g: g['created'])
                    winner['canonical'] = True
                    canonical_ids.add(winner['id'])

            ids = [f['id'] for f, _, _ in level]
            self.stdout.write(f'  depth {depth}: scanning {len(ids)} folders...')
            next_level = []
            for item in list_children(service, ids):
                parent = next((p for p in item.get('parents', []) if p in folders), None)
                if parent is None:
                    continue
                if item['mimeType'] == FOLDER_MIME:
                    next_level.append((item, parent, folders[parent]['rel']))
                else:  # incl. Google-native docs: no MD5, so they are always kept
                    item['rel'] = f"{folders[parent]['rel']}/{item['name']}"
                    item['parent'] = parent
                    files.append(item)
            level = next_level
        return folders, files

    # ------------------------------------------------------------------- plan
    def _plan(self, folders, files):
        groups = defaultdict(list)
        for f in files:
            if f.get('md5Checksum'):  # never touch files we can't compare
                groups[(f['rel'], f['md5Checksum'])].append(f)

        keep, dupes = [], []
        for copies in groups.values():
            copies.sort(key=lambda c: c['modifiedTime'], reverse=True)  # newest first...
            copies.sort(key=lambda c: (not folders[c['parent']]['canonical'],  # ...canonical wins
                                       folders[c['parent']]['created']))
            keep.append(copies[0])
            dupes.extend(copies[1:])
        # Files without an MD5 are kept as-is.
        keep.extend(f for f in files if not f.get('md5Checksum'))

        # Folders that hold (directly or below) at least one kept file must stay.
        kept_folders = set()
        for f in keep:
            fid = f['parent']
            while fid in folders and fid not in kept_folders:
                kept_folders.add(fid)
                fid = folders[fid]['parent']
        has_files = set()
        for f in files:
            fid = f['parent']
            while fid in folders and fid not in has_files:
                has_files.add(fid)
                fid = folders[fid]['parent']

        trashable = {fid for fid in has_files if fid not in kept_folders}
        top_trash_folders = [folders[fid] for fid in trashable if folders[fid]['parent'] not in trashable]

        def under_trashed(fid):
            while fid in folders:
                if fid in trashable:
                    return True
                fid = folders[fid]['parent']
            return False

        file_trash = [d for d in dupes if not under_trashed(d['parent'])]
        return keep, dupes, top_trash_folders, file_trash

    # ---------------------------------------------------------------- execute
    def _trash_all(self, service, ids):
        """Trash ids using batched requests with retry/backoff on rate limits."""
        from googleapiclient.errors import HttpError

        pending, failed, done = list(ids), {}, 0
        attempt = 0
        while pending and attempt < 6:
            retry = []
            for i in range(0, len(pending), BATCH_SIZE):
                chunk = pending[i:i + BATCH_SIZE]
                results = {}

                def cb(request_id, response, exception, results=results):
                    results[request_id] = exception

                batch = service.new_batch_http_request(callback=cb)
                for fid in chunk:
                    batch.add(service.files().update(fileId=fid, body={'trashed': True},
                                                     supportsAllDrives=True, fields='id'),
                              request_id=fid)
                try:
                    batch.execute()
                except HttpError as e:  # whole batch failed
                    results = {fid: e for fid in chunk}

                for fid in chunk:
                    exc = results.get(fid)
                    if exc is None:
                        done += 1
                        continue
                    status = getattr(getattr(exc, 'resp', None), 'status', None)
                    reason = ''
                    try:
                        reason = exc.error_details[0].get('reason', '') if exc.error_details else ''
                    except Exception:
                        pass
                    if status == 404:  # already gone (e.g. parent folder was trashed)
                        done += 1
                    elif status in (429, 500, 502, 503) or reason in RETRYABLE_REASONS:
                        retry.append(fid)
                    else:
                        failed[fid] = str(exc)
                self.stdout.write(f'\r  trashed {done}/{len(ids)}', ending='')
                self.stdout.flush()
            pending = retry
            if pending:
                attempt += 1
                wait = min(2 ** attempt * 5, 120)
                self.stdout.write(f'\n  rate limited on {len(pending)} items, retrying in {wait}s...')
                time.sleep(wait)
        for fid in pending:
            failed[fid] = 'gave up after repeated rate limiting'
        self.stdout.write('')
        return done, failed

    # ------------------------------------------------------------------ entry
    def handle(self, *args, **opts):
        root_id = getattr(settings, 'GOOGLE_DRIVE_FOLDER_ID', None)
        if not root_id:
            raise CommandError('GOOGLE_DRIVE_FOLDER_ID is not configured.')
        service = get_drive_service()

        self.stdout.write(self.style.NOTICE('Indexing Google Drive backup folder (Database_Backups is never touched)...'))
        folders, files = self._index(service, root_id, opts['mirror_only'])
        keep, dupes, trash_folders, trash_files = self._plan(folders, files)

        dup_bytes = sum(int(d.get('size', 0)) for d in dupes)
        self.stdout.write(self.style.NOTICE(
            f'\n{len(files)} files in {len(folders)} folders\n'
            f'  keep:       {len(keep)} files\n'
            f'  duplicates: {len(dupes)} files ({dup_bytes / 1048576:.1f} MB)\n'
            f'  -> trash {len(trash_folders)} whole duplicate folders + {len(trash_files)} individual files '
            f'({len(trash_folders) + len(trash_files)} API calls)'))

        worst = defaultdict(int)
        for d in dupes:
            worst[d['rel']] += 1
        if worst:
            self.stdout.write('  most duplicated:')
            for rel, n in sorted(worst.items(), key=lambda x: -x[1])[:8]:
                self.stdout.write(f'    {n + 1:>5} copies  {rel}')

        if not dupes:
            self.stdout.write(self.style.SUCCESS('✓ No duplicates found.'))
            return
        if not opts['execute']:
            self.stdout.write(self.style.WARNING('\nDry run — nothing changed. Re-run with --execute to move duplicates to trash.'))
            return

        if not opts['yes']:
            if input(f'\nMove {len(dupes)} duplicate files to Drive trash? Type "yes": ').strip().lower() != 'yes':
                raise CommandError('Aborted.')

        ids = [f['id'] for f in trash_folders] + [f['id'] for f in trash_files]
        done, failed = self._trash_all(service, ids)
        if failed:
            self.stdout.write(self.style.ERROR(f'{len(failed)} items could not be trashed, e.g.:'))
            for fid, err in list(failed.items())[:5]:
                self.stdout.write(f'  {fid}: {err[:200]}')
        self.stdout.write(self.style.SUCCESS(
            f'✓ Done: {done} of {len(ids)} items moved to trash. '
            f'Trashed items can be restored from Drive trash for ~30 days.'))
