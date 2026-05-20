import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ktbv2.settings")
django.setup()

from django.urls import resolve
match = resolve('/costmgt/raw-categories/')
func = match.func
print("Func cls:", getattr(func, 'cls', None))
if getattr(func, 'cls', None):
    cls = func.cls
    print("Has queryset:", hasattr(cls, 'queryset'))
    if hasattr(cls, 'queryset'):
        print("Queryset model:", cls.queryset.model)
