from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *


urlpatterns = [
    path('export/checktrade/', ExportTradeCheckView.as_view(), name='check_trade'),
    path('export/trade/', ExportTradeExcelView.as_view(), name='export_trade'),
    path('export/presp/', ExportPreSPExcelView.as_view(), name='export_presp'),
    path('export/prepay/', ExportPrePayExcelView.as_view(), name='export_prepay'),
    path('export/sp/', ExportSPExcelView.as_view(), name='export_sp'),
    path('export/pf/', ExportPaymentFinanceExcelView.as_view(), name='export_pf'),
    path('export/pl/', ExportPLExcelView.as_view(), name='export_pl'),
    path('export/kyc/', ExportKycExcelView.as_view(), name='export_kyc'),
    path('export/consumption/', ExportConsumptionExcelView.as_view(), name='export_consumption'),
    
    path('export/consumption-formula/', ExportConsumptionFormulaExcelView.as_view(), name='export_consumption_formula'),
    path('export/product-formula/', ExportProductFormulaExcelView.as_view(), name='export_product_formula'),
    path('export/final-product/', ExportFinalProductExcelView.as_view(), name='export_final_product'),
    path('export/packing/', ExportPackingExcelView.as_view(), name='export_packing'),
    path('export/raw-material/', ExportRawMaterialExcelView.as_view(), name='export_raw_material'),
    path('export/additive/', ExportAdditiveExcelView.as_view(), name='export_additive'),
    path('export/report/packing-cons/', ExportPackingConsumptionReportExcelView.as_view(), name='export_packing_cons_report'),
    path('export/report/additive-cons/', ExportAdditiveConsumptionReportExcelView.as_view(), name='export_additive_cons_report'),
    path('export/report/raw-cons/', ExportRawMaterialConsumptionReportExcelView.as_view(), name='export_raw_cons_report'),
    
    path('export/raw-category/', ExportRawCategoryExcelView.as_view(), name='export_raw_category'),
    path('export/additive-category/', ExportAdditiveCategoryExcelView.as_view(), name='export_additive_category'),
    
    path('export/inventory/', ExportInventoryExcelView.as_view(), name='export_inventory'),
    path('export/trade-pending/', ExportTradePendingExcelView.as_view(), name='export_trade_pending'),
    path('export/product-trace/', ExportTradeProductTraceExcelView.as_view(), name='export_product_trace'),
    path('export/product-ref/', ExportTradeProductRefExcelView.as_view(), name='export_product_ref'),
]