#!/bin/bash

# Start Redis
redis-server &

# Start Django backend
cd ~/ktbv2/ktbv2/backend/ktbv2
source ~/ktbv2/ktbv2/backend/venv/bin/activate
python3 manage.py runserver 0.0.0.0:8000 &

# Start Celery worker & beat (scheduler)
cd ~/ktbv2/ktbv2/backend/ktbv2
source ~/ktbv2/ktbv2/backend/venv/bin/activate
celery -A ktbv2 worker -l info &
celery -A ktbv2 beat -l info --schedule=/tmp/celerybeat-schedule &

# Start Frontend
cd ~/ktbv2/ktbv2/frontend/ktbv2
npm run dev &

echo "All services started!"