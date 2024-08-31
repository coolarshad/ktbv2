# serializers.py
from rest_framework import serializers
from drf_writable_nested import WritableNestedModelSerializer
from .models import *

class TradeProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = TradeProduct
        fields = '__all__'

class TradeExtraCostSerializer(serializers.ModelSerializer):
    class Meta:
        model = TradeExtraCost
        fields = '__all__'

class TradeSerializer(serializers.ModelSerializer):
    trade_products = TradeProductSerializer(many=True, read_only=True)
    trade_extra_costs = TradeExtraCostSerializer(many=True, read_only=True)
    related_trades = serializers.PrimaryKeyRelatedField(
        queryset=Trade.objects.all(),
        many=True,
        required=False,
        
    )

    class Meta:
        model = Trade
        fields = '__all__'
    
    def create(self, validated_data):
        related_trades_data = validated_data.pop('related_trades', [])
        trade = super().create(validated_data)
        if related_trades_data:
            trade.related_trades.set(related_trades_data)
        return trade
    
    def update(self, instance, validated_data):
        related_trades_data = validated_data.pop('related_trades', [])
        trade = super().update(instance, validated_data)
        if related_trades_data:
            trade.related_trades.set(related_trades_data)
        return trade

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


class KycSerializer(serializers.ModelSerializer):
    class Meta:
        model = Kyc
        fields = '__all__'


class PurchaseProductTraceSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseProductTrace
        fields = '__all__'
    
class SalesProductTraceSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesProductTrace
        fields = '__all__'

class PurchasePendingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchasePending
        fields = '__all__'

class SalesPendingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesPending
        fields = '__all__'

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'

class BankSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bank
        fields = '__all__'

class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = '__all__'