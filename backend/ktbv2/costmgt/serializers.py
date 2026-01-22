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


class PackingExtraSerializer(serializers.ModelSerializer):
    class Meta:
        model = PackingExtra
        fields = ['id', 'name', 'rate']

class PackingSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    extras = PackingExtraSerializer(many=True, required=False)  # nested extras

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
            'approved',
            'extras'
        ]

    def create(self, validated_data):
        extras_data = validated_data.pop('extras', [])
        packing = Packing.objects.create(**validated_data)
        for extra in extras_data:
            PackingExtra.objects.create(packing=packing, **extra)
        return packing

    def update(self, instance, validated_data):
        extras_data = validated_data.pop('extras', [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update extras: simple approach is to delete all and recreate
        if extras_data:
            instance.extras.all().delete()
            for extra in extras_data:
                PackingExtra.objects.create(packing=instance, **extra)

        return instance



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

class RMExtraSerializer(serializers.ModelSerializer):
    class Meta:
        model = RMExtra
        fields = ['id', 'name', 'rate']

class RawMaterialSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    extras = RMExtraSerializer(many=True, required=False)  # nested extras

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
            'extras'
        ]

    def create(self, validated_data):
        extras_data = validated_data.pop('extras', [])
        obj = RawMaterial.objects.create(**validated_data)
        for extra in extras_data:
            RMExtra.objects.create(rm=obj, **extra)
        return obj

    def update(self, instance, validated_data):
        extras_data = validated_data.pop('extras', [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update extras: simple approach is to delete all and recreate
        if extras_data:
            instance.extras.all().delete()
            for extra in extras_data:
                RMExtra.objects.create(rm=instance, **extra)

        return instance



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

class AdditiveExtraSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdditiveExtra
        fields = ['id', 'name', 'rate']

class AdditiveSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    extras = AdditiveExtraSerializer(many=True, required=False)  # nested extras

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
            'extras'
        ]
    
    def create(self, validated_data):
        extras_data = validated_data.pop('extras', [])
        obj = Additive.objects.create(**validated_data)
        for extra in extras_data:
            AdditiveExtra.objects.create(additive=obj, **extra)
        return obj

    def update(self, instance, validated_data):
        extras_data = validated_data.pop('extras', [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update extras: simple approach is to delete all and recreate
        if extras_data:
            instance.extras.all().delete()
            for extra in extras_data:
                AdditiveExtra.objects.create(additive=instance, **extra)

        return instance


class ConsumptionFormulaAdditiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsumptionFormulaAdditive
        fields = '__all__'

    def get_additive_details(self, obj):
        try:
            instance = AdditiveCategory.objects.get(id=obj.name)
            return AdditiveCategorySerializer(instance).data
        except AdditiveCategory.DoesNotExist:
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
            instance = RawCategory.objects.get(id=obj.name)
            return RawCategorySerializer(instance).data
        except RawCategory.DoesNotExist:
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

class FinalProductItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinalProductItem
        fields = '__all__'

class FinalProductSerializer(serializers.ModelSerializer):
    final_product_items = FinalProductItemSerializer(many=True, read_only=True)
    consumption = ConsumptionSerializer(source="name", read_only=True)
    
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

class PackingSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PackingSize
        fields = '__all__'