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
from notifications.services import NotificationService
from accounts.models import CustomUser
from accounts.mixins import get_authorized_queryset, HierarchicalSecurityMixin
# Create your views here.


actor = None

class NotificationViewSetMixin:
    notification_verb = "Record"
    notification_target_url = "/"

    def _dispatch_notifications(self, request, is_update=False):
        notified_users = request.data.getlist('notifiedUsers[]') if hasattr(request.data, 'getlist') else request.data.get('notifiedUsers[]', [])
        if not notified_users:
            notified_users = request.data.get('notifiedUsers', [])
        notified_user_ids = list(map(int, notified_users)) if notified_users else []

        action = "Updated" if is_update else "Created"
        
        if notified_user_ids:
            NotificationService.notify_users_explicit(
                # actor=request.user if hasattr(request, 'user') and request.user.is_authenticated else None,
                actor=actor,
                notified_user_ids=notified_user_ids,
                verb=f"{self.notification_verb} {action}",
                message=f"You have been assigned to {self.notification_verb} by {request.user.name if hasattr(request, 'user') and hasattr(request.user, 'name') else 'System'}",
                target_url=self.notification_target_url
            )
            
        if not is_update:
            NotificationService.notify_all_general(
                # actor=request.user if hasattr(request, 'user') and request.user.is_authenticated else None,
                actor=actor,
                verb=f"New {self.notification_verb}",
                message=f"A new {self.notification_verb} was created.",
                target_url=self.notification_target_url
            )

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        self._dispatch_notifications(request, is_update=False)
        return response

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        self._dispatch_notifications(request, is_update=True)
        return response

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().prefetch_related(
        'children',
        'children__children',
        'children__children__children',
        'children__children__children__children'
    )
    serializer_class = CategorySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = CategoryFilter

class PackingViewSet(HierarchicalSecurityMixin, NotificationViewSetMixin, viewsets.ModelViewSet):
    notification_verb = "Packing Price"
    notification_target_url = "/packings"

    queryset = Packing.objects.all().order_by('-id')  # latest first
    serializer_class = PackingSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = PackingFilter

class RawCategoryViewSet(viewsets.ModelViewSet):
    queryset = RawCategory.objects.all().prefetch_related(
        'children',
        'children__children',
        'children__children__children',
        'children__children__children__children'
    )
    serializer_class = RawCategorySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = RawCategoryFilter

    def get_queryset(self):
        qs = super().get_queryset()
        leaf = self.request.query_params.get('leaf')

        if leaf in ['1', 'true', 'True']:
            qs = qs.filter(children__isnull=True)
        elif leaf in ['0', 'false', 'False']:
            qs = qs.filter(children__isnull=False).distinct()
        # else → no filtering (return all)

        return qs


class RawMaterialViewSet(HierarchicalSecurityMixin, NotificationViewSetMixin, viewsets.ModelViewSet):
    notification_verb = "Raw Material Pricing"
    notification_target_url = "/raw-materials"

    queryset = RawMaterial.objects.all().order_by('-id') 
    serializer_class = RawMaterialSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = RawMaterialFilter

class AdditiveCategoryViewSet(viewsets.ModelViewSet):
    queryset = AdditiveCategory.objects.all().prefetch_related(
        'children',
        'children__children',
        'children__children__children',
        'children__children__children__children'
    )
    serializer_class = AdditiveCategorySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = AdditiveCategoryFilter

    def get_queryset(self):
        qs = super().get_queryset()
        leaf = self.request.query_params.get('leaf')
        if leaf in ['1', 'true', 'True']:
            qs = qs.filter(children__isnull=True)
        elif leaf in ['0', 'false', 'False']:
            qs = qs.filter(children__isnull=False).distinct()

        return qs

class AdditiveViewSet(HierarchicalSecurityMixin, NotificationViewSetMixin, viewsets.ModelViewSet):
    notification_verb = "Additive Pricing"
    notification_target_url = "/additives"

    queryset = Additive.objects.all()
    serializer_class = AdditiveSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = AdditiveFilter

class ConsumptionAdditiveViewSet(viewsets.ModelViewSet):
    queryset = ConsumptionAdditive.objects.all()
    serializer_class = ConsumptionAdditiveSerializer

