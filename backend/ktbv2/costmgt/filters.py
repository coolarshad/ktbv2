import django_filters
from .models import *

class ConsumptionFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name='date', lookup_expr='gte')  # Replace `date_field` with the actual field name
    date_to = django_filters.DateFilter(field_name='date', lookup_expr='lte')    # Replace `date_field` with the actual field name
    # sales = django_filters.BooleanFilter(field_name='trade_category', lookup_expr='exact')
    # purchase = django_filters.BooleanFilter(field_name='trade_category', lookup_expr='exact')
    # cancel = django_filters.BooleanFilter(field_name='trade_category', lookup_expr='exact')
   

    class Meta:
        model = Consumption
        fields = {
            'name': ['exact', 'icontains'],
            'grade': ['exact', 'icontains'],
            'sae': ['exact', 'icontains'],
            'remarks': ['exact', 'icontains'],
            'approved': ['exact'],
        }


class ConsumptionFormulaFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name='date', lookup_expr='gte')  # Replace `date_field` with the actual field name
    date_to = django_filters.DateFilter(field_name='date', lookup_expr='lte')    # Replace `date_field` with the actual field name
    # sales = django_filters.BooleanFilter(field_name='trade_category', lookup_expr='exact')
    # purchase = django_filters.BooleanFilter(field_name='trade_category', lookup_expr='exact')
    # cancel = django_filters.BooleanFilter(field_name='trade_category', lookup_expr='exact')
   

    class Meta:
        model = Consumption
        fields = {
            'name': ['exact', 'icontains'],
            'grade': ['exact', 'icontains'],
            'sae': ['exact', 'icontains'],
            'remarks': ['exact', 'icontains'],
            'approved': ['exact'],
        }