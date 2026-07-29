# filters.py
import django_filters
from django.db import models
from django.db.models import Q
from .models import *

def get_searchable_lookups(model):
    lookups = []
    checked_models = {model}
    
    for field in model._meta.get_fields():
        if field.one_to_many or field.many_to_many:
            continue
        if field.auto_created and not field.is_relation:
            continue
            
        if isinstance(field, (models.CharField, models.TextField)):
            lookups.append(field.name)
        elif isinstance(field, (models.ForeignKey, models.OneToOneField)):
            related_model = field.related_model
            if related_model and related_model not in checked_models:
                for subfield in related_model._meta.get_fields():
                    if subfield.auto_created:
                        continue
                    if isinstance(subfield, (models.CharField, models.TextField)):
                        if subfield.name in ['password', 'email', 'phone', 'role', 'designation', 'last_login']:
                            continue
                        lookups.append(f"{field.name}__{subfield.name}")
    return lookups

class SearchableFilterSet(django_filters.FilterSet):
    q = django_filters.CharFilter(method='global_search', label='Search')

    def global_search(self, queryset, name, value):
        if not value:
            return queryset
        
        q_objects = Q()
        model = self.Meta.model
        lookups = get_searchable_lookups(model)
        
        # 1. Resolve matching Kyc IDs
        try:
            from trademgt.models import Kyc
            kyc_ids = list(Kyc.objects.filter(name__icontains=value).values_list('id', flat=True))
            kyc_str_ids = [str(x) for x in kyc_ids]
        except Exception:
            kyc_str_ids = []

        # 2. Resolve matching Company IDs
        try:
            from trademgt.models import Company
            company_ids = list(Company.objects.filter(name__icontains=value).values_list('id', flat=True))
            company_str_ids = [str(x) for x in company_ids]
        except Exception:
            company_str_ids = []

        # 3. Resolve matching Bank IDs
        try:
            from trademgt.models import Bank
            bank_ids = list(Bank.objects.filter(name__icontains=value).values_list('id', flat=True))
            bank_str_ids = [str(x) for x in bank_ids]
        except Exception:
            bank_str_ids = []

        # 4. Resolve matching Currency IDs
        try:
            from trademgt.models import Currency
            currency_ids = list(Currency.objects.filter(name__icontains=value).values_list('id', flat=True))
            currency_str_ids = [str(x) for x in currency_ids]
        except Exception:
            currency_str_ids = []

        # 5. Resolve matching PaymentTerm IDs
        try:
            from trademgt.models import PaymentTerm
            pt_ids = list(PaymentTerm.objects.filter(name__icontains=value).values_list('id', flat=True))
            pt_str_ids = [str(x) for x in pt_ids]
        except Exception:
            pt_str_ids = []

        for lookup in lookups:
            if lookup == 'customer_company_name' or lookup.endswith('__customer_company_name'):
                if kyc_str_ids:
                    q_objects |= Q(**{f"{lookup}__in": kyc_str_ids})
                else:
                    q_objects |= Q(**{f"{lookup}__icontains": value})
            elif lookup == 'company' or lookup.endswith('__company'):
                if company_str_ids:
                    q_objects |= Q(**{f"{lookup}__in": company_str_ids})
                else:
                    q_objects |= Q(**{f"{lookup}__icontains": value})
            elif lookup == 'bank_name_address' or lookup.endswith('__bank_name_address'):
                if bank_str_ids:
                    q_objects |= Q(**{f"{lookup}__in": bank_str_ids})
                else:
                    q_objects |= Q(**{f"{lookup}__icontains": value})
            elif lookup == 'currency_selection' or lookup.endswith('__currency_selection'):
                if currency_str_ids:
                    q_objects |= Q(**{f"{lookup}__in": currency_str_ids})
                else:
                    q_objects |= Q(**{f"{lookup}__icontains": value})
            elif lookup == 'payment_term' or lookup.endswith('__payment_term'):
                if pt_str_ids:
                    q_objects |= Q(**{f"{lookup}__in": pt_str_ids})
                else:
                    q_objects |= Q(**{f"{lookup}__icontains": value})
            else:
                q_objects |= Q(**{f"{lookup}__icontains": value})
            
        # Also search in S.N (id), numeric fields, and Date fields generically
        val_float = None
        try:
            val_float = float(value.strip())
        except ValueError:
            pass

        for field in model._meta.get_fields():
            if field.one_to_many or field.many_to_many:
                continue
            if field.is_relation:
                continue
            
            # S.N / id, numeric fields, and Date fields
            if field.primary_key or isinstance(field, (
                models.AutoField, models.IntegerField, models.BigIntegerField, models.SmallIntegerField,
                models.FloatField, models.DecimalField,
                models.DateField, models.DateTimeField
            )):
                q_objects |= Q(**{f"{field.name}__icontains": value.strip()})
                if val_float is not None and isinstance(field, (models.FloatField, models.DecimalField)):
                    q_objects |= Q(**{f"{field.name}": val_float})

        return queryset.filter(q_objects)

