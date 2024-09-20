# serializers.py
from rest_framework import serializers
from drf_writable_nested import WritableNestedModelSerializer
from .models import *

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

class KycSerializer(serializers.ModelSerializer):
    class Meta:
        model = Kyc
        fields = '__all__'
        
class TradeProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = TradeProduct
        fields = '__all__'
        
    def get_product_details(self, obj):
        try:
            instance = ProductName.objects.get(id=obj.product_name)
            return ProductNameSerializer(instance).data
        except ProductName.DoesNotExist:
            return None
    def get_supplier_details(self, obj):
        try:
            instance = Kyc.objects.get(id=obj.packaging_supplier)  # or use another field to identify the company
            return KycSerializer(instance).data
        except Kyc.DoesNotExist:
            return None
    def get_packing_details(self, obj):
        try:
            instance = Packing.objects.get(id=obj.mode_of_packing)  # or use another field to identify the company
            return PackingSerializer(instance).data
        except Packing.DoesNotExist:
            return None

    def to_representation(self, instance):
        # Call the parent's `to_representation` method
        ret = super().to_representation(instance)
        # Debugging: Check the original URL
        print("Original LOI URL:", ret['loi'])
        # Add the serialized company details to the response
        ret['productName'] = self.get_product_details(instance)
        ret['supplier'] = self.get_supplier_details(instance)
        ret['packing'] = self.get_packing_details(instance)

        # Debugging: Check the URL after adding details
        print("Modified LOI URL:", ret['loi'])
        return ret

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

    ## additional related info
    def get_company_details(self, obj):
        try:
            company_instance = Company.objects.get(id=obj.company)  
            return CompanySerializer(company_instance).data
        except Company.DoesNotExist:
            return None 

    def get_kyc_details(self, obj):
        try:
            kyc_instance = Kyc.objects.get(id=obj.customer_company_name)  # or use another field to identify the company
            return KycSerializer(kyc_instance).data
        except Kyc.DoesNotExist:
            return None
    
    def get_bank_details(self, obj):
        try:
            instance = Bank.objects.get(id=obj.bank_name_address)
            return BankSerializer(instance).data
        except Bank.DoesNotExist:
            return None
    def get_currency_details(self, obj):
        try:
            instance = Currency.objects.get(id=obj.currency_selection)
            return CurrencySerializer(instance).data
        except Currency.DoesNotExist:
            return None
    def get_payment_term_details(self, obj):
        try:
            instance = PaymentTerm.objects.get(id=obj.payment_term)
            return PaymentTermSerializer(instance).data
        except PaymentTerm.DoesNotExist:
            return None
    def get_container_details(self, obj):
        try:
            instance = ShipmentSize.objects.get(id=obj.payment_term)
            return ShipmentSizeSerializer(instance).data
        except ShipmentSize.DoesNotExist:
            return None

    def to_representation(self, instance):
        # Call the parent's `to_representation` method
        ret = super().to_representation(instance)
        
        # Add the serialized company details to the response
        ret['companyName'] = self.get_company_details(instance)
        ret['customer'] = self.get_kyc_details(instance)
        ret['bank'] = self.get_bank_details(instance)
        ret['currency'] = self.get_currency_details(instance)
        ret['paymentTerm'] = self.get_payment_term_details(instance)
        ret['shipmentSize'] = self.get_container_details(instance)
        
        return ret


class PrintSerializer(serializers.ModelSerializer):
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
    
    def get_currency_details(self, obj):
        try:
            instance = Currency.objects.get(id=obj.currency_selection)
            return CurrencySerializer(instance).data
        except Currency.DoesNotExist:
            return None

    def get_payment_term_details(self, obj):
        try:
            instance = PaymentTerm.objects.get(id=obj.payment_term)
            return PaymentTermSerializer(instance).data
        except PaymentTerm.DoesNotExist:
            return None

    def get_company_details(self, obj):
        # Fetch company details manually
        try:
            # Assuming `company` field in `Trade` contains company name or ID
            company_instance = Company.objects.get(id=obj.company)  # or use another field to identify the company
            return CompanySerializer(company_instance).data
        except Company.DoesNotExist:
            return None  # Or handle it as needed

    def get_kyc_details(self, obj):
        # Fetch company details manually
        try:
            # Assuming `company` field in `Trade` contains company name or ID
            kyc_instance = Kyc.objects.get(id=obj.customer_company_name)  # or use another field to identify the company
            return KycSerializer(kyc_instance).data
        except Kyc.DoesNotExist:
            return None  # Or handle it as needed
    
    def get_bank_details(self, obj):
        # Fetch company details manually
        try:
            # Assuming `company` field in `Trade` contains company name or ID
            instance = Bank.objects.get(id=obj.bank_name_address)  # or use another field to identify the company
            return BankSerializer(instance).data
        except Bank.DoesNotExist:
            return None  # Or handle it as needed
    
    def get_container_details(self, obj):
        try:
            instance = ShipmentSize.objects.get(id=obj.payment_term)
            return ShipmentSizeSerializer(instance).data
        except ShipmentSize.DoesNotExist:
            return None


    def to_representation(self, instance):
        # Call the parent's `to_representation` method
        ret = super().to_representation(instance)
        
        # Add the serialized company details to the response
        ret['company'] = self.get_company_details(instance)
        ret['customer_company_name'] = self.get_kyc_details(instance)
        ret['bank_name_address'] = self.get_bank_details(instance)
        ret['paymentTerm'] = self.get_payment_term_details(instance)
        ret['shipmentSize'] = self.get_container_details(instance)
        ret['currency'] = self.get_currency_details(instance)
        
        return ret

    


class PaymentTermSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentTerm
        fields = '__all__'


class PreSalePurchaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreSalePurchase
        fields = '__all__'

    def get_trade_details(self, obj):
        try:
            instance = Trade.objects.get(id=obj.trn.id)
            return TradeSerializer(instance).data
        except Trade.DoesNotExist:
            return None
    

    def to_representation(self, instance):
        # Call the parent's `to_representation` method
        ret = super().to_representation(instance)
        
        # Add the serialized company details to the response
        ret['trade'] = self.get_trade_details(instance)
       
        return ret

class PreDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreDocument
        fields = '__all__'
    
    def get_doc_details(self, obj):
        try:
            instance = DocumentsRequired.objects.get(id=obj.name)
            return DocumentsRequiredSerializer(instance).data
        except DocumentsRequired.DoesNotExist:
            return None
    def to_representation(self, instance):
        # Call the parent's `to_representation` method
        ret = super().to_representation(instance)
        
        # Add the serialized company details to the response
     
        ret['doc'] = self.get_doc_details(instance)
        
        return ret

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
    
    def get_trade_details(self, obj):
        # Fetch company details manually
        try:
            # Assuming `company` field in `Trade` contains company name or ID
            instance = Trade.objects.get(id=obj.trn.id)  # or use another field to identify the company
            return TradeSerializer(instance).data
        except Trade.DoesNotExist:
            return None  # Or handle it as needed

    def get_payment_term_details(self, obj):
        # Fetch company details manually
        try:
            # Assuming `company` field in `Trade` contains company name or ID
            instance = PaymentTerm.objects.get(name=obj.trn.payment_term)  # or use another field to identify the company
            return PaymentTermSerializer(instance).data
        except PaymentTerm.DoesNotExist:
            return None  # Or handle it as needed

    def get_kyc_details(self, obj):
        # Fetch company details manually
        try:
            # Assuming `company` field in `Trade` contains company name or ID
            kyc_instance = Kyc.objects.get(id=obj.trn.customer_company_name)  # or use another field to identify the company
            return KycSerializer(kyc_instance).data
        except Kyc.DoesNotExist:
            return None  # Or handle it as needed

    def get_presp_details(self, obj):
        # Fetch company details manually
        try:
            # Assuming `company` field in `Trade` contains company name or ID
            instance = PreSalePurchase.objects.get(trn=obj.trn)  # or use another field to identify the company
            return PreSalePurchaseSerializer(instance).data
        except PreSalePurchase.DoesNotExist:
            return None  # Or handle it as needed

    def to_representation(self, instance):
        # Call the parent's `to_representation` method
        ret = super().to_representation(instance)
        
        # Add the serialized company details to the response
        ret['trn'] = self.get_trade_details(instance)
        ret['kyc'] = self.get_kyc_details(instance)
        ret['presp'] = self.get_presp_details(instance)
        ret['payment_term'] = self.get_payment_term_details(instance)
        
        return ret

class PrePaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Trade
        fields = '__all__'    

    def get_payment_term_details(self, obj):
        # Fetch company details manually
        try:
            # Assuming `company` field in `Trade` contains company name or ID
            instance = PaymentTerm.objects.get(name=obj.payment_term)  # or use another field to identify the company
            return PaymentTermSerializer(instance).data
        except PaymentTerm.DoesNotExist:
            return None  # Or handle it as needed

    def get_kyc_details(self, obj):
        # Fetch company details manually
        try:
            # Assuming `company` field in `Trade` contains company name or ID
            kyc_instance = Kyc.objects.get(id=obj.customer_company_name)  # or use another field to identify the company
            return KycSerializer(kyc_instance).data
        except Kyc.DoesNotExist:
            return None  # Or handle it as needed

    def get_presp_details(self, obj):
        # Fetch company details manually
        try:
            # Assuming `company` field in `Trade` contains company name or ID
            instance = PreSalePurchase.objects.get(trn=obj.id)  # or use another field to identify the company
            return PreSalePurchaseSerializer(instance).data
        except PreSalePurchase.DoesNotExist:
            return None  # Or handle it as needed

    def to_representation(self, instance):
        # Call the parent's `to_representation` method
        ret = super().to_representation(instance)
        
        # Add the serialized company details to the response
        ret['kyc'] = self.get_kyc_details(instance)
        ret['presp'] = self.get_presp_details(instance)
        ret['payment_term'] = self.get_payment_term_details(instance)
        
        return ret

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
    
    def get_trade_details(self, obj):
        # Fetch company details manually
        try:
            # Assuming `company` field in `Trade` contains company name or ID
            instance = Trade.objects.get(id=obj.trn.id)  # or use another field to identify the company
            return TradeSerializer(instance).data
        except Trade.DoesNotExist:
            return None  # Or handle it as needed

    def get_prepay_details(self, obj):
        # Fetch company details manually
        try:
            # Assuming `company` field in `Trade` contains company name or ID
            instance = PrePayment.objects.get(trn=obj.trn)  # or use another field to identify the company
            return PrePaymentSerializer(instance).data
        except PrePayment.DoesNotExist:
            return None  # Or handle it as needed

    def to_representation(self, instance):
        # Call the parent's `to_representation` method
        ret = super().to_representation(instance)
        
        # Add the serialized company details to the response
        ret['trn'] = self.get_trade_details(instance)
        ret['prepayment'] = self.get_prepay_details(instance)
        
        return ret
        
class SalesPurchaseProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesPurchaseProduct
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

class SPSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trade
        fields = '__all__'    

    def get_prepay_details(self, obj):
        # Fetch company details manually
        try:
            # Assuming `company` field in `Trade` contains company name or ID
            instance = PrePayment.objects.get(trn=obj.id)  # or use another field to identify the company
            return PrePaymentSerializer(instance).data
        except PrePayment.DoesNotExist:
            return None  # Or handle it as needed

    def to_representation(self, instance):
        # Call the parent's `to_representation` method
        ret = super().to_representation(instance)
        
        # Add the serialized company details to the response
        ret['prepayment'] = self.get_prepay_details(instance)
        return ret

class PaymentFinanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentFinance
        fields = '__all__'
    
    def get_sp_details(self, obj):
        # Fetch company details manually
        try:
            # Assuming `company` field in `Trade` contains company name or ID
            instance = SalesPurchase.objects.get(trn=obj.trn)  # or use another field to identify the company
            return SalesPurchaseSerializer(instance).data
        except SalesPurchase.DoesNotExist:
            return None  # Or handle it as needed

    def to_representation(self, instance):
        # Call the parent's `to_representation` method
        ret = super().to_representation(instance)
        
        # Add the serialized company details to the response
        ret['sp'] = self.get_sp_details(instance)
        
        return ret

class PFChargesSerializer(serializers.ModelSerializer):
    class Meta:
        model = PFCharges
        fields = '__all__'

class TTCopySerializer(serializers.ModelSerializer):
    class Meta:
        model = TTCopy
        fields = '__all__'

class PFSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trade
        fields = '__all__'    

    def get_sp_details(self, obj):
        # Fetch company details manually
        try:
            # Assuming `company` field in `Trade` contains company name or ID
            instance = SalesPurchase.objects.get(trn=obj.id)  # or use another field to identify the company
            return SalesPurchaseSerializer(instance).data
        except SalesPurchase.DoesNotExist:
            return None  # Or handle it as needed

    def to_representation(self, instance):
        # Call the parent's `to_representation` method
        ret = super().to_representation(instance)
        
        # Add the serialized company details to the response
        ret['sp'] = self.get_sp_details(instance)
        return ret



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
    
    def get_trade_details(self, obj):
        try:
            instance = Trade.objects.get(id=obj.payment_term)
            return TradeSerializer(instance).data
        except Trade.DoesNotExist:
            return None
    def get_product_details(self, obj):
        try:
            instance = ProductName.objects.get(id=obj.product_name)
            return ProductNameSerializer(instance).data
        except ProductName.DoesNotExist:
            return None

    def to_representation(self, instance):
        # Call the parent's `to_representation` method
        ret = super().to_representation(instance)
        
        # Add the serialized company details to the response
        ret['trade'] = self.get_trade_details(instance)
        ret['productName'] = self.get_product_details(instance)
    
        return ret

class SalesPendingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesPending
        fields = '__all__'

    def get_trade_details(self, obj):
        try:
            instance = Trade.objects.get(id=obj.payment_term)
            return TradeSerializer(instance).data
        except Trade.DoesNotExist:
            return None
    def get_product_details(self, obj):
        try:
            instance = ProductName.objects.get(id=obj.product_name)
            return ProductNameSerializer(instance).data
        except ProductName.DoesNotExist:
            return None

    def to_representation(self, instance):
        # Call the parent's `to_representation` method
        ret = super().to_representation(instance)
        
        # Add the serialized company details to the response
        ret['trade'] = self.get_trade_details(instance)
        ret['productName'] = self.get_product_details(instance)
    
        return ret

class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = '__all__'

class PackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Packing
        fields = '__all__'

class ShipmentSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShipmentSize
        fields = '__all__'

class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = '__all__'

class ProductNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductName
        fields = '__all__'