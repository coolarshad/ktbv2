from rest_framework import serializers
from .models import *
from django.db import transaction
from trademgt.models import Packing as P
from trademgt.serializers import PackingSerializer as PS
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

class PackingTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PackingType
        fields = '__all__'

class PackingSerializer(serializers.ModelSerializer):
    # category_name = serializers.CharField(source="category.name", read_only=True)
    # extras = PackingExtraSerializer(many=True, required=False)  # nested extras
    packing_type = serializers.PrimaryKeyRelatedField(
        queryset=PackingType.objects.all()
    )

    packing_type_detail = PackingTypeSerializer(
        source="packing_type",
        read_only=True
    )

    class Meta:
        model = Packing
        fields = [
            'id',
            'date',
            'name',
            'per_each',
            # 'category',
            # 'category_name',
            'packing_type',
            'packing_type_detail',
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
    subname_name = serializers.CharField(source="name.name", read_only=True)
    extras = RMExtraSerializer(many=True, required=False)  # nested extras

    class Meta:
        model = RawMaterial
        fields = [
            'id',
            'date',
            'name',
            'subname_name',
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
    subname_name = serializers.CharField(source="name.name", read_only=True)
    extras = AdditiveExtraSerializer(many=True, required=False)  # nested extras

    class Meta:
        model = Additive
        fields = [
            'id',
            'name',
            'subname_name',
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

    def get_additive_name_details(self, obj):
        try:
            instance = AdditiveCategory.objects.get(id=obj.name)
            return AdditiveCategorySerializer(instance).data
        except AdditiveCategory.DoesNotExist:
            return None
    def get_additive_subname_details(self, obj):
        try:
            instance = Additive.objects.get(id=obj.sub_name)
            return AdditiveSerializer(instance).data
        except Additive.DoesNotExist:
            return None
        
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['additive'] = self.get_additive_name_details(instance)
        ret['additive_subname'] = self.get_additive_subname_details(instance)
        return ret

class ConsumptionBaseOilSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsumptionBaseOil
        fields = '__all__'

    def get_raw_details(self, obj):
        try:
            instance = RawCategory.objects.get(id=obj.name)
            return RawCategorySerializer(instance).data
        except RawCategory.DoesNotExist:
            return None
    def get_raw_name_details(self, obj):
        try:
            instance = RawMaterial.objects.get(id=obj.sub_name)
            return RawMaterialSerializer(instance).data
        except RawMaterial.DoesNotExist:
            return None
        
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['raw'] = self.get_raw_details(instance)
        ret['raw_subname'] = self.get_raw_name_details(instance)
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

class PackingTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PackingType
        fields = '__all__'


class ProductFormulaItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductFormulaItem
        fields = '__all__'

    def get_packings_type_details(self, obj):
        try:
            instance = PackingType.objects.get(id=obj.packing_type)
            return PackingTypeSerializer(instance).data
        except PackingType.DoesNotExist:
            return None
    def get_packings_details(self, obj):
        try:
            instance = Packing.objects.get(id=obj.packing_label)
            return PackingSerializer(instance).data
        except Packing.DoesNotExist:
            return None
        
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['packings_type'] = self.get_packings_type_details(instance)
        ret['packings'] = self.get_packings_details(instance)
        return ret



class ProductFormulaSerializer(serializers.ModelSerializer):
    product_formula_items = ProductFormulaItemSerializer(many=True, read_only=True)
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
            instance = PackingSize.objects.get(id=obj.packing_type)
            return PackingSizeSerializer(instance).data
        except PackingSize.DoesNotExist:
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

# ================================
# Packing Item Serializer
# ================================

class FinalProductPackingItemSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    selected_packing = serializers.PrimaryKeyRelatedField(
        queryset=Packing.objects.all()
    )

    class Meta:
        model = FinalProductPackingItem
        fields = [
            "id",
            "packing_type",
            "packing",
            "selected_packing",
            "qty",
            "rate",
            "value",
        ]
        read_only_fields = ["value"]

# ================================
# Additional Cost Serializer
# ================================

class FinalProductAdditionalCostSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = FinalProductAdditionalCost
        fields = [
            "id",
            "name",
            "rate",
            "value",
        ]


# ================================
# Final Product Serializer
# ================================

# class FinalProductSerializer(serializers.ModelSerializer):

#     packing_items = FinalProductPackingItemSerializer(many=True)
#     additional_costs = FinalProductAdditionalCostSerializer(many=True)
    

#     class Meta:
#         model = FinalProduct
#         fields = [
#             "id",
#             "date",
#             "consumption",
#             "formula",
#             "packing_size",
#             "bottles_per_pack",
#             "litres_per_pack",
#             "total_qty",
#             "total_qty_unit",
#             "qty_in_litres",
#             "total_oil_consumed",
#             "per_litre_cost",
#             "total_cfr_pricing",
#             "remarks",
#             "approved",
#             "packing_items",
#             "additional_costs",
#             "batch"
#         ]


#     # ================================
#     # CREATE
#     # ================================
#     def create(self, validated_data):
#         packing_items_data = validated_data.pop("packing_items", [])
#         additional_costs_data = validated_data.pop("additional_costs", [])

#         final_product = FinalProduct.objects.create(**validated_data)

#         # Create Packing Items
#         for item in packing_items_data:
#             FinalProductPackingItem.objects.create(
#                 final_product=final_product,
#                 **item
#             )

#         # Create Additional Costs
#         for cost in additional_costs_data:
#             FinalProductAdditionalCost.objects.create(
#                 final_product=final_product,
#                 **cost
#             )

#         return final_product


#     # ================================
#     # UPDATE
#     # ================================
#     def update(self, instance, validated_data):
#         packing_items_data = validated_data.pop("packing_items", [])
#         additional_costs_data = validated_data.pop("additional_costs", [])

#         # Update main fields
#         for attr, value in validated_data.items():
#             setattr(instance, attr, value)
#         instance.save()

#         # ----------------------------
#         # Replace Packing Items
#         # ----------------------------
#         instance.packing_items.all().delete()

#         for item in packing_items_data:
#             FinalProductPackingItem.objects.create(
#                 final_product=instance,
#                 **item
#             )

#         # ----------------------------
#         # Replace Additional Costs
#         # ----------------------------
#         instance.additional_costs.all().delete()

#         for cost in additional_costs_data:
#             FinalProductAdditionalCost.objects.create(
#                 final_product=instance,
#                 **cost
#             )

#         return instance
    




class FinalProductSerializer(serializers.ModelSerializer):

    packing_items = FinalProductPackingItemSerializer(many=True)
    additional_costs = FinalProductAdditionalCostSerializer(many=True)

    # Write fields (normal FK handling)
    formula = serializers.PrimaryKeyRelatedField(
        queryset=ProductFormula.objects.all(),
        required=False,
        allow_null=True
    )

    packing_size = serializers.PrimaryKeyRelatedField(
        queryset=PackingSize.objects.all(),
        required=False,
        allow_null=True
    )

    batch = serializers.PrimaryKeyRelatedField(
        queryset=Consumption.objects.all(),
        required=False,
        allow_null=True
    )


    # Read display fields
    formula_detail = serializers.SerializerMethodField(read_only=True)
    packing_size_detail = serializers.SerializerMethodField(read_only=True)
    batch_detail = serializers.SerializerMethodField(read_only=True)
    consumption_detail = serializers.SerializerMethodField(read_only=True)
    # unit_detail = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = FinalProduct
        fields = [
            "id",
            "date",
            "consumption",
            "consumption_qty",
            "formula",
            "packing_size",
            "bottles_per_pack",
            "litres_per_pack",
            "total_qty",
            "total_qty_unit",
            "qty_in_litres",
            "total_oil_consumed",
            "per_litre_cost",
            "total_cfr_pricing",
            "remarks",
            "approved",
            "packing_items",
            "additional_costs",
            "packing_size_detail",
            "formula_detail",
            "batch_detail",
            "consumption_detail",
            "batch",
            # "unit_detail",
        ]

    def create(self, validated_data):
        packing_items_data = validated_data.pop("packing_items", [])
        additional_costs_data = validated_data.pop("additional_costs", [])

        final_product = FinalProduct.objects.create(**validated_data)

        # Create Packing Items
        for item in packing_items_data:
            FinalProductPackingItem.objects.create(
                final_product=final_product,
                **item
            )

        # Create Additional Costs
        for cost in additional_costs_data:
            FinalProductAdditionalCost.objects.create(
                final_product=final_product,
                **cost
            )

        return final_product

    def update(self, instance, validated_data):
        packing_items_data = validated_data.pop("packing_items", [])
        additional_costs_data = validated_data.pop("additional_costs", [])

        # Update main fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        instance.packing_items.all().delete()

        for item in packing_items_data:
            FinalProductPackingItem.objects.create(
                final_product=instance,
                **item
            )

        instance.additional_costs.all().delete()

        for cost in additional_costs_data:
            FinalProductAdditionalCost.objects.create(
                final_product=instance,
                **cost
            )

        return instance
    

    def get_packing_size_detail(self, obj):
        if obj.packing_size:
            return {
                "value": obj.packing_size.id,
                "label": obj.packing_size.name
            }
        return None

    def get_batch_detail(self, obj):
        try:
            if obj.batch:
                instance = Consumption.objects.get(id=obj.batch.id)
                return ConsumptionSerializer(instance).data
        except Consumption.DoesNotExist:
            return None

    def get_formula_detail(self, obj):
        try:
            instance = ProductFormula.objects.get(id=obj.formula.id)
            return ProductFormulaSerializer(instance).data
        except ProductFormula.DoesNotExist:
            return None
        
    def get_consumption_detail(self, obj):
        try:
            instance = Consumption.objects.get(id=obj.consumption)
            return ConsumptionSerializer(instance).data
        except Consumption.DoesNotExist:
            return None
    
    # def get_unit_detail(self, obj):
    #     try:
    #         instance = P.objects.get(id=obj.total_qty_unit)
    #         return PS(instance).data
    #     except P.DoesNotExist:
    #         return None