class TradeFilter(SearchableFilterSet):
    date_from = django_filters.DateFilter(field_name='trd', lookup_expr='gte')  # Replace `date_field` with the actual field name
    date_to = django_filters.DateFilter(field_name='trd', lookup_expr='lte')    # Replace `date_field` with the actual field name
    # sales = django_filters.BooleanFilter(field_name='trade_category', lookup_expr='exact')
    # purchase = django_filters.BooleanFilter(field_name='trade_category', lookup_expr='exact')
    # cancel = django_filters.BooleanFilter(field_name='trade_category', lookup_expr='exact')
    pending = django_filters.BooleanFilter(method='filter_pending')
    pending_sp = django_filters.BooleanFilter(method='filter_pending_sp')

    def filter_pending_sp(self, queryset, name, value):
        if value:
            return queryset.filter(salespurchase__isnull=True)
        return queryset

    def filter_pending(self, queryset, name, value):
        if value is True:
            return queryset.filter(Q(approved=False) | Q(reviewed=False))
        elif value is False:
            return queryset.filter(approved=True, reviewed=True)
        return queryset

    def global_search(self, queryset, name, value):
        if not value:
            return queryset

        val = value.strip()
        q_objects = Q()

        # ID
        if val.isdigit():
            q_objects |= Q(id=int(val))

        # Trade Type & TRN
        q_objects |= Q(trade_type__icontains=val)
        q_objects |= Q(trn__icontains=val)

        # Company
        try:
            from trademgt.models import Company
            comp_ids = list(Company.objects.filter(name__icontains=val).values_list('id', flat=True))
            if comp_ids:
                q_objects |= Q(company__in=comp_ids)
        except Exception:
            pass

        # Buyer/Seller Name (Kyc)
        try:
            from trademgt.models import Kyc
            kyc_ids = list(Kyc.objects.filter(name__icontains=val).values_list('id', flat=True))
            if kyc_ids:
                q_objects |= Q(customer_company_name__in=[str(k) for k in kyc_ids])
        except Exception:
            pass
        q_objects |= Q(customer_company_name__icontains=val)

        # Product Name & Code & Rate & Trade Qty
        q_objects |= Q(trade_products__product_code__icontains=val)
        q_objects |= Q(trade_products__product_name__icontains=val)
        q_objects |= Q(trade_products__product_name_for_client__icontains=val)
        try:
            from trademgt.models import ProductName
            p_ids = list(ProductName.objects.filter(name__icontains=val).values_list('id', flat=True))
            if p_ids:
                p_str_ids = [str(x) for x in p_ids]
                q_objects |= Q(trade_products__product_name__in=p_str_ids)
        except Exception:
            pass

        try:
            num_val = float(val)
            q_objects |= Q(trade_products__rate_in_usd=num_val)
            q_objects |= Q(trade_products__trade_qty=num_val)
        except ValueError:
            pass

        # Dates
        from django.utils.dateparse import parse_date
        parsed_d = parse_date(val)
        if parsed_d:
            q_objects |= Q(trd=parsed_d)
            q_objects |= Q(approval_date=parsed_d)

        return queryset.filter(q_objects).distinct()

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

class TradeProductFilter(SearchableFilterSet):
    class Meta:
        model = TradeProduct
        fields = {
            'product_code': ['exact', 'icontains'],
            'product_name': ['exact', 'icontains'],
            'product_name_for_client': ['exact', 'icontains'],
            'hs_code': ['exact', 'icontains'],
        }

class TradeExtraCostFilter(SearchableFilterSet):
    class Meta:
        model = TradeExtraCost
        fields = {
            'extra_cost': ['exact', 'gte', 'lte'],
            'extra_cost_remarks': ['exact', 'icontains'],
        }

