import os

new_content = """import json
from django.urls import resolve
from accounts.models import ActivityLog
from django.forms.models import model_to_dict
from django.core.serializers.json import DjangoJSONEncoder
import re

class ActivityLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def _get_view_class_and_model(self, request):
        try:
            match = resolve(request.path)
            view_class = getattr(match.func, 'view_class', None) or getattr(match.func, 'cls', None)
            if view_class and hasattr(view_class, 'queryset') and view_class.queryset is not None:
                return view_class, view_class.queryset.model
        except Exception:
            pass
        return None, None
        
    def _sanitize_dict(self, d):
        if not isinstance(d, dict): return d
        try:
            return json.loads(json.dumps(d, cls=DjangoJSONEncoder))
        except:
            return str(d)

    def __call__(self, request):
        old_data = None
        model = None
        obj_id = None
        
        # PRE-PROCESS: Capture old_data for PUT/PATCH/DELETE
        if request.method in ['PUT', 'PATCH', 'DELETE']:
            _, model = self._get_view_class_and_model(request)
            if model:
                try:
                    match = resolve(request.path)
                    obj_id = match.kwargs.get('pk') or match.kwargs.get('id')
                    if obj_id:
                        obj = model.objects.get(pk=obj_id)
                        old_data = self._sanitize_dict(model_to_dict(obj))
                except Exception:
                    pass

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
            
            new_data = None
            if request.method in ['POST', 'PUT', 'PATCH']:
                new_data = resp_data

            _, model = self._get_view_class_and_model(request)
            
            obj_str = ""
            model_name = ""
            if model:
                model_name = re.sub(r'(?<!^)(?=[A-Z])', ' ', model.__name__)
                
                if not obj_id:
                    if request.method == 'POST' and isinstance(resp_data, dict):
                        obj_id = resp_data.get('id')
                
                if obj_id:
                    try:
                        obj = model.objects.get(pk=obj_id)
                        obj_str = str(obj)
                        if request.method == 'POST':
                            new_data = self._sanitize_dict(model_to_dict(obj))
                    except Exception:
                        pass
            
            action = action_message
            if not action:
                verb_map = {
                    'POST': 'created',
                    'PUT': 'updated',
                    'PATCH': 'updated',
                    'DELETE': 'deleted'
                }
                action_verb = verb_map.get(request.method, request.method.lower())
                
                if 'approve' in request.path:
                    action_verb = 'approved'
                elif 'login' in request.path:
                    action_verb = 'logged in'
                
                if model_name:
                    if obj_str:
                        action = f"{model_name} {action_verb} for {obj_str}"
                    else:
                        action = f"{model_name} {action_verb}"
                else:
                    if obj_str:
                        action = f"{action_verb.capitalize()} {obj_str}"
                    else:
                        action = f"{action_verb.capitalize()} action performed"

            elif obj_str and obj_str not in action:
                action = f"{action} ({obj_str})"

            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            ip = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')
            
            details = {}
            if old_data or new_data:
                details['old_data'] = old_data
                details['new_data'] = new_data

            ActivityLog.objects.create(
                actor=user,
                action=action[:255],
                resource=request.path,
                ip_address=ip,
                details=details if details else None
            )

        return response
"""

with open('/home/saiyad/ktbv2/ktbv2/backend/ktbv2/ktbv2/middleware.py', 'w') as f:
    f.write(new_content)
