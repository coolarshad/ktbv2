import os
import logging
from celery import shared_task
from django.conf import settings
from .gdrive_service import upload_file_to_drive

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def backup_file_to_gdrive_task(self, relative_file_path, subfolder_name=None, destination_filename=None):
    """
    Celery task to backup a media file to Google Drive asynchronously.
    """
    if not getattr(settings, 'GOOGLE_DRIVE_AUTO_BACKUP', True):
        logger.info("[GDrive Task] Auto-backup is disabled in settings.")
        return None

    if not relative_file_path:
        return None

    # Resolve local path from MEDIA_ROOT
    local_file_path = os.path.join(settings.MEDIA_ROOT, relative_file_path)
    if not os.path.exists(local_file_path):
        logger.warning(f"[GDrive Task] File not found on disk: {local_file_path}")
        return None

    try:
        result = upload_file_to_drive(
            local_file_path=local_file_path,
            destination_filename=destination_filename,
            subfolder_name=subfolder_name
        )
        return result
    except Exception as exc:
        logger.error(f"[GDrive Task] Error uploading {local_file_path}: {exc}")
        raise self.retry(exc=exc)

@shared_task(bind=True, max_retries=2, default_retry_delay=120)
def backup_db_to_gdrive_task(self):
    """
    Celery task to run a PostgreSQL backup and upload to Google Drive.
    Can be scheduled via Celery Beat or cron.
    """
    if not getattr(settings, 'GOOGLE_DRIVE_AUTO_BACKUP', True):
        logger.info("[GDrive DB Task] Auto-backup is disabled in settings.")
        return None

    from django.core.management import call_command
    try:
        call_command('backup_db_to_gdrive')
        return "Database backup to Google Drive completed."
    except Exception as exc:
        logger.error(f"[GDrive DB Task] Database backup failed: {exc}")
        raise self.retry(exc=exc)
