from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from trademgt.models import Trade, PreSalePurchase, SalesPurchase, PaymentFinance
from costmgt.models import FinalProduct, Additive, RawMaterial, ConsumptionFormula, Packing, Category
from notifications.models import Notification
# Create your views here.
from rest_framework import generics, status, filters
from django_filters.rest_framework import DjangoFilterBackend
from accounts.models import CustomUser, Permission, ActivityLog
from .serializers import PermissionSerializer, UserSerializer, UserProfileSerializer, ChangePasswordSerializer, ActivityLogSerializer
from rest_framework.permissions import BasePermission, IsAuthenticated

class HasPermission(BasePermission):
    def has_permission(self, request, view):
        required_permission = getattr(view, 'required_permission', None)

        if not required_permission:
            return True

        return request.user.permissions.filter(code=required_permission).exists()

class UserListCreateView(generics.ListCreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

class UserRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

# List + Create
class PermissionListCreateView(generics.ListCreateAPIView):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer

    def create(self, request, *args, **kwargs):
        # Check if request.data is a list
        is_many = isinstance(request.data, list)
        serializer = self.get_serializer(data=request.data, many=is_many)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

# Retrieve + Update + Delete
class PermissionRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer

class DashboardAPIView(APIView):
    def get(self, request):
        # Trade Management Metrics
        total_trades = Trade.objects.count()
        trades_appr = Trade.objects.filter(approved=True).count()

        total_presales = PreSalePurchase.objects.count()
        presales_appr = PreSalePurchase.objects.filter(approved=True).count()

        total_sales_purchases = SalesPurchase.objects.count()
        sales_purchases_appr = SalesPurchase.objects.filter(reviewed=True).count()

        total_payment_finance = PaymentFinance.objects.count()
        payment_finance_appr = PaymentFinance.objects.filter(reviewed=True).count()

        # Cost Management Metrics
        total_products = FinalProduct.objects.count()
        products_appr = FinalProduct.objects.filter(approved=True).count()

        total_additives = Additive.objects.count()
        additives_appr = Additive.objects.filter(approved=True).count()

        total_raw_materials = RawMaterial.objects.count()
        raw_materials_appr = RawMaterial.objects.filter(approved=True).count()

        total_consumptions = ConsumptionFormula.objects.count()
        consumptions_appr = ConsumptionFormula.objects.filter(approved=True).count()

        total_packings = Packing.objects.count()
        packings_appr = Packing.objects.filter(approved=True).count()
        
        # Unread notifications for current user
        if request.user and request.user.is_authenticated:
            unread_notifications = Notification.objects.filter(recipient=request.user, is_read=False).count()
            recent_notifications = Notification.objects.filter(recipient=request.user).order_by('-created_at')[:5].values('id', 'verb', 'message', 'created_at', 'is_read')
        else:
            unread_notifications = 0
            recent_notifications = []

        # Recent Trade Activities
        recent_trades = Trade.objects.order_by('-id')[:5].values('id', 'trn', 'trd', 'trade_type', 'company', 'approved')
        recent_presales = PreSalePurchase.objects.order_by('-id')[:5].values('id', 'date', 'trn__trn', 'approved')

        # Recent Cost Activities
        recent_cost_activities = FinalProduct.objects.order_by('-id')[:5].values('id', 'date', 'total_qty', 'total_cfr_pricing', 'approved')
        recent_consumptions = ConsumptionFormula.objects.order_by('-id')[:5].values('id', 'ref', 'date', 'approved')
        
        return Response({
            'trade_management': {
                'metrics': {
                    'trades': {'total': total_trades, 'approved': trades_appr, 'pending': total_trades - trades_appr},
                    'presales': {'total': total_presales, 'approved': presales_appr, 'pending': total_presales - presales_appr},
                    'sales_purchases': {'total': total_sales_purchases, 'approved': sales_purchases_appr, 'pending': total_sales_purchases - sales_purchases_appr},
                    'payment_finance': {'total': total_payment_finance, 'approved': payment_finance_appr, 'pending': total_payment_finance - payment_finance_appr},
                },
                'recent_trades': list(recent_trades),
                'recent_presales': list(recent_presales),
            },
            'cost_management': {
                'metrics': {
                    'products': {'total': total_products, 'approved': products_appr, 'pending': total_products - products_appr},
                    'additives': {'total': total_additives, 'approved': additives_appr, 'pending': total_additives - additives_appr},
                    'raw_materials': {'total': total_raw_materials, 'approved': raw_materials_appr, 'pending': total_raw_materials - raw_materials_appr},
                    'consumptions': {'total': total_consumptions, 'approved': consumptions_appr, 'pending': total_consumptions - consumptions_appr},
                    'packings': {'total': total_packings, 'approved': packings_appr, 'pending': total_packings - packings_appr},
                },
                'recent_products': list(recent_cost_activities),
                'recent_consumptions': list(recent_consumptions),
            },
            'general': {
                'unread_notifications': unread_notifications,
                'recent_notifications': list(recent_notifications)
            }
        })

class UserProfileAPIView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user

class ChangePasswordAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data.get("new_password"))
            user.save()
            return Response({"detail": "Password successfully updated."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminPasswordResetAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user_id = kwargs.get('pk')
        try:
            target_user = CustomUser.objects.get(pk=user_id)
        except CustomUser.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            target_user.set_password(serializer.validated_data.get("new_password"))
            target_user.save()
            return Response({"detail": f"Password successfully reset for {target_user.email}."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ActivityLogListAPIView(generics.ListAPIView):
    queryset = ActivityLog.objects.all().order_by('-timestamp')
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['actor', 'action']
    search_fields = ['resource', 'actor__name', 'actor__email']