from rest_framework import serializers
from .models import CustomUser, Permission, ActivityLog
from rest_framework.generics import ListAPIView
from .models import Permission

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'code', 'name']

class PermissionListView(ListAPIView):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer

class UserSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True) 
    permission_ids = serializers.PrimaryKeyRelatedField(
        queryset=Permission.objects.all(),
        many=True,
        write_only=True,
        required=False,
        source='permissions'
    )

    class Meta:
        model = CustomUser
        fields = ['id', 'name', 'email', 'phone', 'designation', 'role', 'reports_to', 'permissions', 'permission_ids']

    def create(self, validated_data):
        permissions = validated_data.pop('permissions', None)
        user = super().create(validated_data)
        if permissions:
            user.permissions.set(permissions)
        return user

    def update(self, instance, validated_data):
        permissions = validated_data.pop('permissions', None)
        instance = super().update(instance, validated_data)
        if permissions is not None:
            instance.permissions.set(permissions)
        return instance

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'name', 'email', 'phone', 'designation', 'role']
        read_only_fields = ['id', 'email', 'role']  # Users typically shouldn't change their own role or email directly here

class ChangePasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(required=True, min_length=8)

class ActivityLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.name', read_only=True)
    
    class Meta:
        model = ActivityLog
        fields = ['id', 'actor', 'actor_name', 'action', 'resource', 'ip_address', 'timestamp', 'details']