from accounts.models import CustomUser
from django.db.models import Q

def can_user_delete_approved(user, perm_codes=None):
    """
    Returns True if user is a Superuser OR Manager2 with any of the specified delete permission codes.
    """
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    if getattr(user, 'role', None) == 'Manager2':
        if not perm_codes:
            return True
        if isinstance(perm_codes, str):
            perm_codes = [perm_codes]
        
        # Check exact code matches
        if user.permissions.filter(code__in=perm_codes).exists():
            return True
            
        # Check if user has any permission matching delete_* for this entity
        user_perm_codes = list(user.permissions.values_list('code', flat=True))
        for code in perm_codes:
            if code in user_perm_codes:
                return True
            base = code.replace('delete_', '')
            if any(p.startswith('delete_') and base in p for p in user_perm_codes):
                return True

        # Fallback: Manager2 users with active delete permissions are authorized for delete operations
        if any(p.startswith('delete_') for p in user_perm_codes):
            return True

    return False

def can_user_delete_system_record(user, perm_codes=None):
    """
    Returns True ONLY if user is a Superuser OR Manager2 with delete permissions for system/tracking records.
    """
    return can_user_delete_approved(user, perm_codes)

def can_user_update_approved(user, perm_codes=None):
    """
    Returns True if user is a Superuser OR Manager2 with any of the specified update permission codes.
    """
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    if getattr(user, 'role', None) == 'Manager2':
        if not perm_codes:
            return True
        if isinstance(perm_codes, str):
            perm_codes = [perm_codes]

        if user.permissions.filter(code__in=perm_codes).exists():
            return True

        user_perm_codes = list(user.permissions.values_list('code', flat=True))
        for code in perm_codes:
            if code in user_perm_codes:
                return True
            base = code.replace('update_', '').replace('change_', '')
            if any(p.startswith('update_') and base in p for p in user_perm_codes):
                return True

        if any(p.startswith('update_') for p in user_perm_codes):
            return True

    return False


