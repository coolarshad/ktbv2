import os
import mimetypes
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

# In-memory cache for folder IDs to minimize Google Drive API roundtrips
_FOLDER_CACHE = {}

def get_drive_service():
    """
    Authenticate and return an authorized Google Drive v3 API service resource.
    """
    from google.oauth2 import service_account
    from googleapiclient.discovery import build

    key_file = getattr(settings, 'GOOGLE_DRIVE_SERVICE_ACCOUNT_FILE', None)
    if not key_file or not os.path.exists(key_file):
        raise FileNotFoundError(f"Service account file not found at: {key_file}")

    scopes = ['https://www.googleapis.com/auth/drive']
    credentials = service_account.Credentials.from_service_account_file(
        key_file,
        scopes=scopes
    )
    return build('drive', 'v3', credentials=credentials, cache_discovery=False)


def get_or_create_folder(service, folder_name, parent_id):
    """
    Find an existing folder by name under parent_id, or create a new one.
    """
    cache_key = f"{parent_id}:{folder_name}"
    if cache_key in _FOLDER_CACHE:
        return _FOLDER_CACHE[cache_key]

    safe_folder_name = folder_name.replace("'", "\\'")
    query = (
        f"mimeType = 'application/vnd.google-apps.folder' "
        f"and name = '{safe_folder_name}' "
        f"and '{parent_id}' in parents "
        f"and trashed = false"
    )

    results = service.files().list(
        q=query,
        spaces='drive',
        corpora='allDrives',
        fields='files(id, name)',
        orderBy='createdTime',  # always reuse the oldest folder if duplicates exist
        pageSize=1,
        supportsAllDrives=True,
        includeItemsFromAllDrives=True
    ).execute()

    files = results.get('files', [])
    if files:
        folder_id = files[0]['id']
    else:
        folder_metadata = {
            'name': folder_name,
            'mimeType': 'application/vnd.google-apps.folder',
            'parents': [parent_id]
        }
        folder = service.files().create(
            body=folder_metadata,
            fields='id',
            supportsAllDrives=True
        ).execute()
        folder_id = folder.get('id')
        logger.info(f"Created Google Drive folder '{folder_name}' (ID: {folder_id})")

    _FOLDER_CACHE[cache_key] = folder_id
    return folder_id


def resolve_subfolder_hierarchy(service, subfolder_path, root_folder_id):
    """
    Resolve a slash-separated subfolder path (e.g. 'TRN-101/LOIs') under root_folder_id.
    """
    if not subfolder_path:
        return root_folder_id

    current_parent = root_folder_id
    parts = [p.strip() for p in subfolder_path.replace('\\', '/').split('/') if p.strip()]
    for part in parts:
        current_parent = get_or_create_folder(service, part, current_parent)

    return current_parent


def upload_file_to_drive(local_file_path, destination_filename=None, subfolder_name=None):
    """
    Upload a local file to the configured Google Drive folder.
    
    :param local_file_path: Absolute path to the file on local disk
    :param destination_filename: Desired filename in Google Drive (defaults to basename of local path)
    :param subfolder_name: Optional subfolder path under root Google Drive folder (e.g. 'LOIs' or 'TRN-123/Invoices')
    :return: dict with uploaded file info {'id', 'name', 'webViewLink'} or None on failure
    """
    if not os.path.exists(local_file_path):
        logger.warning(f"[GDrive] Local file does not exist: {local_file_path}")
        return None

    root_folder_id = getattr(settings, 'GOOGLE_DRIVE_FOLDER_ID', None)
    if not root_folder_id:
        logger.error("[GDrive] GOOGLE_DRIVE_FOLDER_ID is not configured in settings.")
        return None

    try:
        service = get_drive_service()
        from googleapiclient.http import MediaFileUpload

        target_folder_id = resolve_subfolder_hierarchy(service, subfolder_name, root_folder_id)

        filename = destination_filename or os.path.basename(local_file_path)
        mimetype, _ = mimetypes.guess_type(local_file_path)
        if not mimetype:
            mimetype = 'application/octet-stream'

        file_metadata = {
            'name': filename,
            'parents': [target_folder_id]
        }

        media = MediaFileUpload(local_file_path, mimetype=mimetype, resumable=True)

        uploaded_file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, name, webViewLink',
            supportsAllDrives=True
        ).execute()

        logger.info(f"[GDrive] Successfully uploaded '{filename}' to Google Drive (ID: {uploaded_file.get('id')})")
        return uploaded_file

    except Exception as e:
        logger.error(f"[GDrive] Failed to upload '{local_file_path}' to Google Drive: {e}", exc_info=True)
        raise e


FOLDER_MIME = 'application/vnd.google-apps.folder'


def list_children(service, parent_ids, extra_q=''):
    """List non-trashed children of one or more Drive folders (handles paging)."""
    parent_ids = list(parent_ids)
    out = []
    for i in range(0, len(parent_ids), 40):  # keep query length sane
        chunk = parent_ids[i:i + 40]
        q = '(' + ' or '.join(f"'{p}' in parents" for p in chunk) + ') and trashed = false' + extra_q
        token = None
        while True:
            resp = service.files().list(
                q=q, corpora='allDrives', includeItemsFromAllDrives=True, supportsAllDrives=True,
                fields='nextPageToken, files(id, name, mimeType, size, md5Checksum, modifiedTime, createdTime, parents)',
                pageSize=1000, pageToken=token,
            ).execute()
            out.extend(resp.get('files', []))
            token = resp.get('nextPageToken')
            if not token:
                break
    return out


def folders_named(service, parent_id, name):
    """All folders called `name` directly under parent_id. Concurrent uploads have created
    duplicate folders with the same name, so callers should treat them as one."""
    return [f for f in list_children(service, [parent_id], f" and mimeType = '{FOLDER_MIME}'")
            if f['name'] == name]


def index_tree(service, folder_ids, prefix, files_out):
    """Breadth-first walk of Drive folders, merging same-named duplicates.
    Fills files_out[relative/path] -> list of Drive file dicts."""
    level = {fid: prefix for fid in folder_ids}
    while level:
        children = list_children(service, level.keys())
        next_level = {}
        for item in children:
            parent_prefix = next((level[p] for p in item.get('parents', []) if p in level), prefix)
            rel = f"{parent_prefix}/{item['name']}" if parent_prefix else item['name']
            if item['mimeType'] == FOLDER_MIME:
                next_level[item['id']] = rel
            elif not item['mimeType'].startswith('application/vnd.google-apps'):
                files_out[rel].append(item)
        level = next_level
    return files_out
