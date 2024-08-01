# serializers.py
from rest_framework import serializers
from .models import *

class TradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trade
        fields = '__all__'

class TradeProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = TradeProduct
        fields = '__all__'


class TradeExtraCostSerializer(serializers.ModelSerializer):
    class Meta:
        model = TradeExtraCost
        fields = '__all__'


class PaymentTermSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentTerm
        fields = '__all__'


class PreSalePurchaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreSalePurchase
        fields = '__all__'

class AcknowledgedPISerializer(serializers.ModelSerializer):
    class Meta:
        model = AcknowledgedPI
        fields = '__all__'


class AcknowledgedPOSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcknowledgedPO
        fields = '__all__'

class DocumentsRequiredSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentsRequired
        fields = '__all__'

class PrePaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrePayment
        fields = '__all__'


class LcCopySerializer(serializers.ModelSerializer):
    class Meta:
        model = LcCopy
        fields = '__all__'

class LcAmmendmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LcAmmendment
        fields = '__all__'

class AdvanceTTCopySerializer(serializers.ModelSerializer):
    class Meta:
        model = AdvanceTTCopy
        fields = '__all__'

class SalesPurchaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesPurchase
        fields = '__all__'

class SalesPurchaseExtraChargeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesPurchaseExtraCharge
        fields = '__all__'

class PackingListSerializer(serializers.ModelSerializer):
    class Meta:
        model = PackingList
        fields = '__all__'

class BL_CopySerializer(serializers.ModelSerializer):
    class Meta:
        model = BL_Copy
        fields = '__all__'

class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = '__all__'

class COASerializer(serializers.ModelSerializer):
    class Meta:
        model = COA
        fields = '__all__'

class PaymentFinanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentFinance
        fields = '__all__'

class TTCopySerializer(serializers.ModelSerializer):
    class Meta:
        model = TTCopy
        fields = '__all__'