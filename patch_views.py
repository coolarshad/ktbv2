import re

with open('/home/saiyad/ktbv2/ktbv2/backend/ktbv2/costmgt/views.py', 'r') as f:
    content = f.read()

def inject_getlist(match):
    return match.group(0) + "\n\n        notified_users = request.GET.getlist('notifiedUsers[]')\n        notified_user_ids = list(map(int, notified_users)) if notified_users else []"

# Inject notified_users retrieval
content = re.sub(
    r'(if not pk:\s+return Response\(\{.*?\}, status=status\.HTTP_400_BAD_REQUEST\))',
    inject_getlist,
    content
)

def inject_notify(match):
    indent = match.group(1)
    actor_line = match.group(2)
    verb = match.group(3)
    msg = match.group(4)
    url = match.group(5)
    
    explicit = f"""{indent}actor = request.user if hasattr(request, 'user') and request.user.is_authenticated else None
{indent}NotificationService.notify_users_explicit(
{indent}    actor=actor,
{indent}    notified_user_ids=notified_user_ids,
{indent}    verb={verb},
{indent}    message=f"You have been notified that " + {msg},
{indent}    target_url={url}
{indent})

{indent}NotificationService.notify_all_general(
{indent}    actor=actor,
{indent}    verb={verb},
{indent}    message={msg},
{indent}    target_url={url}
{indent})"""
    return explicit

# Inject explicit notification
content = re.sub(
    r'(\s+)NotificationService\.notify_all_general\(\s+actor=(.*?),\s+verb=(.*?),\s+message=(.*?),\s+target_url=(.*?)\s+\)',
    inject_notify,
    content
)

with open('/home/saiyad/ktbv2/ktbv2/backend/ktbv2/costmgt/views.py', 'w') as f:
    f.write(content)

print("Done patching.")
