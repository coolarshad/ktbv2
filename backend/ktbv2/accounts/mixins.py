from accounts.models import CustomUser

def get_authorized_queryset(request, queryset):
    user = request.user
    if not user or not user.is_authenticated:
        return queryset.none()
    
    if user.role == 'Manager2' or user.is_superuser:
        return queryset

    org_ids = list(user.organizations.values_list('id', flat=True))
    if not org_ids:
        return queryset.filter(created_by_id=user.id)

    org_member_ids = set(CustomUser.objects.filter(organizations__in=org_ids).values_list('id', flat=True))
    org_member_ids.add(user.id)

    return queryset.filter(created_by_id__in=org_member_ids)


class HierarchicalSecurityMixin:
    """
    Mixin for ViewSets to enforce Row-Level Security based on management hierarchy.
    """
    def get_queryset(self):
        qs = super().get_queryset()
        return get_authorized_queryset(self.request, qs)

    def perform_create(self, serializer):
        # Automatically assign created_by to the current user
        if hasattr(serializer.Meta.model, 'created_by'):
            serializer.save(created_by=self.request.user)
        else:
            serializer.save()
