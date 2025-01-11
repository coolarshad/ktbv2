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
import logging
import pandas as pd
from datetime import date
logger = logging.getLogger(__name__)

class TradeView(APIView):
    filter_backends = [DjangoFilterBackend]
    filterset_class = TradeFilter

    def get(self, request, *args, **kwargs):
        trade_id = kwargs.get('pk')  # URL parameter for trade ID
        
        if trade_id:  # If `pk` is provided, retrieve a specific trade
            try:
                trade = Trade.objects.get(id=trade_id)
            except Trade.DoesNotExist:
                return Response({'detail': 'Trade not found.'}, status=status.HTTP_404_NOT_FOUND)

            trade_serializer = TradeSerializer(trade)
            trade_products = TradeProduct.objects.filter(trade=trade)
            trade_extra_costs = TradeExtraCost.objects.filter(trade=trade)

            trade_products_serializer = TradeProductSerializer(trade_products, many=True)
            trade_extra_costs_serializer = TradeExtraCostSerializer(trade_extra_costs, many=True)

            response_data = trade_serializer.data
            response_data['tradeProducts'] = trade_products_serializer.data
            response_data['tradeExtraCosts'] = trade_extra_costs_serializer.data

            return Response(response_data)

        else:  # If `pk` is not provided, list all trades
            # trades = Trade.objects.all()
            # serializer = TradeSerializer(trades, many=True)
            # return Response(serializer.data)
            queryset = Trade.objects.all()
            filterset = TradeFilter(request.GET, queryset=queryset)

            if not filterset.is_valid():
                return Response(filterset.errors, status=status.HTTP_400_BAD_REQUEST)

            serializer = TradeSerializer(filterset.qs, many=True)
            return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        data = request.data
        # Prepare trade data separately
        
        trade_data = {
            'company': data.get('company'),
            'trd': data.get('trd'),
            'trn': data.get('trn'),
            'trade_type': data.get('trade_type'),
            'trade_category': data.get('trade_category'),
            'country_of_origin': data.get('country_of_origin'),
            'customer_company_name': data.get('customer_company_name'),
            'address': data.get('address'),
            'currency_selection': data.get('currency_selection'),
            'exchange_rate': data.get('exchange_rate'),
            'commission_agent': data.get('commission_agent'),
            'contract_value': data.get('contract_value'),
            'payment_term': data.get('payment_term'),
            'advance_value_to_receive': data.get('advance_value_to_receive'),
            'commission_value': data.get('commission_value'),
            'logistic_provider': data.get('logistic_provider'),
            'estimated_logistic_cost': data.get('estimated_logistic_cost'),
            'logistic_cost_tolerence': data.get('logistic_cost_tolerence'),
            'logistic_cost_remarks': data.get('logistic_cost_remarks'),
            'bank_name_address': data.get('bank_name_address'),
            'account_number': data.get('account_number'),
            'swift_code': data.get('swift_code'),
            'incoterm': data.get('incoterm'),
            'pod': data.get('pod'),
            'pol': data.get('pol'),
            'eta': data.get('eta'),
            'etd': data.get('etd'),
            'remarks': data.get('remarks'),
            'trader_name': data.get('trader_name'),
            'insurance_policy_number': data.get('insurance_policy_number'),
           
            'shipper_in_bl': data.get('shipper_in_bl'),
            'consignee_in_bl': data.get('consignee_in_bl'),
            'notify_party_in_bl': data.get('notify_party_in_bl'),
            
            'container_shipment_size': data.get('container_shipment_size'),
            'bl_fee': data.get('bl_fee'),
            'bl_fee_remarks': data.get('bl_fee_remarks'),
        }
        trade_products_data = []
        trade_extra_costs_data = []
        # related_trades_data = []

        i = 0
        while f'tradeProducts[{i}].product_code' in data:
            loi_file = request.FILES.get(f'tradeProducts[{i}].loi', None)

            product_data = {
                'product_code_ref': data.get(f'tradeProducts[{i}].product_code_ref'),
                'product_code': data.get(f'tradeProducts[{i}].product_code'),
                'product_name': data.get(f'tradeProducts[{i}].product_name'),
                'product_name_for_client': data.get(f'tradeProducts[{i}].product_name_for_client'),
                'loi': loi_file,  # Handle binary data as needed
                'hs_code': data.get(f'tradeProducts[{i}].hs_code'),
                'total_contract_qty': data.get(f'tradeProducts[{i}].total_contract_qty'),
                'total_contract_qty_unit': data.get(f'tradeProducts[{i}].total_contract_qty_unit'),
                'tolerance': data.get(f'tradeProducts[{i}].tolerance'),
                'contract_balance_qty': data.get(f'tradeProducts[{i}].contract_balance_qty'),
                'contract_balance_qty_unit': data.get(f'tradeProducts[{i}].contract_balance_qty_unit'),
                'trade_qty': data.get(f'tradeProducts[{i}].trade_qty'),
                'trade_qty_unit': data.get(f'tradeProducts[{i}].trade_qty_unit'),
                'selected_currency_rate': data.get(f'tradeProducts[{i}].selected_currency_rate'),
                'rate_in_usd': data.get(f'tradeProducts[{i}].rate_in_usd'),
                'markings_in_packaging': data.get(f'tradeProducts[{i}].markings_in_packaging'),
                'mode_of_packing': data.get(f'tradeProducts[{i}].mode_of_packing'),
                'rate_of_each_packing': data.get(f'tradeProducts[{i}].rate_of_each_packing'),
                'qty_of_packing': data.get(f'tradeProducts[{i}].qty_of_packing'),
                'total_packing_cost': data.get(f'tradeProducts[{i}].total_packing_cost'),
                'packaging_supplier': data.get(f'tradeProducts[{i}].packaging_supplier'),
                'product_value': data.get(f'tradeProducts[{i}].product_value'),
                'commission_rate': data.get(f'tradeProducts[{i}].commission_rate'),
                'total_commission': data.get(f'tradeProducts[{i}].total_commission'),
                'ref_type': data.get(f'tradeProducts[{i}].ref_type'),
                'ref_trn': data.get(f'tradeProducts[{i}].ref_trn'),
                
            }
            trade_products_data.append(product_data)
            i += 1

        j = 0
        while f'tradeExtraCosts[{j}].extra_cost' in data:
            cost_data = {
                'extra_cost': data.get(f'tradeExtraCosts[{j}].extra_cost'),
                'extra_cost_remarks': data.get(f'tradeExtraCosts[{j}].extra_cost_remarks'),
            }
            trade_extra_costs_data.append(cost_data)
            j += 1
        
        

        with transaction.atomic():
            trade_serializer = TradeSerializer(data=trade_data)
            if trade_serializer.is_valid():
                trade = trade_serializer.save()
               
            else:
                return Response(trade_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            if trade_products_data:
                try:
                    
                    trade_products = [TradeProduct(**item, trade=trade) for item in trade_products_data]
                    TradeProduct.objects.bulk_create(trade_products)
                except Exception as e:
                    return Response({'error': f"Trade Products: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
                
            if trade_extra_costs_data:
                try:
                    trade_extra_costs = [TradeExtraCost(**item, trade=trade) for item in trade_extra_costs_data]
                    TradeExtraCost.objects.bulk_create(trade_extra_costs)
                except Exception as e:
                    return Response({'error': f"Trade Extra Costs: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                company = Company.objects.get(id=data.get('company'))
                company.save_counter(data.get('trn'))
            except Company.DoesNotExist:
                return Response({'error': 'Company not found.'}, status=status.HTTP_400_BAD_REQUEST)
            
           
            
            if trade.trade_type.lower() == "sales":
                for product in trade_products:
                    try:
                        
                        # Check if a SalesProductTrace with the given product_code exists
                        existing_trace = SalesProductTrace.objects.filter(product_code=product.product_code,first_trn=product.product_code_ref).first()
                       
                        if existing_trace:
                            # If it exists, update only the fields you want to update
                            existing_trace.trade_qty = product.trade_qty
                            existing_trace.contract_balance_qty = float(product.contract_balance_qty)-float(product.trade_qty)
                            existing_trace.save()
                        else:
                            # If it doesn't exist, create a new record with all fields
                            SalesProductTrace.objects.create(
                            product_code=product.product_code,
                            total_contract_qty=product.total_contract_qty,
                            trade_qty=product.trade_qty,    
                            contract_balance_qty=float(product.contract_balance_qty)-float(product.trade_qty),
                            ref_balance_qty=float(product.contract_balance_qty),
                            first_trn=trade.trn
                            )
                        
                        try:
                            existing_strace = PurchaseProductTrace.objects.filter(product_code=product.product_code,first_trn=product.ref_trn).first()
                            
                            if existing_strace:
                                existing_strace.ref_balance_qty = float(existing_strace.ref_balance_qty)-float(product.trade_qty)
                                existing_strace.save()
                        except Exception as e:
                            print(f"Error updating ref balance in PurchaseProductTrace: {e}")
                            raise
                    except Exception as e:
                        # Handle specific exception for SalesProductTrace
                        print(f"Error updating or creating SalesProductTrace: {e}")
                        raise
                    
            
            if trade.trade_type.lower() == "purchase":
                for product in trade_products:
                    try:
                        # Check if a SalesProductTrace with the given product_code exists
                        existing_trace = PurchaseProductTrace.objects.filter(product_code=product.product_code,first_trn=product.product_code_ref).first()
            
                        if existing_trace:
                            # If it exists, update only the fields you want to update
                            existing_trace.trade_qty = product.trade_qty
                            existing_trace.contract_balance_qty = float(product.contract_balance_qty)-float(product.trade_qty)
                            existing_trace.save()
                        else:
                            # If it doesn't exist, create a new record with all fields
                            PurchaseProductTrace.objects.create(
                            product_code=product.product_code,
                            total_contract_qty=product.total_contract_qty,
                            trade_qty=product.trade_qty,
                            contract_balance_qty=float(product.contract_balance_qty)-float(product.trade_qty),
                            ref_balance_qty=float(product.contract_balance_qty),
                            first_trn=trade.trn
                            )
                        try:
                            existing_ptrace = SalesProductTrace.objects.filter(product_code=product.product_code,first_trn=product.ref_trn).first()
                            if existing_ptrace:
                                existing_ptrace.ref_balance_qty = float(existing_ptrace.ref_balance_qty)-float(product.trade_qty)
                                existing_ptrace.save()
                        except Exception as e:
                            print(f"Error updating ref balance in PurchaseProductTrace: {e}")
                            raise
                    except Exception as e:
                        # Handle specific exception for SalesProductTrace
                        print(f"Error updating or creating PurchaseProductTrace: {e}")
                        raise
                        
            
        return Response(trade_serializer.data, status=status.HTTP_201_CREATED)
   
    def put(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        data = request.data

        try:
            trade = Trade.objects.get(pk=pk)
        except Trade.DoesNotExist:
            return Response({'error': 'Trade not found'}, status=status.HTTP_404_NOT_FOUND)
        

        # Prepare trade data separately
        trade_data = {
            'company': data.get('company'),
            'trd': data.get('trd'),
            'trn': data.get('trn'),
            'trade_type': data.get('trade_type'),
            'trade_category': data.get('trade_category'),
            'country_of_origin': data.get('country_of_origin'),
            'customer_company_name': data.get('customer_company_name'),
            'address': data.get('address'),
           
            
            'currency_selection': data.get('currency_selection'),
            'exchange_rate': data.get('exchange_rate'),
          
            'commission_agent': data.get('commission_agent'),
            'contract_value': data.get('contract_value'),
            'payment_term': data.get('payment_term'),
            'advance_value_to_receive': data.get('advance_value_to_receive'),
           
            'commission_value': data.get('commission_value'),
            'logistic_provider': data.get('logistic_provider'),
            'estimated_logistic_cost': data.get('estimated_logistic_cost'),
            'logistic_cost_tolerence': data.get('logistic_cost_tolerence'),
            'logistic_cost_remarks': data.get('logistic_cost_remarks'),
            'bank_name_address': data.get('bank_name_address'),
            'account_number': data.get('account_number'),
            'swift_code': data.get('swift_code'),
            'incoterm': data.get('incoterm'),
            'pod': data.get('pod'),
            'pol': data.get('pol'),
            'eta': data.get('eta'),
            'etd': data.get('etd'),
            'remarks': data.get('remarks'),
            'trader_name': data.get('trader_name'),
            'insurance_policy_number': data.get('insurance_policy_number'),
           
            'shipper_in_bl': data.get('shipper_in_bl'),
            'consignee_in_bl': data.get('consignee_in_bl'),
            'notify_party_in_bl': data.get('notify_party_in_bl'),
           
            'container_shipment_size': data.get('container_shipment_size'),
            'bl_fee': data.get('bl_fee'),
            'bl_fee_remarks': data.get('bl_fee_remarks'),
        }

        trade_products_data = []
        trade_extra_costs_data = []
        # related_trades_data = []
        

        i = 0
        while f'tradeProducts[{i}].product_code' in data:
            loi_file = request.FILES.get(f'tradeProducts[{i}].loi', None)
            product_name_for_client=data.get(f'tradeProducts[{i}].product_name_for_client')
            # If no new file is provided, use the existing file
            if not loi_file:
                existing_trade_product = TradeProduct.objects.filter(trade=trade, product_code=data.get(f'tradeProducts[{i}].product_code')).first()
                if existing_trade_product:
                    loi_file = existing_trade_product.loi  # retain existing file

            if product_name_for_client and product_name_for_client.lower() == 'na':
                loi_file = None

            product_data = {
                'product_code_ref': data.get(f'tradeProducts[{i}].product_code_ref'),
                'product_code': data.get(f'tradeProducts[{i}].product_code'),
                'product_name': data.get(f'tradeProducts[{i}].product_name'),
                'product_name_for_client': data.get(f'tradeProducts[{i}].product_name_for_client'),
                'loi': loi_file,  # Handle binary data as needed
                'hs_code': data.get(f'tradeProducts[{i}].hs_code'),
                'total_contract_qty': data.get(f'tradeProducts[{i}].total_contract_qty'),
                'total_contract_qty_unit': data.get(f'tradeProducts[{i}].total_contract_qty_unit'),
                'tolerance': data.get(f'tradeProducts[{i}].tolerance'),
                'contract_balance_qty': data.get(f'tradeProducts[{i}].contract_balance_qty'),
                'contract_balance_qty_unit': data.get(f'tradeProducts[{i}].contract_balance_qty_unit'),
                'trade_qty': data.get(f'tradeProducts[{i}].trade_qty'),
                'trade_qty_unit': data.get(f'tradeProducts[{i}].trade_qty_unit'),
                'selected_currency_rate': data.get(f'tradeProducts[{i}].selected_currency_rate'),
                'rate_in_usd': data.get(f'tradeProducts[{i}].rate_in_usd'),
                'markings_in_packaging': data.get(f'tradeProducts[{i}].markings_in_packaging'),
                'mode_of_packing': data.get(f'tradeProducts[{i}].mode_of_packing'),
                'rate_of_each_packing': data.get(f'tradeProducts[{i}].rate_of_each_packing'),
                'qty_of_packing': data.get(f'tradeProducts[{i}].qty_of_packing'),
                'total_packing_cost': data.get(f'tradeProducts[{i}].total_packing_cost'),
                'packaging_supplier': data.get(f'tradeProducts[{i}].packaging_supplier'),
                'product_value': data.get(f'tradeProducts[{i}].product_value'),
                'commission_rate': data.get(f'tradeProducts[{i}].commission_rate'),
                'total_commission': data.get(f'tradeProducts[{i}].total_commission'),
                'ref_type': data.get(f'tradeProducts[{i}].ref_type'),
                'ref_trn': data.get(f'tradeProducts[{i}].ref_trn'),
            }
            trade_products_data.append(product_data)
            i += 1

        j = 0
        while f'tradeExtraCosts[{j}].extra_cost' in data:
            cost_data = {
                'extra_cost': data.get(f'tradeExtraCosts[{j}].extra_cost'),
                'extra_cost_remarks': data.get(f'tradeExtraCosts[{j}].extra_cost_remarks'),
            }
            trade_extra_costs_data.append(cost_data)
            j += 1
        

        with transaction.atomic():

            tradeProducts=TradeProduct.objects.filter(trade=trade)

            if trade.trade_type.lower() == "sales":
                for product in tradeProducts:
                    try:
                        existing = SalesPending.objects.filter(product_code=product.product_code,product_name=product.product_name,hs_code=product.hs_code).first()
                        if existing:
                            existing.balance_qty = float(existing.balance_qty)-(float(existing.contract_qty)+(float(existing.tolerance)/100)*float(existing.contract_qty))
                            existing.save()

                    except Exception as e:
                        print(f"Error updating or creating SalesPending: {e}")
                        raise

                    try:
                        # Check if a SalesProductTrace with the given product_code exists
                        existing_trace = SalesProductTrace.objects.filter(product_code=product.product_code,first_trn=product.product_code_ref).first()
            
                        if existing_trace:
                           
                            existing_trace.contract_balance_qty = float(existing_trace.contract_balance_qty)+float(product.trade_qty)
                            existing_trace.save()
                       
                        
                        try:
                            if product.ref_type=='Purchase':
                                p_trace = PurchaseProductTrace.objects.filter(product_code=product.product_code,first_trn=product.ref_trn).first()
                                if p_trace:
                                    p_trace.ref_balance_qty = float(p_trace.ref_balance_qty)+float(product.trade_qty)
                                    p_trace.save()
                        except Exception as e:
                            print(f"Error updating ref balance in PurchaseProductTrace: {e}")
                            raise
                    except Exception as e:
                        # Handle specific exception for SalesProductTrace
                        print(f"Error updating or creating SalesProductTrace: {e}")
                        raise
                    
            
            if trade.trade_type.lower() == "purchase":
                for product in tradeProducts:
                    try:
                        existing = PurchasePending.objects.filter(product_code=product.product_code,product_name=product.product_name,hs_code=product.hs_code).first()
                        if existing:
                            existing.balance_qty = float(existing.balance_qty)-(float(existing.contract_qty)+(float(existing.tolerance)/100)*float(existing.contract_qty))
                            existing.save()

                    except Exception as e:
                        print(f"Error updating or creating SalesPending: {e}")
                        raise

                    try:
                        # Check if a SalesProductTrace with the given product_code exists
                        existing_trace = PurchaseProductTrace.objects.filter(product_code=product.product_code,first_trn=product.product_code_ref).first()
            
                        if existing_trace:
                            # If it exists, update only the fields you want to update
                            existing_trace.trade_qty = product.trade_qty
                            existing_trace.contract_balance_qty = float(product.contract_balance_qty)-float(product.trade_qty)
                            existing_trace.save()
                        
                        try:
                            if product.ref_type=='Sales':
                                s_trace = SalesProductTrace.objects.filter(product_code=product.product_code,first_trn=product.ref_trn).first()
                                if s_trace:
                                    s_trace.ref_balance_qty = float(s_trace.ref_balance_qty)+float(product.trade_qty)
                                    s_trace.save()
                        except Exception as e:
                            print(f"Error updating ref balance in PurchaseProductTrace: {e}")
                            raise
                    except Exception as e:
                        # Handle specific exception for SalesProductTrace
                        print(f"Error updating or creating PurchaseProductTrace: {e}")
                        raise

            trade_serializer = TradeSerializer(trade, data=trade_data, partial=True)
            if trade_serializer.is_valid():
                trade = trade_serializer.save()
                
            else:
                return Response(trade_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            if trade_products_data:
                # Clear existing trade products and add new ones
                TradeProduct.objects.filter(trade=trade).delete()
                try:
                    trade_products = [TradeProduct(**item, trade=trade) for item in trade_products_data]
                    TradeProduct.objects.bulk_create(trade_products)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

            if trade_extra_costs_data:
                # Clear existing trade extra costs and add new ones
                TradeExtraCost.objects.filter(trade=trade).delete()
                try:
                    trade_extra_costs = [TradeExtraCost(**item, trade=trade) for item in trade_extra_costs_data]
                    TradeExtraCost.objects.bulk_create(trade_extra_costs)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            

            if trade.trade_type.lower() == "sales":
                for product in trade_products:
                    try:
                        existing = SalesPending.objects.filter(product_code=product.product_code,product_name=product.product_name,hs_code=product.hs_code).first()
                        if existing:
                            # existing.balance_qty = float(existing.balance_qty)-float(product.trade_qty)
                            existing.balance_qty = float(existing.balance_qty)+(float(product.trade_qty)+(float(product.tolerance)/100)*float(product.trade_qty))
                            existing.balance_qty_unit=product.trade_qty_unit
                            existing.contract_qty=product.trade_qty
                            existing.contract_qty_unit=product.trade_qty
                            existing.save()
                        else:
                            SalesPending.objects.create(
                            trn=trade,
                            trd=trade.trd,
                            company=trade.company,
                            payment_term=trade.payment_term,
                            product_code=product.product_code,
                            product_name=product.product_name,
                            hs_code=product.hs_code,
                            balance_qty=float(product.trade_qty)+float(product.tolerance)/100*float(product.trade_qty),
                            balance_qty_unit=product.trade_qty_unit,
                            contract_qty=product.trade_qty,
                            contract_qty_unit=product.trade_qty_unit,
                            selected_currency_rate=product.selected_currency_rate,
                            rate_in_usd=product.rate_in_usd,
                            tolerance=product.tolerance
                            )

                    except Exception as e:
                        print(f"Error updating or creating SalesPending: {e}")
                        raise

                    try:
                        # Check if a SalesProductTrace with the given product_code exists
                        if product.product_code_ref=='NA':
                            first_trn=trade.trn
                        else:
                            first_trn=product.product_code_ref
                        existing_trace = SalesProductTrace.objects.filter(product_code=product.product_code,first_trn=first_trn).first()
            
                        if existing_trace:
                            # If it exists, update only the fields you want to update
                            existing_trace.trade_qty = product.trade_qty
                            existing_trace.contract_balance_qty = float(product.contract_balance_qty)-float(product.trade_qty)
                            existing.contract_qty=product.trade_qty
                            existing_trace.save()
                        else:
                            # If it doesn't exist, create a new record with all fields
                            SalesProductTrace.objects.create(
                            product_code=product.product_code,
                            total_contract_qty=product.total_contract_qty,
                            trade_qty=product.trade_qty,    
                            contract_balance_qty=float(product.contract_balance_qty)-float(product.trade_qty),
                            ref_balance_qty=float(product.contract_balance_qty),
                            first_trn=trade.trn
                            )
                        
                        try:
                            if product.ref_type=='Purchase':
                                existing_ptrace = PurchaseProductTrace.objects.filter(product_code=product.product_code,first_trn=product.ref_trn).first()
                                if existing_ptrace:
                                    existing_ptrace.ref_balance_qty = float(existing_ptrace.ref_balance_qty)-float(product.trade_qty)
                                    existing_ptrace.save()
                        except Exception as e:
                            print(f"Error updating ref balance in PurchaseProductTrace: {e}")
                            raise
                    except Exception as e:
                        # Handle specific exception for SalesProductTrace
                        print(f"Error updating or creating SalesProductTrace: {e}")
                        raise
                    
            
            if trade.trade_type.lower() == "purchase":
                for product in trade_products:
                    try:
                        existing = PurchasePending.objects.filter(product_code=product.product_code,product_name=product.product_name,hs_code=product.hs_code).first()
                        if existing:
                            # existing.balance_qty = float(existing.balance_qty)-float(product.trade_qty)
                            existing.balance_qty = float(existing.balance_qty)+(float(product.trade_qty)+(float(product.tolerance)/100)*float(product.trade_qty))
                            existing.balance_qty_unit=product.trade_qty_unit
                            existing.contract_qty=product.trade_qty
                            existing.contract_qty_unit=product.trade_qty
                            existing.save()
                        else:
                            PurchasePending.objects.create(
                            trn=trade,
                            trd=trade.trd,
                            company=trade.company,
                            payment_term=trade.payment_term,
                            product_code=product.product_code,
                            product_name=product.product_name,
                            hs_code=product.hs_code,
                            balance_qty=float(product.trade_qty)+float(product.tolerance)/100*float(product.trade_qty),
                            balance_qty_unit=product.trade_qty_unit,
                            contract_qty=product.trade_qty,
                            contract_qty_unit=product.trade_qty_unit,
                            selected_currency_rate=product.selected_currency_rate,
                            rate_in_usd=product.rate_in_usd,
                            tolerance=product.tolerance
                            )

                    except Exception as e:
                        print(f"Error updating or creating SalesPending: {e}")
                        raise

                    try:
                        # Check if a SalesProductTrace with the given product_code exists
                        if product.product_code_ref=='NA':
                            first_trn=trade.trn
                        else:
                            first_trn=product.product_code_ref
                        existing_trace = PurchaseProductTrace.objects.filter(product_code=product.product_code,first_trn=first_trn).first()
            
                        if existing_trace:
                            # If it exists, update only the fields you want to update
                            existing_trace.trade_qty = product.trade_qty
                            existing_trace.contract_balance_qty = float(product.contract_balance_qty)-float(product.trade_qty)
                            existing_trace.save()
                        else:
                            # If it doesn't exist, create a new record with all fields
                            PurchaseProductTrace.objects.create(
                            product_code=product.product_code,
                            total_contract_qty=product.total_contract_qty,
                            trade_qty=product.trade_qty,
                            contract_balance_qty=float(product.contract_balance_qty)-float(product.trade_qty),
                            ref_balance_qty=float(product.contract_balance_qty),
                            first_trn=trade.trn
                            )
                        try:
                            if product.ref_type=='Sales':
                                existing_strace = SalesProductTrace.objects.filter(product_code=product.product_code,first_trn=product.ref_trn).first()
                                if existing_strace:
                                    existing_strace.ref_balance_qty = float(existing_strace.ref_balance_qty)-float(product.trade_qty)
                                    existing_strace.save()
                        except Exception as e:
                            print(f"Error updating ref balance in PurchaseProductTrace: {e}")
                            raise
                    except Exception as e:
                        # Handle specific exception for SalesProductTrace
                        print(f"Error updating or creating PurchaseProductTrace: {e}")
                        raise

        return Response(trade_serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
        pk = kwargs.get('pk')

        try:
            trade = Trade.objects.get(pk=pk)
        except Trade.DoesNotExist:
            return Response({'error': 'Trade not found'}, status=status.HTTP_404_NOT_FOUND)

        # Start an atomic transaction
        with transaction.atomic():
            # Fetch related TradeProduct instances before deleting them
            trade_products = TradeProduct.objects.filter(trade=trade)

            # Undo changes in SalesProductTrace if the trade type is 'sales'
            if trade.trade_type.lower() == "sales":
                for product in trade_products:
                    existing_trace = SalesProductTrace.objects.filter(product_code=product.product_code).first()
                    if existing_trace:
                        # Revert the changes
                        existing_trace.contract_balance_qty += float(product.trade_qty)
                        existing_trace.trade_qty = 0  # Or adjust as needed
                        existing_trace.save()
                    
                    try:
                        if product.ref_type=='Purchase':
                            existing_ptrace = PurchaseProductTrace.objects.filter(product_code=product.product_code).first()
                            if existing_ptrace:
                                existing_ptrace.ref_balance_qty = float(existing_ptrace.ref_balance_qty)+float(product.trade_qty)
                                existing_ptrace.save()
                    except Exception as e:
                        print(f"Error updating ref balance in PurchaseProductTrace: {e}")
                        raise

            # Undo changes in PurchaseProductTrace if the trade type is 'purchase'
            elif trade.trade_type.lower() == "purchase":
                for product in trade_products:
                    existing_trace = PurchaseProductTrace.objects.filter(product_code=product.product_code).first()
                    if existing_trace:
                        # Revert the changes
                        existing_trace.contract_balance_qty += float(product.trade_qty)
                        existing_trace.trade_qty = 0  # Or adjust as needed
                        existing_trace.save()
                    try:
                        if product.ref_type=='Sales':
                            existing_strace = SalesProductTrace.objects.filter(product_code=product.product_code).first()
                            if existing_strace:
                                existing_strace.ref_balance_qty = float(existing_strace.ref_balance_qty)+float(product.trade_qty)
                                existing_strace.save()
                    except Exception as e:
                        print(f"Error updating ref balance in PurchaseProductTrace: {e}")
                        raise

            # Delete related trade products and extra costs
            TradeProduct.objects.filter(trade=trade).delete()
            TradeExtraCost.objects.filter(trade=trade).delete()

            # Finally, delete the trade
            trade.delete()

        return Response({'message': 'Trade deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

class TradeApproveView(APIView):
    def get(self, request, *args, **kwargs):
        trade_id = kwargs.get('pk')

        # Check if trade_id is provided
        if not trade_id:
            return Response({'detail': 'Trade ID not provided.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Use atomic block for the approval process
            with transaction.atomic():
                # Retrieve the trade object
                trade = Trade.objects.get(id=trade_id)

                # Update trade approval status
                trade.approved = True
                trade.save()

                # Serialize and return the approved trade
                serializer = TradeSerializer(trade)
                return Response(serializer.data, status=status.HTTP_200_OK)

        except Trade.DoesNotExist:
            return Response({'detail': 'Trade not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            # Log the error or handle it appropriately in a real-world application
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TradeReviewView(APIView):
    def get(self, request, *args, **kwargs):
        trade_id = kwargs.get('pk')

        # Check if trade_id is provided
        if not trade_id:
            return Response({'detail': 'Trade ID not provided.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Use atomic block for the approval process
            with transaction.atomic():
                # Retrieve the trade object
                trade = Trade.objects.get(id=trade_id)

                # Update trade approval status
                trade.reviewed = True
                trade.approval_date = date.today()
                trade.save()

                # Check if trade_type is "sales" and create SalesPending instances
                if trade.trade_type.lower() == "sales":
                    trade_products = TradeProduct.objects.filter(trade=trade)
                    sales_pending_instances = []

                    for product in trade_products:
                        # Create SalesPending instance using data from TradeProduct
                        sales_pending = SalesPending(
                            trn=trade,
                            trd=trade.trd,
                            company=trade.company,
                            payment_term=trade.payment_term,
                            product_code=product.product_code,
                            product_name=product.product_name,
                            hs_code=product.hs_code,
                            balance_qty=float(product.trade_qty)+float(product.tolerance)/100*float(product.trade_qty),
                            balance_qty_unit=product.trade_qty_unit,
                            contract_qty=product.trade_qty,
                            contract_qty_unit=product.trade_qty_unit,
                            selected_currency_rate=product.selected_currency_rate,
                            rate_in_usd=product.rate_in_usd,
                            tolerance=product.tolerance
                        )
                        sales_pending_instances.append(sales_pending)

                    # Bulk create all SalesPending instances at once
                    SalesPending.objects.bulk_create(sales_pending_instances)

                # Check if trade_type is "purchase" and create PurchasePending instances
                elif trade.trade_type.lower() == "purchase":
                    trade_products = TradeProduct.objects.filter(trade=trade)
                    purchase_pending_instances = []

                    for product in trade_products:
                        # Create PurchasePending instance using data from TradeProduct
                        purchase_pending = PurchasePending(
                            trn=trade,
                            trd=trade.trd,
                            company=trade.company,
                            payment_term=trade.payment_term,
                            product_code=product.product_code,
                            product_name=product.product_name,
                            hs_code=product.hs_code,
                            balance_qty=float(product.trade_qty)+float(product.tolerance)/100*float(product.trade_qty),
                            balance_qty_unit=product.trade_qty_unit,
                            contract_qty=product.trade_qty,
                            contract_qty_unit=product.trade_qty_unit,
                            selected_currency_rate=product.selected_currency_rate,
                            rate_in_usd=product.rate_in_usd,
                            tolerance=product.tolerance
                           
                        )
                        purchase_pending_instances.append(purchase_pending)

                    # Bulk create all PurchasePending instances at once
                    PurchasePending.objects.bulk_create(purchase_pending_instances)

                # Serialize and return the approved trade
                serializer = TradeSerializer(trade)
                return Response(serializer.data, status=status.HTTP_200_OK)

        except Trade.DoesNotExist:
            return Response({'detail': 'Trade not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            # Log the error or handle it appropriately in a real-world application
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




class TradeProductViewSet(viewsets.ModelViewSet):
    queryset = TradeProduct.objects.all()
    serializer_class = TradeProductSerializer

class TradeExtraCostViewSet(viewsets.ModelViewSet):
    queryset = TradeExtraCost.objects.all()
    serializer_class = TradeExtraCostSerializer

class PaymentTermViewSet(viewsets.ModelViewSet):
    queryset = PaymentTerm.objects.all()
    serializer_class = PaymentTermSerializer

class PreSalePurchaseView(APIView):
    filter_backends = [DjangoFilterBackend]
    filterset_class = PreSalePurchaseFilter

    def get(self, request, *args, **kwargs):

        pre_sp_id = kwargs.get('pk')  
        
        if pre_sp_id:  # If `pk` is provided, retrieve a specific trade
            try:
                pre_sp = PreSalePurchase.objects.get(id=pre_sp_id)
            except PreSalePurchase.DoesNotExist:
                return Response({'detail': 'PreSalePurchase not found.'}, status=status.HTTP_404_NOT_FOUND)

            pre_sp_serializer = PreSalePurchaseSerializer(pre_sp)
            docs = PreDocument.objects.filter(presalepurchase=pre_sp)
            ack_pis = AcknowledgedPI.objects.filter(presalepurchase=pre_sp)
            ack_pos = AcknowledgedPO.objects.filter(presalepurchase=pre_sp)

            docs_serializer = PreDocumentSerializer(docs, many=True)
            ack_pis_serializer = AcknowledgedPISerializer(ack_pis, many=True)
            ack_pos_serializer = AcknowledgedPOSerializer(ack_pos, many=True)

            response_data = pre_sp_serializer.data
            response_data['acknowledgedPI'] = ack_pis_serializer.data
            response_data['acknowledgedPO'] = ack_pos_serializer.data
            response_data['documentRequired'] = docs_serializer.data

            return Response(response_data)

        else:  # If `pk` is not provided, list all PreSalePurchase entries
            queryset = PreSalePurchase.objects.all()
            filterset = PreSalePurchaseFilter(request.GET, queryset=queryset)

            if not filterset.is_valid():
                return Response(filterset.errors, status=status.HTTP_400_BAD_REQUEST)

            # Serialize the queryset with related acknowledgedPI and acknowledgedPO data
            response_data = []

            for pre_sp in filterset.qs:
                pre_sp_serializer = PreSalePurchaseSerializer(pre_sp)
                
                # Get related acknowledgedPI and acknowledgedPO for the current PreSalePurchase
                docs = PreDocument.objects.filter(presalepurchase=pre_sp)
                ack_pis = AcknowledgedPI.objects.filter(presalepurchase=pre_sp)
                ack_pos = AcknowledgedPO.objects.filter(presalepurchase=pre_sp)

                docs_serializer = PreDocumentSerializer(docs, many=True)
                ack_pis_serializer = AcknowledgedPISerializer(ack_pis, many=True)
                ack_pos_serializer = AcknowledgedPOSerializer(ack_pos, many=True)

                # Add related data to serialized PreSalePurchase data
                pre_sp_data = pre_sp_serializer.data
                pre_sp_data['documentRequired'] = docs_serializer.data
                pre_sp_data['acknowledgedPI'] = ack_pis_serializer.data
                pre_sp_data['acknowledgedPO'] = ack_pos_serializer.data

                # Append the enriched data to the response list
                response_data.append(pre_sp_data)

            return Response(response_data)

    def post(self, request, *args, **kwargs):
        data = request.data
        # Prepare trade data separately
        pre_sp_data = {
            'trn': data.get('trn'),
            'date': data.get('date'),
            'doc_issuance_date': data.get('doc_issuance_date'),
          
            'remarks': data.get('remarks'),
        }
        document_required_data=[]
        acknowledged_pi_data = []
        acknowledged_po_data = []

        k = 0
        while f'documentRequired[{k}].name' in data:
            doc_data = {
                'name': data.get(f'documentRequired[{k}].name'),
            }
            document_required_data.append(doc_data)
            k += 1

        i = 0
        while f'acknowledgedPI[{i}].ackn_pi_name' in data:
            pi_data = {
                'ackn_pi_name': data.get(f'acknowledgedPI[{i}].ackn_pi_name'),
                'ackn_pi': request.FILES.get(f'acknowledgedPI[{i}].ackn_pi',None),  # Handle binary data as needed
            }
            acknowledged_pi_data.append(pi_data)
            i += 1

        j = 0
        while f'acknowledgedPO[{j}].ackn_po_name' in data:
            po_data = {
                'ackn_po_name': data.get(f'acknowledgedPO[{j}].ackn_po_name'),
                'ackn_po': request.FILES.get(f'acknowledgedPO[{j}].ackn_po',None),
            }
            acknowledged_po_data.append(po_data)
            j += 1
        
        with transaction.atomic():
            pre_sp_serializer = PreSalePurchaseSerializer(data=pre_sp_data)
            if pre_sp_serializer.is_valid():
                pre_sp = pre_sp_serializer.save()
            else:
                return Response(pre_sp_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            if document_required_data:
                try:
                    docs = [PreDocument(**item, presalepurchase=pre_sp) for item in document_required_data]
                    PreDocument.objects.bulk_create(docs)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
            if acknowledged_pi_data:
                try:
                    pis = [AcknowledgedPI(**item, presalepurchase=pre_sp) for item in acknowledged_pi_data]
                    AcknowledgedPI.objects.bulk_create(pis)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
                
            if acknowledged_po_data:
                try:
                    pos = [AcknowledgedPO(**item, presalepurchase=pre_sp) for item in acknowledged_po_data]
                    AcknowledgedPO.objects.bulk_create(pos)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(pre_sp_serializer.data, status=status.HTTP_201_CREATED)

    

    def put(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        data = request.data
        
        try:
            pre_sp = PreSalePurchase.objects.get(pk=pk)
        except PreSalePurchase.DoesNotExist:
            return Response({'error': 'PreSalePurchase not found'}, status=status.HTTP_404_NOT_FOUND)

        # Prepare trade data separately
        pre_sp_data = {
            'trn': data.get('trn'),
            'date': data.get('date'),
            'doc_issuance_date': data.get('doc_issuance_date'),
            
            'remarks': data.get('remarks'),
        }
        document_required_data=[]
        acknowledged_pi_data = []
        acknowledged_po_data = []

        k = 0
        while f'documentRequired[{k}].name' in data:
            doc_data = {
                'name': data.get(f'documentRequired[{k}].name'),
            }
            document_required_data.append(doc_data)
            k += 1

        i = 0
        while f'acknowledgedPI[{i}].ackn_pi_name' in data:
            pi_file = request.FILES.get(f'acknowledgedPI[{i}].ackn_pi',None)
            if not pi_file:
                existing_pi = AcknowledgedPI.objects.filter(presalepurchase=pre_sp, ackn_pi_name=data.get(f'acknowledgedPI[{i}].ackn_pi_name')).first()
                if existing_pi:
                    pi_file = existing_pi.ackn_pi  # retain existing file
            pi_data = {
                'ackn_pi_name': data.get(f'acknowledgedPI[{i}].ackn_pi_name'),
                'ackn_pi': pi_file,  # Handle binary data as needed
            }
            acknowledged_pi_data.append(pi_data)
            i += 1

        j = 0
        while f'acknowledgedPO[{j}].ackn_po_name' in data:
            po_file = request.FILES.get(f'acknowledgedPO[{j}].ackn_po',None)
            if not po_file:
                existing_po = AcknowledgedPO.objects.filter(presalepurchase=pre_sp, ackn_po_name=data.get(f'acknowledgedPO[{j}].ackn_po_name')).first()
                if existing_po:
                    po_file = existing_po.ackn_po  # retain existing file
            po_data = {
                'ackn_po_name': data.get(f'acknowledgedPO[{j}].ackn_po_name'),
                'ackn_po': po_file,
            }
            acknowledged_po_data.append(po_data)
            j += 1
       
        with transaction.atomic():
            pre_sp_serializer = PreSalePurchaseSerializer(pre_sp, data=pre_sp_data, partial=True)
            if pre_sp_serializer.is_valid():
                pre_sp = pre_sp_serializer.save()
            else:
                return Response(pre_sp_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            if document_required_data:
                # Clear existing trade products and add new ones
                PreDocument.objects.filter(presalepurchase=pre_sp).delete()
                try:
                    docs = [PreDocument(**item, presalepurchase=pre_sp) for item in document_required_data]
                    PreDocument.objects.bulk_create(docs)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
           
            if acknowledged_pi_data:
                # Clear existing trade products and add new ones
                AcknowledgedPI.objects.filter(presalepurchase=pre_sp).delete()
               
                try:
                    pis = [AcknowledgedPI(**item, presalepurchase=pre_sp) for item in acknowledged_pi_data]
                    AcknowledgedPI.objects.bulk_create(pis)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

            if acknowledged_po_data:
                # Clear existing trade extra costs and add new ones
                AcknowledgedPO.objects.filter(presalepurchase=pre_sp).delete()
                try:
                    pos = [AcknowledgedPO(**item, presalepurchase=pre_sp) for item in acknowledged_po_data]
                    AcknowledgedPO.objects.bulk_create(pos)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(pre_sp_serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
        pk = kwargs.get('pk')

        try:
            pre_sp = PreSalePurchase.objects.get(pk=pk)
        except PreSalePurchase.DoesNotExist:
            return Response({'error': 'PreSalePurchase not found'}, status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            # Delete related trade products and extra costs
            PreDocument.objects.filter(presalepurchase=pre_sp).delete()
            AcknowledgedPI.objects.filter(presalepurchase=pre_sp).delete()
            AcknowledgedPO.objects.filter(presalepurchase=pre_sp).delete()
            pre_sp.delete()

        return Response({'message': 'PreSalePurchase deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    
class AcknowledgedPIViewSet(viewsets.ModelViewSet):
    queryset = AcknowledgedPI.objects.all()
    serializer_class = AcknowledgedPISerializer

class PreDocumentViewSet(viewsets.ModelViewSet):
    queryset = PreDocument.objects.all()
    serializer_class = PreDocumentSerializer

class AcknowledgedPOViewSet(viewsets.ModelViewSet):
    queryset = AcknowledgedPO.objects.all()
    serializer_class = AcknowledgedPOSerializer

class DocumentsRequiredViewSet(viewsets.ModelViewSet):
    queryset = DocumentsRequired.objects.all()
    serializer_class = DocumentsRequiredSerializer

class PreSalePurchaseApprove(APIView):
    def get(self, request, *args, **kwargs):
        presp_id = kwargs.get('pk')
    
        if not presp_id:
            return Response({'detail': 'Pre Sales/Purchase ID not provided.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                presp = PreSalePurchase.objects.get(id=presp_id)
                presp.approved = True
                presp.save()
                serializer = PreSalePurchaseSerializer(presp)
                return Response(serializer.data, status=status.HTTP_200_OK)
        except PrePayment.DoesNotExist:
            return Response({'detail': 'Pre Sales/Purchase not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)   

class PrePaymentView(APIView):
    filter_backends = [DjangoFilterBackend]
    filterset_class = PrePaymentFilter

    def get(self, request, *args, **kwargs):
        prepayment_id = kwargs.get('pk')  # URL parameter for trade ID
        
        if prepayment_id:  # If `pk` is provided, retrieve a specific trade
            try:
                prepayment = PrePayment.objects.get(id=prepayment_id)
            except PrePayment.DoesNotExist:
                return Response({'detail': 'PrePayment not found.'}, status=status.HTTP_404_NOT_FOUND)

            prepayment_serializer = PrePaymentSerializer(prepayment)
            lc_copies = LcCopy.objects.filter(prepayment=prepayment)
            lc_ammendments = LcAmmendment.objects.filter(prepayment=prepayment)
            advance_tt_copies = AdvanceTTCopy.objects.filter(prepayment=prepayment)

            lc_copies_serializer = LcCopySerializer(lc_copies, many=True)
            lc_ammendments_serializer = LcAmmendmentSerializer(lc_ammendments, many=True)
            advance_tt_copies_serializer = AdvanceTTCopySerializer(advance_tt_copies, many=True)

            response_data = prepayment_serializer.data
            response_data['lcCopies'] = lc_copies_serializer.data
            response_data['lcAmmendments'] = lc_ammendments_serializer.data
            response_data['advanceTTCopies'] = advance_tt_copies_serializer.data

            return Response(response_data)

        else:  # If `pk` is not provided, list all trades
            queryset = PrePayment.objects.all()
            filterset = PrePaymentFilter(request.GET, queryset=queryset)

            if not filterset.is_valid():
                return Response(filterset.errors, status=status.HTTP_400_BAD_REQUEST)

            serializer = PrePaymentSerializer(filterset.qs, many=True)
            return Response(serializer.data)
    
    def post(self, request, *args, **kwargs):
        data = request.data
        # Prepare trade data separately
        prepayment_data = {
            'trn': data.get('trn'),
            # 'adv_due_date':data.get('adv_due_date'),
            # 'as_per_pi_advance': data.get('as_per_pi_advance'),
            'lc_number': data.get('lc_number'),
            'lc_opening_bank': data.get('lc_opening_bank'),
            'advance_received': data.get('advance_received'),
            'date_of_receipt': data.get('date_of_receipt'),
            'advance_paid': data.get('advance_paid'),
            'date_of_payment': data.get('date_of_payment'),
            'lc_expiry_date': data.get('lc_expiry_date'),
            'latest_shipment_date_in_lc': data.get('latest_shipment_date_in_lc'),
            'remarks': data.get('remarks'),
            'advance_amount': data.get('advance_amount'),
        }

        lc_copies_data = []
        lc_ammendments_data = []
        advance_tt_copies_data = []

        i = 0
        while f'lcCopies[{i}].name' in data:
            lc_copy_data = {
                'name': data.get(f'lcCopies[{i}].name'),
                'lc_copy': request.FILES.get(f'lcCopies[{i}].lc_copy',None),  # Handle binary data as needed
            }
            lc_copies_data.append(lc_copy_data)
            i += 1

        j = 0
        while f'lcAmmendments[{j}].name' in data:
            lc_ammend_data = {
                'name': data.get(f'lcAmmendments[{j}].name'),
                'lc_ammendment': request.FILES.get(f'lcAmmendments[{j}].lc_ammendment',None),
            }
            lc_ammendments_data.append(lc_ammend_data)
            j += 1
        
        k = 0
        while f'advanceTTCopies[{k}].name' in data:
            advance_tt_copies = {
                'name': data.get(f'advanceTTCopies[{k}].name'),
                'advance_tt_copy': request.FILES.get(f'advanceTTCopies[{k}].advance_tt_copy',None),
            }
            advance_tt_copies_data.append(advance_tt_copies)
            k += 1

        with transaction.atomic():
            prepayment_serializer = PrePaymentSerializer(data=prepayment_data)
            if prepayment_serializer.is_valid():
                prepayment = prepayment_serializer.save()
            else:
                return Response(prepayment_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            if lc_copies_data:
                try:
                    
                    lc_copies = [LcCopy(**item, prepayment=prepayment) for item in lc_copies_data]
                    LcCopy.objects.bulk_create(lc_copies)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
                
            if lc_ammendments_data:
                try:
                    lc_ammends = [LcAmmendment(**item, prepayment=prepayment) for item in lc_ammendments_data]
                    LcAmmendment.objects.bulk_create(lc_ammends)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
            if advance_tt_copies_data:
                try:
                    advance_tt_copies = [AdvanceTTCopy(**item, prepayment=prepayment) for item in advance_tt_copies_data]
                    AdvanceTTCopy.objects.bulk_create(advance_tt_copies)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
           
            if prepayment.trn.trade_type.lower() == 'purchase':
                prepayment.advance_amount= prepayment.advance_paid
            elif prepayment.trn.trade_type.lower() == 'sales':  
                prepayment.advance_amount= prepayment.advance_received
            prepayment.save()

        return Response(prepayment_serializer.data, status=status.HTTP_201_CREATED)

    def put(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        data = request.data
        
        try:
            prepayment = PrePayment.objects.get(pk=pk)
        except PrePayment.DoesNotExist:
            return Response({'error': 'PrePayment not found'}, status=status.HTTP_404_NOT_FOUND)

        # Prepare trade data separately
        prepayment_data = {
            'trn': data.get('trn'),
            # 'adv_due_date':data.get('adv_due_date'),
            # 'as_per_pi_advance': data.get('as_per_pi_advance'),
            'lc_number': data.get('lc_number'),
            'lc_opening_bank': data.get('lc_opening_bank'),
            'advance_received': data.get('advance_received'),
            'date_of_receipt': data.get('date_of_receipt'),
            'advance_paid': data.get('advance_paid'),
            'date_of_payment': data.get('date_of_payment'),
            'lc_expiry_date': data.get('lc_expiry_date'),
            'latest_shipment_date_in_lc': data.get('latest_shipment_date_in_lc'),
            'remarks': data.get('remarks'),
        }

        lc_copies_data = []
        lc_ammendments_data = []
        advance_tt_copies_data = []

        i = 0
        while f'lcCopies[{i}].name' in data:
            doc_file1 = request.FILES.get(f'lcCopies[{i}].lc_copy',None)
            if not doc_file1:
                existing_doc = LcCopy.objects.filter(prepayment=prepayment, name=data.get(f'lcCopies[{i}].name')).first()
                if existing_doc:
                    doc_file1 = existing_doc.lc_copy  # retain existing file

            lc_copy_data = {
                'name': data.get(f'lcCopies[{i}].name'),
                'lc_copy': doc_file1,  # Handle binary data as needed
            }
            lc_copies_data.append(lc_copy_data)
            i += 1

        j = 0
        while f'lcAmmendments[{j}].name' in data:
            doc_file2 = request.FILES.get(f'lcAmmendments[{j}].lc_ammendment',None)
            if not doc_file2:
                existing_doc = LcAmmendment.objects.filter(prepayment=prepayment, name=data.get(f'lcAmmendments[{j}].name')).first()
                if existing_doc:
                    doc_file2 = existing_doc.lc_ammendment  # retain existing file

            lc_ammend_data = {
                'name': data.get(f'lcAmmendments[{j}].name'),
                'lc_ammendment': doc_file2,
            }
            lc_ammendments_data.append(lc_ammend_data)
            j += 1
        
        k = 0
        while f'advanceTTCopies[{k}].name' in data:
            doc_file3 = request.FILES.get(f'advanceTTCopies[{k}].advance_tt_copy',None)
            if not doc_file3:
                existing_doc = AdvanceTTCopy.objects.filter(prepayment=prepayment, name=data.get(f'advanceTTCopies[{k}].name')).first()
                if existing_doc:
                    doc_file3 = existing_doc.advance_tt_copy  # retain existing file
            advance_tt_copies = {
                'name': data.get(f'advanceTTCopies[{k}].name'),
                'advance_tt_copy': doc_file3,
            }
            advance_tt_copies_data.append(advance_tt_copies)
            k += 1
       
        with transaction.atomic():

            if prepayment.trn.trade_type.lower() == 'purchase':
                prepayment.advance_amount-= prepayment.advance_paid
            elif prepayment.trn.trade_type.lower() == 'sales':  
                prepayment.advance_amount-= prepayment.advance_received
            prepayment.save()

            prepayment_serializer = PrePaymentSerializer(prepayment, data=prepayment_data, partial=True)
            if prepayment_serializer.is_valid():
                prepayment = prepayment_serializer.save()
            else:
                return Response(prepayment_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
           
            if lc_copies_data:
                # Clear existing trade products and add new ones
                LcCopy.objects.filter(prepayment=prepayment).delete()
               
                try:
                    lc_copies = [LcCopy(**item, prepayment=prepayment) for item in lc_copies_data]
                    LcCopy.objects.bulk_create(lc_copies)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

            if lc_ammendments_data:
                # Clear existing trade extra costs and add new ones
                LcAmmendment.objects.filter(prepayment=prepayment).delete()
                try:
                    lc_ammendment = [LcAmmendment(**item, prepayment=prepayment) for item in lc_ammendments_data]
                    LcAmmendment.objects.bulk_create(lc_ammendment)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
            if advance_tt_copies_data:
                # Clear existing trade extra costs and add new ones
                AdvanceTTCopy.objects.filter(prepayment=prepayment).delete()
                try:
                    advance_tt_copies = [AdvanceTTCopy(**item, prepayment=prepayment) for item in advance_tt_copies_data]
                    AdvanceTTCopy.objects.bulk_create(advance_tt_copies)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
            if prepayment.trn.trade_type.lower() == 'purchase':
                prepayment.advance_amount+= prepayment.advance_paid
            elif prepayment.trn.trade_type.lower() == 'sales':  
                prepayment.advance_amount+= prepayment.advance_received
            prepayment.save()

        return Response(prepayment_serializer.data, status=status.HTTP_200_OK)
    
    def delete(self, request, *args, **kwargs):
        pk = kwargs.get('pk')

        try:
            prepayment = PrePayment.objects.get(pk=pk)
        except PrePayment.DoesNotExist:
            return Response({'error': 'PrePayment not found'}, status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            # Delete related trade products and extra costs
            LcCopy.objects.filter(prepayment=prepayment).delete()
            LcAmmendment.objects.filter(prepayment=prepayment).delete()
            AdvanceTTCopy.objects.filter(prepayment=prepayment).delete()
            prepayment.delete()

        return Response({'message': 'PrePayment deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

class LcCopyViewSet(viewsets.ModelViewSet):
    queryset = LcCopy.objects.all()
    serializer_class = LcCopySerializer

class LcAmmendmentViewSet(viewsets.ModelViewSet):
    queryset = LcAmmendment.objects.all()
    serializer_class = LcAmmendmentSerializer

class AdvanceTTCopyViewSet(viewsets.ModelViewSet):
    queryset = AdvanceTTCopy.objects.all()
    serializer_class = AdvanceTTCopySerializer

class PrePaymentReview(APIView):
    def get(self, request, *args, **kwargs):
        prepay_id = kwargs.get('pk')
    
        if not prepay_id:
            return Response({'detail': 'Pre payment ID not provided.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                prepay = PrePayment.objects.get(id=prepay_id)
                prepay.reviewed = True
                prepay.save()
                serializer = PrePaymentSerializer(prepay)
                return Response(serializer.data, status=status.HTTP_200_OK)
        except PrePayment.DoesNotExist:
            return Response({'detail': 'Pre payment not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)   

class SalesPurchaseView(APIView):
    filter_backends = [DjangoFilterBackend]
    filterset_class = SalesPurchaseFilter

    def get(self, request, *args, **kwargs):
        sp_id = kwargs.get('pk')  # URL parameter for trade ID
        
        if sp_id:  # If `pk` is provided, retrieve a specific trade
            try:
                sp = SalesPurchase.objects.get(id=sp_id)
            except SalesPurchase.DoesNotExist:
                return Response({'detail': 'SalesPurchase not found.'}, status=status.HTTP_404_NOT_FOUND)

            sp_serializer = SalesPurchaseSerializer(sp)
            sp_products = SalesPurchaseProduct.objects.filter(sp=sp)
            sp_extra_charges = SalesPurchaseExtraCharge.objects.filter(sp=sp)
            packing_list = PackingList.objects.filter(sp=sp)
            invoices = Invoice.objects.filter(sp=sp)
            coas = COA.objects.filter(sp=sp)
            bl_copies = BL_Copy.objects.filter(sp=sp)

            sp_products_serializer = SalesPurchaseProductSerializer(sp_products, many=True)
            sp_extra_charges_serializer = SalesPurchaseExtraChargeSerializer(sp_extra_charges, many=True)
            packing_list_serializer = PackingListSerializer(packing_list, many=True)
            invoices_serializer = InvoiceSerializer(invoices, many=True)
            coas_serializer = COASerializer(coas, many=True)
            bl_copies_serializer = BL_CopySerializer(bl_copies, many=True)

            response_data = sp_serializer.data
            response_data['salesPurchaseProducts'] = sp_products_serializer.data
            response_data['extraCharges'] = sp_extra_charges_serializer.data
            response_data['invoices'] = invoices_serializer.data
            response_data['coas'] = coas_serializer.data
            response_data['packingLists'] = packing_list_serializer.data
            response_data['blCopies'] = bl_copies_serializer.data

            return Response(response_data)

        else:  # If `pk` is not provided, list all trades
            queryset = SalesPurchase.objects.all()
            filterset = SalesPurchaseFilter(request.GET, queryset=queryset)

            if not filterset.is_valid():
                return Response(filterset.errors, status=status.HTTP_400_BAD_REQUEST)

            serializer = SalesPurchaseSerializer(filterset.qs, many=True)
            return Response(serializer.data)
    
    def post(self, request, *args, **kwargs):
        data = request.data
        # Prepare trade data separately
        sp_data = {
            'trn': data.get('trn'),
            'invoice_date': data.get('invoice_date'),
            'invoice_number': data.get('invoice_number'),
            'invoice_amount': data.get('invoice_amount'),
            # 'commission_value': data.get('commission_value'),
            'bl_number': data.get('bl_number'),
            # 'bl_qty': data.get('bl_qty'),
            'bl_fees': data.get('bl_fees'),
            'bl_collection_cost': data.get('bl_collection_cost'),
            'bl_date': data.get('bl_date'),
            # 'total_packing_cost': data.get('total_packing_cost'),
            # 'packaging_supplier': data.get('packaging_supplier'),
            # 'logistic_supplier': data.get('logistic_supplier'),
            # 'batch_number': data.get('batch_number'),
            # 'production_date': data.get('production_date'),
            'logistic_cost': data.get('logistic_cost'),
            'logistic_cost_due_date': data.get('logistic_cost_due_date'),
            'liner': data.get('liner'),
            'pod': data.get('pod'),
            'pol': data.get('pol'),
            'etd': data.get('etd'),
            'eta': data.get('eta'),
            'shipment_status': data.get('shipment_status'),
            'remarks': data.get('remarks')
        }
        sp_products_data = []
        sp_extra_charges_data = []
        packing_list_data = []
        # invoices_data = []
        # coas_data = []
        # bl_copies_data = []

        h = 0
        while f'salesPurchaseProducts[{h}].product_name' in data:
            sp_product = {
                'product_name': data.get(f'salesPurchaseProducts[{h}].product_name'),
                'hs_code': data.get(f'salesPurchaseProducts[{h}].hs_code'),  
                'tolerance': data.get(f'salesPurchaseProducts[{h}].tolerance'),  
                'batch_number': data.get(f'salesPurchaseProducts[{h}].batch_number'),  
                'production_date': data.get(f'salesPurchaseProducts[{h}].production_date'),  
                'bl_qty': data.get(f'salesPurchaseProducts[{h}].bl_qty'),
                'pending_qty': data.get(f'salesPurchaseProducts[{h}].pending_qty'),   
                'trade_qty_unit': data.get(f'salesPurchaseProducts[{h}].trade_qty_unit'),  
                'bl_value': data.get(f'salesPurchaseProducts[{h}].bl_value'), 
                'product_code': data.get(f'salesPurchaseProducts[{h}].product_code'), 
                'selected_currency_rate': data.get(f'salesPurchaseProducts[{h}].selected_currency_rate'),  
                'rate_in_usd': data.get(f'salesPurchaseProducts[{h}].rate_in_usd'), 
            }
            sp_products_data.append(sp_product)
            h += 1

        i = 0
        while f'extraCharges[{i}].name' in data:
            sp_extras = {
                'name': data.get(f'extraCharges[{i}].name'),
                'charge': data.get(f'extraCharges[{i}].charge'),  # Handle binary data as needed
            }
            sp_extra_charges_data.append(sp_extras)
            i += 1

        j = 0
        while f'packingLists[{j}].name' in data:
            packing_lists = {
                'name': data.get(f'packingLists[{j}].name'),
                'packing_list': request.FILES.get(f'packingLists[{j}].packing_list',None),
            }
            packing_list_data.append(packing_lists)
            j += 1
        
       

        with transaction.atomic():
            sp_serializer = SalesPurchaseSerializer(data=sp_data)
            if sp_serializer.is_valid():
                sp = sp_serializer.save()
            else:
                return Response(sp_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            if sp_products_data:
                try: 
                    sp_products = [SalesPurchaseProduct(**item, sp=sp) for item in sp_products_data]
                    SalesPurchaseProduct.objects.bulk_create(sp_products)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
            if sp_extra_charges_data:
                try: 
                    sp_extras = [SalesPurchaseExtraCharge(**item, sp=sp) for item in sp_extra_charges_data]
                    SalesPurchaseExtraCharge.objects.bulk_create(sp_extras)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
                
            if packing_list_data:
                try:
                    packings = [PackingList(**item, sp=sp) for item in packing_list_data]
                    PackingList.objects.bulk_create(packings)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
            
            if sp.trn.trade_type.lower() == "sales":
                for product in sp_products:
                    pending_product=SalesPending.objects.filter(trn=sp.trn.id,product_code=product.product_code,product_name=product.product_name,hs_code=product.hs_code).first()
                    pending_product.balance_qty=float(pending_product.balance_qty)-float(product.bl_qty)
                    pending_product.save()
                       
                  
            elif sp.trn.trade_type.lower() == "purchase":
                for product in sp_products:
                    pending_product=PurchasePending.objects.filter(trn=sp.trn.id,product_code=product.product_code,product_name=product.product_name,hs_code=product.hs_code).first()
                    pending_product.balance_qty=float(pending_product.balance_qty)-float(product.bl_qty)
                    pending_product.save()

        return Response(sp_serializer.data, status=status.HTTP_201_CREATED)
    
    def put(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        data = request.data
        
        try:
            sp = SalesPurchase.objects.get(pk=pk)
        except SalesPurchase.DoesNotExist:
            return Response({'error': 'SalesPurchase not found'}, status=status.HTTP_404_NOT_FOUND)

        # Prepare trade data separately
        sp_data = {
            'trn': data.get('trn'),
            'invoice_date': data.get('invoice_date'),
            'invoice_number': data.get('invoice_number'),
            'invoice_amount': data.get('invoice_amount'),
            # 'commission_value': data.get('commission_value'),
            'bl_number': data.get('bl_number'),
            # 'bl_qty': data.get('bl_qty'),
            'bl_fees': data.get('bl_fees'),
            'bl_collection_cost': data.get('bl_collection_cost'),
            'bl_date': data.get('bl_date'),
            # 'total_packing_cost': data.get('total_packing_cost'),
            # 'packaging_supplier': data.get('packaging_supplier'),
            # 'logistic_supplier': data.get('logistic_supplier'),
            # 'batch_number': data.get('batch_number'),
            # 'production_date': data.get('production_date'),
            'logistic_cost': data.get('logistic_cost'),
            'logistic_cost_due_date': data.get('logistic_cost_due_date'),
            'liner': data.get('liner'),
            'pod': data.get('pod'),
            'pol': data.get('pol'),
            'etd': data.get('etd'),
            'eta': data.get('eta'),
            'shipment_status': data.get('shipment_status'),
            'remarks': data.get('remarks')
        }

        sp_products_data = []
        sp_extra_charges_data = []
        packing_list_data = []
       
        h = 0
        while f'salesPurchaseProducts[{h}].product_name' in data:
            sp_product = {
                'product_name': data.get(f'salesPurchaseProducts[{h}].product_name'),
                'hs_code': data.get(f'salesPurchaseProducts[{h}].hs_code'),  
                'tolerance': data.get(f'salesPurchaseProducts[{h}].tolerance'),  
                'batch_number': data.get(f'salesPurchaseProducts[{h}].batch_number'),  
                'production_date': data.get(f'salesPurchaseProducts[{h}].production_date'),  
                'bl_qty': data.get(f'salesPurchaseProducts[{h}].bl_qty'),  
                'pending_qty': data.get(f'salesPurchaseProducts[{h}].pending_qty'),  
                'trade_qty_unit': data.get(f'salesPurchaseProducts[{h}].trade_qty_unit'),  
                'bl_value': data.get(f'salesPurchaseProducts[{h}].bl_value'),  
                'product_code': data.get(f'salesPurchaseProducts[{h}].product_code'), 
                'selected_currency_rate': data.get(f'salesPurchaseProducts[{h}].selected_currency_rate'),  
                'rate_in_usd': data.get(f'salesPurchaseProducts[{h}].rate_in_usd'), 
            }
            sp_products_data.append(sp_product)
            h += 1

        i = 0
        while f'extraCharges[{i}].name' in data:
            sp_extras = {
                'name': data.get(f'extraCharges[{i}].name'),
                'charge': data.get(f'extraCharges[{i}].charge'),  # Handle binary data as needed
            }
            sp_extra_charges_data.append(sp_extras)
            i += 1

        j = 0
        while f'packingLists[{j}].name' in data:
            doc_file = request.FILES.get(f'packingLists[{j}].packing_list',None)
            if not doc_file:
                existing_doc = PackingList.objects.filter(sp=sp, name=data.get(f'packingLists[{j}].name')).first()
                if existing_doc:
                    doc_file = existing_doc.packing_list  # retain existing file

            packing_lists = {
                'name': data.get(f'packingLists[{j}].name'),
                'packing_list': doc_file,
            }
            packing_list_data.append(packing_lists)
            j += 1
        
       
        with transaction.atomic():
            spProducts=SalesPurchaseProduct.objects.filter(sp=sp)

            if sp.trn.trade_type.lower() == "sales":
                for product in spProducts:
                    try:
                        # Check if a SalesProductTrace with the given product_code exists
                        existing_pending = SalesPending.objects.filter(trn=sp.trn.id,product_name=product.product_name,product_code=product.product_code,hs_code=product.hs_code).first()
            
                        if existing_pending:
                            existing_pending.balance_qty = float(existing_pending.balance_qty)+float(product.bl_qty)
                            existing_pending.save()
                       
                    except Exception as e:
                        # Handle specific exception for SalesProductTrace
                        print(f"Error updating SalesPending: {e}")
                        raise
                    try:
                        # Check if a SalesProductTrace with the given product_code exists
                        existing_inv = Inventory.objects.filter(product_name=product.product_name,batch_number=product.batch_number,production_date=product.production_date,unit=product.trade_qty_unit).first()
            
                        if existing_inv and sp.reviewed:
                            existing_inv.quantity = float(existing_inv.quantity)+float(product.bl_qty)
                            existing_inv.save()
                       
                    except Exception as e:
                        # Handle specific exception for SalesProductTrace
                        print(f"Error updating or creating Inventory: {e}")
                        raise
                    
            
            if sp.trn.trade_type.lower() == "purchase":
                for product in spProducts:
                    try:
                        # Check if a SalesProductTrace with the given product_code exists
                        existing_pending = PurchasePending.objects.filter(trn=sp.trn.id,product_name=product.product_name,product_code=product.product_code,hs_code=product.hs_code).first()
            
                        if existing_pending:
                            existing_pending.balance_qty = float(existing_pending.balance_qty)+float(product.bl_qty)
                            existing_pending.save()
                       
                    except Exception as e:
                        # Handle specific exception for SalesProductTrace
                        print(f"Error updating PurchasePending: {e}")
                        raise

                    try:
                        # Check if a SalesProductTrace with the given product_code exists
                        existing_inv = Inventory.objects.filter(product_name=product.product_name,batch_number=product.batch_number,production_date=product.production_date,unit=product.trade_qty_unit).first()
            
                        if existing_inv and sp.reviewed:
                            # If it exists, update only the fields you want to update
                            existing_inv.quantity = float(existing_inv.quantity)-float(product.bl_qty)
                            existing_inv.save()
                        
                    except Exception as e:
                        # Handle specific exception for SalesProductTrace
                        print(f"Error updating or creating Inventory: {e}")
                        raise

            sp_serializer = SalesPurchaseSerializer(sp, data=sp_data, partial=True)
            if sp_serializer.is_valid():
                sp = sp_serializer.save()
            else:
                return Response(sp_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            
            if sp_products_data:
                # Clear existing trade products and add new ones
                SalesPurchaseProduct.objects.filter(sp=sp).delete()
               
                try:
                    sp_products = [SalesPurchaseProduct(**item, sp=sp) for item in sp_products_data]
                    SalesPurchaseProduct.objects.bulk_create(sp_products)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
           
            if sp_extra_charges_data:
                # Clear existing trade products and add new ones
                SalesPurchaseExtraCharge.objects.filter(sp=sp).delete()
               
                try:
                    sp_extras = [SalesPurchaseExtraCharge(**item, sp=sp) for item in sp_extra_charges_data]
                    SalesPurchaseExtraCharge.objects.bulk_create(sp_extras)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

            if packing_list_data:
                # Clear existing trade extra costs and add new ones
                PackingList.objects.filter(sp=sp).delete()
                try:
                    packings = [PackingList(**item, sp=sp) for item in packing_list_data]
                    PackingList.objects.bulk_create(packings)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
            salesPurchaseProducts=SalesPurchaseProduct.objects.filter(sp=sp)
            if sp.trn.trade_type.lower() == "sales":
                for product in salesPurchaseProducts:
                    try:
                        pending_product=SalesPending.objects.filter(trn=sp.trn.id,product_code=product.product_code,product_name=product.product_name,hs_code=product.hs_code).first()
                        pending_product.balance_qty=float(pending_product.balance_qty)-float(product.bl_qty)
                        pending_product.save()
                    except Exception as e:
                            # Handle specific exception for SalesProductTrace
                        print(f"Error updating SalesPending: {e}")
                        raise
                    try:
                        if sp.reviewed:
                            existing_inv = Inventory.objects.filter(product_name=product.product_name,batch_number=product.batch_number,production_date=product.production_date,unit=product.trade_qty_unit).first()
                            if existing_inv:
                                # If it exists, update only the fields you want to update
                                existing_inv.quantity-= product.bl_qty
                                existing_inv.save()
                            else:
                                # If it doesn't exist, create a new record with all fields
                                Inventory.objects.create(
                                product_name=product.product_name,
                                batch_number=product.batch_number,
                                production_date=product.production_date,    
                                quantity=0-float(product.bl_qty),
                                unit=product.trade_qty_unit
                                )
                    except Exception as e:
                            # Handle specific exception for SalesProductTrace
                        print(f"Error updating or creating Inventory: {e}")
                        raise

            if sp.trn.trade_type.lower() == "purchase":
                for product in salesPurchaseProducts:
                    try:
                        pending_product=PurchasePending.objects.filter(trn=sp.trn.id,product_code=product.product_code,product_name=product.product_name,hs_code=product.hs_code).first()
                        pending_product.balance_qty=float(pending_product.balance_qty)-float(product.bl_qty)
                        pending_product.save()
                    except Exception as e:
                            # Handle specific exception for SalesProductTrace
                        print(f"Error updating PurchasePending: {e}")
                        raise

                    try:
                        if sp.reviewed:
                            existing_inv = Inventory.objects.filter(product_name=product.product_name,batch_number=product.batch_number,production_date=product.production_date,unit=product.trade_qty_unit).first()
                            if existing_inv:
                                # If it exists, update only the fields you want to update
                                existing_inv.quantity+= product.bl_qty
                                existing_inv.save()
                            else:
                                # If it doesn't exist, create a new record with all fields
                                Inventory.objects.create(
                                product_name=product.product_name,
                                batch_number=product.batch_number,
                                production_date=product.production_date,    
                                quantity=float(product.bl_qty),
                                unit=product.trade_qty_unit
                                )
                    except Exception as e:
                            # Handle specific exception for SalesProductTrace
                        print(f"Error updating or creating Inventory: {e}")
                        raise

        return Response(sp_serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
        pk = kwargs.get('pk')

        try:
            sp = SalesPurchase.objects.get(pk=pk)
        except SalesPurchase.DoesNotExist:
            return Response({'error': 'SalesPurchase not found'}, status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            salesPurchaseProducts=SalesPurchaseProduct.objects.filter(sp=sp)
            if sp.trn.trade_type.lower() == "sales":
                for product in salesPurchaseProducts:
                    try:
                        # Check if a SalesProductTrace with the given product_code exists
                        existing_pending = SalesPending.objects.filter(trn=sp.trn.id,product_name=product.product_name,product_code=product.product_code,hs_code=product.hs_code).first()
            
                        if existing_pending:
                            existing_pending.balance_qty = float(existing_pending.balance_qty)+float(product.bl_qty)
                            existing_pending.save()
                       
                    except Exception as e:
                        # Handle specific exception for SalesProductTrace
                        print(f"Error updating SalesPending: {e}")
                        raise
                    try:
                        existing_inv = Inventory.objects.filter(product_name=product.product_name,batch_number=product.batch_number,production_date=product.production_date,unit=product.trade_qty_unit).first()
                        if existing_inv:
                                # If it exists, update only the fields you want to update
                            existing_inv.quantity+= product.bl_qty
                            existing_inv.save()
                    except Exception as e:
                            # Handle specific exception for SalesProductTrace
                        print(f"Error updating or creating Inventory: {e}")
                        raise

            if sp.trn.trade_type.lower() == "purchase":
                for product in salesPurchaseProducts:
                    try:
                        # Check if a SalesProductTrace with the given product_code exists
                        existing_pending = PurchasePending.objects.filter(trn=sp.trn.id,product_name=product.product_name,product_code=product.product_code,hs_code=product.hs_code).first()
            
                        if existing_pending:
                            existing_pending.balance_qty = float(existing_pending.balance_qty)+float(product.bl_qty)
                            existing_pending.save()
                       
                    except Exception as e:
                        # Handle specific exception for SalesProductTrace
                        print(f"Error updating PurchasePending: {e}")
                        raise
                    try:
                        existing_inv = Inventory.objects.filter(product_name=product.product_name,batch_number=product.batch_number,production_date=product.production_date,unit=product.trade_qty_unit).first()
                        if existing_inv:
                            # If it exists, update only the fields you want to update
                            existing_inv.quantity-= product.bl_qty
                            existing_inv.save()
                           
                    except Exception as e:
                        # Handle specific exception for SalesProductTrace
                        print(f"Error updating or creating Inventory: {e}")
                        raise
            # Delete related trade products and extra costs
            SalesPurchaseProduct.objects.filter(sp=sp).delete()
            SalesPurchaseExtraCharge.objects.filter(sp=sp).delete()
            PackingList.objects.filter(sp=sp).delete()
           
            sp.delete()

        return Response({'message': 'SalesPurchase deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

class SalesPurchaseExtraChargeViewSet(viewsets.ModelViewSet):
    queryset = SalesPurchaseExtraCharge.objects.all()
    serializer_class = SalesPurchaseExtraChargeSerializer

class PackingListViewSet(viewsets.ModelViewSet):
    queryset = PackingList.objects.all()
    serializer_class = PackingListSerializer

class BL_CopyViewSet(viewsets.ModelViewSet):
    queryset = BL_Copy.objects.all()
    serializer_class = BL_CopySerializer

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

class COAViewSet(viewsets.ModelViewSet):
    queryset = COA.objects.all()
    serializer_class = COASerializer

class SalesPurchaseApprove(APIView):
    def get(self, request, *args, **kwargs):
        sp_id = kwargs.get('pk')
    
        if not sp_id:
            return Response({'detail': 'Sales/Purchase ID not provided.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                sp = SalesPurchase.objects.get(id=sp_id)
                sp.reviewed = True
                sp.save()
                salesPurchaseProducts=SalesPurchaseProduct.objects.filter(sp=sp)
                if sp.trn.trade_type.lower() == "sales":
                    for product in salesPurchaseProducts:
                        try:
                            existing_inv = Inventory.objects.filter(product_name=product.product_name,batch_number=product.batch_number,production_date=product.production_date,unit=product.trade_qty_unit).first()
                            if existing_inv:
                                # If it exists, update only the fields you want to update
                                existing_inv.quantity-= product.bl_qty
                                existing_inv.save()
                            else:
                                # If it doesn't exist, create a new record with all fields
                                Inventory.objects.create(
                                product_name=product.product_name,
                                batch_number=product.batch_number,
                                production_date=product.production_date,    
                                quantity=0-float(product.bl_qty),
                                unit=product.trade_qty_unit
                                )
                        except Exception as e:
                            # Handle specific exception for SalesProductTrace
                            print(f"Error updating or creating Inventory: {e}")
                            raise

                if sp.trn.trade_type.lower() == "purchase":
                    for product in salesPurchaseProducts:
                        try:
                            existing_inv = Inventory.objects.filter(product_name=product.product_name,batch_number=product.batch_number,production_date=product.production_date,unit=product.trade_qty_unit).first()
                            if existing_inv:
                                # If it exists, update only the fields you want to update
                                existing_inv.quantity+= product.bl_qty
                                existing_inv.save()
                            else:
                                # If it doesn't exist, create a new record with all fields
                                Inventory.objects.create(
                                product_name=product.product_name,
                                batch_number=product.batch_number,
                                production_date=product.production_date,    
                                quantity=float(product.bl_qty),
                                unit=product.trade_qty_unit
                                )
                        except Exception as e:
                            # Handle specific exception for SalesProductTrace
                            print(f"Error updating or creating Inventory: {e}")
                            raise

                serializer = SalesPurchaseSerializer(sp)
                return Response(serializer.data, status=status.HTTP_200_OK)
        except SalesPurchase.DoesNotExist:
            return Response({'detail': 'Sales/Purchase not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SalesPurchaseBLView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            sp = SalesPurchase.objects.filter(trn__trade_type='Purchase',reviewed=True)
            serializer = SalesPurchaseSerializer(sp,many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except SalesPurchase.DoesNotExist:
            return Response({'detail': 'Sales/Purchase not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

           
class PaymentFinanceView(APIView):
    filter_backends = [DjangoFilterBackend]
    filterset_class = PaymentFinanceFilter

    def get(self, request, *args, **kwargs):
        pf_id = kwargs.get('pk')  # URL parameter for trade ID
        
        if pf_id:  # If `pk` is provided, retrieve a specific trade
            try:
                pf = PaymentFinance.objects.get(id=pf_id)
            except PaymentFinance.DoesNotExist:
                return Response({'detail': 'PaymentFinance not found.'}, status=status.HTTP_404_NOT_FOUND)

            pf_serializer = PaymentFinanceSerializer(pf)
            charges = PFCharges.objects.filter(payment_finance=pf)
            tt_copies = TTCopy.objects.filter(payment_finance=pf)
           
            charges_serializer = PFChargesSerializer(charges, many=True)
            tt_copies_serializer = TTCopySerializer(tt_copies, many=True)
            
            response_data = pf_serializer.data
            response_data['pfCharges'] = charges_serializer.data
            response_data['ttCopies'] = tt_copies_serializer.data
            return Response(response_data)

        else:  # If `pk` is not provided, list all trades
            queryset = PaymentFinance.objects.all()
            filterset = PaymentFinanceFilter(request.GET, queryset=queryset)

            if not filterset.is_valid():
                return Response(filterset.errors, status=status.HTTP_400_BAD_REQUEST)

            serializer = PaymentFinanceSerializer(filterset.qs, many=True)
            return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        data = request.data
        # Prepare trade data separately
        pf_data = {
            'sp': data.get('sp'),
            # 'balance_payment': data.get('balance_payment'),
            'balance_payment_received': data.get('balance_payment_received'),
            'balance_payment_made': data.get('balance_payment_made'),
            'balance_payment_date': data.get('balance_payment_date'),
            'advance_adjusted': data.get('advance_adjusted'),
            'net_due_in_this_trade': data.get('net_due_in_this_trade'),
            # 'payment_mode': data.get('payment_mode'),
            'status_of_payment': data.get('status_of_payment'),
            # 'logistic_cost': data.get('logistic_cost'),
            # 'commission_value': data.get('commission_value'),
            # 'bl_fee': data.get('bl_fee'),
            # 'bl_collection_cost': data.get('bl_collection_cost'),
            # 'shipment_status': data.get('shipment_status'),
            'release_docs': data.get('release_docs'),
            'release_docs_date': data.get('release_docs_date'),
            'remarks': data.get('remarks'),
        }

        charges_data = []
        tt_copies_data = []

        k = 0
        while f'pfCharges[{k}].name' in data:
            charge_data = {
                'name': data.get(f'pfCharges[{k}].name'),
                'charge': data.get(f'pfCharges[{k}].charge'),  # Handle binary data as needed
            }
            charges_data.append(charge_data)
            k += 1

        i = 0
        while f'ttCopies[{i}].name' in data:
            tt_copy_data = {
                'name': data.get(f'ttCopies[{i}].name'),
                'tt_copy': data.get(f'ttCopies[{i}].tt_copy'),  # Handle binary data as needed
            }
            tt_copies_data.append(tt_copy_data)
            i += 1

        with transaction.atomic():
            pf_serializer = PaymentFinanceSerializer(data=pf_data)
            if pf_serializer.is_valid():
                pf = pf_serializer.save()
            else:
                return Response(pf_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            prepayment = PrePayment.objects.filter(trn=pf.sp.trn).first()
            if prepayment:
                prepayment.advance_amount-= pf.advance_adjusted
                prepayment.save()
            if charges_data:
                try:
                    
                    pf_charges = [PFCharges(**item, payment_finance=pf) for item in charges_data]
                    PFCharges.objects.bulk_create(pf_charges)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
            if tt_copies_data:
                try:
                    
                    tt_copies = [TTCopy(**item, payment_finance=pf) for item in tt_copies_data]
                    TTCopy.objects.bulk_create(tt_copies)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(pf_serializer.data, status=status.HTTP_201_CREATED)

    def put(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        data = request.data
        
        try:
            pf = PaymentFinance.objects.get(pk=pk)
        except PaymentFinance.DoesNotExist:
            return Response({'error': 'PaymentFinance not found'}, status=status.HTTP_404_NOT_FOUND)

        # Prepare trade data separately
        pf_data = {
            'trn': data.get('trn'),
            # 'balance_payment': data.get('balance_payment'),
            'balance_payment_received': data.get('balance_payment_received'),
            'balance_payment_made': data.get('balance_payment_made'),
            'balance_payment_date': data.get('balance_payment_date'),
            'advance_adjusted': data.get('advance_adjusted'),
            'net_due_in_this_trade': data.get('net_due_in_this_trade'),
            # 'payment_mode': data.get('payment_mode'),
            'status_of_payment': data.get('status_of_payment'),
            # 'logistic_cost': data.get('logistic_cost'),
            # 'commission_value': data.get('commission_value'),
            # 'bl_fee': data.get('bl_fee'),
            # 'bl_collection_cost': data.get('bl_collection_cost'),
            # 'shipment_status': data.get('shipment_status'),
            'release_docs': data.get('release_docs'),
            'release_docs_date': data.get('release_docs_date'),
            'remarks': data.get('remarks'),
        }

        charges_data = []
        tt_copies_data = []

        k = 0
        while f'pfCharges[{k}].name' in data:
            charge_data = {
                'name': data.get(f'pfCharges[{k}].name'),
                'charge': data.get(f'pfCharges[{k}].charge'),  # Handle binary data as needed
            }
            charges_data.append(charge_data)
            k += 1

        i = 0
        while f'ttCopies[{i}].name' in data:
            doc_file = request.FILES.get(f'ttCopies[{i}].tt_copy',None)
            if not doc_file:
                existing_doc = TTCopy.objects.filter(payment_finance=pf, name=data.get(f'ttCopies[{i}].name')).first()
                if existing_doc:
                    doc_file = existing_doc.tt_copy  # retain existing file
            tt_copy_data = {
                'name': data.get(f'ttCopies[{i}].name'),
                'tt_copy': doc_file,  # Handle binary data as needed
            }
            tt_copies_data.append(tt_copy_data)
            i += 1
       
        with transaction.atomic():
            prepayment = PrePayment.objects.filter(trn=pf.sp.trn).first()
            if prepayment:
                prepayment.advance_amount+= pf.advance_adjusted
                prepayment.save()

            pf_serializer = PaymentFinanceSerializer(pf, data=pf_data, partial=True)
            if pf_serializer.is_valid():
                pf = pf_serializer.save()
            else:
                return Response(pf_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            prepayment = PrePayment.objects.filter(trn=pf.sp.trn).first()
            if prepayment:
                prepayment.advance_amount-= pf.advance_adjusted
                prepayment.save()
                
            if charges_data:
                # Clear existing trade products and add new ones
                PFCharges.objects.filter(payment_finance=pf).delete()
                try:
                    
                    pf_charges = [PFCharges(**item, payment_finance=pf) for item in charges_data]
                    PFCharges.objects.bulk_create(pf_charges)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
           
            if tt_copies_data:
                # Clear existing trade products and add new ones
                TTCopy.objects.filter(payment_finance=pf).delete()
               
                try:
                    tt_copies = [TTCopy(**item, payment_finance=pf) for item in tt_copies_data]
                    TTCopy.objects.bulk_create(tt_copies)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(pf_serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
        pk = kwargs.get('pk')

        try:
            pf = PaymentFinance.objects.get(pk=pk)
        except PaymentFinance.DoesNotExist:
            return Response({'error': 'PaymentFinance not found'}, status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            # Delete related trade products and extra costs
            PFCharges.objects.filter(payment_finance=pf).delete()
            TTCopy.objects.filter(payment_finance=pf).delete()
            prepayment = PrePayment.objects.filter(trn=pf.sp.trn).first()
            if prepayment:
                prepayment.advance_amount+= pf.advance_adjusted
                prepayment.save()

            pf.delete()

        return Response({'message': 'PaymentFinance deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

class TTCopyViewSet(viewsets.ModelViewSet):
    queryset = TTCopy.objects.all()
    serializer_class = TTCopySerializer

class PFChargesViewSet(viewsets.ModelViewSet):
    queryset = PFCharges.objects.all()
    serializer_class = PFChargesSerializer

class PFReview(APIView):
    def get(self, request, *args, **kwargs):
        pf_id = kwargs.get('pk')
    
        if not pf_id:
            return Response({'detail': 'Paymnet/Finance ID not provided.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                pf = PaymentFinance.objects.get(id=pf_id)
                pf.reviewed = True
                pf.save()
                serializer = PaymentFinanceSerializer(pf)
                return Response(serializer.data, status=status.HTTP_200_OK)
        except PaymentFinance.DoesNotExist:
            return Response({'detail': 'Paymnet/Finance not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)    

class KycViewSet(viewsets.ModelViewSet):
    queryset = Kyc.objects.all()
    serializer_class = KycSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = KycFilter

class KycApproveOneView(APIView):
    def get(self, request, *args, **kwargs):
        kyc_id = kwargs.get('pk')
    
        if not kyc_id:
            return Response({'detail': 'Kyc ID not provided.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                kyc = Kyc.objects.get(id=kyc_id)

                kyc.approve1 = True
                kyc.save()

                serializer = KycSerializer(kyc)
                return Response(serializer.data, status=status.HTTP_200_OK)
        except Kyc.DoesNotExist:
            return Response({'detail': 'Kyc not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class KycApproveTwoView(APIView):
    def get(self, request, *args, **kwargs):
        kyc_id = kwargs.get('pk')
    
        if not kyc_id:
            return Response({'detail': 'Kyc ID not provided.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                kyc = Kyc.objects.get(id=kyc_id)

                kyc.approve2 = True
                kyc.save()

                serializer = KycSerializer(kyc)
                return Response(serializer.data, status=status.HTTP_200_OK)
        except Kyc.DoesNotExist:
            return Response({'detail': 'Kyc not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PurchaseProductTraceViewSet(viewsets.ModelViewSet):
    queryset = PurchaseProductTrace.objects.all()
    serializer_class = PurchaseProductTraceSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        product_code = self.request.query_params.get('product_code', None)
        if product_code:
            queryset = queryset.filter(product_code=product_code)
        return queryset


class SalesProductTraceViewSet(viewsets.ModelViewSet):
    queryset = SalesProductTrace.objects.all()
    serializer_class = SalesProductTraceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = SalesProductTraceFilter

   
class PurchasePendingViewSet(viewsets.ModelViewSet):
    queryset = PurchasePending.objects.all()
    serializer_class = PurchasePendingSerializer


 

class SalesPendingViewSet(viewsets.ModelViewSet):
    queryset = SalesPending.objects.all()
    serializer_class = SalesPendingSerializer



class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer

class BankViewSet(viewsets.ModelViewSet):
    queryset = Bank.objects.all()
    serializer_class = BankSerializer

class UnitViewSet(viewsets.ModelViewSet):
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer

class NextCounterView(APIView):
    def get(self, request, company_id):
        try:
            # Fetch the company by ID
            company = Company.objects.get(pk=company_id)
            # Get the next counter value
            next_counter = company.get_next_counter()
            return Response({'next_counter': next_counter}, status=status.HTTP_200_OK)
        except Company.DoesNotExist:
            return Response({'error': 'Company not found'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class PrintView(APIView):
    
    def get(self, request, *args, **kwargs):
        trade_id = kwargs.get('pk')  # URL parameter for trade ID
        
        if trade_id:  # If `pk` is provided, retrieve a specific trade
            try:
                trade = Trade.objects.get(id=trade_id)
            except Trade.DoesNotExist:
                return Response({'detail': 'Trade not found.'}, status=status.HTTP_404_NOT_FOUND)

            trade_serializer = PrintSerializer(trade)
            trade_products = TradeProduct.objects.filter(trade=trade)
            trade_extra_costs = TradeExtraCost.objects.filter(trade=trade)

            trade_products_serializer = TradeProductSerializer(trade_products, many=True)
            trade_extra_costs_serializer = TradeExtraCostSerializer(trade_extra_costs, many=True)

            response_data = trade_serializer.data
            response_data['tradeProducts'] = trade_products_serializer.data
            response_data['tradeExtraCosts'] = trade_extra_costs_serializer.data

            return Response(response_data)

        else:  # If `pk` is not provided, list all trades
            trades = Trade.objects.all()
            serializer = PrintSerializer(trades, many=True)
            return Response(serializer.data)
            

class PrePayView(APIView):
    def get(self, request, *args, **kwargs):
        trade_id = kwargs.get('pk')  # URL parameter for trade ID
        
        if trade_id:  # If `pk` is provided, retrieve a specific trade
            try:
                trade = Trade.objects.get(id=trade_id)
            except Trade.DoesNotExist:
                return Response({'detail': 'Trade not found.'}, status=status.HTTP_404_NOT_FOUND)

            trade_serializer = PrePaySerializer(trade)
            response_data = trade_serializer.data
            return Response(response_data)
        else:  # If `pk` is not provided, list all trades
            trades = Trade.objects.all()
            serializer = PrePaySerializer(trades, many=True)
            return Response(serializer.data)

class SPView(APIView):
    def get(self, request, *args, **kwargs):
        trade_id = kwargs.get('pk')  # URL parameter for trade ID
        
        if trade_id:  # If `pk` is provided, retrieve a specific trade
            try:
                trade = Trade.objects.get(id=trade_id)
            except Trade.DoesNotExist:
                return Response({'detail': 'Trade not found.'}, status=status.HTTP_404_NOT_FOUND)

            trade_serializer = SPSerializer(trade)
            response_data = trade_serializer.data
            return Response(response_data)
        else:  # If `pk` is not provided, list all trades
            trades = Trade.objects.all()
            serializer = SPSerializer(trades, many=True)
            return Response(serializer.data)

class PFView(APIView):
    def get(self, request, *args, **kwargs):
        trade_id = kwargs.get('pk')  # URL parameter for trade ID
        
        if trade_id:  # If `pk` is provided, retrieve a specific trade
            try:
                trade = Trade.objects.get(id=trade_id)
            except Trade.DoesNotExist:
                return Response({'detail': 'Trade not found.'}, status=status.HTTP_404_NOT_FOUND)

            trade_serializer = PFSerializer(trade)
            response_data = trade_serializer.data
            return Response(response_data)
        else:  # If `pk` is not provided, list all trades
            trades = Trade.objects.all()
            serializer = PFSerializer(trades, many=True)
            return Response(serializer.data)

class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer


class ProductNameViewSet(viewsets.ModelViewSet):
    queryset = ProductName.objects.all()
    serializer_class = ProductNameSerializer

class ShipmentSizeViewSet(viewsets.ModelViewSet):
    queryset = ShipmentSize.objects.all()
    serializer_class = ShipmentSizeSerializer

class CurrencyViewSet(viewsets.ModelViewSet):
    queryset = Currency.objects.all()
    serializer_class = CurrencySerializer

class PackingViewSet(viewsets.ModelViewSet):
    queryset = Packing.objects.all()
    serializer_class = PackingSerializer


class RefBalanceView(APIView):
    
    def get(self, request, *args, **kwargs):
        ref_trn = request.query_params.get('trn')
        product_code = request.query_params.get('product_code')
        product_name = request.query_params.get('product_name')
        
        try:
            product = TradeProduct.objects.get(trade__trn=ref_trn,product_code=product_code,product_name=product_name)
            if product.trade.trade_type=='Sales':
                trace=SalesProductTrace.objects.filter(product_code=product_code).first()
            else:
                trace=PurchaseProductTrace.objects.filter(product_code=product_code).first()
                if trace.ref_balance_qty:
                    balance = trace.ref_balance_qty
                else:
                    balance = 'NA'
        except TradeProduct.DoesNotExist:
            return Response({'ref_balance':'NA'})

        return Response({'ref_balance':balance})

      
class ProfitLossViewSet(viewsets.ModelViewSet):
    queryset = PL.objects.all()
    serializer_class = ProfitLossSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = PLFilter

class PLView(APIView):
    def get(self, request, *args, **kwargs):
        trade_id = kwargs.get('pk')  # URL parameter for trade ID
        
        if trade_id:  # If `pk` is provided, retrieve a specific trade
            try:
                trade = SalesPurchase.objects.get(id=trade_id)
            except SalesPurchase.DoesNotExist:
                return Response({'detail': 'Trade not found.'}, status=status.HTTP_404_NOT_FOUND)

            trade_serializer = PLSerializer(trade)
            response_data = trade_serializer.data
            return Response(response_data)
        else:  # If `pk` is not provided, list all trades
            trades = SalesPurchase.objects.all()
            serializer = PLSerializer(trades, many=True)
            return Response(serializer.data)
        

class PendingBalanceView(APIView):
    def get(self, request, *args, **kwargs):
        trn = request.query_params.get('trn')
        product_code = request.query_params.get('product_code')
        product_name = request.query_params.get('product_name')
        hs_code = request.query_params.get('hs_code')
        purchase_bl_number = request.query_params.get('purchase_bl_number')
        
        try:
            trade = Trade.objects.get(id=trn)
            
            if not trade:
                return Response({'error': 'Trade not found'}, status=404)
            
            if trade.trade_type == 'Purchase':
                product = PurchasePending.objects.filter(
                    trn=trade,
                    product_code=product_code,
                    product_name=product_name,
                    hs_code=hs_code
                ).first()
               
                if product:
                    # Serialize and return the product data
                    serialized_product = PurchasePendingSerializer(product)
                    return Response({'pending_balance': serialized_product.data})
                else:
                    return Response({'pending_balance': 0})
            
            else:  # Sales trade type
                product = SalesPending.objects.filter(
                    trn=trade,
                    product_code=product_code,
                    product_name=product_name,
                    hs_code=hs_code
                ).first()
               
                if product:
                    sp_product=SalesPurchaseProduct.objects.filter(sp__bl_number=purchase_bl_number,sp__trn__trade_type='Purchase',product_code=product_code,product_name=product_name).first()
                   
                    # Serialize and return the product data
                    serialized_product = SalesPendingSerializer(product)
                    sp_serialized = SalesPurchaseProductSerializer(sp_product)
                    return Response({'pending_balance': serialized_product.data,'sp_product':sp_serialized.data})
                else:
                    return Response({'pending_balance': 0})

        except Trade.DoesNotExist:
            return Response({'error': 'Trade not found'}, status=404)

class AdvanceAmountView(APIView):
    def get(self, request, *args, **kwargs):
        sp_id = request.query_params.get('sp')
        
        try:
            # Get the SalesPurchase instance
            sp = SalesPurchase.objects.get(id=sp_id)
            # Get the PrePayment instance using the Trade from SalesPurchase
            prepayment = PrePayment.objects.filter(trn=sp.trn).first()
            
            if prepayment:
                return Response({'advance_amount': prepayment.advance_amount})
            else:
                return Response({'advance_amount': 0})

        except SalesPurchase.DoesNotExist:
            return Response({'error': 'Sales/Purchase record not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class TradeReportView(APIView):
    def get(self, request, *args, **kwargs):
        trn = request.query_params.get('trn')
        
        try:
            # Get the SalesPurchase instance
            trade = Trade.objects.get(id=trn)
            
            trade_serializer = TradeReportSerializer(trade)
            response_data = trade_serializer.data
            return Response(response_data)
        except Trade.DoesNotExist:
            return Response({'error': 'Trade record not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class InventoryDetailView(APIView):
    def get(self, request, *args, **kwargs):
        id = request.query_params.get('id')

        # Validate if `id` is provided
        if not id:
            return Response({'error': 'Inventory ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Get the Inventory instance
            inventory = Inventory.objects.get(id=id)

            # Filter SalesPurchaseProduct records based on Inventory details
            sps = SalesPurchaseProduct.objects.filter(
                product_name=inventory.product_name,
                batch_number=inventory.batch_number,
                production_date=inventory.production_date
            )

            # Serialize the filtered SalesPurchaseProduct records
            sp_serializer = InventoryDetailProductSerializer(sps, many=True)

            # Return serialized data
            return Response(sp_serializer.data, status=status.HTTP_200_OK)
        
        except Inventory.DoesNotExist:
            return Response({'error': 'Inventory record not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'An error occurred: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
