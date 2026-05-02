from rest_framework import serializers
from .models import Notification
from accounts.models import CustomUser

class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'name', 'email']

class NotificationSerializer(serializers.ModelSerializer):
    actor = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = ['id', 'actor', 'verb', 'message', 'target_url', 'notification_type', 'is_read', 'email_sent', 'created_at']
