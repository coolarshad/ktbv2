from rest_framework import serializers
from .models import *

# class PackingSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Packing
#         fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    # recursive serializer for children
    children = serializers.SerializerMethodField()
    parent_name = serializers.CharField(source="parent.name", read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'parent', 'parent_name', 'children']

    def get_children(self, obj):
        if obj.children.exists():
            return CategorySerializer(obj.children.all(), many=True).data
        return []

    

class PackingSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Packing
        fields = [
            'id',
            'date',
            'name',
            'per_each',
            'category',
            'category_name',
            'packing_type',
            'remarks',
            'approved'
        ]


from rest_framework import serializers
from .models import RawCategory, RawMaterial, AdditiveCategory, Additive


class RawCategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    parent_name = serializers.CharField(source="parent.name", read_only=True)

    class Meta:
        model = RawCategory
        fields = ['id', 'name', 'parent', 'parent_name', 'children']

    def get_children(self, obj):
        if obj.children.exists():
            return RawCategorySerializer(obj.children.all(), many=True).data
        return []


class RawMaterialSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = RawMaterial
        fields = [
            'id',
            'name',
            'cost_per_liter',
            'buy_price_pmt',
            'add_cost',
            'total',
            'ml_to_kl',
            'density',
            'remarks',
            'approved',
            'category',
            'category_name',
        ]


class AdditiveCategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    parent_name = serializers.CharField(source="parent.name", read_only=True)

    class Meta:
        model = AdditiveCategory
        fields = ['id', 'name', 'parent', 'parent_name', 'children']

    def get_children(self, obj):
        if obj.children.exists():
            return AdditiveCategorySerializer(obj.children.all(), many=True).data
        return []


class AdditiveSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Additive
        fields = [
            'id',
            'name',
            'date',
            'crfPrice',
            'addCost',
            'costPriceInLiter',
            'density',
            'totalCost',
            'remarks',
            'approved',
            'category',
            'category_name',
        ]

class ConsumptionFormulaAdditiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsumptionFormulaAdditive
        fields = '__all__'

class ConsumptionFormulaBaseOilSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsumptionFormulaBaseOil
        fields = '__all__'

class ConsumptionFormulaSerializer(serializers.ModelSerializer):
    consumption_additives = ConsumptionFormulaAdditiveSerializer(many=True, read_only=True)
    consumption_base_oils = ConsumptionFormulaBaseOilSerializer(many=True, read_only=True)
    class Meta:
        model = ConsumptionFormula
        fields = '__all__'

class ConsumptionAdditiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsumptionAdditive
        fields = '__all__'

class ConsumptionBaseOilSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsumptionBaseOil
        fields = '__all__'

class ConsumptionSerializer(serializers.ModelSerializer):
    consumption_additives = ConsumptionAdditiveSerializer(many=True, read_only=True)
    consumption_base_oils = ConsumptionBaseOilSerializer(many=True, read_only=True)
    class Meta:
        model = Consumption
        fields = '__all__'

class FinalProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinalProduct
        fields = '__all__'