from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from rest_framework.views import APIView
from rest_framework import viewsets
from .models import *
from .serializers import *
from django_filters.rest_framework import DjangoFilterBackend
from .filters import *
from rest_framework.parsers import MultiPartParser, FormParser
# Create your views here.


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class PackingViewSet(viewsets.ModelViewSet):
    queryset = Packing.objects.all()
    serializer_class = PackingSerializer

class RawCategoryViewSet(viewsets.ModelViewSet):
    queryset = RawCategory.objects.all()
    serializer_class = RawCategorySerializer

class RawMaterialViewSet(viewsets.ModelViewSet):
    queryset = RawMaterial.objects.all()
    serializer_class = RawMaterialSerializer

class AdditiveCategoryViewSet(viewsets.ModelViewSet):
    queryset = AdditiveCategory.objects.all()
    serializer_class = AdditiveCategorySerializer

class AdditiveViewSet(viewsets.ModelViewSet):
    queryset = Additive.objects.all()
    serializer_class = AdditiveSerializer

class ConsumptionAdditiveViewSet(viewsets.ModelViewSet):
    queryset = ConsumptionAdditive.objects.all()
    serializer_class = ConsumptionAdditiveSerializer

class ConsumptionBaseOilViewSet(viewsets.ModelViewSet):
    queryset = ConsumptionBaseOil.objects.all()
    serializer_class = ConsumptionBaseOilSerializer


