#!/bin/bash
set -e

echo "Running database migrations..."
python manage.py migrate --noinput || echo "Migration warning: check DB connectivity."

echo "Starting Gunicorn..."
exec gunicorn -c gunicorn.conf.py ktbv2.wsgi:application
