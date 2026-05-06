#!/bin/bash

pkill -f "redis-server"
pkill -f "manage.py runserver"
pkill -f "celery"
pkill -f "npm run dev"
pkill -f "vite"

echo "All services stopped!"