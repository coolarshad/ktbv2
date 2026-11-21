import hashlib
import os
from collections import defaultdict

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from trademgt.gdrive_service import folders_named, get_drive_service, index_tree, upload_file_to_drive


def _md5(path):
    h = hashlib.md5()
    with open(path, 'rb') as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


class Command(BaseCommand):
    help = ('Uploads local media files to the configured Google Drive backup folder, mirroring the '
            'MEDIA_ROOT layout. Files already on Drive (same path, size and MD5) are skipped.')

    def add_arguments(self, parser):
        parser.add_argument(
            '--subfolder',
            type=str,
            default=None,
            help='Optionally specify a subfolder inside media/ to backup (e.g. uploads/lois)'
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Upload every file even if an identical copy already exists on Drive.'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Only report which files would be uploaded.'
        )

    def _index_existing(self, media_root, target_dir):
        """Map 'uploads/lois/x.pdf' -> [Drive file dicts] for everything already mirrored on Drive."""
        service = get_drive_service()
        root_id = settings.GOOGLE_DRIVE_FOLDER_ID
        rel_target = os.path.relpath(target_dir, media_root)
        if rel_target == '.':
            top_names = [d for d in os.listdir(media_root) if os.path.isdir(os.path.join(media_root, d))]
        else:
            top_names = [rel_target.replace('\\', '/').split('/')[0]]

        existing = defaultdict(list)
        for name in top_names:
            folders = folders_named(service, root_id, name)
            if folders:
                index_tree(service, [f['id'] for f in folders], name, existing)
        return existing

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

        existing = {}
        if not options.get('all'):
            self.stdout.write("Indexing files already on Google Drive...")
            try:
                existing = self._index_existing(media_root, target_dir)
            except Exception as e:
                # Don't fall back to re-uploading everything: that is what created the duplicates.
                raise CommandError(f"Could not index existing Drive files, aborting sweep: {e}")
            self.stdout.write(f"  {len(existing)} files already mirrored on Drive")

        total_files = 0
        success_files = 0
        skipped_files = 0
        failed_files = 0

        for root, dirs, files in os.walk(target_dir):
            for file in files:
                # Skip hidden files or system files
                if file.startswith('.') or file.endswith(('.tmp', '.part')):
                    continue

                abs_file_path = os.path.join(root, file)
                rel_dir = os.path.relpath(root, media_root)
                subfolder_name = rel_dir if rel_dir != '.' else None
                rel_path = os.path.relpath(abs_file_path, media_root).replace(os.sep, '/')

                total_files += 1

                copies = existing.get(rel_path)
                if copies:
                    size = str(os.path.getsize(abs_file_path))
                    same_size = [c for c in copies if c.get('size') == size]
                    if same_size and _md5(abs_file_path) in {c.get('md5Checksum') for c in same_size}:
                        skipped_files += 1
                        continue

                if options.get('dry_run'):
                    success_files += 1
                    self.stdout.write(f"[{total_files}] Would upload: {rel_path}")
                    continue

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
            f"\nFinished! Total files: {total_files} | Uploaded: {success_files} | "
            f"Already on Drive: {skipped_files} | Failed: {failed_files}"
        ))
