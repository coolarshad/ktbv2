import os
import gzip
import subprocess
import tempfile
import logging
from datetime import datetime
from django.core.management.base import BaseCommand
from django.conf import settings
from trademgt.gdrive_service import upload_file_to_drive

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Dumps the PostgreSQL database, compresses it with gzip, and uploads it to Google Drive.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force upload even if GOOGLE_DRIVE_AUTO_BACKUP is disabled in settings.'
        )
        parser.add_argument(
            '--keep-local',
            action='store_true',
            help='Keep a copy of the compressed dump file locally after uploading.'
        )
        parser.add_argument(
            '--output-dir',
            type=str,
            default=None,
            help='Local directory to store the dump (defaults to system tempdir).'
        )

    def handle(self, *args, **options):
        auto_backup_enabled = getattr(settings, 'GOOGLE_DRIVE_AUTO_BACKUP', False)
        force = options.get('force', False)

        if not auto_backup_enabled and not force:
            self.stdout.write(self.style.WARNING(
                "GOOGLE_DRIVE_AUTO_BACKUP is disabled in settings. Use --force to run anyway."
            ))
            return

        db_settings = settings.DATABASES.get('default', {})
        engine = db_settings.get('ENGINE', '')
        if 'postgresql' not in engine:
            self.stdout.write(self.style.ERROR(
                f"Unsupported database engine for pg_dump: {engine}. Only PostgreSQL is supported."
            ))
            return

        db_name = db_settings.get('NAME')
        db_user = db_settings.get('USER')
        db_password = db_settings.get('PASSWORD')
        db_host = db_settings.get('HOST', 'localhost')
        db_port = str(db_settings.get('PORT', 5432))

        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
        dump_filename = f"{db_name}_backup_{timestamp}.sql.gz"

        out_dir = options.get('output_dir') or tempfile.gettempdir()
        os.makedirs(out_dir, exist_ok=True)
        dump_filepath = os.path.join(out_dir, dump_filename)

        self.stdout.write(self.style.NOTICE(f"Creating PostgreSQL dump: {dump_filename}..."))

        env = os.environ.copy()
        if db_password:
            env['PGPASSWORD'] = str(db_password)

        pg_dump_cmd = [
            'pg_dump',
            '-h', str(db_host),
            '-p', str(db_port),
            '-U', str(db_user),
            '-d', str(db_name),
            '--no-owner',
            '--no-privileges',
        ]

        try:
            # Stream pg_dump stdout directly into a gzip compressed file
            with open(dump_filepath, 'wb') as f_out:
                with gzip.GzipFile(fileobj=f_out, mode='wb') as gz_out:
                    proc = subprocess.Popen(
                        pg_dump_cmd,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        env=env
                    )
                    for chunk in iter(lambda: proc.stdout.read(65536), b''):
                        gz_out.write(chunk)
                    stderr = proc.stderr.read()
                    proc.wait()

            if proc.returncode != 0:
                err_msg = stderr.decode('utf-8', errors='ignore')
                self.stdout.write(self.style.ERROR(f"pg_dump failed with exit code {proc.returncode}:\n{err_msg}"))
                if os.path.exists(dump_filepath):
                    os.remove(dump_filepath)
                return

            file_size_mb = os.path.getsize(dump_filepath) / (1024 * 1024)
            self.stdout.write(self.style.SUCCESS(
                f"Dump created successfully ({file_size_mb:.2f} MB). Uploading to Google Drive..."
            ))

            # Upload to Google Drive under 'Database_Backups' folder
            result = upload_file_to_drive(
                local_file_path=dump_filepath,
                destination_filename=dump_filename,
                subfolder_name='Database_Backups'
            )

            if result:
                self.stdout.write(self.style.SUCCESS(
                    f"✓ Database backup successfully uploaded to Google Drive!\n"
                    f"  File: {result.get('name')}\n"
                    f"  Google Drive ID: {result.get('id')}"
                ))
            else:
                self.stdout.write(self.style.ERROR("Failed to upload dump to Google Drive."))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error during backup process: {e}"))
            logger.error(f"[DB Backup] Error: {e}", exc_info=True)
        finally:
            if not options.get('keep_local') and os.path.exists(dump_filepath):
                try:
                    os.remove(dump_filepath)
                except Exception:
                    pass
