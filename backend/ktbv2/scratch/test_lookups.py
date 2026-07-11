import os
import sys
import django

sys.path.append('/home/saiyad/ktbv2/ktbv2/backend/ktbv2')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ktbv2.settings')
django.setup()

from django.db import models
from django.db.models import Q
from trademgt.models import Trade, PreSalePurchase

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

# Simulate global_search method
def test_global_search(model, value):
    q_objects = Q()
    lookups = get_searchable_lookups(model)
    
    # 1. Fetch matching Kyc IDs
    try:
        from trademgt.models import Kyc
        kyc_ids = list(Kyc.objects.filter(name__icontains=value).values_list('id', flat=True))
        kyc_str_ids = [str(x) for x in kyc_ids]
    except Exception:
        kyc_str_ids = []

    # 2. Fetch matching Company IDs
    try:
        from trademgt.models import Company
        company_ids = list(Company.objects.filter(name__icontains=value).values_list('id', flat=True))
        company_str_ids = [str(x) for x in company_ids]
    except Exception:
        company_str_ids = []

    # 3. Fetch matching Bank IDs
    try:
        from trademgt.models import Bank
        bank_ids = list(Bank.objects.filter(name__icontains=value).values_list('id', flat=True))
        bank_str_ids = [str(x) for x in bank_ids]
    except Exception:
        bank_str_ids = []

    for lookup in lookups:
        # Check if the lookup targets one of the pseudo-relations
        if lookup == 'customer_company_name' or lookup.endswith('__customer_company_name'):
            if kyc_str_ids:
                q_objects |= Q(**{f"{lookup}__in": kyc_str_ids})
        elif lookup == 'company' or lookup.endswith('__company'):
            if company_str_ids:
                q_objects |= Q(**{f"{lookup}__in": company_str_ids})
        elif lookup == 'bank_name_address' or lookup.endswith('__bank_name_address'):
            if bank_str_ids:
                q_objects |= Q(**{f"{lookup}__in": bank_str_ids})
        else:
            q_objects |= Q(**{f"{lookup}__icontains": value})
            
    return q_objects

print("Simulating Trade search for 'Ali':")
q_trade = test_global_search(Trade, 'Ali')
print(q_trade)

print("\nSimulating PreSalePurchase search for 'Ali':")
q_presp = test_global_search(PreSalePurchase, 'Ali')
print(q_presp)