class PreSalePurchaseFilter(SearchableFilterSet):
    date_from = django_filters.DateFilter(field_name='trn__trd', lookup_expr='gte')  # Replace `date_field` with the actual field name
    date_to = django_filters.DateFilter(field_name='trn__trd', lookup_expr='lte') 
    pending_sp = django_filters.BooleanFilter(method='filter_pending_sp')

    def filter_pending_sp(self, queryset, name, value):
        if value:
            return queryset.filter(trn__salespurchase__isnull=True)
        return queryset

    def global_search(self, queryset, name, value):
        if not value:
            return queryset

        val = value.strip()
        q_objects = Q()

        if val.isdigit():
            q_objects |= Q(id=int(val))

        q_objects |= Q(trn__trn__icontains=val)
        q_objects |= Q(trn__trade_type__icontains=val)
        q_objects |= Q(remarks__icontains=val)
        q_objects |= Q(trn__remarks__icontains=val)

        # Buyer/Seller (Kyc)
        q_objects |= Q(trn__customer_company_name__icontains=val)
        try:
            from trademgt.models import Kyc
            kyc_ids = list(Kyc.objects.filter(name__icontains=val).values_list('id', flat=True))
            if kyc_ids:
                q_objects |= Q(trn__customer_company_name__in=[str(k) for k in kyc_ids])
        except Exception:
            pass

        # Payment Term
        try:
            from trademgt.models import PaymentTerm
            pt_ids = list(PaymentTerm.objects.filter(name__icontains=val).values_list('id', flat=True))
            if pt_ids:
                q_objects |= Q(trn__payment_term__in=[str(p) for p in pt_ids])
        except Exception:
            pass

        from django.utils.dateparse import parse_date
        parsed_d = parse_date(val)
        if parsed_d:
            q_objects |= Q(doc_issuance_date=parsed_d)
            q_objects |= Q(date=parsed_d)

        return queryset.filter(q_objects).distinct()

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

class PrePaymentFilter(SearchableFilterSet):
    date_from = django_filters.DateFilter(field_name='trn__trd', lookup_expr='gte')  # Replace `date_field` with the actual field name
    date_to = django_filters.DateFilter(field_name='trn__trd', lookup_expr='lte') 
    pending_sp = django_filters.BooleanFilter(method='filter_pending_sp')

    def filter_pending_sp(self, queryset, name, value):
        if value:
            return queryset.filter(trn__salespurchase__isnull=True)
        return queryset

    def global_search(self, queryset, name, value):
        if not value:
            return queryset

        val = value.strip()
        q_objects = Q()

        if val.isdigit():
            q_objects |= Q(id=int(val))

        q_objects |= Q(trn__trn__icontains=val)
        q_objects |= Q(trn__trade_type__icontains=val)
        q_objects |= Q(lc_number__icontains=val)
        q_objects |= Q(lc_opening_bank__icontains=val)
        q_objects |= Q(remarks__icontains=val)
        q_objects |= Q(trn__remarks__icontains=val)

        try:
            from trademgt.models import Bank
            bank_ids = list(Bank.objects.filter(name__icontains=val).values_list('id', flat=True))
            if bank_ids:
                q_objects |= Q(lc_opening_bank__in=[str(b) for b in bank_ids])
        except Exception:
            pass

        try:
            num_val = float(val)
            q_objects |= Q(advance_received=num_val)
            q_objects |= Q(advance_paid=num_val)
        except ValueError:
            pass

        from django.utils.dateparse import parse_date
        parsed_d = parse_date(val)
        if parsed_d:
            q_objects |= Q(date_of_receipt=parsed_d)
            q_objects |= Q(date_of_payment=parsed_d)
            q_objects |= Q(lc_expiry_date=parsed_d)
            q_objects |= Q(latest_shipment_date_in_lc=parsed_d)

        return queryset.filter(q_objects).distinct()

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

class SalesPurchaseFilter(SearchableFilterSet):
    date_from = django_filters.DateFilter(field_name='trn__trd', lookup_expr='gte')  # Replace `date_field` with the actual field name
    date_to = django_filters.DateFilter(field_name='trn__trd', lookup_expr='lte') 

    def global_search(self, queryset, name, value):
        if not value:
            return queryset

        val = value.strip()
        q_objects = Q()

        if val.isdigit():
            q_objects |= Q(id=int(val))

        q_objects |= Q(trn__trn__icontains=val)
        q_objects |= Q(trn__trade_type__icontains=val)
        q_objects |= Q(invoice_number__icontains=val)
        q_objects |= Q(bl_number__icontains=val)
        q_objects |= Q(remarks__icontains=val)
        q_objects |= Q(trn__remarks__icontains=val)

        try:
            num_val = float(val)
            q_objects |= Q(invoice_amount=num_val)
        except ValueError:
            pass

        from django.utils.dateparse import parse_date
        parsed_d = parse_date(val)
        if parsed_d:
            q_objects |= Q(invoice_date=parsed_d)
            q_objects |= Q(bl_date=parsed_d)

        return queryset.filter(q_objects).distinct()
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

