import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ktbv2.settings")
django.setup()

from django.urls import resolve
match = resolve('/costmgt/raw-categories/')
print("Match:", match)
func = match.func
print("Func:", func)
view_class = getattr(func, 'view_class', None)
print("View Class:", view_class)
if view_class:
    print("Has queryset:", hasattr(view_class, 'queryset'))
    if hasattr(view_class, 'queryset'):
        print("Queryset:", view_class.queryset)
