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
    
    def get_ref_trn_details(self, obj):
        try:
            if obj.ref_trn != 'NA':
                instance = Trade.objects.get(trn=obj.ref_trn)  # or use another field to identify the company
                return instance.trn
        except Trade.DoesNotExist:
            return None

    def to_representation(self, instance):
        # Call the parent's `to_representation` method
        ret = super().to_representation(instance)
       
        # Add the serialized company details to the response
        ret['productName'] = self.get_product_details(instance)
        ret['supplier'] = self.get_supplier_details(instance)
        ret['packing'] = self.get_packing_details(instance)
        ret['refTrn'] = self.get_ref_trn_details(instance)

        return ret

class TradeExtraCostSerializer(serializers.ModelSerializer):
    class Meta:
        model = TradeExtraCost
        fields = '__all__'

class TradeSerializer(serializers.ModelSerializer):
    trade_products = TradeProductSerializer(many=True, read_only=True)
    trade_extra_costs = TradeExtraCostSerializer(many=True, read_only=True)
    # related_trades = serializers.PrimaryKeyRelatedField(
    #     queryset=Trade.objects.all(),
    #     many=True,
    #     required=False,
        
    # )
    
    class Meta:
        model = Trade
        fields = '__all__'

    # def create(self, validated_data):
    #     related_trades_data = validated_data.pop('related_trades', [])
    #     trade = super().create(validated_data)
    #     if related_trades_data:
    #         trade.related_trades.set(related_trades_data)
    #     return trade
    
    # def update(self, instance, validated_data):
    #     related_trades_data = validated_data.pop('related_trades', [])
    #     trade = super().update(instance, validated_data)
    #     if related_trades_data:
    #         trade.related_trades.set(related_trades_data)
    #     return trade

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
            instance = ShipmentSize.objects.get(id=obj.container_shipment_size)
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
    # related_trades = serializers.PrimaryKeyRelatedField(
    #     queryset=Trade.objects.all(),
    #     many=True,
    #     required=False,
        
    # )
    
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
            instance = ShipmentSize.objects.get(id=obj.container_shipment_size)
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
    
class PreSalePurchaseSerializer(serializers.ModelSerializer):
    documentRequired = PreDocumentSerializer(many=True, read_only=True)
    class Meta:
        model = PreSalePurchase
        fields = '__all__'

    def get_trade_details(self, obj):
        try:
            instance = Trade.objects.get(id=obj.trn.id)
            return TradeSerializer(instance).data
        except Trade.DoesNotExist:
            return None
    def get_doc_details(self, obj):
        try:
            instance = PreDocument.objects.filter(presalepurchase=obj)
            return PreDocumentSerializer(instance,many=True).data
        except PreDocument.DoesNotExist:
            return None
    
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['trade'] = self.get_trade_details(instance)
        ret['documentRequired'] = self.get_doc_details(instance)
       
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
            instance = PaymentTerm.objects.get(id=obj.trn.payment_term)  # or use another field to identify the company
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


class SalesPurchaseProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesPurchaseProduct
        # fields = '__all__'
        exclude = ['pending_qty']
    
    def get_combined_pending_qty(self, obj):
        # Determine the trade type from the associated Trade object
        trade_type = obj.sp.trn.trade_type
        
        # Fetch the corresponding pending model based on trade type
        try:
            if trade_type == 'Sales':  # Example trade type for sales
                pending_obj = SalesPending.objects.get(
                    product_code=obj.product_code,
                    product_name=obj.product_name,
                    trn=obj.sp.trn
                )
            elif trade_type == 'Purchase':  # Example trade type for purchase
                pending_obj = PurchasePending.objects.get(
                    product_code=obj.product_code,
                    product_name=obj.product_name,
                    trn=obj.sp.trn
                )
            else:
                return obj.pending_qty  # Return original pending_qty if trade_type is unknown
           
            # Add the balance_qty from the pending object
            return  pending_obj.balance_qty + obj.bl_qty
        except (SalesPending.DoesNotExist, PurchasePending.DoesNotExist):
            return obj.pending_qty 

    def get_product_details(self, obj):
        try:
            instance = ProductName.objects.get(id=obj.product_name)
            return ProductNameSerializer(instance).data
        except ProductName.DoesNotExist:
            return None
        
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['productName'] = self.get_product_details(instance)
        ret['pending_qty'] = self.get_combined_pending_qty(instance)
        return ret

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

