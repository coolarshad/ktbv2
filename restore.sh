#!/usr/bin/env bash
# Restore PostgreSQL and/or media from the Google Drive backups (Docker deployment).
#
#   ./restore.sh list                         # show available DB backups
#   ./restore.sh test [latest|<file>]         # restore into scratch DB "ktbv2_restore_test" (app keeps running)
#   ./restore.sh db   [latest|<file>]         # restore over the LIVE database (stops app first)
#   ./restore.sh media                        # download missing media files into the media volume
#   ./restore.sh all  [latest|<file>]         # db + media
#   ./restore.sh verify                       # list DB-referenced files missing on disk
#
# Extra flags after the backup name are passed to `manage.py restore_from_gdrive`, e.g. --yes, --overwrite.
set -euo pipefail
cd "$(dirname "$0")"

# Support both Compose v2 ("docker compose") and the older standalone "docker-compose".
if docker compose version >/dev/null 2>&1; then
  DC=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  DC=(docker-compose)
else
  echo "Neither 'docker compose' nor 'docker-compose' is installed." >&2; exit 1
fi

APP_SERVICES=(backend celery_worker celery_beat)
CMD="${1:-}"; shift || true
BACKUP="latest"
if [[ $# -gt 0 && "$1" != --* ]]; then BACKUP="$1"; shift; fi

manage() {
  # One-off container with the same image, env, code and media volume as the backend.
  "${DC[@]}" run --rm --no-deps -T backend python manage.py restore_from_gdrive "$@"
}
manage_tty() {
  "${DC[@]}" run --rm --no-deps backend python manage.py restore_from_gdrive "$@"
}

stop_app()  { echo ">> Stopping ${APP_SERVICES[*]}"; "${DC[@]}" stop "${APP_SERVICES[@]}"; }
start_app() { echo ">> Starting ${APP_SERVICES[*]}"; "${DC[@]}" start "${APP_SERVICES[@]}"; }

case "$CMD" in
  list)   manage --list ;;
  verify) manage --verify-media ;;
  test)   manage_tty --db "$BACKUP" --target-db ktbv2_restore_test "$@" ;;
  media)
    stop_app; trap start_app EXIT
    manage --media "$@" ;;
  db|all)
    stop_app; trap start_app EXIT
    args=(--db "$BACKUP")
    [[ "$CMD" == all ]] && args+=(--media)
    manage_tty "${args[@]}" "$@"
    echo ">> Applying any newer migrations"
    "${DC[@]}" run --rm --no-deps -T backend python manage.py migrate --noinput ;;
  *)
    sed -n '2,12p' "$0"; exit 1 ;;
esac
