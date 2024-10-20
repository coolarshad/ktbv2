from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *


urlpatterns = [
    path('export/trade/', ExportTradeExcelView.as_view(), name='export_trade'),
  
]