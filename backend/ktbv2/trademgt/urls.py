from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
# router.register(r'trades', TradeViewSet)
router.register(r'trade-products', TradeProductViewSet)
router.register(r'trade-extra-cost', TradeExtraCostViewSet)
router.register(r'payment-terms', PaymentTermViewSet)
# router.register(r'pre-sales-purchases', PreSalePurchaseViewSet)
router.register(r'ackn-pis', AcknowledgedPIViewSet)
router.register(r'ackn-pos', AcknowledgedPOViewSet)
router.register(r'documents', DocumentsRequiredViewSet)
# router.register(r'pre-payments', PrePaymentViewSet)
router.register(r'lc-copies', LcCopyViewSet)
router.register(r'lc-ammendments', LcAmmendmentViewSet)
router.register(r'advance-tt-copies', AdvanceTTCopyViewSet)
# router.register(r'sales-purchases', SalesPurchaseViewSet)
router.register(r'sp--extra-charges', SalesPurchaseExtraChargeViewSet)
router.register(r'packing-lists', PackingListViewSet)
router.register(r'bl-copies', BL_CopyViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'coas', COAViewSet)
# router.register(r'payment-finances', PaymentFinanceViewSet)
router.register(r'tt-copies', TTCopyViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('trades/', TradeView.as_view(), name='trades'),
    path('trades/<int:pk>/', TradeView.as_view(), name='trade-detail'),

    path('pre-sales-purchases/', PreSalePurchaseView.as_view(), name='pre-sales-purchases'),
    path('pre-sales-purchases/<int:pk>/', PreSalePurchaseView.as_view(), name='pre-sales-purchases-detail'),

    path('pre-payments/', PrePaymentView.as_view(), name='pre-payments'),
    path('pre-payments/<int:pk>/', PrePaymentView.as_view(), name='pre-payments-detail'),

    path('sales-purchases/', SalesPurchaseView.as_view(), name='sales-purchases'),
    path('sales-purchases/<int:pk>/', SalesPurchaseView.as_view(), name='sales-purchases-detail'),

    path('payment-finances/', PaymentFinanceView.as_view(), name='payment-finances'),
    path('payment-finances/<int:pk>/', PaymentFinanceView.as_view(), name='payment-finances-detail'),
]+ router.urls

# urlpatterns = [
#     path('', Trade),
# ]