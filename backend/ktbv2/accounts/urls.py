from django.urls import path
from .views import PermissionListCreateView, PermissionRetrieveUpdateDestroyView, UserListCreateView, UserRetrieveUpdateDestroyView, DashboardAPIView

urlpatterns = [
    path('users/', UserListCreateView.as_view()),
    path('users/<int:pk>/', UserRetrieveUpdateDestroyView.as_view()),

     # Permissions
    path('permissions/', PermissionListCreateView.as_view(), name='permission-list-create'),
    path('permissions/<int:pk>/', PermissionRetrieveUpdateDestroyView.as_view(), name='permission-detail'),

    # Dashboard
    path('dashboard/', DashboardAPIView.as_view(), name='dashboard-api'),

]