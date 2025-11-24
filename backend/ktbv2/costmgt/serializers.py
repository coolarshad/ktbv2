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

    def get_additive_details(self, obj):
        try:
            instance = Additive.objects.get(id=obj.name)
            return AdditiveSerializer(instance).data
        except Additive.DoesNotExist:
            return None
        
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['additive'] = self.get_additive_details(instance)
        return ret

class ConsumptionFormulaBaseOilSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsumptionFormulaBaseOil
        fields = '__all__'

    def get_raw_details(self, obj):
        try:
            instance = RawMaterial.objects.get(id=obj.name)
            return RawMaterialSerializer(instance).data
        except RawMaterial.DoesNotExist:
            return None
        
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['raw'] = self.get_raw_details(instance)
        return ret

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

    def get_additive_details(self, obj):
        try:
            instance = Additive.objects.get(id=obj.name)
            return AdditiveSerializer(instance).data
        except Additive.DoesNotExist:
            return None
        
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['additive'] = self.get_additive_details(instance)
        return ret

class ConsumptionBaseOilSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsumptionBaseOil
        fields = '__all__'

    def get_raw_details(self, obj):
        try:
            instance = RawMaterial.objects.get(id=obj.name)
            return RawMaterialSerializer(instance).data
        except RawMaterial.DoesNotExist:
            return None
        
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['raw'] = self.get_raw_details(instance)
        return ret


class ConsumptionSerializer(serializers.ModelSerializer):
    consumption_additives = ConsumptionAdditiveSerializer(many=True, read_only=True)
    consumption_base_oils = ConsumptionBaseOilSerializer(many=True, read_only=True)
    class Meta:
        model = Consumption
        fields = '__all__'

    def get_formula(self, obj):
        try:
            instance = ConsumptionFormula.objects.get(id=int(obj.name))
            return ConsumptionFormulaSerializer(instance).data
        except ConsumptionFormula.DoesNotExist:
            return None
    
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['formula'] = self.get_formula(instance)
        return ret

class FinalProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinalProduct
        fields = '__all__'


class PackingTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PackingType
        fields = '__all__'


class ProductFormulaItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductFormulaItem
        fields = '__all__'


class ProductFormulaSerializer(serializers.ModelSerializer):
    formula_item = ProductFormulaItemSerializer(many=True, read_only=True)
    class Meta:
        model = ProductFormula
        fields = '__all__'

    def get_consumption_details(self, obj):
        try:
            instance = Consumption.objects.get(id=obj.consumption_name)
            return ConsumptionSerializer(instance).data
        except Consumption.DoesNotExist:
            return None
    
    def get_packing_details(self, obj):
        try:
            instance = Packing.objects.get(id=obj.packing_type)
            return PackingSerializer(instance).data
        except Packing.DoesNotExist:
            return None
        
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['consumption'] = self.get_consumption_details(instance)
        ret['packing'] = self.get_packing_details(instance)
        return ret

