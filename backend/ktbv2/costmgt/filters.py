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
            
        return queryset.filter(q_objects)

class AdditiveFilter(SearchableFilterSet):
    date_from = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='date', lookup_expr='lte')

    class Meta:
        model = Additive
        fields = {
            'remarks': ['exact', 'icontains'],
            'approved': ['exact'],
        }

class RawMaterialFilter(SearchableFilterSet):
    date_from = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='date', lookup_expr='lte')

    class Meta:
        model = RawMaterial
        fields = {
            'remarks': ['exact', 'icontains'],
            'approved': ['exact'],
        }

class PackingFilter(SearchableFilterSet):
    date_from = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='date', lookup_expr='lte')

    class Meta:
        model = Packing
        fields = {
            'name': ['exact', 'icontains'],
            'approved': ['exact'],
        }

class AdditiveCategoryFilter(SearchableFilterSet):
    class Meta:
        model = AdditiveCategory
        fields = {
            'name': ['exact', 'icontains'],
            'approved': ['exact'],
        }

class RawCategoryFilter(SearchableFilterSet):
    class Meta:
        model = RawCategory
        fields = {
            'name': ['exact', 'icontains'],
            'approved': ['exact'],
        }

class CategoryFilter(SearchableFilterSet):
    class Meta:
        model = Category
        fields = {
            'name': ['exact', 'icontains'],
        }

class ConsumptionFilter(SearchableFilterSet):
    date_from = django_filters.DateFilter(field_name='date', lookup_expr='gte')  # Replace `date_field` with the actual field name
    date_to = django_filters.DateFilter(field_name='date', lookup_expr='lte')    # Replace `date_field` with the actual field name
    # sales = django_filters.BooleanFilter(field_name='trade_category', lookup_expr='exact')
    # purchase = django_filters.BooleanFilter(field_name='trade_category', lookup_expr='exact')
    # cancel = django_filters.BooleanFilter(field_name='trade_category', lookup_expr='exact')
   

    class Meta:
        model = Consumption
        fields = {
            'alias': ['exact', 'icontains'],
            'grade': ['exact', 'icontains'],
            'sae': ['exact', 'icontains'],
            'remarks': ['exact', 'icontains'],
            'approved': ['exact'],
        }


class ConsumptionFormulaFilter(SearchableFilterSet):
    date_from = django_filters.DateFilter(field_name='date', lookup_expr='gte')  # Replace `date_field` with the actual field name
    date_to = django_filters.DateFilter(field_name='date', lookup_expr='lte')    # Replace `date_field` with the actual field name
    # sales = django_filters.BooleanFilter(field_name='trade_category', lookup_expr='exact')
    # purchase = django_filters.BooleanFilter(field_name='trade_category', lookup_expr='exact')
    # cancel = django_filters.BooleanFilter(field_name='trade_category', lookup_expr='exact')
   

    class Meta:
        model = ConsumptionFormula
        fields = {
            'name': ['exact', 'icontains'],
            'grade': ['exact', 'icontains'],
            'sae': ['exact', 'icontains'],
            'remarks': ['exact', 'icontains'],
            'approved': ['exact'],
        }

class ProductFormulaFilter(SearchableFilterSet):
    # date_from = django_filters.DateFilter(field_name='date', lookup_expr='gte')  # Replace `date_field` with the actual field name
    # date_to = django_filters.DateFilter(field_name='date', lookup_expr='lte')    # Replace `date_field` with the actual field name

    class Meta:
        model = ProductFormula
        fields = {
            'formula_name': ['exact', 'icontains'],
            'consumption_name': ['exact', 'icontains'],
            'packing_type': ['exact', 'icontains'],
            'approved': ['exact'],
        }
class FinalProductFilter(SearchableFilterSet):
    date_from = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='date', lookup_expr='lte')

    class Meta:
        model = FinalProduct
        fields = []

    def global_search(self, queryset, name, value):
        if not value:
            return queryset
        
        q_objects = Q()
        model = self.Meta.model
        lookups = get_searchable_lookups(model)

        for lookup in lookups:
            q_objects |= Q(**{f"{lookup}__icontains": value})

        # Add nested/reverse fields
        # 1. Packing Items (FinalProductPackingItem)
        q_objects |= Q(packing_items__packing__icontains=value)
        q_objects |= Q(packing_items__packing_type__icontains=value)

        # 2. Additives in ConsumptionAdditive (FinalProduct -> Consumption -> ConsumptionAdditive)
        try:
            from costmgt.models import AdditiveCategory, Additive
            add_cat_ids = list(AdditiveCategory.objects.filter(name__icontains=value).values_list('id', flat=True))
            add_cat_str_ids = [str(x) for x in add_cat_ids]
            
            additive_ids = list(Additive.objects.filter(
                Q(category__name__icontains=value) | Q(name__name__icontains=value)
            ).values_list('id', flat=True))
            additive_str_ids = [str(x) for x in additive_ids]

            if add_cat_str_ids:
                q_objects |= Q(batch__consumptionadditive__name__in=add_cat_str_ids)
            if additive_str_ids:
                q_objects |= Q(batch__consumptionadditive__sub_name__in=additive_str_ids)
        except Exception:
            pass

        # 3. Base Oils in ConsumptionBaseOil (FinalProduct -> Consumption -> ConsumptionBaseOil)
        try:
            from costmgt.models import RawCategory, RawMaterial
            raw_cat_ids = list(RawCategory.objects.filter(name__icontains=value).values_list('id', flat=True))
            raw_cat_str_ids = [str(x) for x in raw_cat_ids]
            
            raw_material_ids = list(RawMaterial.objects.filter(
                Q(category__name__icontains=value) | Q(name__name__icontains=value)
            ).values_list('id', flat=True))
            raw_material_str_ids = [str(x) for x in raw_material_ids]

            if raw_cat_str_ids:
                q_objects |= Q(batch__consumptionbaseoil__name__in=raw_cat_str_ids)
            if raw_material_str_ids:
                q_objects |= Q(batch__consumptionbaseoil__sub_name__in=raw_material_str_ids)
        except Exception:
            pass

        return queryset.filter(q_objects).distinct()