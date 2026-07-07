from django.db import models


def get_authorized_queryset(request, queryset):
    user = request.user
    if not user.is_authenticated:
        return queryset.none()
    
    if user.role == 'Manager2' or user.is_superuser:
        return queryset

    subordinate_ids = set()
    def get_subordinates(u):
        subs = u.subordinates.all()
        for sub in subs:
            if sub.id not in subordinate_ids:
                subordinate_ids.add(sub.id)
                get_subordinates(sub)
                
    get_subordinates(user)

    manager_ids = set()
    def get_managers(u):
        if u.reports_to:
            if u.reports_to.id not in manager_ids:
                manager_ids.add(u.reports_to.id)
                get_managers(u.reports_to)

    get_managers(user)

    authorized_ids = [user.id] + list(subordinate_ids) + list(manager_ids)
    return queryset.filter(created_by_id__in=authorized_ids)


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
