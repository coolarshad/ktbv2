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
router.register(r'pf-charges', PFChargesViewSet)
router.register(r'kyc', KycViewSet)
router.register(r'purchase-product-trace', PurchaseProductTraceViewSet)
router.register(r'sales-product-trace', SalesProductTraceViewSet)
router.register(r'purchase-pending', PurchasePendingViewSet)
router.register(r'sales-pending', SalesPendingViewSet)
router.register(r'company', CompanyViewSet)
router.register(r'bank', BankViewSet)
router.register(r'unit', UnitViewSet)
router.register(r'inventory', InventoryViewSet)
router.register(r'packings', PackingViewSet)
router.register(r'shipment-sizes', ShipmentSizeViewSet)
router.register(r'currencies', CurrencyViewSet)
router.register(r'product-names', ProductNameViewSet)
router.register(r'profitloss', ProfitLossViewSet)



urlpatterns = [
    path('', include(router.urls)),
    path('trades/', TradeView.as_view(), name='trades'),
    path('trades/<int:pk>/', TradeView.as_view(), name='trade-detail'),
    path('tradeapprove/<int:pk>/', TradeApproveView.as_view(), name='trade-approve'),
    path('tradereview/<int:pk>/', TradeReviewView.as_view(), name='trade-review'),

    path('pre-sales-purchases/', PreSalePurchaseView.as_view(), name='pre-sales-purchases'),
    path('pre-sales-purchases/<int:pk>/', PreSalePurchaseView.as_view(), name='pre-sales-purchases-detail'),
    path('pre-sales-purchases-approve/<int:pk>/', PreSalePurchaseApprove.as_view(), name='pre-sales-purchases-approve'),

    path('pre-payments/', PrePaymentView.as_view(), name='pre-payments'),
    path('pre-payments/<int:pk>/', PrePaymentView.as_view(), name='pre-payments-detail'),
    path('pre-payments-review/<int:pk>/', PrePaymentReview.as_view(), name='pre-payments-review'),

    path('sales-purchases/', SalesPurchaseView.as_view(), name='sales-purchases'),
    path('sales-purchases/<int:pk>/', SalesPurchaseView.as_view(), name='sales-purchases-detail'),
    path('sales-purchases-approve/<int:pk>/', SalesPurchaseApprove.as_view(), name='sales-purchases-approve'),
    path('sp-purchase-bl/', SalesPurchaseBLView.as_view(), name='sales-purchases-bl'),

    path('payment-finances/', PaymentFinanceView.as_view(), name='payment-finances'),
    path('payment-finances/<int:pk>/', PaymentFinanceView.as_view(), name='payment-finances-detail'),
    path('payment-finances-review/<int:pk>/', PFReview.as_view(), name='payment-finances-review'),

    path('companies/<int:company_id>/next-counter/', NextCounterView.as_view(), name='next-counter'),

    path('print/<int:pk>/', PrintView.as_view(), name='trades'),
    path('prepay/<int:pk>/', PrePayView.as_view(), name='prepay'),
    path('sp/<int:pk>/', SPView.as_view(), name='sp'),
    path('pf/<int:pk>/', PFView.as_view(), name='pf'),
    path('pl/<int:pk>/', PLView.as_view(), name='pl'),  

    path('kyc-approve-one/<int:pk>/', KycApproveOneView.as_view(), name='kyc-approve1'),
    path('kyc-approve-two/<int:pk>/', KycApproveTwoView.as_view(), name='kyc-approve2'),


    path('product-balance', RefBalanceView.as_view(), name='product-balance'),
    path('pending-balance', PendingBalanceView.as_view(), name='pending-balance'),
    path('advance-amount/', AdvanceAmountView.as_view(), name='advance-amount'),

    path('trade-report/', TradeReportView.as_view(), name='trade-report'),
    path('inventory-detail/', InventoryDetailView.as_view(), name='inventory-detail'),
]+ router.urls

# urlpatterns = [
#     path('', Trade),
# ]