from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'trades', TradeViewSet)
router.register(r'trade-products', TradeProductViewSet)
router.register(r'trade-extra-cost', TradeExtraCostViewSet)
router.register(r'payment-terms', PaymentTermViewSet)
router.register(r'pre-sales-purchases', PreSalePurchaseViewSet)
router.register(r'ackn-pis', AcknowledgedPIViewSet)
router.register(r'ackn-pos', AcknowledgedPOViewSet)
router.register(r'documents', DocumentsRequiredViewSet)
router.register(r'pre-payments', PrePaymentViewSet)
router.register(r'lc-copies', LcCopyViewSet)
router.register(r'lc-ammendments', LcAmmendmentViewSet)
router.register(r'advance-tt-copies', AdvanceTTCopyViewSet)
router.register(r'sales-purchases', SalesPurchaseViewSet)
router.register(r'sp--extra-charges', SalesPurchaseExtraChargeViewSet)
router.register(r'packing-lists', PackingListViewSet)
router.register(r'bl-copies', BL_CopyViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'coas', COAViewSet)
router.register(r'payment-finances', PaymentFinanceViewSet)
router.register(r'tt-copies', TTCopyViewSet)


urlpatterns = [
    path('', include(router.urls)),
]

# urlpatterns = [
#     path('', Trade),
# ]