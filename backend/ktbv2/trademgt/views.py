from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from rest_framework.views import APIView
from rest_framework import viewsets
from .models import *
from .serializers import *

from rest_framework.parsers import MultiPartParser, FormParser
import logging
logger = logging.getLogger(__name__)

class TradeView(APIView):
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
            'packing': data.get('packing'),
            'cost_of_packing_per_each': data.get('cost_of_packing_per_each'),
            'total_packing_cost': data.get('total_packing_cost'),
            'packaging_supplier': data.get('packaging_supplier'),
            'selected_currency_rate': data.get('selected_currency_rate'),
            'currency_selection': data.get('currency_selection'),
            'exchange_rate': data.get('exchange_rate'),
            'rate_in_usd': data.get('rate_in_usd'),
            'commission': data.get('commission'),
            'contract_value': data.get('contract_value'),
            'payment_term': data.get('payment_term'),
            'advance_value_to_receive': data.get('advance_value_to_receive'),
            'commission_rate': data.get('commission_rate'),
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
            'bl_declaration': data.get('bl_declaration'),
            'shipper_in_bl': data.get('shipper_in_bl'),
            'consignee_in_bl': data.get('consignee_in_bl'),
            'notify_party_in_bl': data.get('notify_party_in_bl'),
            'markings_in_packaging': data.get('markings_in_packaging'),
            'container_shipment_size': data.get('container_shipment_size'),
            'bl_fee': data.get('bl_fee'),
            'bl_fee_remarks': data.get('bl_fee_remarks'),
        }

        trade_products_data = []
        trade_extra_costs_data = []

        i = 0
        while f'tradeProducts[{i}].product_code' in data:
            product_data = {
                'product_code': data.get(f'tradeProducts[{i}].product_code'),
                'product_name': data.get(f'tradeProducts[{i}].product_name'),
                'product_name_for_client': data.get(f'tradeProducts[{i}].product_name_for_client'),
                'loi': data.get(f'tradeProducts[{i}].loi'),  # Handle binary data as needed
                'hs_code': data.get(f'tradeProducts[{i}].hs_code'),
                'total_contract_qty': data.get(f'tradeProducts[{i}].total_contract_qty'),
                'total_contract_qty_unit': data.get(f'tradeProducts[{i}].total_contract_qty_unit'),
                'tolerance': data.get(f'tradeProducts[{i}].tolerance'),
                'contract_balance_qty': data.get(f'tradeProducts[{i}].contract_balance_qty'),
                'contract_balance_qty_unit': data.get(f'tradeProducts[{i}].contract_balance_qty_unit'),
                'trade_qty': data.get(f'tradeProducts[{i}].trade_qty'),
                'trade_qty_unit': data.get(f'tradeProducts[{i}].trade_qty_unit'),
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
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
                
            if trade_extra_costs_data:
                try:
                    trade_extra_costs = [TradeExtraCost(**item, trade=trade) for item in trade_extra_costs_data]
                    TradeExtraCost.objects.bulk_create(trade_extra_costs)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(trade_serializer.data, status=status.HTTP_201_CREATED)

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
            trades = Trade.objects.all()
            serializer = TradeSerializer(trades, many=True)
            return Response(serializer.data)
    
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
            'packing': data.get('packing'),
            'cost_of_packing_per_each': data.get('cost_of_packing_per_each'),
            'total_packing_cost': data.get('total_packing_cost'),
            'packaging_supplier': data.get('packaging_supplier'),
            'selected_currency_rate': data.get('selected_currency_rate'),
            'currency_selection': data.get('currency_selection'),
            'exchange_rate': data.get('exchange_rate'),
            'rate_in_usd': data.get('rate_in_usd'),
            'commission': data.get('commission'),
            'contract_value': data.get('contract_value'),
            'payment_term': data.get('payment_term'),
            'advance_value_to_receive': data.get('advance_value_to_receive'),
            'commission_rate': data.get('commission_rate'),
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
            'bl_declaration': data.get('bl_declaration'),
            'shipper_in_bl': data.get('shipper_in_bl'),
            'consignee_in_bl': data.get('consignee_in_bl'),
            'notify_party_in_bl': data.get('notify_party_in_bl'),
            'markings_in_packaging': data.get('markings_in_packaging'),
            'container_shipment_size': data.get('container_shipment_size'),
            'bl_fee': data.get('bl_fee'),
            'bl_fee_remarks': data.get('bl_fee_remarks'),
        }

        trade_products_data = []
        trade_extra_costs_data = []

        i = 0
        while f'tradeProducts[{i}].product_code' in data:
            product_data = {
                'product_code': data.get(f'tradeProducts[{i}].product_code'),
                'product_name': data.get(f'tradeProducts[{i}].product_name'),
                'product_name_for_client': data.get(f'tradeProducts[{i}].product_name_for_client'),
                'loi': data.get(f'tradeProducts[{i}].loi'),  # Handle binary data as needed
                'hs_code': data.get(f'tradeProducts[{i}].hs_code'),
                'total_contract_qty': data.get(f'tradeProducts[{i}].total_contract_qty'),
                'total_contract_qty_unit': data.get(f'tradeProducts[{i}].total_contract_qty_unit'),
                'tolerance': data.get(f'tradeProducts[{i}].tolerance'),
                'contract_balance_qty': data.get(f'tradeProducts[{i}].contract_balance_qty'),
                'contract_balance_qty_unit': data.get(f'tradeProducts[{i}].contract_balance_qty_unit'),
                'trade_qty': data.get(f'tradeProducts[{i}].trade_qty'),
                'trade_qty_unit': data.get(f'tradeProducts[{i}].trade_qty_unit'),
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

        return Response(trade_serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
        pk = kwargs.get('pk')

        try:
            trade = Trade.objects.get(pk=pk)
        except Trade.DoesNotExist:
            return Response({'error': 'Trade not found'}, status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            # Delete related trade products and extra costs
            TradeProduct.objects.filter(trade=trade).delete()
            TradeExtraCost.objects.filter(trade=trade).delete()
            trade.delete()

        return Response({'message': 'Trade deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

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
    def post(self, request, *args, **kwargs):
        data = request.data
        # Prepare trade data separately
        pre_sp_data = {
            'trn': 53,
            'date': data.get('date'),
            'doc_issuance_date': data.get('doc_issuance_date'),
            'payment_term': data.get('payment_term'),
            'advance_due_date': data.get('advance_due_date'),
            'lc_due_date': data.get('lc_due_date'),
            'remarks': data.get('remarks'),
        }

        acknowledged_pi_data = []
        acknowledged_po_data = []

        i = 0
        while f'acknowledgedPI[{i}].ackn_pi_name' in data:
            pi_data = {
                'ackn_pi_name': data.get(f'acknowledgedPI[{i}].ackn_pi_name'),
                'ackn_pi': data.get(f'acknowledgedPI[{i}].ackn_pi'),  # Handle binary data as needed
            }
            acknowledged_pi_data.append(pi_data)
            i += 1

        j = 0
        while f'acknowledgedPO[{j}].ackn_po_name' in data:
            po_data = {
                'ackn_po_name': data.get(f'acknowledgedPO[{j}].ackn_po_name'),
                'ackn_po': data.get(f'acknowledgedPO[{j}].ackn_po'),
            }
            acknowledged_po_data.append(po_data)
            j += 1
        
        with transaction.atomic():
            pre_sp_serializer = PreSalePurchaseSerializer(data=pre_sp_data)
            if pre_sp_serializer.is_valid():
                pre_sp = pre_sp_serializer.save()
            else:
                return Response(pre_sp_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
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

    def get(self, request, *args, **kwargs):
        pre_sp_id = kwargs.get('pk')  # URL parameter for trade ID
        
        if pre_sp_id:  # If `pk` is provided, retrieve a specific trade
            try:
                pre_sp = PreSalePurchase.objects.get(id=pre_sp_id)
            except PreSalePurchase.DoesNotExist:
                return Response({'detail': 'PreSalePurchase not found.'}, status=status.HTTP_404_NOT_FOUND)

            pre_sp_serializer = PreSalePurchaseSerializer(pre_sp)
            ack_pis = AcknowledgedPI.objects.filter(presalepurchase=pre_sp)
            ack_pos = AcknowledgedPO.objects.filter(presalepurchase=pre_sp)

            ack_pis_serializer = AcknowledgedPISerializer(ack_pis, many=True)
            ack_pos_serializer = AcknowledgedPOSerializer(ack_pos, many=True)

            response_data = pre_sp_serializer.data
            response_data['acknowledgedPI'] = ack_pis_serializer.data
            response_data['acknowledgedPO'] = ack_pos_serializer.data

            return Response(response_data)

        else:  # If `pk` is not provided, list all trades
            pre_sps = PreSalePurchase.objects.all()
            serializer = PreSalePurchaseSerializer(pre_sps, many=True)
            return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        data = request.data
        
        try:
            pre_sp = PreSalePurchase.objects.get(pk=pk)
        except PreSalePurchase.DoesNotExist:
            return Response({'error': 'PreSalePurchase not found'}, status=status.HTTP_404_NOT_FOUND)

        # Prepare trade data separately
        pre_sp_data = {
            'trn': 53,
            'date': data.get('date'),
            'doc_issuance_date': data.get('doc_issuance_date'),
            'payment_term': data.get('payment_term'),
            'advance_due_date': data.get('advance_due_date'),
            'lc_due_date': data.get('lc_due_date'),
            'remarks': data.get('remarks'),
        }

        acknowledged_pi_data = []
        acknowledged_po_data = []

        i = 0
        while f'acknowledgedPI[{i}].ackn_pi_name' in data:
            pi_data = {
                'ackn_pi_name': data.get(f'acknowledgedPI[{i}].ackn_pi_name'),
                'ackn_pi': data.get(f'acknowledgedPI[{i}].ackn_pi'),  # Handle binary data as needed
            }
            acknowledged_pi_data.append(pi_data)
            i += 1

        j = 0
        while f'acknowledgedPO[{j}].ackn_po_name' in data:
            po_data = {
                'ackn_po_name': data.get(f'acknowledgedPO[{j}].ackn_po_name'),
                'ackn_po': data.get(f'acknowledgedPO[{j}].ackn_po'),
            }
            acknowledged_po_data.append(po_data)
            j += 1
       
        with transaction.atomic():
            pre_sp_serializer = PreSalePurchaseSerializer(pre_sp, data=pre_sp_data, partial=True)
            if pre_sp_serializer.is_valid():
                pre_sp = pre_sp_serializer.save()
            else:
                return Response(pre_sp_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
           
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
            AcknowledgedPI.objects.filter(presalepurchase=pre_sp).delete()
            AcknowledgedPO.objects.filter(presalepurchase=pre_sp).delete()
            pre_sp.delete()

        return Response({'message': 'PreSalePurchase deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    
class AcknowledgedPIViewSet(viewsets.ModelViewSet):
    queryset = AcknowledgedPI.objects.all()
    serializer_class = AcknowledgedPISerializer

class AcknowledgedPOViewSet(viewsets.ModelViewSet):
    queryset = AcknowledgedPO.objects.all()
    serializer_class = AcknowledgedPOSerializer

class DocumentsRequiredViewSet(viewsets.ModelViewSet):
    queryset = DocumentsRequired.objects.all()
    serializer_class = DocumentsRequiredSerializer

class PrePaymentView(APIView):
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
            prepayments = PrePayment.objects.all()
            serializer = PrePaymentSerializer(prepayments, many=True)
            return Response(serializer.data)
    
    def post(self, request, *args, **kwargs):
        data = request.data
        # Prepare trade data separately
        prepayment_data = {
            'trn': 53,
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
            lc_copy_data = {
                'name': data.get(f'lcCopies[{i}].name'),
                'lc_copy': data.get(f'lcCopies[{i}].lc_copy'),  # Handle binary data as needed
            }
            lc_copies_data.append(lc_copy_data)
            i += 1

        j = 0
        while f'lcAmmendments[{j}].name' in data:
            lc_ammend_data = {
                'name': data.get(f'lcAmmendments[{j}].name'),
                'lc_ammendment': data.get(f'lcAmmendments[{j}].lc_ammendment'),
            }
            lc_ammendments_data.append(lc_ammend_data)
            j += 1
        
        k = 0
        while f'advanceTTCopies[{k}].name' in data:
            advance_tt_copies = {
                'name': data.get(f'advanceTTCopies[{k}].name'),
                'advance_tt_copy': data.get(f'advanceTTCopies[{k}].advance_tt_copy'),
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
            'trn': 53,
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
            lc_copy_data = {
                'name': data.get(f'lcCopies[{i}].name'),
                'lc_copy': data.get(f'lcCopies[{i}].lc_copy'),  # Handle binary data as needed
            }
            lc_copies_data.append(lc_copy_data)
            i += 1

        j = 0
        while f'lcAmmendments[{j}].name' in data:
            lc_ammend_data = {
                'name': data.get(f'lcAmmendments[{j}].name'),
                'lc_ammendment': data.get(f'lcAmmendments[{j}].lc_ammendment'),
            }
            lc_ammendments_data.append(lc_ammend_data)
            j += 1
        
        k = 0
        while f'advanceTTCopies[{j}].name' in data:
            advance_tt_copies = {
                'name': data.get(f'advanceTTCopies[{j}].name'),
                'advance_tt_copy': data.get(f'advanceTTCopies[{j}].advance_tt_copy'),
            }
            advance_tt_copies_data.append(advance_tt_copies)
            k += 1
       
        with transaction.atomic():
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

class SalesPurchaseView(APIView):
    def get(self, request, *args, **kwargs):
        sp_id = kwargs.get('pk')  # URL parameter for trade ID
        
        if sp_id:  # If `pk` is provided, retrieve a specific trade
            try:
                sp = SalesPurchase.objects.get(id=sp_id)
            except SalesPurchase.DoesNotExist:
                return Response({'detail': 'SalesPurchase not found.'}, status=status.HTTP_404_NOT_FOUND)

            sp_serializer = SalesPurchaseSerializer(sp)
            sp_extra_charges = SalesPurchaseExtraCharge.objects.filter(sp=sp)
            packing_list = PackingList.objects.filter(sp=sp)
            invoices = Invoice.objects.filter(sp=sp)
            coas = COA.objects.filter(sp=sp)
            bl_copies = BL_Copy.objects.filter(sp=sp)

            sp_extra_charges_serializer = SalesPurchaseExtraChargeSerializer(sp_extra_charges, many=True)
            packing_list_serializer = PackingListSerializer(packing_list, many=True)
            invoices_serializer = InvoiceSerializer(invoices, many=True)
            coas_serializer = COASerializer(coas, many=True)
            bl_copies_serializer = BL_CopySerializer(bl_copies, many=True)

            response_data = sp_serializer.data
            response_data['extraCharges'] = sp_extra_charges_serializer.data
            response_data['invoices'] = invoices_serializer.data
            response_data['coas'] = coas_serializer.data
            response_data['packingLists'] = packing_list_serializer.data
            response_data['blCopies'] = bl_copies_serializer.data

            return Response(response_data)

        else:  # If `pk` is not provided, list all trades
            sps = SalesPurchase.objects.all()
            serializer = SalesPurchaseSerializer(sps, many=True)
            return Response(serializer.data)
    
    def post(self, request, *args, **kwargs):
        data = request.data
        # Prepare trade data separately
        sp_data = {
            'trn': 53,
            'invoice_date': data.get('invoice_date'),
            'invoice_number': data.get('invoice_number'),
            'invoice_amount': data.get('invoice_amount'),
            'commission_value': data.get('commission_value'),
            'bl_number': data.get('bl_number'),
            'bl_qty': data.get('bl_qty'),
            'bl_fees': data.get('bl_fees'),
            'bl_collection_cost': data.get('bl_collection_cost'),
            'bl_date': data.get('bl_date'),
            'total_packing_cost': data.get('total_packing_cost'),
            'packaging_supplier': data.get('packaging_supplier'),
            'logistic_supplier': data.get('logistic_supplier'),
            'batch_number': data.get('batch_number'),
            'production_date': data.get('production_date'),
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

        sp_extra_charges_data = []
        packing_list_data = []
        invoices_data = []
        coas_data = []
        bl_copies_data = []

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
                'packing_list': data.get(f'packingLists[{j}].packing_list'),
            }
            packing_list_data.append(packing_lists)
            j += 1
        
        k = 0
        while f'blCopies[{k}].name' in data:
            bl_copy_data = {
                'name': data.get(f'blCopies[{k}].name'),
                'bl_copy': data.get(f'blCopies[{k}].bl_copy'),
            }
            bl_copies_data.append(bl_copy_data)
            k += 1
        
        l = 0
        while f'invoices[{l}].name' in data:
            invoice_data = {
                'name': data.get(f'invoices[{l}].name'),
                'invoice': data.get(f'invoices[{l}].invoice'),
            }
            invoices_data.append(invoice_data)
            l += 1
        
        m = 0
        while f'coas[{m}].name' in data:
            coa_data = {
                'name': data.get(f'coas[{m}].name'),
                'coa': data.get(f'coas[{m}].coa'),
            }
            coas_data.append(coa_data)
            m += 1

        with transaction.atomic():
            sp_serializer = SalesPurchaseSerializer(data=sp_data)
            if sp_serializer.is_valid():
                sp = sp_serializer.save()
            else:
                return Response(sp_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
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
            
            if invoices_data:
                try:
                    invoices = [Invoice(**item, sp=sp) for item in invoices_data]
                    Invoice.objects.bulk_create(invoices)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
            if coas_data:
                try:
                    coas = [COA(**item, sp=sp) for item in coas_data]
                    COA.objects.bulk_create(coas)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
            if bl_copies_data:
                try:
                    bl_copies = [BL_Copy(**item, sp=sp) for item in bl_copies_data]
                    BL_Copy.objects.bulk_create(bl_copies)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

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
            'trn': 53,
            'invoice_date': data.get('invoice_date'),
            'invoice_number': data.get('invoice_number'),
            'invoice_amount': data.get('invoice_amount'),
            'commission_value': data.get('commission_value'),
            'bl_number': data.get('bl_number'),
            'bl_qty': data.get('bl_qty'),
            'bl_fees': data.get('bl_fees'),
            'bl_collection_cost': data.get('bl_collection_cost'),
            'bl_date': data.get('bl_date'),
            'total_packing_cost': data.get('total_packing_cost'),
            'packaging_supplier': data.get('packaging_supplier'),
            'logistic_supplier': data.get('logistic_supplier'),
            'batch_number': data.get('batch_number'),
            'production_date': data.get('production_date'),
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

        sp_extra_charges_data = []
        packing_list_data = []
        invoices_data = []
        coas_data = []
        bl_copies_data = []


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
                'packing_list': data.get(f'packingLists[{j}].packing_list'),
            }
            packing_list_data.append(packing_lists)
            j += 1
        
        k = 0
        while f'blCopies[{k}].name' in data:
            bl_copy_data = {
                'name': data.get(f'blCopies[{k}].name'),
                'bl_copy': data.get(f'blCopies[{k}].bl_copy'),
            }
            bl_copies_data.append(bl_copy_data)
            k += 1
        
        l = 0
        while f'invoices[{l}].name' in data:
            invoice_data = {
                'name': data.get(f'invoices[{l}].name'),
                'invoice': data.get(f'invoices[{l}].invoice'),
            }
            invoices_data.append(invoice_data)
            l += 1
        
        m = 0
        while f'coas[{m}].name' in data:
            coa_data = {
                'name': data.get(f'coas[{m}].name'),
                'coa': data.get(f'coas[{m}].coa'),
            }
            coas_data.append(coa_data)
            m += 1
       
        with transaction.atomic():
            sp_serializer = SalesPurchaseSerializer(sp, data=sp_data, partial=True)
            if sp_serializer.is_valid():
                sp = sp_serializer.save()
            else:
                return Response(sp_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
           
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
            
            if invoices_data:
                # Clear existing trade extra costs and add new ones
                Invoice.objects.filter(sp=sp).delete()
                try:
                    invoices = [Invoice(**item, sp=sp) for item in invoices_data]
                    Invoice.objects.bulk_create(invoices)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

            if coas_data:
                # Clear existing trade extra costs and add new ones
                COA.objects.filter(sp=sp).delete()
                try:
                    coas = [COA(**item, sp=sp) for item in coas_data]
                    COA.objects.bulk_create(coas)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
                
            if bl_copies_data:
                # Clear existing trade extra costs and add new ones
                BL_Copy.objects.filter(sp=sp).delete()
                try:
                    bl_copies = [BL_Copy(**item, sp=sp) for item in bl_copies_data]
                    BL_Copy.objects.bulk_create(bl_copies)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(sp_serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
        pk = kwargs.get('pk')

        try:
            sp = SalesPurchase.objects.get(pk=pk)
        except SalesPurchase.DoesNotExist:
            return Response({'error': 'SalesPurchase not found'}, status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            # Delete related trade products and extra costs
            SalesPurchaseExtraCharge.objects.filter(sp=sp).delete()
            PackingList.objects.filter(sp=sp).delete()
            BL_Copy.objects.filter(sp=sp).delete()
            Invoice.objects.filter(sp=sp).delete()
            COA.objects.filter(sp=sp).delete()
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

class PaymentFinanceView(APIView):
    def get(self, request, *args, **kwargs):
        pf_id = kwargs.get('pk')  # URL parameter for trade ID
        
        if pf_id:  # If `pk` is provided, retrieve a specific trade
            try:
                pf = PaymentFinance.objects.get(id=pf_id)
            except PaymentFinance.DoesNotExist:
                return Response({'detail': 'PaymentFinance not found.'}, status=status.HTTP_404_NOT_FOUND)

            pf_serializer = PaymentFinanceSerializer(pf)
            tt_copies = TTCopy.objects.filter(payment_finance=pf)
           

            tt_copies_serializer = TTCopySerializer(tt_copies, many=True)
            

            response_data = pf_serializer.data
            response_data['ttCopies'] = tt_copies_serializer.data
            return Response(response_data)

        else:  # If `pk` is not provided, list all trades
            pfs = PaymentFinance.objects.all()
            serializer = PaymentFinanceSerializer(pfs, many=True)
            return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        data = request.data
        # Prepare trade data separately
        pf_data = {
            'trn': 53,
            'batch_number': data.get('batch_number'),
            'production_date': data.get('production_date'),
            'balance_payment': data.get('balance_payment'),
            'balance_payment_received': data.get('balance_payment_received'),
            'balance_paymnet_made': data.get('balance_paymnet_made'),
            'net_due_in_this_trade': data.get('net_due_in_this_trade'),
            'payment_mode': data.get('payment_mode'),
            'status_of_payment': data.get('status_of_payment'),
            'logistic_cost': data.get('logistic_cost'),
            'commission_agent_value': data.get('commission_agent_value'),
            'bl_fee': data.get('bl_fee'),
            'bl_collection_cost': data.get('bl_collection_cost'),
            'shipment_status': data.get('shipment_status'),
            'release_docs': data.get('release_docs'),
            'release_docs_date': data.get('release_docs_date'),
            'remarks': data.get('remarks'),
        }

        tt_copies_data = []

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
            'trn': 53,
            'batch_number': data.get('batch_number'),
            'production_date': data.get('production_date'),
            'balance_payment': data.get('balance_payment'),
            'balance_payment_received': data.get('balance_payment_received'),
            'balance_paymnet_made': data.get('balance_paymnet_made'),
            'net_due_in_this_trade': data.get('net_due_in_this_trade'),
            'payment_mode': data.get('payment_mode'),
            'status_of_payment': data.get('status_of_payment'),
            'logistic_cost': data.get('logistic_cost'),
            'commission_agent_value': data.get('commission_agent_value'),
            'bl_fee': data.get('bl_fee'),
            'bl_collection_cost': data.get('bl_collection_cost'),
            'shipment_status': data.get('shipment_status'),
            'release_docs': data.get('release_docs'),
            'release_docs_date': data.get('release_docs_date'),
            'remarks': data.get('remarks'),
        }

        tt_copies_data = []

        i = 0
        while f'ttCopies[{i}].name' in data:
            tt_copy_data = {
                'name': data.get(f'ttCopies[{i}].name'),
                'tt_copy': data.get(f'ttCopies[{i}].tt_copy'),  # Handle binary data as needed
            }
            tt_copies_data.append(tt_copy_data)
            i += 1
       
        with transaction.atomic():
            pf_serializer = PaymentFinanceSerializer(pf, data=pf_data, partial=True)
            if pf_serializer.is_valid():
                pf = pf_serializer.save()
            else:
                return Response(pf_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
           
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
            TTCopy.objects.filter(payment_finance=pf).delete()
            pf.delete()

        return Response({'message': 'PaymentFinance deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

class TTCopyViewSet(viewsets.ModelViewSet):
    queryset = TTCopy.objects.all()
    serializer_class = TTCopySerializer