class ConsumptionBaseOilViewSet(viewsets.ModelViewSet):
    queryset = ConsumptionBaseOil.objects.all()
    serializer_class = ConsumptionBaseOilSerializer

def get_next_consumption_ref():
    from django.db.models import Max
    from .models import ConsumptionFormula

    last_ref = (
        ConsumptionFormula.objects
        .aggregate(max_ref=Max('ref'))['max_ref']
    )

    if last_ref:
        last_number = int(last_ref.split('-')[1])
        next_number = last_number + 1
    else:
        next_number = 1

    return f"BFR-{next_number:07d}"

class NextConsumptionRef(APIView):
    def get(self, request):
        return Response({
            "next_ref": get_next_consumption_ref()
        })
    
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
            queryset = get_authorized_queryset(request, ConsumptionFormula.objects.all())
            filterset = ConsumptionFormulaFilter(request.GET, queryset=queryset)

            if not filterset.is_valid():
                return Response(filterset.errors, status=status.HTTP_400_BAD_REQUEST)

            serializer = ConsumptionFormulaSerializer(filterset.qs, many=True)
            return Response(serializer.data)
    
    def post(self, request, *args, **kwargs):
        data = request.data
        notified_users = request.data.getlist('notifiedUsers[]') if hasattr(request.data, 'getlist') else request.data.get('notifiedUsers[]', [])
        notified_user_ids = list(map(int, notified_users)) if notified_users else []

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
                consumption = c_serializer.save(created_by=request.user)
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
                
            NotificationService.notify_users_explicit(
                # actor=request.user if hasattr(request, 'user') and request.user.is_authenticated else None, 
                actor=actor,
                notified_user_ids=notified_user_ids,
                verb="Consumption Formula Created", 
                message=f"You have been assigned to Consumption Formula {consumption.name if consumption.name else consumption.id} by {request.user.name if hasattr(request.user, 'name') else 'System'}",
                target_url=f"/consumption-formulas"
            )
            
            NotificationService.notify_all_general(
                # actor=request.user if hasattr(request, 'user') and request.user.is_authenticated else None,
                actor=actor,
                verb="New Consumption Formula",
                message=f"Consumption Formula {consumption.name if consumption.name else consumption.id} was created.",
                target_url=f"/consumption-formulas"
            )

        return Response(c_serializer.data, status=status.HTTP_201_CREATED)

    def put(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        data = request.data
        
        notified_users = request.data.getlist('notifiedUsers[]') if hasattr(request.data, 'getlist') else request.data.get('notifiedUsers[]', [])
        notified_user_ids = list(map(int, notified_users)) if notified_users else []

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

            NotificationService.notify_users_explicit(
                # actor=request.user if hasattr(request, 'user') and request.user.is_authenticated else None, 
                actor=actor,
                notified_user_ids=notified_user_ids,
                verb="Consumption Formula Updated", 
                message=f"You have been assigned to updated Consumption Formula {consumption.name if consumption.name else consumption.id} by {request.user.name if hasattr(request.user, 'name') else 'System'}",
                target_url=f"/consumption-formulas"
            )
            
            NotificationService.notify_all_general(
                # actor=request.user if hasattr(request, 'user') and request.user.is_authenticated else None,
                actor=actor,
                verb="Consumption Formula Updated",
                message=f"Consumption Formula {consumption.name if consumption.name else consumption.id} was updated.",
                target_url=f"/consumption-formulas"
            )

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
            queryset = get_authorized_queryset(request, Consumption.objects.all())
            filterset = ConsumptionFilter(request.GET, queryset=queryset)

            if not filterset.is_valid():
                return Response(filterset.errors, status=status.HTTP_400_BAD_REQUEST)

            serializer = ConsumptionSerializer(filterset.qs, many=True)
            return Response(serializer.data)
    
    def post(self, request, *args, **kwargs):
        data = request.data
        notified_users = request.data.getlist('notifiedUsers[]') if hasattr(request.data, 'getlist') else request.data.get('notifiedUsers[]', [])
        notified_user_ids = list(map(int, notified_users)) if notified_users else []

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
            'batch': data.get('batch'),
        }
        c_additives_data = []
        c_base_oils_data = []
       
        l = 0
        while f'consumptionAdditive[{l}].name' in data:
            additives_data = {
                'name': data.get(f'consumptionAdditive[{l}].name'),
                'sub_name': data.get(f'consumptionAdditive[{l}].sub_name'),
                'qty_in_percent': data.get(f'consumptionAdditive[{l}].qty_in_percent'),
                'qty_in_litre': data.get(f'consumptionAdditive[{l}].qty_in_litre'),
                'value': data.get(f'consumptionAdditive[{l}].value'),
                'rate': data.get(f'consumptionAdditive[{l}].rate'),
            }
            c_additives_data.append(additives_data)
            l += 1
        
        m = 0
        while f'consumptionBaseOil[{m}].name' in data:
            base_oils_data = {
                'name': data.get(f'consumptionBaseOil[{m}].name'),
                'sub_name': data.get(f'consumptionBaseOil[{m}].sub_name'),
                'qty_in_percent': data.get(f'consumptionBaseOil[{m}].qty_in_percent'),
                'qty_in_litre': data.get(f'consumptionBaseOil[{m}].qty_in_litre'),
                'value': data.get(f'consumptionBaseOil[{m}].value'),
                'rate': data.get(f'consumptionBaseOil[{m}].rate'),
            }
            c_base_oils_data.append(base_oils_data)
            m += 1

        with transaction.atomic():
            c_serializer = ConsumptionSerializer(data=c_data)
            if c_serializer.is_valid():
                consumption = c_serializer.save(created_by=request.user)
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
                
            NotificationService.notify_users_explicit(
                # actor=request.user if hasattr(request, 'user') and request.user.is_authenticated else None, 
                actor=actor,
                notified_user_ids=notified_user_ids,
                verb="Consumption Created", 
                message=f"You have been assigned to Consumption {consumption.name if consumption.name else consumption.id} by {request.user.name if hasattr(request.user, 'name') else 'System'}",
                target_url=f"/consumptions"
            )
            
            NotificationService.notify_all_general(
                # actor=request.user if hasattr(request, 'user') and request.user.is_authenticated else None,
                actor=actor,
                verb="New Consumption",
                message=f"Consumption {consumption.name if consumption.name else consumption.id} was created.",
                target_url=f"/consumptions"
            )

        return Response(c_serializer.data, status=status.HTTP_201_CREATED)

    def put(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        data = request.data
        
        notified_users = request.data.getlist('notifiedUsers[]') if hasattr(request.data, 'getlist') else request.data.get('notifiedUsers[]', [])
        notified_user_ids = list(map(int, notified_users)) if notified_users else []

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
            'batch': data.get('batch')
        }
        c_additives_data = []
        c_base_oils_data = []

        l = 0
        while f'consumptionAdditive[{l}].name' in data:
            additives_data = {
                'name': data.get(f'consumptionAdditive[{l}].name'),
                'sub_name': data.get(f'consumptionAdditive[{l}].sub_name'),
                'qty_in_percent': data.get(f'consumptionAdditive[{l}].qty_in_percent'),
                'qty_in_litre': data.get(f'consumptionAdditive[{l}].qty_in_litre'),
                'value': data.get(f'consumptionAdditive[{l}].value'),
                'rate': data.get(f'consumptionAdditive[{l}].rate'),
            }
            c_additives_data.append(additives_data)
            l += 1
        
        m = 0
        while f'consumptionBaseOil[{m}].name' in data:
            base_oils_data = {
                'name': data.get(f'consumptionBaseOil[{m}].name'),
                'sub_name': data.get(f'consumptionBaseOil[{m}].sub_name'),
                'qty_in_percent': data.get(f'consumptionBaseOil[{m}].qty_in_percent'),
                'qty_in_litre': data.get(f'consumptionBaseOil[{m}].qty_in_litre'),
                'value': data.get(f'consumptionBaseOil[{m}].value'),
                'rate': data.get(f'consumptionBaseOil[{m}].rate'),
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

            NotificationService.notify_users_explicit(
                # actor=request.user if hasattr(request, 'user') and request.user.is_authenticated else None, 
                actor=actor,
                notified_user_ids=notified_user_ids,
                verb="Consumption Updated", 
                message=f"You have been assigned to updated Consumption {consumption.name if consumption.name else consumption.id} by {request.user.name if hasattr(request.user, 'name') else 'System'}",
                target_url=f"/consumptions"
            )
            
            NotificationService.notify_all_general(
                # actor=request.user if hasattr(request, 'user') and request.user.is_authenticated else None,
                actor=actor,
                verb="Consumption Updated",
                message=f"Consumption {consumption.name if consumption.name else consumption.id} was updated.",
                target_url=f"/consumptions"
            )

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



class FinalProductViewSet(HierarchicalSecurityMixin, NotificationViewSetMixin, viewsets.ModelViewSet):
    notification_verb = "Final Product Cost"
    notification_target_url = "/final-products"

    serializer_class = FinalProductSerializer
    queryset = FinalProduct.objects.select_related(
        "formula",
        "packing_size"
    ).prefetch_related(
        "packing_items",
        "additional_costs"
    ).order_by("-id")

    # ----------------------------------
    # Prevent editing if approved=True
    # ----------------------------------
    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.approved:
            return Response(
                {"error": "Approved Final Product cannot be edited."},
                status=400
            )

        response = super().update(request, *args, **kwargs)
        self._dispatch_notifications(request, is_update=True)
        return response


    # ----------------------------------
    # Prevent delete if approved=True
    # ----------------------------------
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.approved:
            return Response(
                {"error": "Approved Final Product cannot be deleted."},
                status=400
            )

        return super().destroy(request, *args, **kwargs)
   


class PackingApprovalView(APIView):
    def get(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        if not pk:
            return Response({'detail': 'Packing ID not provided.'}, status=status.HTTP_400_BAD_REQUEST)

        notified_users = request.GET.getlist('notifiedUsers[]')
        notified_user_ids = list(map(int, notified_users)) if notified_users else []

        try:
            with transaction.atomic():
                obj = Packing.objects.get(pk=pk)

                obj.approved = True
                obj.save()
                
                actor = request.user if hasattr(request, 'user') and request.user.is_authenticated else None

                
                NotificationService.notify_users_explicit(

                
                    actor=actor,

                
                    notified_user_ids=notified_user_ids,

                
                    verb="Packing Approved",

                
                    message=f"You have been notified that " + f"Packing entry has been approved.",

                
                    target_url=f"/packings"

                
                )


                
                NotificationService.notify_all_general(

                
                    actor=actor,

                
                    verb="Packing Approved",

                
                    message=f"Packing entry has been approved.",

                
                    target_url=f"/packings"

                
                )
                
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

        notified_users = request.GET.getlist('notifiedUsers[]')
        notified_user_ids = list(map(int, notified_users)) if notified_users else []

        try:
            with transaction.atomic():
                obj = RawMaterial.objects.get(pk=pk)

                obj.approved = True
                obj.save()
                
                actor = request.user if hasattr(request, 'user') and request.user.is_authenticated else None

                
                NotificationService.notify_users_explicit(

                
                    actor=actor,

                
                    notified_user_ids=notified_user_ids,

                
                    verb="Raw Material Approved",

                
                    message=f"You have been notified that " + f"Raw Material {obj.name if hasattr(obj, 'name') else pk} has been approved.",

                
                    target_url=f"/raw-materials"

                
                )


                
                NotificationService.notify_all_general(

                
                    actor=actor,

                
                    verb="Raw Material Approved",

                
                    message=f"Raw Material {obj.name if hasattr(obj, 'name') else pk} has been approved.",

                
                    target_url=f"/raw-materials"

                
                )

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

        notified_users = request.GET.getlist('notifiedUsers[]')
        notified_user_ids = list(map(int, notified_users)) if notified_users else []

        try:
            with transaction.atomic():
                obj = Additive.objects.get(pk=pk)

                obj.approved = True
                obj.save()
                
                actor = request.user if hasattr(request, 'user') and request.user.is_authenticated else None

                
                NotificationService.notify_users_explicit(

                
                    actor=actor,

                
                    notified_user_ids=notified_user_ids,

                
                    verb="Additive Approved",

                
                    message=f"You have been notified that " + f"Additive {obj.name if hasattr(obj, 'name') else pk} has been approved.",

                
                    target_url=f"/additives"

                
                )


                
                NotificationService.notify_all_general(

                
                    actor=actor,

                
                    verb="Additive Approved",

                
                    message=f"Additive {obj.name if hasattr(obj, 'name') else pk} has been approved.",

                
                    target_url=f"/additives"

                
                )

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

        notified_users = request.GET.getlist('notifiedUsers[]')
        notified_user_ids = list(map(int, notified_users)) if notified_users else []

        try:
            with transaction.atomic():
                obj = ConsumptionFormula.objects.get(pk=pk)

                obj.approved = True
                obj.save()
                
                actor = request.user if hasattr(request, 'user') and request.user.is_authenticated else None

                
                NotificationService.notify_users_explicit(

                
                    actor=actor,

                
                    notified_user_ids=notified_user_ids,

                
                    verb="Consumption Formula Approved",

                
                    message=f"You have been notified that " + f"Consumption Formula {obj.name if hasattr(obj, 'name') else pk} has been approved.",

                
                    target_url=f"/consumption-formula"

                
                )


                
                NotificationService.notify_all_general(

                
                    actor=actor,

                
                    verb="Consumption Formula Approved",

                
                    message=f"Consumption Formula {obj.name if hasattr(obj, 'name') else pk} has been approved.",

                
                    target_url=f"/consumption-formula"

                
                )

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

   
        queryset = get_authorized_queryset(request, ProductFormula.objects.all())
        filterset = ProductFormulaFilter(request.GET, queryset=queryset)

        if not filterset.is_valid():
            return Response(filterset.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer = ProductFormulaSerializer(filterset.qs, many=True)
        return Response(serializer.data)

        
    def post(self, request, *args, **kwargs):
        data = request.data
        notified_users = request.data.getlist('notifiedUsers[]') if hasattr(request.data, 'getlist') else request.data.get('notifiedUsers[]', [])
        notified_user_ids = list(map(int, notified_users)) if notified_users else []
        
        # Prepare trade data separately
        c_data = {
            'formula_name': data.get('formula_name'),
            'consumption_name': data.get('consumption_name'),
            'consumption_qty': data.get('consumption_qty'),
            'packing_type': data.get('packing_type'),
            # 'bottle_per_pack': data.get('bottle_per_pack'),
            # 'litre_per_pack': data.get('litre_per_pack'),
            'remarks': data.get('remarks'),
        }
        c_items_data = []
      
       
        attributes = data.get("attributes", [])

        c_items_data = []
        for item in attributes:
            c_items_data.append({
                "packing_type": item.get("packing_type"),
                "packing_label": item.get("packing_label"),
                "qty": item.get("qty"),
            })


        # import pdb;pdb.set_trace()
        with transaction.atomic():
            p_serializer = ProductFormulaSerializer(data=c_data)
            if p_serializer.is_valid():
                p_formula = p_serializer.save(created_by=request.user)
            else:
                return Response(p_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            if c_items_data:
                try: 
                    items = [ProductFormulaItem(**item, product_formula=p_formula) for item in c_items_data]
                    ProductFormulaItem.objects.bulk_create(items)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

            NotificationService.notify_users_explicit(
                # actor=request.user if hasattr(request, 'user') and request.user.is_authenticated else None, 
                actor=actor,
                notified_user_ids=notified_user_ids,
                verb="Product Formula Created", 
                message=f"You have been assigned to Product Formula {p_formula.formula_name if p_formula.formula_name else p_formula.id} by {request.user.name if hasattr(request.user, 'name') else 'System'}",
                target_url=f"/product-formulas"
            )
            
            NotificationService.notify_all_general(
                # actor=request.user if hasattr(request, 'user') and request.user.is_authenticated else None,
                actor=actor,
                verb="New Product Formula",
                message=f"Product Formula {p_formula.formula_name if p_formula.formula_name else p_formula.id} was created.",
                target_url=f"/product-formulas"
            )
            
        return Response(p_serializer.data, status=status.HTTP_201_CREATED)
    
    def put(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        data = request.data
        
        notified_users = request.data.getlist('notifiedUsers[]') if hasattr(request.data, 'getlist') else request.data.get('notifiedUsers[]', [])
        notified_user_ids = list(map(int, notified_users)) if notified_users else []

        try:
            formula = ProductFormula.objects.get(pk=pk)
        except ProductFormula.DoesNotExist:
            return Response({'error': 'Product formula not found'}, status=status.HTTP_404_NOT_FOUND)
        
        c_data = {
            'formula_name': data.get('formula_name'),
            'consumption_name': data.get('consumption_name'),
            'consumption_qty': data.get('consumption_qty'),
            'packing_type': data.get('packing_type'),
            # 'bottle_per_pack': data.get('bottle_per_pack'),
            # 'litre_per_pack': data.get('litre_per_pack'),
            'remarks': data.get('remarks'),
        }
        c_items_data = []
      
       
        attributes = data.get("attributes", [])

        c_items_data = []
        for item in attributes:
            c_items_data.append({
                "packing_type": item.get("packing_type"),
                "packing_label": item.get("packing_label"),
                "qty": item.get("qty"),
            })

        # import pdb;pdb.set_trace()
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

            NotificationService.notify_users_explicit(
                # actor=request.user if hasattr(request, 'user') and request.user.is_authenticated else None, 
                actor=actor,
                notified_user_ids=notified_user_ids,
                verb="Product Formula Updated", 
                message=f"You have been assigned to updated Product Formula {formula.formula_name if formula.formula_name else formula.id} by {request.user.name if hasattr(request.user, 'name') else 'System'}",
                target_url=f"/product-formulas"
            )
            
            NotificationService.notify_all_general(
                # actor=request.user if hasattr(request, 'user') and request.user.is_authenticated else None,
                actor=actor,
                verb="Product Formula Updated",
                message=f"Product Formula {formula.formula_name if formula.formula_name else formula.id} was updated.",
                target_url=f"/product-formulas"
            )

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

class PackingSizeViewSet(viewsets.ModelViewSet):
    queryset = PackingSize.objects.all()
    serializer_class = PackingSizeSerializer

class FinalProductApprovalView(APIView):
    def get(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
    
        if not pk:
            return Response({'detail': 'Final Product id not provided.'}, status=status.HTTP_400_BAD_REQUEST)

        notified_users = request.GET.getlist('notifiedUsers[]')
        notified_user_ids = list(map(int, notified_users)) if notified_users else []

        try:
            with transaction.atomic():
                obj = FinalProduct.objects.get(pk=pk)

                obj.approved = True
                obj.save()

                actor = request.user if hasattr(request, 'user') and request.user.is_authenticated else None


                NotificationService.notify_users_explicit(


                    actor=actor,


                    notified_user_ids=notified_user_ids,


                    verb="Final Product Approved",


                    message=f"You have been notified that " + f"Final Product Cost entry has been approved.",


                    target_url=f"/final-products"


                )



                NotificationService.notify_all_general(


                    actor=actor,


                    verb="Final Product Approved",


                    message=f"Final Product Cost entry has been approved.",


                    target_url=f"/final-products"


                )

                serializer = FinalProductSerializer(obj)
                return Response(serializer.data, status=status.HTTP_200_OK)
        except FinalProduct.DoesNotExist:
            return Response({'detail': 'Final Product Cost not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProductFormulaApprovalView(APIView):
    def get(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
    
        if not pk:
            return Response({'detail': 'Product formulation id not provided.'}, status=status.HTTP_400_BAD_REQUEST)

        notified_users = request.GET.getlist('notifiedUsers[]')
        notified_user_ids = list(map(int, notified_users)) if notified_users else []

        try:
            with transaction.atomic():
                obj = ProductFormula.objects.get(pk=pk)

                obj.approved = True
                obj.save()

                actor = request.user if hasattr(request, 'user') and request.user.is_authenticated else None


                NotificationService.notify_users_explicit(


                    actor=actor,


                    notified_user_ids=notified_user_ids,


                    verb="Product Formula Approved",


                    message=f"You have been notified that " + f"Product Formula {obj.formula_name if hasattr(obj, 'formula_name') else pk} has been approved.",


                    target_url=f"/product-formula"


                )



                NotificationService.notify_all_general(


                    actor=actor,


                    verb="Product Formula Approved",


                    message=f"Product Formula {obj.formula_name if hasattr(obj, 'formula_name') else pk} has been approved.",


                    target_url=f"/product-formula"


                )

                serializer = ProductFormulaSerializer(obj)
                return Response(serializer.data, status=status.HTTP_200_OK)
        except ProductFormula.DoesNotExist:
            return Response({'detail': 'Product formulation not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class ConsumptionApprovalView(APIView):
    def get(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        if not pk:
            return Response({'detail': 'Consumption ID not provided.'}, status=status.HTTP_400_BAD_REQUEST)

        notified_users = request.GET.getlist('notifiedUsers[]')
        notified_user_ids = list(map(int, notified_users)) if notified_users else []

        try:
            with transaction.atomic():
                obj = Consumption.objects.get(pk=pk)

                obj.approved = True
                obj.save()
                
                actor = request.user if hasattr(request, 'user') and request.user.is_authenticated else None

                
                NotificationService.notify_users_explicit(

                
                    actor=actor,

                
                    notified_user_ids=notified_user_ids,

                
                    verb="Consumption Approved",

                
                    message=f"You have been notified that " + f"Consumption entry {obj.name if hasattr(obj, 'name') else pk} has been approved.",

                
                    target_url=f"/consumptions"

                
                )


                
                NotificationService.notify_all_general(

                
                    actor=actor,

                
                    verb="Consumption Approved",

                
                    message=f"Consumption entry {obj.name if hasattr(obj, 'name') else pk} has been approved.",

                
                    target_url=f"/consumptions"

                
                )
                serializer = ConsumptionSerializer(obj)
                return Response(serializer.data, status=status.HTTP_200_OK)
        except Consumption.DoesNotExist:
            return Response({'detail': 'Consumption not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class AdditiveCategoryApprovalView(APIView):
    def get(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
    
        if not pk:
            return Response({'detail': 'Additive Category ID not provided.'}, status=status.HTTP_400_BAD_REQUEST)

        notified_users = request.GET.getlist('notifiedUsers[]')
        notified_user_ids = list(map(int, notified_users)) if notified_users else []

        try:
            with transaction.atomic():
                obj = AdditiveCategory.objects.get(pk=pk)
                # import pdb;pdb.set_trace()
                obj.approved = True
                obj.save()

                actor = request.user if hasattr(request, 'user') and request.user.is_authenticated else None


                NotificationService.notify_users_explicit(


                    actor=actor,


                    notified_user_ids=notified_user_ids,


                    verb="Additive Category Approved",


                    message=f"You have been notified that " + f"Additive Category {obj.name if hasattr(obj, 'name') else pk} has been approved.",


                    target_url=f"/additive-categories"


                )



                NotificationService.notify_all_general(


                    actor=actor,


                    verb="Additive Category Approved",


                    message=f"Additive Category {obj.name if hasattr(obj, 'name') else pk} has been approved.",


                    target_url=f"/additive-categories"


                )

                serializer = AdditiveCategorySerializer(obj)
                return Response(serializer.data, status=status.HTTP_200_OK)
        except AdditiveCategory.DoesNotExist:
            return Response({'detail': 'Additive Category not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RawCategoryApprovalView(APIView):
    def get(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
    
        if not pk:
            return Response({'detail': 'Raw Category ID not provided.'}, status=status.HTTP_400_BAD_REQUEST)

        notified_users = request.GET.getlist('notifiedUsers[]')
        notified_user_ids = list(map(int, notified_users)) if notified_users else []

        try:
            with transaction.atomic():
                obj = RawCategory.objects.get(pk=pk)

                obj.approved = True
                obj.save()

                actor = request.user if hasattr(request, 'user') and request.user.is_authenticated else None


                NotificationService.notify_users_explicit(


                    actor=actor,


                    notified_user_ids=notified_user_ids,


                    verb="Raw Category Approved",


                    message=f"You have been notified that " + f"Raw Category {obj.name if hasattr(obj, 'name') else pk} has been approved.",


                    target_url=f"/raw-categories"


                )



                NotificationService.notify_all_general(


                    actor=actor,


                    verb="Raw Category Approved",


                    message=f"Raw Category {obj.name if hasattr(obj, 'name') else pk} has been approved.",


                    target_url=f"/raw-categories"


                )

                serializer = RawCategorySerializer(obj)
                return Response(serializer.data, status=status.HTTP_200_OK)
        except RawCategory.DoesNotExist:
            return Response({'detail': 'Raw Category not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)