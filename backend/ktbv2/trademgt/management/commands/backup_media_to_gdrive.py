import os
from django.core.management.base import BaseCommand
from django.conf import settings
from trademgt.gdrive_service import upload_file_to_drive

class Command(BaseCommand):
    help = 'Uploads all existing local media files to the configured Google Drive backup folder.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--subfolder',
            type=str,
            default=None,
            help='Optionally specify a subfolder inside media/ to backup (e.g. uploads/lois)'
        )

    def handle(self, *args, **options):
        media_root = settings.MEDIA_ROOT
        if not os.path.exists(media_root):
            self.stdout.write(self.style.ERROR(f"MEDIA_ROOT does not exist: {media_root}"))
            return

        target_dir = media_root
        subfolder_arg = options.get('subfolder')
        if subfolder_arg:
            target_dir = os.path.join(media_root, subfolder_arg)

        self.stdout.write(self.style.NOTICE(f"Starting Google Drive backup from: {target_dir}"))

        total_files = 0
        success_files = 0
        failed_files = 0

        for root, dirs, files in os.walk(target_dir):
            for file in files:
                # Skip hidden files or system files
                if file.startswith('.') or file.endswith('.tmp'):
                    continue

                abs_file_path = os.path.join(root, file)
                rel_dir = os.path.relpath(root, media_root)
                subfolder_name = rel_dir if rel_dir != '.' else None

                total_files += 1
                self.stdout.write(f"[{total_files}] Uploading: {file} (Subfolder: {subfolder_name or 'Root'})...")

                try:
                    result = upload_file_to_drive(
                        local_file_path=abs_file_path,
                        destination_filename=file,
                        subfolder_name=subfolder_name
                    )
                    if result:
                        success_files += 1
                        self.stdout.write(self.style.SUCCESS(f"  ✓ Uploaded (ID: {result.get('id')})"))
                    else:
                        failed_files += 1
                        self.stdout.write(self.style.WARNING("  ⚠ Upload skipped or failed"))
                except Exception as e:
                    failed_files += 1
                    self.stdout.write(self.style.ERROR(f"  ✗ Error: {e}"))

        self.stdout.write(self.style.SUCCESS(
            f"\nFinished! Total files processed: {total_files} | Successful: {success_files} | Failed: {failed_files}"
        ))
