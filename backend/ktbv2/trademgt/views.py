from django.shortcuts import render
from django.http import HttpResponse

from rest_framework import viewsets
from .models import *
from .serializers import *

class TradeViewSet(viewsets.ModelViewSet):
    queryset = Trade.objects.all()
    serializer_class = TradeSerializer


class TradeProductViewSet(viewsets.ModelViewSet):
    queryset = TradeProduct.objects.all()
    serializer_class = TradeProductSerializer

class TradeExtraCostViewSet(viewsets.ModelViewSet):
    queryset = TradeExtraCost.objects.all()
    serializer_class = TradeExtraCostSerializer

class PaymentTermViewSet(viewsets.ModelViewSet):
    queryset = PaymentTerm.objects.all()
    serializer_class = PaymentTermSerializer

class PreSalePurchaseViewSet(viewsets.ModelViewSet):
    queryset = PreSalePurchase.objects.all()
    serializer_class = PreSalePurchaseSerializer

class AcknowledgedPIViewSet(viewsets.ModelViewSet):
    queryset = AcknowledgedPI.objects.all()
    serializer_class = AcknowledgedPISerializer

class AcknowledgedPOViewSet(viewsets.ModelViewSet):
    queryset = AcknowledgedPO.objects.all()
    serializer_class = AcknowledgedPOSerializer

class DocumentsRequiredViewSet(viewsets.ModelViewSet):
    queryset = DocumentsRequired.objects.all()
    serializer_class = DocumentsRequiredSerializer

class PrePaymentViewSet(viewsets.ModelViewSet):
    queryset = PrePayment.objects.all()
    serializer_class = PrePaymentSerializer

class LcCopyViewSet(viewsets.ModelViewSet):
    queryset = LcCopy.objects.all()
    serializer_class = LcCopySerializer

class LcAmmendmentViewSet(viewsets.ModelViewSet):
    queryset = LcAmmendment.objects.all()
    serializer_class = LcAmmendmentSerializer

class AdvanceTTCopyViewSet(viewsets.ModelViewSet):
    queryset = AdvanceTTCopy.objects.all()
    serializer_class = AdvanceTTCopySerializer

class SalesPurchaseViewSet(viewsets.ModelViewSet):
    queryset = SalesPurchase.objects.all()
    serializer_class = SalesPurchaseSerializer

class SalesPurchaseExtraChargeViewSet(viewsets.ModelViewSet):
    queryset = SalesPurchaseExtraCharge.objects.all()
    serializer_class = SalesPurchaseExtraChargeSerializer

class PackingListViewSet(viewsets.ModelViewSet):
    queryset = PackingList.objects.all()
    serializer_class = PackingListSerializer

class BL_CopyViewSet(viewsets.ModelViewSet):
    queryset = BL_Copy.objects.all()
    serializer_class = BL_CopySerializer

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

class COAViewSet(viewsets.ModelViewSet):
    queryset = COA.objects.all()
    serializer_class = COASerializer

class PaymentFinanceViewSet(viewsets.ModelViewSet):
    queryset = PaymentFinance.objects.all()
    serializer_class = PaymentFinanceSerializer

class TTCopyViewSet(viewsets.ModelViewSet):
    queryset = TTCopy.objects.all()
    serializer_class = TTCopySerializer