from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationSerializer
from accounts.models import CustomUser

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    # permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Notification.objects.none()
        
        # 1. Base queryset: User only sees notifications where they are the recipient
        queryset = Notification.objects.filter(recipient=user)

        # 2. Scope GENERAL notifications for non-managers
        if not (user.is_superuser or user.role == 'Manager2'):
            from django.db.models import Q
            queryset = queryset.filter(
                Q(notification_type='PERSONAL') |
                Q(notification_type='GENERAL', actor__reports_to=user) |
                Q(notification_type='GENERAL', actor=user.reports_to)
            )

        # 3. De-duplicate PERSONAL and GENERAL notifications by target_url
        personal_urls = queryset.filter(notification_type='PERSONAL').exclude(
            target_url__isnull=True
        ).values_list('target_url', flat=True)
        
        queryset = queryset.exclude(
            notification_type='GENERAL',
            target_url__in=list(personal_urls)
        )

        return queryset

    @action(detail=False, methods=['get'])
    def unread(self, request):
        queryset = self.get_queryset().filter(is_read=False)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'notification marked as read'})
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'status': 'all notifications marked as read'})
