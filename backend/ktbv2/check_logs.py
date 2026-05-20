import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ktbv2.settings")
django.setup()

from accounts.models import ActivityLog
logs = ActivityLog.objects.all().order_by('-id')[:5]
for log in logs:
    print(f"ID: {log.id} | Action: {log.action} | Resource: {log.resource} | Details: {log.details}")
