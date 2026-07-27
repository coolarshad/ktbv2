from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from trademgt.models import Trade, PreSalePurchase, SalesPurchase, PaymentFinance, PrePayment, Inventory
from trademgt.serializers import InventorySerializer
from costmgt.models import FinalProduct, Additive, RawMaterial, ConsumptionFormula, Packing, Category
from notifications.models import Notification
# Create your views here.
from rest_framework import generics, status, filters
from django_filters.rest_framework import DjangoFilterBackend
from accounts.models import CustomUser, Organization, Permission, ActivityLog
from .serializers import OrganizationSerializer, PermissionSerializer, UserSerializer, UserProfileSerializer, ChangePasswordSerializer, ActivityLogSerializer
from rest_framework.permissions import BasePermission, IsAuthenticated

class OrganizationListCreateView(generics.ListCreateAPIView):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer

class OrganizationRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer

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
        from django.db.models import Q, Sum
        from accounts.mixins import get_authorized_queryset

        # Scoped querysets for authorized access
        auth_trades = get_authorized_queryset(request, Trade.objects.all())
        auth_presales = get_authorized_queryset(request, PreSalePurchase.objects.all())
        auth_sps = get_authorized_queryset(request, SalesPurchase.objects.all())
        auth_pfs = get_authorized_queryset(request, PaymentFinance.objects.all())
        auth_prepayments = get_authorized_queryset(request, PrePayment.objects.all())

        # Trade Management Metrics
        total_trades = auth_trades.count()
        trades_appr = auth_trades.filter(approved=True).count()

        total_presales = auth_presales.count()
        presales_appr = auth_presales.filter(approved=True).count()

        total_sales_purchases = auth_sps.count()
        sales_purchases_appr = auth_sps.filter(reviewed=True).count()

        total_payment_finance = auth_pfs.count()
        payment_finance_appr = auth_pfs.filter(reviewed=True).count()

        total_pre_payment = auth_prepayments.count()
        pre_payment_appr = auth_prepayments.filter(reviewed=True).count()

        # Financial & Compliance Summary Metrics
        # 1. Insurance Pending Count (trades where policy number is blank, null, NA, N/A, PENDING, or NONE)
        insurance_pending_query = (
            Q(insurance_policy_number__isnull=True) |
            Q(insurance_policy_number__exact='') |
            Q(insurance_policy_number__iexact='na') |
            Q(insurance_policy_number__iexact='n/a') |
            Q(insurance_policy_number__iexact='n.a.') |
            Q(insurance_policy_number__iexact='pending') |
            Q(insurance_policy_number__iexact='none')
        )
        insurance_pending_count = auth_trades.filter(insurance_pending_query).count()

        # 2. Account Receivables (Sales Trades)
        sales_sps = auth_sps.filter(trn__trade_type='Sales')
        sales_sp_agg = sales_sps.aggregate(total=Sum('invoice_amount'))
        total_sales_invoiced = sales_sp_agg['total'] or 0.0

        sales_pfs = auth_pfs.filter(sp__trn__trade_type='Sales')
        sales_pf_agg = sales_pfs.aggregate(recv=Sum('balance_payment_received'), adv=Sum('advance_adjusted'))
        sales_received = (sales_pf_agg['recv'] or 0.0) + (sales_pf_agg['adv'] or 0.0)

        sales_trades = auth_trades.filter(trade_type='Sales')
        sales_trd_agg = sales_trades.aggregate(total=Sum('advance_value_to_receive'))
        total_sales_adv_to_receive = sales_trd_agg['total'] or 0.0

        sales_prepayments = auth_prepayments.filter(trn__trade_type='Sales')
        sales_prep_agg = sales_prepayments.aggregate(total=Sum('advance_received'))
        total_sales_adv_received = sales_prep_agg['total'] or 0.0

        invoiced_ar = max(0.0, total_sales_invoiced - sales_received)
        advance_ar = max(0.0, total_sales_adv_to_receive - total_sales_adv_received)
        account_receivables = round(invoiced_ar + advance_ar, 2)

        # 3. Account Payables (Purchase Trades)
        purchase_sps = auth_sps.filter(trn__trade_type='Purchase')
        purchase_sp_agg = purchase_sps.aggregate(inv=Sum('invoice_amount'), log=Sum('logistic_cost'))
        total_purchase_invoiced = (purchase_sp_agg['inv'] or 0.0) + (purchase_sp_agg['log'] or 0.0)

        purchase_pfs = auth_pfs.filter(sp__trn__trade_type='Purchase')
        purchase_pf_agg = purchase_pfs.aggregate(paid=Sum('balance_payment_made'), adv=Sum('advance_adjusted'))
        purchase_paid = (purchase_pf_agg['paid'] or 0.0) + (purchase_pf_agg['adv'] or 0.0)

        purchase_trades = auth_trades.filter(trade_type='Purchase')
        purchase_trd_agg = purchase_trades.aggregate(total=Sum('advance_value_to_receive'))
        total_purchase_adv_expected = purchase_trd_agg['total'] or 0.0

        purchase_prepayments = auth_prepayments.filter(trn__trade_type='Purchase')
        purchase_prep_agg = purchase_prepayments.aggregate(total=Sum('advance_paid'))
        total_purchase_adv_paid = purchase_prep_agg['total'] or 0.0

        invoiced_ap = max(0.0, total_purchase_invoiced - purchase_paid)
        advance_ap = max(0.0, total_purchase_adv_expected - total_purchase_adv_paid)
        account_payables = round(invoiced_ap + advance_ap, 2)

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
        recent_trades = auth_trades.order_by('-id')[:5].values('id', 'trn', 'trd', 'trade_type', 'company', 'approved')
        recent_presales = auth_presales.order_by('-id')[:5].values('id', 'date', 'trn__trn', 'approved')

        # Inventory Stock Summary Aggregated by Product Name
        from trademgt.models import ProductName
        inventory_summary = (
            Inventory.objects.values('product_name', 'unit')
            .annotate(total_stock=Sum('quantity'))
            .order_by('-total_stock')
        )
        product_name_map = {str(pn.id): pn.name for pn in ProductName.objects.all()}
        recent_inventory_data = []
        for item in inventory_summary:
            pn_id = str(item['product_name'])
            recent_inventory_data.append({
                'product_name': product_name_map.get(pn_id, pn_id),
                'total_stock': round(item['total_stock'] or 0, 2),
                'unit': item['unit'] or ''
            })

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
                    'pre_payment': {'total': total_pre_payment, 'approved': pre_payment_appr, 'pending': total_pre_payment - pre_payment_appr},
                },
                'financial_summary': {
                    'account_receivables': account_receivables,
                    'account_payables': account_payables,
                    'insurance_pending': insurance_pending_count,
                },
                'recent_trades': list(recent_trades),
                'recent_presales': list(recent_presales),
                'recent_inventory': recent_inventory_data,
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
    search_fields = ['resource', 'actor__name', 'actor__email', 'action']