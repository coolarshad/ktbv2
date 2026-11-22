# Backup & Restore Guide

How the KTB backups work, how to check them, and how to restore the **PostgreSQL database** and the **uploaded media files** from Google Drive.

> **In an emergency:** jump to [Scenario B – Restore the live server](#scenario-b--restore-the-live-server-after-data-loss).

---

## Contents

1. [How the backups work](#1-how-the-backups-work)
2. [Before you start](#2-before-you-start)
3. [Quick reference](#3-quick-reference)
4. [Step-by-step scenarios](#4-step-by-step-scenarios)
   - [A – Test that backups can be restored](#scenario-a--test-that-backups-can-be-restored-safe)
   - [B – Restore the live server after data loss](#scenario-b--restore-the-live-server-after-data-loss)
   - [C – Restore onto a brand-new server](#scenario-c--restore-onto-a-brand-new-server)
   - [D – Restore only missing uploaded files](#scenario-d--restore-only-missing-uploaded-files)
   - [E – Undo a restore](#scenario-e--undo-a-restore)
   - [F – Run a backup by hand](#scenario-f--run-a-backup-by-hand)
   - [G – Remove duplicate files from Google Drive](#scenario-g--remove-duplicate-files-from-google-drive-one-time-cleanup)
5. [Command reference](#5-command-reference)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. How the backups work

### What gets backed up

| What | How | Where on Google Drive |
|---|---|---|
| **Database** | `pg_dump` → gzip, every night | `Database_Backups/ktbv2_db_backup_<date>_<time>.sql.gz` |
| **Media files (mirror)** | Nightly sweep of `media/`, same folder layout | `uploads/...`, `company/...` |
| **Media files (per record)** | Uploaded right after each save (Django signal → Celery) | `<TRN>/...` (e.g. `KP-0000087/Trade_Products/LOI`), `KYC_Documents/<name>/`, `Company_Assets/<name>/` |

The Drive folder is set by `GOOGLE_DRIVE_FOLDER_ID` (in `docker-compose.yml` and `settings.py`). Access uses the service-account key `backend/ktbv2/service_account.json`. **Keep this file safe and out of git. Without it, nothing can be backed up or restored.**

### Schedule (Celery Beat, `CELERY_BEAT_SCHEDULE` in `backend/ktbv2/ktbv2/settings.py`)

| Job | Time (UTC) | Nepal time (UTC+5:45) |
|---|---|---|
| Database backup | 20:15 | 02:00 |
| Media sweep | 20:45 | 02:30 |

The `celery_beat` container triggers the jobs and the `celery_worker` container runs them. If either is stopped, no backups happen.

### Which backup is used for a restore

- **Database:** you pick a file from `Database_Backups/`. Use `latest` or an exact file name.
- **Media:** the restore uses the **mirror** (`uploads/`, `company/`), because it has the same layout as `media/`. A file uploaded *after* the last nightly sweep exists only in the per-record folders. The restore finds those automatically by file name (the "fallback" step).

### Where things live on the server (Docker)

| Thing | Inside container | On the host |
|---|---|---|
| Code | `/app` | `./backend/ktbv2` (bind mount) |
| Media files | `/app/media` | Docker volume `media_data` |
| Safety copies made before a restore | `/app/backups/` | `./backend/ktbv2/backups/` |
| PostgreSQL | `host.docker.internal:5432` | PostgreSQL running on the host |

---

## 2. Before you start

- Run everything from the project root (the folder with `docker-compose.yml` and `restore.sh`).
- `restore.sh` works with both `docker compose` (v2) and the older `docker-compose` (v1) and uses whichever is installed. The manual commands in this guide are written as `docker compose ...`. If your server only has v1 (`docker compose version` fails with `unknown flag`), type `docker-compose ...` instead.
- If `restore.sh` is not executable yet: `chmod +x restore.sh`.
- Restoring over the live database **replaces all current data** with the backup. Anything entered after the backup was taken is lost. A safety copy of the current DB is taken automatically first (see [Scenario E](#scenario-e--undo-a-restore)).
- Every Drive download is checked against Drive's MD5 checksum.
- The database restore runs as **one transaction**. If anything fails, it is rolled back and the database is left exactly as it was.

---

## 3. Quick reference

```bash
./restore.sh list               # list DB backups on Google Drive
./restore.sh test               # restore latest DB into scratch DB "ktbv2_restore_test" (safe, app keeps running)
./restore.sh db                 # restore latest DB over the LIVE database
./restore.sh db <file-name>     # restore a specific backup
./restore.sh media              # download missing media files
./restore.sh all                # database + media
./restore.sh verify             # list files referenced in the DB that are missing on disk
```

What `restore.sh` does for `db`, `media` and `all`:

1. Stops `backend`, `celery_worker` and `celery_beat`, so nothing writes to the DB and no backup runs halfway through.
2. Runs the restore in a temporary container (same image, settings, code and media volume as the backend).
3. For `db` / `all`: runs `python manage.py migrate` (only matters if the code is newer than the backup).
4. Starts the services again, **even if the restore failed**.

Any extra flags after the backup name are passed straight to the restore command, e.g. `./restore.sh db latest --yes`.

---

## 4. Step-by-step scenarios

### Scenario A – Test that backups can be restored (safe)

Do this **once a month** and after any change to the backup setup. It does not touch the live database or the running app.

```bash
./restore.sh list
./restore.sh test                 # or: ./restore.sh test ktbv2_db_backup_2026-11-21_02-00-04.sql.gz
```

Expected output (shortened):

```
Downloading ktbv2_db_backup_2026-11-21_02-00-04.sql.gz (3.05 MB)...
Validating dump...
Creating database "ktbv2_restore_test"...
About to restore  ktbv2_db_backup_2026-11-21_02-00-04.sql.gz
          into    database "ktbv2_restore_test" ...
Type the database name (ktbv2_restore_test) to continue: ktbv2_restore_test
Restoring (single transaction — all or nothing)...
✓ Restored ... into "ktbv2_restore_test" (91 tables, last migration applied ...).
```

Optionally look inside the test DB, then delete it:

```bash
psql -h localhost -U ktbv2_user -d ktbv2_restore_test -c "select count(*) from auth_user;"
psql -h localhost -U ktbv2_user -d postgres -c 'DROP DATABASE ktbv2_restore_test;'
```

To test the media backup without touching the real media folder, download into a temporary folder:

```bash
docker compose run --rm --no-deps backend \
  python manage.py restore_from_gdrive --media --media-dest /tmp/media_test --no-fallback
```

The files are deleted along with the temporary container when it exits. This is only a check that the download works.

---

### Scenario B – Restore the live server after data loss

1. **Choose the backup.** Pick the newest backup taken *before* the problem happened:
   ```bash
   ./restore.sh list
   ```
   Backup names are `ktbv2_db_backup_YYYY-MM-DD_HH-MM-SS.sql.gz`. The time in the name is the server clock (UTC).

2. **(Recommended) Test that backup first:**
   ```bash
   ./restore.sh test ktbv2_db_backup_2026-11-20_20-15-00.sql.gz
   ```

3. **Restore the database and media:**
   ```bash
   ./restore.sh all ktbv2_db_backup_2026-11-20_20-15-00.sql.gz
   ```
   - Type the database name (`ktbv2_db`) when asked.
   - A safety copy of the current DB is saved to `backend/ktbv2/backups/pre_restore_ktbv2_db_<time>.sql.gz`.
   - Media files already on disk with the right size are skipped. Only missing files are downloaded.
   - At the end you get a list of any files the database refers to that could not be found.

   Database only: `./restore.sh db <file>`. Media only: `./restore.sh media`.

4. **Check the app.** Log in, open a few trades and their documents, then run:
   ```bash
   ./restore.sh verify
   ```

---

### Scenario C – Restore onto a brand-new server

1. **Install** Docker and PostgreSQL on the new host, then clone the repository.
2. **Copy the service-account key** to `backend/ktbv2/service_account.json` (from a safe place, not from git).
3. **Create the empty database and user** on the host PostgreSQL. Use the same names and password as the `DB_*` variables in `docker-compose.yml` / `.env`:
   ```bash
   sudo -u postgres psql -c "CREATE USER ktbv2_user WITH PASSWORD 'change-me' CREATEDB;"
   sudo -u postgres psql -c "CREATE DATABASE ktbv2_db OWNER ktbv2_user;"
   ```
   PostgreSQL must accept connections from the Docker network: `listen_addresses` in `postgresql.conf` and a matching line in `pg_hba.conf`.
4. **Build the images** (do not start the app yet):
   ```bash
   docker compose build
   docker compose up -d redis
   ```
5. **Restore everything:**
   ```bash
   ./restore.sh all latest
   ```
   There is nothing to protect on a new server, so the safety copy is skipped automatically (the DB has no tables).
   At the end you may see `has no container to start` for the app services. That's expected here because they were never started; the next step starts them.
6. **Start everything:**
   ```bash
   docker compose up -d
   ```
7. Check with `./restore.sh verify` and by logging in.

---

### Scenario D – Restore only missing uploaded files

For example, someone deleted files from the media volume, or a document gives a 404.

```bash
./restore.sh verify        # shows what is missing
./restore.sh media         # downloads only what is missing (existing files are skipped)
```

To re-download **everything**, replacing local copies:

```bash
./restore.sh media --overwrite
```

---

### Scenario E – Undo a restore

Every restore over a database that has data first saves a copy to `backend/ktbv2/backups/` (inside the container: `/app/backups/`). To go back to it:

```bash
ls backend/ktbv2/backups/
docker compose stop backend celery_worker celery_beat
docker compose run --rm --no-deps backend \
  python manage.py restore_from_gdrive --db-file /app/backups/pre_restore_ktbv2_db_2026-11-21_15-51-08.sql.gz
docker compose start backend celery_worker celery_beat
```

These safety copies are never deleted automatically. Remove old ones when you no longer need them.

---

### Scenario F – Run a backup by hand

Useful right before a risky change (a big migration or data import):

```bash
# Database → Google Drive (keep a local copy too)
docker compose exec backend python manage.py backup_db_to_gdrive --force --keep-local --output-dir /app/backups

# Media → Google Drive (only new or changed files are uploaded)
docker compose exec backend python manage.py backup_media_to_gdrive

# See what the media sweep would upload, without uploading
docker compose exec backend python manage.py backup_media_to_gdrive --dry-run
```

---

### Scenario G – Remove duplicate files from Google Drive (one-time cleanup)

Before the sweep fix, the nightly media sweep uploaded **every** file again each night. As of 2026-11-21 that had produced about 70,000 files on Drive, of which only about 2,100 are distinct (about 89 GB of duplicates). The fixed sweep no longer does this. `dedupe_gdrive` cleans up what is already there.

**What it removes:** only *exact* duplicates, meaning the same path and the same MD5 checksum. Different versions of a file are always kept, and `Database_Backups/` is never touched. Duplicates are **moved to Drive trash**, where they can be restored for about 30 days, not deleted permanently.

1. **Look at the report first** (changes nothing):
   ```bash
   docker compose run --rm --no-deps backend python manage.py dedupe_gdrive
   ```
   ```
   70232 files in 717 folders
     keep:       2134 files
     duplicates: 68098 files (88903.2 MB)
     -> trash 38 whole duplicate folders + 68004 individual files (68042 API calls)
   ```

2. **Run it.** Stop the worker and beat first so no uploads happen during the cleanup:
   ```bash
   docker compose stop celery_worker celery_beat
   docker compose run --rm --no-deps backend python manage.py dedupe_gdrive --execute
   docker compose start celery_worker celery_beat
   ```
   - Type `yes` when asked.
   - Google rate-limits this many changes, so it can take **several hours**. The command waits and retries by itself. Running it inside `tmux` or `screen` means a dropped SSH session doesn't stop it.
   - If it gets interrupted, just run it again. It works out the duplicates from scratch each time.

3. **Check afterwards:** run the report again. It should show close to 0 duplicates.

Use `--mirror-only` to clean only `uploads/` and `company/` and leave the per-TRN/KYC folders alone.

---

## 5. Command reference

All commands run inside the backend container:

```bash
docker compose run --rm --no-deps backend python manage.py <command> [options]   # app stopped or running
docker compose exec backend python manage.py <command> [options]                 # app running
```

Without Docker (local dev using `start.sh`):

```bash
cd backend/ktbv2 && source ../venv/bin/activate && python manage.py <command> [options]
```

### `restore_from_gdrive` – restore DB and/or media

| Option | Meaning |
|---|---|
| `--list` | List DB backups on Drive, newest first. |
| `--db latest` / `--db <file-name>` | Restore that DB backup from Drive. |
| `--db-file <path>` | Restore from a local `.sql` or `.sql.gz` file (e.g. a safety copy). |
| `--target-db <name>` | Restore into this database instead of the live one. Created if missing. Use it for tests. |
| `--no-safety-backup` | Skip the safety copy of the current DB. **Not recommended.** |
| `--media` | Download media files into `MEDIA_ROOT`. |
| `--media-dest <dir>` | Download media somewhere else instead of `MEDIA_ROOT`. |
| `--media-folders <a> <b>` | Which top-level Drive folders mirror `media/` (default: `uploads company`). |
| `--overwrite` | Re-download media files even if they already exist locally. |
| `--no-fallback` | Don't search the per-TRN/KYC folders for files missing from the mirror. |
| `--verify-media` | Only report DB-referenced files missing on disk. |
| `--yes` | Don't ask for confirmation (for scripts). |
| `--force` | Continue even if other sessions are connected to the target DB. |

What a DB restore does, in order:

1. Downloads the file and checks its checksum.
2. Checks that it is a complete `pg_dump`. A truncated file is rejected.
3. Creates the target DB if it doesn't exist (only with `--target-db`).
4. Refuses to continue if other programs are connected (unless `--force`).
5. Asks you to type the database name.
6. Saves a safety copy of the current data to `backups/`.
7. In a single transaction, drops all tables, views and sequences in the `public` schema and loads the backup. It waits at most 30 s for table locks.
8. Prints the table count and the date of the last migration in the backup.

### `backup_db_to_gdrive` – database backup (runs nightly)

| Option | Meaning |
|---|---|
| `--force` | Run even if `GOOGLE_DRIVE_AUTO_BACKUP` is off. |
| `--keep-local` | Keep the `.sql.gz` file locally after uploading. |
| `--output-dir <dir>` | Where to write the dump (default: system temp folder). |

### `backup_media_to_gdrive` – media sweep (runs nightly)

| Option | Meaning |
|---|---|
| `--subfolder <path>` | Only back up part of `media/`, e.g. `uploads/lois`. |
| `--dry-run` | Only show which files would be uploaded. |
| `--all` | Upload every file, even if an identical copy is already on Drive. |

A file is skipped when Drive already has it at the same path with the same size and MD5. If Drive can't be listed, the sweep stops instead of uploading everything again.

### `dedupe_gdrive` – remove duplicate copies on Drive

| Option | Meaning |
|---|---|
| *(no option)* | Report only. |
| `--execute` | Move the duplicates to Drive trash. |
| `--mirror-only` | Only clean `uploads/` and `company/`. |
| `--yes` | Don't ask for confirmation. |

---

## 6. Troubleshooting

| Message / problem | Cause and fix |
|---|---|
| `Service account file not found at: ...` | `backend/ktbv2/service_account.json` is missing. Copy it back. |
| `Other sessions are connected to "ktbv2_db": ...` | Something still uses the DB (backend, celery, pgAdmin, a `psql` window). Close it, or use `restore.sh`, which stops the app. `--force` continues anyway. |
| `Restore FAILED and was rolled back — database "..." is unchanged.` | Nothing was changed. Read the `ERROR:` lines below the message. Often another backup file works. If the error is `canceling statement due to lock timeout`, something was still using the tables: stop it and retry. |
| `... is incomplete (missing "dump complete" footer)` | That backup file is damaged or was cut off. Pick an older one from `--list`. |
| `Checksum mismatch downloading ...` | The download was corrupted. Run the same command again. |
| `Configured database "ktbv2_db" does not exist` | Create the empty database first (see [Scenario C](#scenario-c--restore-onto-a-brand-new-server), step 3). |
| `could not connect to server` / connection refused | PostgreSQL isn't running or isn't reachable from Docker. Check `DB_HOST`/`DB_PORT`, `listen_addresses` and `pg_hba.conf`. |
| `WARNING: database "ktbv2_db" has a collation version mismatch` | Harmless for the restore. To silence it: `ALTER DATABASE ktbv2_db REFRESH COLLATION VERSION;` (as the DB owner). |
| After a restore the app shows errors about missing columns or tables | The code is newer than the backup. Run `docker compose run --rm --no-deps backend python manage.py migrate`. `restore.sh db/all` already does this. |
| `./restore.sh verify` still lists missing files after `media` | Those files never reached Drive (e.g. the upload failed when they were saved). They can't be recovered from these backups. |
| `ambiguous: <file> has N different matches, skipped` | A file missing from the mirror was found in several per-record folders with different contents. Download the correct one by hand from Drive into `media/<same path>`. |
| `dedupe_gdrive` shows `insufficientFilePermissions` | The service account needs at least the **Content manager** role on the shared drive. |
| No new backups on Drive | Check that `celery_beat` and `celery_worker` are running: `docker compose ps`, then `docker compose logs --tail=100 celery_worker`. |

### Database version notes

Production PostgreSQL is version 14, but the Docker image makes the backups with `pg_dump` 17. Those files contain a line (`SET transaction_timeout`) and psql commands (`\restrict`) that older versions don't understand. `restore_from_gdrive` handles both automatically. Restoring by hand with `gunzip | psql` may fail for this reason, so use the command.