class PaymentFinanceFilter(SearchableFilterSet):
    date_from = django_filters.DateFilter(field_name='sp__trn__trd', lookup_expr='gte')  # Replace `date_field` with the actual field name
    date_to = django_filters.DateFilter(field_name='sp__trn__trd', lookup_expr='lte') 

    def global_search(self, queryset, name, value):
        if not value:
            return queryset

        val = value.strip()
        q_objects = Q()

        if val.isdigit():
            q_objects |= Q(id=int(val))
            q_objects |= Q(sp__id=int(val))

        q_objects |= Q(sp__trn__trn__icontains=val)
        q_objects |= Q(sp__trn__trade_type__icontains=val)
        q_objects |= Q(status_of_payment__icontains=val)
        q_objects |= Q(remarks__icontains=val)
        q_objects |= Q(sp__remarks__icontains=val)
        q_objects |= Q(sp__trn__remarks__icontains=val)

        # Payment Mode (PaymentTerm)
        try:
            from trademgt.models import PaymentTerm
            pt_ids = list(PaymentTerm.objects.filter(name__icontains=val).values_list('id', flat=True))
            if pt_ids:
                q_objects |= Q(sp__trn__payment_term__in=[str(p) for p in pt_ids])
        except Exception:
            pass

        try:
            num_val = float(val)
            q_objects |= Q(balance_payment_made=num_val)
            q_objects |= Q(balance_payment_received=num_val)
            q_objects |= Q(sp__invoice_amount=num_val)
            q_objects |= Q(net_due_in_this_trade=num_val)
            q_objects |= Q(advance_adjusted=num_val)

            # Match calculated Balance Payment (sp.invoice_amount - advance)
            from trademgt.models import SalesPurchase, PrePayment
            matching_sp_ids = set()
            for sp_obj in SalesPurchase.objects.select_related('trn').all():
                try:
                    prepay = PrePayment.objects.filter(trn=sp_obj.trn).first()
                    if prepay and sp_obj.invoice_amount is not None:
                        inv = float(sp_obj.invoice_amount)
                        adv = 0.0
                        if sp_obj.trn.trade_type == 'Sales' and prepay.advance_received is not None:
                            adv = float(prepay.advance_received)
                        elif sp_obj.trn.trade_type == 'Purchase' and prepay.advance_paid is not None:
                            adv = float(prepay.advance_paid)
                        
                        rem_val = inv - adv
                        if abs(rem_val - num_val) < 0.01:
                            matching_sp_ids.add(sp_obj.id)
                except Exception:
                    pass
            if matching_sp_ids:
                q_objects |= Q(sp_id__in=list(matching_sp_ids))
        except ValueError:
            pass

        return queryset.filter(q_objects).distinct()
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


class KycFilter(SearchableFilterSet):
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

class InventoryFilter(SearchableFilterSet):
    date_from = django_filters.DateFilter(field_name='production_date', lookup_expr='gte')  # Replace `date_field` with the actual field name
    date_to = django_filters.DateFilter(field_name='production_date', lookup_expr='lte') 
    class Meta:
        model = Inventory
        fields = {
            'product_name': ['exact', 'icontains'],
            'batch_number': ['exact', 'icontains'],
            'unit': ['exact', 'icontains'],
        }

class TradeProductTraceFilter(SearchableFilterSet):
   
    class Meta:
        model = TradeProductTrace
        fields = {
            'product_code': ['exact'],  # Filter by Trade TRN
            # 'first_trn': ['exact'],
            'trade_type':['exact'],
        }

class TradeProductRefFilter(SearchableFilterSet):
   
    class Meta:
        model = TradeProductRef
        fields = {
            'product_code': ['exact'],  # Filter by Trade TRN
            # 'first_trn': ['exact'],
            'trade_type':['exact'],
        }

class PurchaseProductTraceFilter(SearchableFilterSet):
   
    class Meta:
        model = TradeProductTrace
        fields = {
            'product_code': ['exact'],  # Filter by Trade TRN
            # 'first_trn': ['exact'],
        }

class TradePendingFilter(SearchableFilterSet):
   
    class Meta:
        model = TradePending
        fields = {
            'product_code': ['exact'],  # Filter by Trade TRN
            'trade_type':['exact'],
        }


class PLFilter(SearchableFilterSet):
    date_from = django_filters.DateFilter(field_name='sales_trn__trn__trd', lookup_expr='gte')  # Replace `date_field` with the actual field name
    date_to = django_filters.DateFilter(field_name='sales_trn__trn__trd', lookup_expr='lte') 

    def global_search(self, queryset, name, value):
        if not value:
            return queryset

        val = value.strip()
        q_objects = Q()

        if val.isdigit():
            q_objects |= Q(id=int(val))
            q_objects |= Q(sales_trn__id=int(val))
            q_objects |= Q(purchase_trn__id=int(val))

        q_objects |= Q(sales_trn__trn__trn__icontains=val)
        q_objects |= Q(purchase_trn__trn__trn__icontains=val)
        q_objects |= Q(remarks__icontains=val)

        return queryset.filter(q_objects).distinct()
    class Meta:
        model = PL
        fields = {
            'sales_trn__trn__trn': ['exact', 'icontains'],
            'purchase_trn__trn__trn': ['exact', 'icontains'],
            
            'remarks': ['exact', 'icontains'],
        }