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
  
]