# gunicorn.conf.py
import multiprocessing

# Server socket
bind = "0.0.0.0:8000"
backlog = 2048

# Worker processes: 8 cores -> 8 workers with 4 threads each = 32 concurrent connections
workers = 8
worker_class = "gthread"
threads = 4
worker_connections = 1000

# Worker lifecycle
timeout = 120
keepalive = 5
max_requests = 1000
max_requests_jitter = 50

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"
capture_output = True
enable_stdio_inheritance = True
