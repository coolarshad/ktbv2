from django.urls import path
from .views import PermissionListCreateView, PermissionRetrieveUpdateDestroyView, UserListCreateView, UserRetrieveUpdateDestroyView, DashboardAPIView, UserProfileAPIView, ChangePasswordAPIView, AdminPasswordResetAPIView, ActivityLogListAPIView

urlpatterns = [
    path('users/', UserListCreateView.as_view()),
    path('users/<int:pk>/', UserRetrieveUpdateDestroyView.as_view()),
    path('users/<int:pk>/reset-password/', AdminPasswordResetAPIView.as_view(), name='admin-reset-password'),

     # Permissions
    path('permissions/', PermissionListCreateView.as_view(), name='permission-list-create'),
    path('permissions/<int:pk>/', PermissionRetrieveUpdateDestroyView.as_view(), name='permission-detail'),

    # Dashboard
    path('dashboard/', DashboardAPIView.as_view(), name='dashboard-api'),

    # Profile & Settings
    path('profile/', UserProfileAPIView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordAPIView.as_view(), name='change-password'),

    # Activity Logs
    path('logs/', ActivityLogListAPIView.as_view(), name='activity-logs'),

]