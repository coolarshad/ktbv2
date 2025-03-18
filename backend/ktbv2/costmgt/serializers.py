from rest_framework import serializers
from drf_writable_nested import WritableNestedModelSerializer
from .models import *

# class PackingSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Packing
#         fields = '__all__'

class PackingSerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()

    class Meta:
        model = Packing
        fields = ['id', 'name', 'parent', 'per_each', 'date', 'remarks', 'subcategories']

    def get_subcategories(self, obj):
        return PackingSerializer(obj.subcategories.all(), many=True).data

class RawMaterialSerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()
    class Meta:
        model = RawMaterial
        fields = ['id', 'name', 'parent', 'cost_per_liter', 'buy_price_pmt', 'add_cost','total','ml_to_kl','density','remarks', 'subcategories']
    
    def get_subcategories(self, obj):
        return RawMaterialSerializer(obj.subcategories.all(), many=True).data

class AdditiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Additive
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