class SalesPurchaseSerializer(serializers.ModelSerializer):
    sp_product = SalesPurchaseProductSerializer(many=True, read_only=True)
    sp_extra_charges = SalesPurchaseExtraChargeSerializer(many=True, read_only=True)
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
        


class SPSerializer(serializers.ModelSerializer):
    trade_products = TradeProductSerializer(many=True, read_only=True)
    trade_extra_costs = TradeExtraCostSerializer(many=True, read_only=True)
    
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

class PFChargesSerializer(serializers.ModelSerializer):
    class Meta:
        model = PFCharges
        fields = '__all__'

class TTCopySerializer(serializers.ModelSerializer):
    class Meta:
        model = TTCopy
        fields = '__all__'

class PaymentFinanceSerializer(serializers.ModelSerializer):
    pf_charges = PFChargesSerializer(many=True, read_only=True)
    pf_ttcopy = TTCopySerializer(many=True, read_only=True)
    class Meta:
        model = PaymentFinance
        fields = '__all__'
    
    def get_sp_details(self, obj):
        # Fetch company details manually
        try:
            # Assuming `company` field in `Trade` contains company name or ID
            instance = SalesPurchase.objects.get(id=obj.sp.id)  # or use another field to identify the company
            return SalesPurchaseSerializer(instance).data
        except SalesPurchase.DoesNotExist:
            return None  # Or handle it as needed

    def to_representation(self, instance):
        # Call the parent's `to_representation` method
        ret = super().to_representation(instance)
        
        # Add the serialized company details to the response
        ret['sp'] = self.get_sp_details(instance)
        
        return ret



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
            instance = Trade.objects.get(trn=obj.trn)
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
            instance = Trade.objects.get(trn=obj.trn)
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
    
    def get_product_details(self, obj):
        try:
            instance = ProductName.objects.get(id=obj.product_name)
            return ProductNameSerializer(instance).data
        except ProductName.DoesNotExist:
            return None
    
    def to_representation(self, instance):
        ret = super().to_representation(instance)
       
        ret['productName'] = self.get_product_details(instance)
        return ret

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


class ProfitLossSerializer(serializers.ModelSerializer):
    class Meta:
        model = PL
        fields = '__all__'

    def get_sales_trn_details(self, obj):
        try:
            instance = PaymentFinance.objects.get(sp=obj.sales_trn)
            return PaymentFinanceSerializer(instance).data
        except PaymentFinance.DoesNotExist:
            return None  # Or handle it as needed
    
    def get_purchase_trn_details(self, obj):
        try:
            instance = PaymentFinance.objects.get(sp=obj.purchase_trn)
            return PaymentFinanceSerializer(instance).data
        except PaymentFinance.DoesNotExist:
            return None  # Or handle it as needed

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['salesPF'] = self.get_sales_trn_details(instance)
        ret['purchasePF'] = self.get_purchase_trn_details(instance)
        return ret


class PLSerializer(serializers.ModelSerializer):
    sp_product = SalesPurchaseProductSerializer(many=True, read_only=True)
    sp_extra_charges = SalesPurchaseExtraChargeSerializer(many=True, read_only=True)
    class Meta:
        model = SalesPurchase
        fields = '__all__'
    

    def get_prepay_details(self, obj):
        # Fetch company details manually
        try:
            # Assuming `company` field in `Trade` contains company name or ID
            instance = PrePayment.objects.get(trn=obj.trn)  # or use another field to identify the company
            return PrePaymentSerializer(instance).data
        except PrePayment.DoesNotExist:
            return None  # Or handle it as needed

    def get_pf_details(self, obj):
        # Fetch company details manually
        try:
            # Assuming `company` field in `Trade` contains company name or ID
            instance = PaymentFinance.objects.get(sp=obj.id)  # or use another field to identify the company
            return PaymentFinanceSerializer(instance).data
        except PaymentFinance.DoesNotExist:
            return None  # Or handle it as needed

    def to_representation(self, instance):
        # Call the parent's `to_representation` method
        ret = super().to_representation(instance)
        
        # Add the serialized company details to the response
        # ret['trn'] = self.get_trade_details(instance)
        ret['prepay'] = self.get_prepay_details(instance)
        ret['pf'] = self.get_pf_details(instance)
        return ret
    

