# filters.py
import django_filters
from .models import *

class TradeFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name='trd', lookup_expr='gte')  # Replace `date_field` with the actual field name
    date_to = django_filters.DateFilter(field_name='trd', lookup_expr='lte')    # Replace `date_field` with the actual field name
    # sales = django_filters.BooleanFilter(field_name='trade_category', lookup_expr='exact')
    # purchase = django_filters.BooleanFilter(field_name='trade_category', lookup_expr='exact')
    # cancel = django_filters.BooleanFilter(field_name='trade_category', lookup_expr='exact')
   

    class Meta:
        model = Trade
        fields = {
            'company': ['exact', 'icontains'],
            'trn': ['exact', 'icontains'],
            'trade_type': ['exact', 'icontains'],
            'trade_category': ['exact', 'icontains'],
            'country_of_origin': ['exact', 'icontains'],
            'customer_company_name': ['exact', 'icontains'],
            'address': ['exact', 'icontains'],
            'payment_term': ['exact', 'icontains'],
            'logistic_provider': ['exact', 'icontains'],
            'bank_name_address': ['exact', 'icontains'],
            'approved': ['exact'],
            'reviewed': ['exact'],
            'commission_value': ['exact', 'gte', 'lte'],
        }

class TradeProductFilter(django_filters.FilterSet):
    class Meta:
        model = TradeProduct
        fields = {
            'product_code': ['exact', 'icontains'],
            'product_name': ['exact', 'icontains'],
            'product_name_for_client': ['exact', 'icontains'],
            'hs_code': ['exact', 'icontains'],
        }

class TradeExtraCostFilter(django_filters.FilterSet):
    class Meta:
        model = TradeExtraCost
        fields = {
            'extra_cost': ['exact', 'gte', 'lte'],
            'extra_cost_remarks': ['exact', 'icontains'],
        }

class PreSalePurchaseFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name='trn__trd', lookup_expr='gte')  # Replace `date_field` with the actual field name
    date_to = django_filters.DateFilter(field_name='trn__trd', lookup_expr='lte') 
    class Meta:
        model = PreSalePurchase
        fields = {
            'trn__trn': ['exact', 'icontains'],  # Filter by Trade TRN
            'trn__trade_type': ['exact', 'icontains'],
            'trn__company': ['exact', 'icontains'],
            'date': ['exact', 'year__gt', 'year__lt', 'year__gte', 'year__lte'],
            'doc_issuance_date': ['exact', 'year__gt', 'year__lt', 'year__gte', 'year__lte'],
            'approved': ['exact'],
            'remarks': ['exact', 'icontains'],
        }

class PrePaymentFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name='trn__trd', lookup_expr='gte')  # Replace `date_field` with the actual field name
    date_to = django_filters.DateFilter(field_name='trn__trd', lookup_expr='lte') 
    class Meta:
        model = PrePayment
        fields = {
            'trn__trn': ['exact', 'icontains'],  # Filter by Trade TRN
            'trn__trade_type': ['exact', 'icontains'],
            'trn__company': ['exact', 'icontains'],
            'lc_number': ['exact', 'icontains'],
            'lc_opening_bank': ['exact', 'icontains'],
            'advance_received': ['exact', 'gte', 'lte'],
            'date_of_receipt': ['exact', 'icontains'],
            'advance_paid': ['exact', 'gte', 'lte'],
            'date_of_payment': ['exact', 'icontains'],
            'lc_expiry_date': ['exact', 'icontains'],
            'latest_shipment_date_in_lc': ['exact', 'icontains'],
            'remarks': ['exact', 'icontains'],
            'reviewed': ['exact'],
        }

class SalesPurchaseFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name='trn__trd', lookup_expr='gte')  # Replace `date_field` with the actual field name
    date_to = django_filters.DateFilter(field_name='trn__trd', lookup_expr='lte') 
    class Meta:
        model = SalesPurchase
        fields = {
            'trn__trn': ['exact', 'icontains'],
            'trn__trade_type': ['exact', 'icontains'],
            'trn__company': ['exact', 'icontains'],
            'invoice_date': ['exact', 'gte', 'lte'],
            'invoice_number': ['exact', 'icontains'],
            'invoice_amount': ['exact', 'gte', 'lte'],
            # 'commission_value': ['exact', 'gte', 'lte'],
            'bl_number': ['exact', 'icontains'],
            # 'bl_qty': ['exact', 'gte', 'lte'],
            'bl_fees': ['exact', 'gte', 'lte'],
            'bl_collection_cost': ['exact', 'gte', 'lte'],
            'bl_date': ['exact'],
            # 'total_packing_cost': ['exact', 'gte', 'lte'],
            # 'packaging_supplier': ['exact', 'icontains'],
            # 'logistic_supplier': ['exact', 'icontains'],
            # 'batch_number': ['exact', 'icontains'],
            # 'production_date': ['exact'],
            'logistic_cost': ['exact', 'gte', 'lte'],
            'logistic_cost_due_date': ['exact', 'icontains'],
            'liner': ['exact', 'icontains'],
            'pod': ['exact', 'icontains'],
            'pol': ['exact', 'icontains'],
            'etd': ['exact', 'gte', 'lte'],
            'eta': ['exact', 'gte', 'lte'],
            'shipment_status': ['exact', 'icontains'],
            'remarks': ['exact', 'icontains'],
            'reviewed': ['exact'],
        }

class PaymentFinanceFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name='sp__trn__trd', lookup_expr='gte')  # Replace `date_field` with the actual field name
    date_to = django_filters.DateFilter(field_name='sp__trn__trd', lookup_expr='lte') 
    class Meta:
        model = PaymentFinance
        fields = {
            # 'sp__trn': ['exact', 'icontains'],
            # 'trn__trade_type': ['exact', 'icontains'],
            # 'trn__company': ['exact', 'icontains'],

            'sp__trn__trn': ['exact','icontains'],
            'balance_payment_received': ['exact', 'gte', 'lte'],
            'balance_payment_made': ['exact', 'gte', 'lte'],
            'net_due_in_this_trade': ['exact', 'gte', 'lte'],
    
            # 'payment_mode': ['exact', 'icontains'],
            'status_of_payment': ['exact', 'icontains'],
            'reviewed': ['exact'],
            
        }


class KycFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name='date', lookup_expr='gte')  # Replace `date_field` with the actual field name
    date_to = django_filters.DateFilter(field_name='date', lookup_expr='lte') 
    class Meta:
        model = Kyc
        fields = {
            'name': ['exact', 'icontains'],
            'companyRegNo': ['exact', 'icontains'],
            'regAddress': ['exact', 'icontains'],
            'mailingAddress': ['exact', 'gte', 'lte'],
            'telephone': ['exact', 'gte', 'lte'],
            'fax': ['exact', 'gte', 'lte'],
            'person1': ['exact', 'gte', 'lte'],
            'designation1': ['exact', 'gte', 'lte'],
            'mobile1': ['exact', 'gte', 'lte'],
            'email1': ['exact', 'gte', 'lte'],
            'person2': ['exact', 'gte', 'lte'],
            'designation2': ['exact', 'gte', 'lte'],
            'mobile2': ['exact', 'icontains'],
            'email2': ['exact', 'icontains'],
            'banker': ['exact', 'icontains'],
            'address': ['exact', 'icontains'],
            'swiftCode': ['exact', 'icontains'],
            'accountNumber': ['exact', 'icontains'],
            'approve1': ['exact'],
            'approve2': ['exact']
        }

class InventoryFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name='production_date', lookup_expr='gte')  # Replace `date_field` with the actual field name
    date_to = django_filters.DateFilter(field_name='production_date', lookup_expr='lte') 
    class Meta:
        model = Inventory
        fields = {
            'product_name': ['exact', 'icontains'],
            'batch_number': ['exact', 'icontains'],
            'unit': ['exact', 'icontains'],
        }

class TradeProductTraceFilter(django_filters.FilterSet):
   
    class Meta:
        model = TradeProductTrace
        fields = {
            'product_code': ['exact'],  # Filter by Trade TRN
            # 'first_trn': ['exact'],
            'trade_type':['exact'],
        }

class TradeProductRefFilter(django_filters.FilterSet):
   
    class Meta:
        model = TradeProductRef
        fields = {
            'product_code': ['exact'],  # Filter by Trade TRN
            # 'first_trn': ['exact'],
            'trade_type':['exact'],
        }

class PurchaseProductTraceFilter(django_filters.FilterSet):
   
    class Meta:
        model = TradeProductTrace
        fields = {
            'product_code': ['exact'],  # Filter by Trade TRN
            # 'first_trn': ['exact'],
        }

class TradePendingFilter(django_filters.FilterSet):
   
    class Meta:
        model = TradePending
        fields = {
            'product_code': ['exact'],  # Filter by Trade TRN
            'trade_type':['exact', 'icontains'],
        }


class PLFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name='sales_trn__trn__trd', lookup_expr='gte')  # Replace `date_field` with the actual field name
    date_to = django_filters.DateFilter(field_name='sales_trn__trn__trd', lookup_expr='lte') 
    class Meta:
        model = PL
        fields = {
            'sales_trn__trn__trn': ['exact', 'icontains'],
            'purchase_trn__trn__trn': ['exact', 'icontains'],
            
            'remarks': ['exact', 'icontains'],
        }