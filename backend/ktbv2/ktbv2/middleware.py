import json
from django.urls import resolve
from accounts.models import ActivityLog

class ActivityLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if request.method in ['POST', 'PUT', 'PATCH', 'DELETE'] and 200 <= response.status_code < 300:
            user = request.user if request.user.is_authenticated else None
            
            action_message = None
            resp_data = {}
            try:
                if response.content:
                    resp_data = json.loads(response.content.decode('utf-8'))
                    action_message = resp_data.get('message') or resp_data.get('detail')
            except Exception:
                pass
            
            # Try to resolve model __str__
            obj_str = ""
            try:
                match = resolve(request.path)
                view_class = getattr(match.func, 'view_class', None)
                if view_class and hasattr(view_class, 'queryset') and view_class.queryset is not None:
                    model = view_class.queryset.model
                    obj_id = None
                    if request.method == 'POST' and isinstance(resp_data, dict):
                        obj_id = resp_data.get('id')
                    else:
                        obj_id = match.kwargs.get('pk') or match.kwargs.get('id')
                    
                    if obj_id:
                        obj = model.objects.get(pk=obj_id)
                        obj_str = str(obj)
            except Exception as e:
                pass

            action = action_message
            if not action:
                action_type = request.method
                if 'approve' in request.path:
                    action_type = 'Approve'
                elif 'login' in request.path:
                    action_type = 'Login'
                
                if obj_str:
                    action = f"{action_type} {obj_str}"
                else:
                    action = f"{action_type} action performed"

            elif obj_str and obj_str not in action:
                action = f"{action} ({obj_str})"

            # Get IP
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            ip = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')
            
            ActivityLog.objects.create(
                actor=user,
                action=action[:255],
                resource=request.path,
                ip_address=ip
            )

        return response