# class TradeReportSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Trade
#         fields = '__all__'
    
#     def get_sp_details(self, obj):
#         # Fetch company details manually
#         try:
#             # Assuming `company` field in `Trade` contains company name or ID
#             instance = SalesPurchase.objects.get(trn=obj.id)  # or use another field to identify the company
#             return SalesPurchaseSerializer(instance).data
#         except SalesPurchase.DoesNotExist:
#             return None  # Or handle it as needed
    
#     def to_representation(self, instance):
#         ret = super().to_representation(instance)
#         ret['sp'] = self.get_sp_details(instance)
#         return ret


class TradeReportSPSerializer(serializers.ModelSerializer):
    sp_product = SalesPurchaseProductSerializer(many=True, read_only=True)
    sp_extra_charges = SalesPurchaseExtraChargeSerializer(many=True, read_only=True)
    pf = PaymentFinanceSerializer(many=True, source='pfs', read_only=True)

    class Meta:
        model = SalesPurchase
        fields = '__all__'

    def get_trade_details(self, obj):
        # Fetch related Trade details
        try:
            trade_instance = Trade.objects.get(id=obj.trn.id)  # Access related Trade
            return TradeSerializer(trade_instance).data
        except Trade.DoesNotExist:
            return None  # Or handle it as needed

    def get_prepay_details(self, obj):
        # Fetch related PrePayment details
        try:
            prepayment_instance = PrePayment.objects.get(trn=obj.trn)
            return PrePaymentSerializer(prepayment_instance).data
        except PrePayment.DoesNotExist:
            return None  # Or handle it as needed

    def to_representation(self, instance):
        # Call the parent's `to_representation` method
        ret = super().to_representation(instance)

        # Add serialized trade and prepayment details
        ret['trn'] = self.get_trade_details(instance)
        ret['prepayment'] = self.get_prepay_details(instance)

        return ret



from rest_framework import serializers
from .models import Trade, PreSalePurchase, PrePayment, SalesPurchase
from .serializers import TradeSerializer, PreSalePurchaseSerializer, PrePaymentSerializer, TradeReportSPSerializer


class TradeReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trade
        fields = '__all__'
    
    def get_trade_details(self, obj):
        # Fetch related Trade details
        try:
            # Make sure to query by the correct field, such as 'id'
            trade_instance = Trade.objects.get(id=obj.id)  # Access related Trade using 'id'
            return TradeSerializer(trade_instance).data
        except Trade.DoesNotExist:
            return None  # Or handle it as needed
    
    def get_presp_details(self, obj):
        # Fetch related PreSalePurchase details
        try:
            prepayment_instance = PreSalePurchase.objects.get(trn=obj.id)  # Use 'trn' for PreSalePurchase
            return PreSalePurchaseSerializer(prepayment_instance).data
        except PreSalePurchase.DoesNotExist:
            return None  # Or handle it as needed

    def get_prepay_details(self, obj):
        # Fetch related PrePayment details
        try:
            prepayment_instance = PrePayment.objects.get(trn=obj.id)  # Use 'trn' for PrePayment
            return PrePaymentSerializer(prepayment_instance).data
        except PrePayment.DoesNotExist:
            return None  # Or handle it as needed

    def get_sp_details(self, obj):
        # Fetch related SalesPurchase details
        sp_instances = obj.salespurchase_set.all()  # Get all related SalesPurchase instances
        return TradeReportSPSerializer(sp_instances, many=True).data

    def to_representation(self, instance):
        # Customize the representation of the instance
        ret = super().to_representation(instance)
        ret['trade'] = self.get_trade_details(instance)
        ret['presp'] = self.get_presp_details(instance)
        ret['pp'] = self.get_prepay_details(instance)
        ret['sp'] = self.get_sp_details(instance)
        return ret