class ConsumptionFormulaView(APIView):
    # filter_backends = [DjangoFilterBackend]
    # filterset_class = ConsumptionFilter

    def get(self, request, *args, **kwargs):
        c_id = kwargs.get('pk')  # URL parameter for trade ID
        
        if c_id:  # If `pk` is provided, retrieve a specific trade
            try:
                consumption = ConsumptionFormula.objects.get(id=c_id)
            except ConsumptionFormula.DoesNotExist:
                return Response({'detail': 'Consumption Formula not found.'}, status=status.HTTP_404_NOT_FOUND)

            c_serializer = ConsumptionFormulaSerializer(consumption)
            c_additives = ConsumptionFormulaAdditive.objects.filter(consumption=consumption)
            c_base_oils = ConsumptionFormulaBaseOil.objects.filter(consumption=consumption)
        
            c_additives_serializer = ConsumptionFormulaAdditiveSerializer(c_additives, many=True)
            c_base_oils_serializer = ConsumptionFormulaBaseOilSerializer(c_base_oils, many=True)
          
            response_data = c_serializer.data
            response_data['consumptionFormulaAdditive'] = c_additives_serializer.data
            response_data['consumptionFormulaBaseOil'] = c_base_oils_serializer.data

            return Response(response_data)

        else:  # If `pk` is not provided, list all trades
            queryset = ConsumptionFormula.objects.all()
            filterset = ConsumptionFormulaFilter(request.GET, queryset=queryset)

            if not filterset.is_valid():
                return Response(filterset.errors, status=status.HTTP_400_BAD_REQUEST)

            serializer = ConsumptionFormulaSerializer(filterset.qs, many=True)
            return Response(serializer.data)
    
    def post(self, request, *args, **kwargs):
        data = request.data
        # Prepare trade data separately
        c_data = {
            'date': data.get('date'),
            'name': data.get('name'),
            'grade': data.get('grade'),
            'sae': data.get('sae'),
            'remarks': data.get('remarks'),
        }
        c_additives_data = []
        c_base_oils_data = []
       
        l = 0
        while f'consumptionAdditive[{l}].name' in data:
            additives_data = {
                'name': data.get(f'consumptionAdditive[{l}].name'),
                'qty_in_percent': data.get(f'consumptionAdditive[{l}].qty_in_percent'),
    
            }
            c_additives_data.append(additives_data)
            l += 1
        
        m = 0
        while f'consumptionBaseOil[{m}].name' in data:
            base_oils_data = {
                'name': data.get(f'consumptionBaseOil[{m}].name'),
                'qty_in_percent': data.get(f'consumptionBaseOil[{m}].qty_in_percent'),

            }
            c_base_oils_data.append(base_oils_data)
            m += 1

        with transaction.atomic():
            c_serializer = ConsumptionFormulaSerializer(data=c_data)
            if c_serializer.is_valid():
                consumption = c_serializer.save()
            else:
                return Response(c_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            if c_additives_data:
                try: 
                    additives = [ConsumptionFormulaAdditive(**item, consumption=consumption) for item in c_additives_data]
                    ConsumptionFormulaAdditive.objects.bulk_create(additives)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
            if c_base_oils_data:
                try: 
                    base_oils = [ConsumptionFormulaBaseOil(**item, consumption=consumption) for item in c_base_oils_data]
                    ConsumptionFormulaBaseOil.objects.bulk_create(base_oils)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
                

        return Response(c_serializer.data, status=status.HTTP_201_CREATED)

    def put(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        data = request.data
        
        try:
            consumption = ConsumptionFormula.objects.get(pk=pk)
        except ConsumptionFormula.DoesNotExist:
            return Response({'error': 'Consumption Formula not found'}, status=status.HTTP_404_NOT_FOUND)

        # Prepare trade data separately
        c_data = {
            'date': data.get('date'),
            'name': data.get('name'),
            'grade': data.get('grade'),
            'sae': data.get('sae'),
            
            'remarks': data.get('remarks'),
        }
        c_additives_data = []
        c_base_oils_data = []

        l = 0
        while f'consumptionAdditive[{l}].name' in data:
            additives_data = {
                'name': data.get(f'consumptionAdditive[{l}].name'),
                'qty_in_percent': data.get(f'consumptionAdditive[{l}].qty_in_percent'),
              
            }
            c_additives_data.append(additives_data)
            l += 1
        
        m = 0
        while f'consumptionBaseOil[{m}].name' in data:
            base_oils_data = {
                'name': data.get(f'consumptionBaseOil[{m}].name'),
                'qty_in_percent': data.get(f'consumptionBaseOil[{m}].qty_in_percent'),
               
            }
            c_base_oils_data.append(base_oils_data)
            m += 1
       
        with transaction.atomic():
            c_serializer = ConsumptionFormulaSerializer(consumption, data=c_data, partial=True)
            if c_serializer.is_valid():
                consumption = c_serializer.save()
            else:
                return Response(c_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            
            if c_additives_data:
                # Clear existing trade products and add new ones
                ConsumptionFormulaAdditive.objects.filter(consumption=consumption).delete()
               
                try:
                    additives_data = [ConsumptionFormulaAdditive(**item, consumption=consumption) for item in c_additives_data]
                    ConsumptionFormulaAdditive.objects.bulk_create(additives_data)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
           
            if c_base_oils_data:
                # Clear existing trade products and add new ones
                ConsumptionFormulaBaseOil.objects.filter(consumption=consumption).delete()
               
                try:
                    base_oils_data = [ConsumptionFormulaBaseOil(**item, consumption=consumption) for item in c_base_oils_data]
                    ConsumptionFormulaBaseOil.objects.bulk_create(base_oils_data)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(c_serializer.data, status=status.HTTP_200_OK)
    
    def delete(self, request, *args, **kwargs):
        pk = kwargs.get('pk')

        try:
            consumption = ConsumptionFormula.objects.get(pk=pk)
        except ConsumptionFormula.DoesNotExist:
            return Response({'error': 'Consumption Formula not found'}, status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            # Delete related trade products and extra costs
            ConsumptionFormulaAdditive.objects.filter(consumption=consumption).delete()
            ConsumptionFormulaBaseOil.objects.filter(consumption=consumption).delete()
           
            consumption.delete()

        return Response({'message': 'Consumption Formula deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


class ConsumptionView(APIView):
    # filter_backends = [DjangoFilterBackend]
    # filterset_class = ConsumptionFilter

    def get(self, request, *args, **kwargs):
        c_id = kwargs.get('pk')  # URL parameter for trade ID
        
        if c_id:  # If `pk` is provided, retrieve a specific trade
            try:
                consumption = Consumption.objects.get(id=c_id)
            except Consumption.DoesNotExist:
                return Response({'detail': 'Consumption not found.'}, status=status.HTTP_404_NOT_FOUND)

            c_serializer = ConsumptionSerializer(consumption)
            c_additives = ConsumptionAdditive.objects.filter(consumption=consumption)
            c_base_oils = ConsumptionBaseOil.objects.filter(consumption=consumption)
        
            c_additives_serializer = ConsumptionAdditiveSerializer(c_additives, many=True)
            c_base_oils_serializer = ConsumptionBaseOilSerializer(c_base_oils, many=True)
          
            response_data = c_serializer.data
            response_data['consumptionAdditive'] = c_additives_serializer.data
            response_data['consumptionBaseOil'] = c_base_oils_serializer.data

            return Response(response_data)

        else:  # If `pk` is not provided, list all trades
            queryset = Consumption.objects.all()
            filterset = ConsumptionFilter(request.GET, queryset=queryset)

            if not filterset.is_valid():
                return Response(filterset.errors, status=status.HTTP_400_BAD_REQUEST)

            serializer = ConsumptionSerializer(filterset.qs, many=True)
            return Response(serializer.data)
    
    def post(self, request, *args, **kwargs):
        data = request.data
        # Prepare trade data separately
        c_data = {
            'date': data.get('date'),
            'name': data.get('name'),
            'alias': data.get('alias'),
            'grade': data.get('grade'),
            'sae': data.get('sae'),
            'net_blending_qty': data.get('net_blending_qty'),
            'gross_vol_crosscheck': data.get('gross_vol_crosscheck'),
            'cross_check': data.get('cross_check'),
            'total_value': data.get('total_value'),
            'per_litre_cost': data.get('per_litre_cost'),
            'remarks': data.get('remarks'),
        }
        c_additives_data = []
        c_base_oils_data = []
       
        l = 0
        while f'consumptionAdditive[{l}].name' in data:
            additives_data = {
                'name': data.get(f'consumptionAdditive[{l}].name'),
                'qty_in_percent': data.get(f'consumptionAdditive[{l}].qty_in_percent'),
                'qty_in_litre': data.get(f'consumptionAdditive[{l}].qty_in_litre'),
                'value': data.get(f'consumptionAdditive[{l}].value'),
            }
            c_additives_data.append(additives_data)
            l += 1
        
        m = 0
        while f'consumptionBaseOil[{m}].name' in data:
            base_oils_data = {
                'name': data.get(f'consumptionBaseOil[{m}].name'),
                'qty_in_percent': data.get(f'consumptionBaseOil[{m}].qty_in_percent'),
                'qty_in_litre': data.get(f'consumptionBaseOil[{m}].qty_in_litre'),
                'value': data.get(f'consumptionBaseOil[{m}].value'),
            }
            c_base_oils_data.append(base_oils_data)
            m += 1

        with transaction.atomic():
            c_serializer = ConsumptionSerializer(data=c_data)
            if c_serializer.is_valid():
                consumption = c_serializer.save()
            else:
                return Response(c_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            if c_additives_data:
                try: 
                    additives = [ConsumptionAdditive(**item, consumption=consumption) for item in c_additives_data]
                    ConsumptionAdditive.objects.bulk_create(additives)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
            if c_base_oils_data:
                try: 
                    base_oils = [ConsumptionBaseOil(**item, consumption=consumption) for item in c_base_oils_data]
                    ConsumptionBaseOil.objects.bulk_create(base_oils)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
                

        return Response(c_serializer.data, status=status.HTTP_201_CREATED)

    def put(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        data = request.data
        
        try:
            consumption = Consumption.objects.get(pk=pk)
        except Consumption.DoesNotExist:
            return Response({'error': 'Consumption not found'}, status=status.HTTP_404_NOT_FOUND)

        # Prepare trade data separately
        c_data = {
            'date': data.get('date'),
            'name': data.get('name'),
            'alias': data.get('alias'),
            'grade': data.get('grade'),
            'sae': data.get('sae'),
            'net_blending_qty': data.get('net_blending_qty'),
            'gross_vol_crosscheck': data.get('gross_vol_crosscheck'),
            'cross_check': data.get('cross_check'),
            'total_value': data.get('total_value'),
            'per_litre_cost': data.get('per_litre_cost'),
            'remarks': data.get('remarks'),
        }
        c_additives_data = []
        c_base_oils_data = []

        l = 0
        while f'consumptionAdditive[{l}].name' in data:
            additives_data = {
                'name': data.get(f'consumptionAdditive[{l}].name'),
                'qty_in_percent': data.get(f'consumptionAdditive[{l}].qty_in_percent'),
                'qty_in_litre': data.get(f'consumptionAdditive[{l}].qty_in_litre'),
                'value': data.get(f'consumptionAdditive[{l}].value'),
            }
            c_additives_data.append(additives_data)
            l += 1
        
        m = 0
        while f'consumptionBaseOil[{m}].name' in data:
            base_oils_data = {
                'name': data.get(f'consumptionBaseOil[{m}].name'),
                'qty_in_percent': data.get(f'consumptionBaseOil[{m}].qty_in_percent'),
                'qty_in_litre': data.get(f'consumptionBaseOil[{m}].qty_in_litre'),
                'value': data.get(f'consumptionBaseOil[{m}].value'),
            }
            c_base_oils_data.append(base_oils_data)
            m += 1
       
        with transaction.atomic():
            c_serializer = ConsumptionSerializer(consumption, data=c_data, partial=True)
            if c_serializer.is_valid():
                consumption = c_serializer.save()
            else:
                return Response(c_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            
            if c_additives_data:
                # Clear existing trade products and add new ones
                ConsumptionAdditive.objects.filter(consumption=consumption).delete()
               
                try:
                    additives_data = [ConsumptionAdditive(**item, consumption=consumption) for item in c_additives_data]
                    ConsumptionAdditive.objects.bulk_create(additives_data)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
           
            if c_base_oils_data:
                # Clear existing trade products and add new ones
                ConsumptionBaseOil.objects.filter(consumption=consumption).delete()
               
                try:
                    base_oils_data = [ConsumptionBaseOil(**item, consumption=consumption) for item in c_base_oils_data]
                    ConsumptionBaseOil.objects.bulk_create(base_oils_data)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(c_serializer.data, status=status.HTTP_200_OK)
    
    def delete(self, request, *args, **kwargs):
        pk = kwargs.get('pk')

        try:
            consumption = Consumption.objects.get(pk=pk)
        except Consumption.DoesNotExist:
            return Response({'error': 'Consumption not found'}, status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            # Delete related trade products and extra costs
            ConsumptionAdditive.objects.filter(consumption=consumption).delete()
            ConsumptionBaseOil.objects.filter(consumption=consumption).delete()
           
            consumption.delete()

        return Response({'message': 'Consumption deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


class FinalProductViewSet(viewsets.ModelViewSet):
    queryset = FinalProduct.objects.all()
    serializer_class = FinalProductSerializer


class PackingApprovalView(APIView):
    def get(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        if not pk:
            return Response({'detail': 'Packing ID not provided.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                obj = Packing.objects.get(pk=pk)

                obj.approved = True
                obj.save()
                serializer = PackingSerializer(obj)
                return Response(serializer.data, status=status.HTTP_200_OK)
        except Packing.DoesNotExist:
            return Response({'detail': 'Packing not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class RawMaterialApprovalView(APIView):
    def get(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
    
        if not pk:
            return Response({'detail': 'Raw Material ID not provided.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                obj = RawMaterial.objects.get(pk=pk)

                obj.approved = True
                obj.save()

                serializer = RawMaterialSerializer(obj)
                return Response(serializer.data, status=status.HTTP_200_OK)
        except RawMaterial.DoesNotExist:
            return Response({'detail': 'Raw Material not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class AdditiveApprovalView(APIView):
    def get(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
    
        if not pk:
            return Response({'detail': 'Additive ID not provided.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                obj = Additive.objects.get(pk=pk)

                obj.approved = True
                obj.save()

                serializer = AdditiveSerializer(obj)
                return Response(serializer.data, status=status.HTTP_200_OK)
        except Additive.DoesNotExist:
            return Response({'detail': 'Additive not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class ConsumptionFormulaApprovalView(APIView):
    def get(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
    
        if not pk:
            return Response({'detail': 'Consumption Formula ID not provided.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                obj = ConsumptionFormula.objects.get(pk=pk)

                obj.approved = True
                obj.save()

                serializer = ConsumptionFormulaSerializer(obj)
                return Response(serializer.data, status=status.HTTP_200_OK)
        except ConsumptionFormula.DoesNotExist:
            return Response({'detail': 'Consumption Formula not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class PackingTypeViewSet(viewsets.ModelViewSet):
    queryset = PackingType.objects.all()
    serializer_class = PackingTypeSerializer


class ProductFormulaView(APIView):
    
    def get(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        if pk:
            try:
                formula = ProductFormula.objects.get(id=pk)
            except ProductFormula.DoesNotExist:
                return Response(
                    {'detail': 'ProductFormula not found.'},
                    status=status.HTTP_404_NOT_FOUND
                    )

            formula_serializer = ProductFormulaSerializer(formula)

            items = ProductFormulaItem.objects.filter(product_formula=formula)

            item_serializer = ProductFormulaItemSerializer(items, many=True)

    
            response_data = formula_serializer.data
            response_data['items'] = item_serializer.data

            return Response(response_data)

   
        queryset = ProductFormula.objects.all()
        filterset = ProductFormulaFilter(request.GET, queryset=queryset)

        if not filterset.is_valid():
            return Response(filterset.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer = ProductFormulaSerializer(filterset.qs, many=True)
        return Response(serializer.data)

        
    def post(self, request, *args, **kwargs):
        data = request.data
        # Prepare trade data separately
        c_data = {
            'formula_name': data.get('formula_name'),
            'consumption_name': data.get('consumption_name'),
            'packing_type': data.get('packing_type'),
            'remarks': data.get('remarks'),
        }
        c_items_data = []
      
       
        l = 0
        while f'attributes[{l}].label' in data:
            item_data = {
                'label': data.get(f'attributes[{l}].label'),
                'value': data.get(f'attributes[{l}].value'),
            }
            c_items_data.append(item_data)
            l += 1

        with transaction.atomic():
            p_serializer = ProductFormulaSerializer(data=c_data)
            if p_serializer.is_valid():
                p_formula = p_serializer.save()
            else:
                return Response(p_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            if c_items_data:
                try: 
                    items = [ProductFormulaItem(**item, product_formula=p_formula) for item in c_items_data]
                    ProductFormulaItem.objects.bulk_create(items)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
        return Response(p_serializer.data, status=status.HTTP_201_CREATED)
    
    def put(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        data = request.data
        
        try:
            formula = ProductFormula.objects.get(pk=pk)
        except ProductFormula.DoesNotExist:
            return Response({'error': 'Product formula not found'}, status=status.HTTP_404_NOT_FOUND)
        
        c_data = {
            'formula_name': data.get('formula_name'),
            'consumption_name': data.get('consumption_name'),
            'packing_type': data.get('packing_type'),
            'remarks': data.get('remarks'),
        }
        c_items_data = []
      
       
        l = 0
        while f'attributes[{l}].label' in data:
            item_data = {
                'label': data.get(f'attributes[{l}].label'),
                'value': data.get(f'attributes[{l}].value'),
            }
            c_items_data.append(item_data)
            l += 1
       
        with transaction.atomic():
            formula_serializer = ProductFormulaSerializer(formula, data=c_data, partial=True)
            if formula_serializer.is_valid():
                formula = formula_serializer.save()
            else:
                return Response(formula_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            
            if c_items_data:
                # Clear existing trade products and add new ones
                ProductFormulaItem.objects.filter(product_formula=formula).delete()
               
                try: 
                    items = [ProductFormulaItem(**item, product_formula=formula) for item in c_items_data]
                    ProductFormulaItem.objects.bulk_create(items)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            

        return Response(formula_serializer.data, status=status.HTTP_200_OK)
    
    def delete(self, request, *args, **kwargs):
        pk = kwargs.get('pk')

        try:
            formula = ProductFormula.objects.get(pk=pk)
        except ProductFormula.DoesNotExist:
            return Response({'error': 'Product Formula not found'}, status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            # Delete related trade products and extra costs
            ProductFormulaItem.objects.filter(product_formula=formula).delete()
            formula.delete()

        return Response({'message': 'Product Formula deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

class ProductFormulaItemViewSet(viewsets.ModelViewSet):
    queryset = ProductFormulaItem.objects.all()
    serializer_class = ProductFormulaItemSerializer