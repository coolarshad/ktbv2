from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse
import pandas as pd
from trademgt.models import *
from trademgt.serializers import *
from . import helper


def fmt_2dec(val):
    if val is None or val == '' or val == 'N/A':
        return 'N/A'
    try:
        return f"{float(val):.2f}"
    except (ValueError, TypeError):
        return str(val)


def fmt_4dec(val):
    if val is None or val == '' or val == 'N/A':
        return 'N/A'
    try:
        return f"{float(val):.4f}"
    except (ValueError, TypeError):
        return str(val)


class ExportTradeCheckView(APIView):
    def get(self, request, *args, **kwargs):
        # products = TradeProduct.objects.all()
        # serializer = ExcelTradeProductSerializer(products, many=True)
        objs = PaymentFinance.objects.all()
        serializer = PaymentFinanceSerializer(objs, many=True)
        return Response(serializer.data)
    
class ExportTradeExcelView(APIView):
    def get(self, request, *args, **kwargs):
        from accounts.mixins import get_authorized_queryset
        from trademgt.filters import TradeFilter

        trades_qs = get_authorized_queryset(request, Trade.objects.all())
        filterset = TradeFilter(request.GET, queryset=trades_qs)
        
        if filterset.is_valid():
            trades = filterset.qs
        else:
            trades = filterset.queryset

        tradeProducts = TradeProduct.objects.filter(trade__in=trades).order_by('-trade__id', 'id')
        serializer = ExcelTradeProductSerializer(tradeProducts, many=True)
        data = self.prepare_excel_data(serializer.data)
        
        df = pd.DataFrame(data)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="trades.xlsx"'
        df.to_excel(response, index=False)

        return response

    def prepare_excel_data(self, serialized_data):
        excel_data = []
        for trade in serialized_data:

            trade_data = {
                'Company': trade['trade']['companyName']['name'],
                'Trd': trade['trade']['trd'],
                'Trn': trade['trade']['trn'],
                'Trade type': trade['trade']['trade_type'],
                'Trade category': trade['trade']['trade_category'],
                'Country of origin': trade['trade']['country_of_origin'],
                'customer company name': trade['trade']['customer']['name'],
                'Address': trade['trade']['address'],
                'Currency selection': trade['trade']['currency']['name'],
                'Exchange rate': fmt_2dec(trade['trade']['exchange_rate']),
                'Commission agent': trade['trade']['commission_agent'],
                'contract_value': fmt_2dec(trade['trade']['contract_value']),
                'payment_term': trade['trade']['paymentTerm']['name'],
                'advance_value_to_receive': fmt_2dec(trade['trade']['advance_value_to_receive']),
                'commission_value': fmt_2dec(trade['trade']['commission_value']),
                'logistic_provider': trade['trade']['logistic_provider'],
                'estimated_logistic_cost': fmt_2dec(trade['trade']['estimated_logistic_cost']),
                'logistic_cost_tolerence': fmt_2dec(trade['trade']['logistic_cost_tolerence']),
                # 'logistic_cost_remarks': trade['trade']['logistic_cost_remarks'],
                'bank_name_address': trade['trade']['bank']['name'],
                'account_number': trade['trade']['account_number'],
                'swift_code': trade['trade']['swift_code'],
                'incoterm': trade['trade']['incoterm'],
                'pod': trade['trade']['pod'],
                'pol': trade['trade']['pol'],
                'eta': trade['trade']['eta'],
                'etd': trade['trade']['etd'],
                'remarks': trade['trade']['remarks'],
                'trader_name': trade['trade']['trader_name'],
                'insurance_policy_number': trade['trade']['insurance_policy_number'],
                'shipper_in_bl': trade['trade']['shipper_in_bl'],
                'consignee_in_bl': trade['trade']['consignee_in_bl'],
                'notify_party_in_bl': trade['trade']['notify_party_in_bl'],
                'bl_fee': fmt_2dec(trade['trade']['bl_fee']),
                'bl_fee_remarks': trade['trade']['bl_fee_remarks'],
                'approved': trade['trade']['approved'],
                'reviewed': trade['trade']['reviewed'],
                'approval_date': trade['trade']['approval_date'],
                'approved_by': trade['trade']['approved_by'],
                'reviewed_by': trade['trade']['reviewed_by'],
                'product_code': trade['product_code'],
                'product_name': trade['productName']['name'],
                'product_name_for_client': trade['product_name_for_client'],
                'loi': trade['loi'],
                'hs_code': trade['hs_code'],
                'total_contract_qty': fmt_4dec(trade['total_contract_qty']),
                'total_contract_qty_unit': trade['total_contract_qty_unit'],
                'tolerance': fmt_2dec(trade['tolerance']),
                'contract_balance_qty': fmt_4dec(trade['contract_balance_qty']),
                'contract_balance_qty_unit': trade['contract_balance_qty_unit'],
                'trade_qty': fmt_4dec(trade['trade_qty']),
                'trade_qty_unit': trade['trade_qty_unit'],
                'selected_currency_rate': fmt_2dec(trade['selected_currency_rate']),
                'rate_in_usd': fmt_2dec(trade['rate_in_usd']),
                'product_value': fmt_2dec(trade['product_value']),
                'markings_in_packaging': trade['markings_in_packaging'],
                'packaging_supplier': trade['supplier']['name'],
                'mode_of_packing': trade['packing']['name'],
                'rate_of_each_packing': fmt_2dec(trade['rate_of_each_packing']),
                'qty_of_packing': fmt_4dec(trade['qty_of_packing']),
                'total_packing_cost': fmt_2dec(trade['total_packing_cost']),
                'commission_rate': fmt_2dec(trade['commission_rate']),

                'total_commission': fmt_2dec(trade['total_commission']),
                # 'ref_type': trade['ref_type'],
                'ref_product_code': trade['ref_product_code'],
                'ref_trn': trade['ref_trn'],
                'container_shipment_size': trade['shipmentSize']['name'],
               
                # Include any other trade fields you want
            }
            trade_extra_costs = trade.get('trade', {}).get('trade_extra_costs', [])
            max_extras = len(trade_extra_costs)

            for i in range(max_extras):
                extra = trade_extra_costs[i]
                trade_data[f'extra_cost_remarks {i+1}'] = extra.get('extra_cost_remarks', '')
                trade_data[f'extra_cost {i+1}'] = fmt_2dec(extra.get('extra_cost', ''))
               
            excel_data.append(trade_data)
        
        return excel_data



class ExportPreSPExcelView(APIView):
    def get(self, request, *args, **kwargs):
        objs = PreSalePurchase.objects.all()
        serializer = PreSalePurchaseSerializer(objs, many=True)
        data = self.prepare_excel_data(serializer.data)
        
        df = pd.DataFrame(data)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="presalespurchase.xlsx"'
        df.to_excel(response, index=False)

        return response

    def prepare_excel_data(self, serialized_data):
        excel_data = []
        for obj in serialized_data:

            obj_data = {
                'TRN':obj['trade']['trn'],
                'Date':obj['date'],
                'Document Issuance Date':obj['doc_issuance_date'],
                'Trade Type': obj['trade']['trade_type'],
                'Company': obj['trade']['companyName']['name'],
                'Country of Origin': obj['trade']['country_of_origin'],
                'Customer Company Name': obj['trade']['customer']['name'],
                'Address': obj['trade']['address'],
                'Payment Term': obj['trade']['paymentTerm']['name'],
                'Advance/LC Due Date': obj['trade']['companyName']['name'],
                'Bank Name Address': obj['trade']['bank']['name'],
                'Account Number': obj['trade']['account_number'],
                'SWIFT Code': obj['trade']['swift_code'],
                'Incoterm': obj['trade']['incoterm'],
                'POD': obj['trade']['pod'],
                'POL': obj['trade']['pol'],
                'ETA': obj['trade']['eta'],
                'ETD': obj['trade']['etd'],
                'Trader Name': obj['trade']['trader_name'],
                'Insurance Policy Number': obj['trade']['insurance_policy_number'],
                'Trade Remarks': obj['trade']['remarks'],
                'PreSP Remarks': obj['remarks'],
               
               
               
                # Include any other trade fields you want
            }
                
            excel_data.append(obj_data)
        
        return excel_data
    

class ExportPrePayExcelView(APIView):
    def get(self, request, *args, **kwargs):
        objs = PrePayment.objects.all()
        serializer = PrePaymentSerializer(objs, many=True)
        data = self.prepare_excel_data(serializer.data)
       
        df = pd.DataFrame(data)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="prepayment.xlsx"'
        df.to_excel(response, index=False)

        return response

    def prepare_excel_data(self, serialized_data):
        excel_data = []
        for obj in serialized_data:

            obj_data = {
                'TRN':obj['trn']['trn'],
                'PO Date/PI Date':obj['presp']['doc_issuance_date'],
                'Trade Type': obj['trn']['trade_type'],
                'Payment Term': obj['trn']['paymentTerm']['name'],
                'Customer Company Name': obj['trn']['customer']['name'],
                'Value of Contract': fmt_2dec(obj['trn']['contract_value']),
                
                'Advance to Pay': obj['trn']['companyName']['name'],
                'Advance to Receive': obj['trn']['country_of_origin'],
                'Advance Due Date': obj['trn']['customer']['name'],
                'Trader Name': obj['trn']['trader_name'],
                'Insurance Policy Number': obj['trn']['insurance_policy_number'],
                
                'LC Number': obj['lc_number'],
                'LC Opening Bank': obj['lc_opening_bank'],
                'Advance Received': fmt_2dec(obj['advance_received']),
                'Date of Receipt': obj['date_of_receipt'],
                'Advance Paid': fmt_2dec(obj['advance_paid']),
                'Date of Payment': obj['date_of_payment'],
                'LC Expiry Date': obj['lc_expiry_date'],
                'Latest Shipment Date in LC': obj['latest_shipment_date_in_lc'],
                'Remarks': obj['remarks'],
                'Reviewed': obj['reviewed'],
              
                # Include any other trade fields you want
            }
                
            excel_data.append(obj_data)
        
        return excel_data
    

class ExportSPExcelView(APIView):
    def get(self, request, *args, **kwargs):
        objs = SalesPurchaseProduct.objects.all()
        serializer = ExcelSalesPurchaseProductSerializer(objs, many=True)
        data = self.prepare_excel_data(serializer.data)
       
        df = pd.DataFrame(data)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="salespurchase.xlsx"'
        df.to_excel(response, index=False)

        return response

    def prepare_excel_data(self, serialized_data):
        excel_data = []
        for obj in serialized_data:
           
                obj_data = {
                'TRN':obj['sp']['trn']['trn'],
                'Trade Type': obj['sp']['trn']['trade_type'],
                'Customer Company Name': obj['sp']['trn']['customer']['name'],
                'Trader Name': obj['sp']['trn']['trader_name'],
                'Insurance Policy Number': obj['sp']['trn']['insurance_policy_number'],
                
                'LC Details':obj['sp']['prepayment']['lc_number'],
                'Commission Agent': obj['sp']['trn']['commission_agent'],
                'Commission Value': fmt_2dec(helper.calculate_sp_commission_value(obj,obj['sp']['trn']['trade_products'])),
                'Logistic Provider': obj['sp']['trn']['logistic_provider'],
              
                
                'Invoice Date': obj['sp']['invoice_date'],
                'Invoice Number': obj['sp']['invoice_number'],
                'Invoice Amount': fmt_2dec(obj['sp']['invoice_amount']),
                'BL Number': obj['sp']['bl_number'],
                'BL Fees': fmt_2dec(obj['sp']['bl_fees']),
                'BL Collection Cost': fmt_2dec(obj['sp']['bl_collection_cost']),
                'BL Date': obj['sp']['bl_date'],
                'Logistic Cost': fmt_2dec(obj['sp']['logistic_cost']),
                'Logistic Cost Due Date': obj['sp']['logistic_cost_due_date'],
                'Liner': obj['sp']['liner'],
                'POD': obj['sp']['pod'],
                'POL': obj['sp']['pol'],
                'ETD': obj['sp']['etd'],
                'ETA': obj['sp']['eta'],
                'Shipment Status': obj['sp']['shipment_status'],
                'Remarks': obj['sp']['remarks'],
              

                'Product Name': obj['productName']['name'],
                'Product Code': obj['product_code'],
                'HS Code': obj['hs_code'],
                'Batch Number': obj['batch_number'],
                'Production Date': obj['production_date'],
                'BL Quantity': fmt_4dec(obj['bl_qty']),
                'Trade Qty Unit': obj['trade_qty_unit'],
                'Selected Currency Rate': fmt_2dec(obj['selected_currency_rate']),
                'Rate in USD': fmt_2dec(obj['rate_in_usd']),
                'Product Value': fmt_2dec(obj['bl_value']),

                'Reviewed': obj['sp']['reviewed'],
              
                # Include any other trade fields you want
                }
                
                excel_data.append(obj_data)
        
        return excel_data
    


class ExportPaymentFinanceExcelView(APIView):
    def get(self, request, *args, **kwargs):
        objs = PaymentFinance.objects.all()
        serializer = PaymentFinanceSerializer(objs, many=True)
        data = self.prepare_excel_data(serializer.data)
       
        df = pd.DataFrame(data)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="payment_finance.xlsx"'
        df.to_excel(response, index=False)

        return response

    def prepare_excel_data(self, serialized_data):
        excel_data = []
        for obj in serialized_data:
            inv_amt = float(obj.get('sp', {}).get('invoice_amount') or 0.0)
            adv_rec = float(obj.get('sp', {}).get('prepayment', {}).get('advance_received') or 0.0)
            adv_paid = float(obj.get('sp', {}).get('prepayment', {}).get('advance_paid') or 0.0)
            bal_pay = inv_amt - adv_rec - adv_paid

            obj_data = {
                'TRN':obj['sp']['trn']['trn'],
                'SP ID':obj['sp']['id'],
                'Trade Type': obj['sp']['trn']['trade_type'],
                'Payment Term': obj['sp']['trn']['paymentTerm']['name'],
                'Customer Company Name': obj['sp']['trn']['customer']['name'],
                'Trader Name': obj['sp']['trn']['trader_name'],
                'Insurance Policy Number': obj['sp']['trn']['insurance_policy_number'],

                'Invoice Amount': fmt_2dec(obj['sp']['invoice_amount']),
                'Invoice Number': obj['sp']['invoice_number'],
                'Invoice Date': obj['sp']['invoice_date'],
                'BL Number': obj['sp']['bl_number'],
                'Advance Received': fmt_2dec(obj['sp']['prepayment']['advance_received']),
                'Advance Paid': fmt_2dec(obj['sp']['prepayment']['advance_paid']),
                'Advance Received Date': obj['sp']['prepayment']['date_of_receipt'],
                'Advance Paid Date': obj['sp']['prepayment']['date_of_payment'],
                'Balance Payment': fmt_2dec(bal_pay),
                'Balance Payment Due Date': obj['sp']['bl_date'],
                'Logistic Cost': fmt_2dec(obj['sp']['logistic_cost']),
                'Logistic Provider': obj['sp']['trn']['logistic_provider'],
                'Logistic Cost Due Date': obj['sp']['logistic_cost_due_date'],

                
                'Commission Agent': obj['sp']['trn']['commission_agent'],
                'Commission Value': fmt_2dec(helper.calculate_pf_commission_value(obj['sp']['sp_product'],obj['sp']['trn']['trade_products'])),
                'BL Fees': fmt_2dec(obj['sp']['bl_fees']),
                'BL Collection Cost': fmt_2dec(obj['sp']['bl_collection_cost']),
                'Shipment Status': obj['sp']['shipment_status'],
                
                
                'Remarks from S&P': obj['sp']['remarks'],

                'Advance Adjusted': fmt_2dec(obj['advance_adjusted']),
                'Balance Payment Received': fmt_2dec(obj['balance_payment_received']),
                'Balance Payment Made': fmt_2dec(obj['balance_payment_made']),
                'Balance Payment Date': obj['balance_payment_date'],
                'Net Due in This Trade': fmt_2dec(obj['net_due_in_this_trade']),
                'Status of Payment': obj['status_of_payment'],
                'Release Docs': obj['release_docs'],
                'Release Docs Date': obj['release_docs_date'],
                'Remarks': obj['remarks'],
                'Reviewed': obj['reviewed'],
              
                # Include any other trade fields you want
            }
                
            excel_data.append(obj_data)
        
        return excel_data
    


class ExportPLExcelView(APIView):
    def get(self, request, *args, **kwargs):
        objs = PL.objects.all()
        serializer = ProfitLossSerializer(objs, many=True)
        data = self.prepare_excel_data(serializer.data)
       
        df = pd.DataFrame(data)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="profit_loss.xlsx"'
        df.to_excel(response, index=False)

        return response

    def prepare_excel_data(self, serialized_data):
        excel_data = []
        for obj in serialized_data:

            obj_data = {
                'Sales Company': obj['salesPF']['sp']['trn']['companyName']['name'],
                'Sales Trade Reference Date': obj['salesPF']['sp']['trn']['trd'],
                'Sales Trade Reference Number': obj['salesPF']['sp']['trn']['trn'],
                'Sales Trader Name': obj['salesPF']['sp']['trn']['trader_name'],
                'Sales Insurrance policy number': obj['salesPF']['sp']['trn']['insurance_policy_number'],
                'Sales Customer Company Name in Full Detail': obj['salesPF']['sp']['trn']['customer']['name'],
                'Sales Commission Agent': obj['salesPF']['sp']['trn']['commission_agent'],
                'Sales Logistic Provider': obj['salesPF']['sp']['trn']['logistic_provider'],
                'Sales Total Packing cost(Sum)': obj['salesPF']['sp']['id'],
                'Sales Invoice Date': obj['salesPF']['sp']['invoice_date'],
                'Sales Invoice Number': obj['salesPF']['sp']['invoice_number'],
                'Sales Invoice Amount': fmt_2dec(obj['salesPF']['sp']['invoice_amount']),
                'Sales COMMISSION VALUE': obj['salesPF']['sp']['id'],
                'Sales BL Number': obj['salesPF']['sp']['bl_number'],
                'Sales BL FEES': fmt_2dec(obj['salesPF']['sp']['bl_fees']),
                'Sales BL COLLECTION COST': fmt_2dec(obj['salesPF']['sp']['bl_collection_cost']),
                'Sales OTHER CHARGES': obj['salesPF']['sp']['id'],
                'Sales BL Date': obj['salesPF']['sp']['bl_date'],
                'Sales Logitics Cost': fmt_2dec(obj['salesPF']['sp']['logistic_cost']),
                'Sales CHARGES P & F': obj['salesPF']['sp']['id'],
                'Sales Total Income': fmt_2dec(obj['salesPF']['sp']['invoice_amount']),

                'Purchase Company': obj['purchasePF']['sp']['trn']['companyName']['name'],
                'Purchase Trade Reference Date': obj['purchasePF']['sp']['trn']['trd'],
                'Purchase Trade Reference Number': obj['purchasePF']['sp']['trn']['trn'],
                'Purchase Trader Name': obj['purchasePF']['sp']['trn']['trader_name'],
                'Purchase Insurrance policy number': obj['purchasePF']['sp']['trn']['insurance_policy_number'],
                'Purchase Customer Company Name in Full Detail': obj['purchasePF']['sp']['trn']['customer']['name'],
                'Purchase Commission Agent': obj['purchasePF']['sp']['trn']['commission_agent'],
                'Purchase Logistic Provider': obj['purchasePF']['sp']['trn']['logistic_provider'],
                'Purchase Total Packing cost(Sum)': obj['purchasePF']['sp']['id'],
                'Purchase Invoice Date': obj['purchasePF']['sp']['invoice_date'],
                'Purchase Invoice Number': obj['purchasePF']['sp']['invoice_number'],
                'Purchase Invoice Amount': fmt_2dec(obj['purchasePF']['sp']['invoice_amount']),
                'Purchase COMMISSION VALUE': obj['purchasePF']['sp']['id'],
                'Purchase BL Number': obj['purchasePF']['sp']['bl_number'],
                'Purchase BL FEES': fmt_2dec(obj['purchasePF']['sp']['bl_fees']),
                'Purchase BL COLLECTION COST': fmt_2dec(obj['purchasePF']['sp']['bl_collection_cost']),
                'Purchase OTHER CHARGES': obj['purchasePF']['sp']['id'],
                'Purchase BL Date': obj['purchasePF']['sp']['bl_date'],
                'Purchase Logitics Cost': fmt_2dec(obj['purchasePF']['sp']['logistic_cost']),
                'Purchase CHARGES P & F': obj['purchasePF']['sp']['id'],
                'Purchase Total Expense': fmt_2dec(obj['purchasePF']['sp']['invoice_amount']),
            }

                
            excel_data.append(obj_data)
        
        return excel_data
    

class ExportKycExcelView(APIView):
    def get(self, request, *args, **kwargs):
        tradeProducts = Kyc.objects.all()
        serializer = KycSerializer(tradeProducts, many=True)
        data = self.prepare_excel_data(serializer.data)
       
        df = pd.DataFrame(data)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="KYC_export.xlsx"'
        df.to_excel(response, index=False)

        return response

    # def prepare_excel_data(self, serialized_data):
    #     excel_data = []
    #     for obj in serialized_data:

    #         trade_data = {
    #             'Date': obj['date'],
    #             'Name': obj['name'],
    #             'Company Reg.No': obj['companyRegNo'],
    #             'Reg Address': obj['regAddress'],
    #             'Mailing Address': obj['mailingAddress'],
    #             'Telephone': obj['telephone'],
    #             'Fax': obj['fax'],
    #             'Person 1': obj['person1'],
    #             'Designation 1': obj['designation1'],
    #             'Mobile 1': obj['mobile1'],
    #             'Email 1': obj['email1'],
    #             'Person 2': obj['person2'],
    #             'Designation 2': obj['designation2'],
    #             'Mobile 2': obj['mobile2'],
    #             'Email 2': obj['email2'],
    #             'Banker': obj['banker'],
    #             'Address': obj['address'],
    #             'Swift Code': obj['swiftCode'],
    #             'Account Number': obj['accountNumber'],
    #             'Approve 1': obj['approve1'],
    #             'Approve 2': obj['approve2'],
               
    #             # Include any other trade fields you want
    #         }
                
    #         excel_data.append(trade_data)
        
    #     return excel_data
    def prepare_excel_data(self, serialized_data):
        excel_data = []
        max_banks = 3  # Max number of bank details to include columns for

        for obj in serialized_data:
            trade_data = {
            'Date': obj['date'],
            'Name': obj['name'],
            'Company Reg.No': obj['companyRegNo'],
            'Reg Address': obj['regAddress'],
            'Mailing Address': obj['mailingAddress'],
            'Telephone': obj['telephone'],
            'Fax': obj['fax'],
            'Person 1': obj['person1'],
            'Designation 1': obj['designation1'],
            'Mobile 1': obj['mobile1'],
            'Email 1': obj['email1'],
            'Person 2': obj['person2'],
            'Designation 2': obj['designation2'],
            'Mobile 2': obj['mobile2'],
            'Email 2': obj['email2'],
            'Approve 1': obj['approve1'],
            'Approve 2': obj['approve2'],
            }

            # Fill in bank details
            bank_details = obj.get('bank_details', [])
            for i in range(max_banks):
                if i < len(bank_details):
                    bank = bank_details[i]
                    trade_data[f'Banker {i+1}'] = bank.get('banker', '')
                    trade_data[f'Address {i+1}'] = bank.get('address', '')
                    trade_data[f'Swift Code {i+1}'] = bank.get('swiftCode', '')
                    trade_data[f'Account Number {i+1}'] = bank.get('accountNumber', '')
                # else:
                #     trade_data[f'Banker {i+1}'] = ''
                #     trade_data[f'Address {i+1}'] = ''
                #     trade_data[f'Swift Code {i+1}'] = ''
                #     trade_data[f'Account Number {i+1}'] = ''

            excel_data.append(trade_data)

        return excel_data

class ExportConsumptionExcelView(APIView):
    def get(self, request, *args, **kwargs):
        from costmgt.models import Consumption
        from costmgt.serializers import ConsumptionSerializer
        from costmgt.filters import ConsumptionFilter
        from accounts.mixins import get_authorized_queryset

        queryset = get_authorized_queryset(request, Consumption.objects.all())
        filterset = ConsumptionFilter(request.GET, queryset=queryset)
        objs = filterset.qs if filterset.is_valid() else queryset
        serializer = ConsumptionSerializer(objs, many=True)
        data = self.prepare_excel_data(serializer.data)
       
        df = pd.DataFrame(data)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="consumption.xlsx"'
        df.to_excel(response, index=False)

        return response

    def prepare_excel_data(self, serialized_data):
        excel_data = []
        
        # Find maximum number of additives and base oils
        max_additives = 0
        max_baseoils = 0
        for obj in serialized_data:
            num_additives = len(obj.get('additives', []))
            num_baseoils = len(obj.get('baseoil', []))
            if num_additives > max_additives:
                max_additives = num_additives
            if num_baseoils > max_baseoils:
                max_baseoils = num_baseoils

        for obj in serialized_data:
            trade_data = {
                'Formula Ref': obj.get('formula', {}).get('ref', '') if obj.get('formula') else '',
                'Name': obj.get('formula', {}).get('name', '') if obj.get('formula') else '',
                'Batch Number': obj.get('batch', ''),
                'Date': obj.get('date', ''),
                'Grade': obj.get('grade', ''),
                'SAE': obj.get('sae', ''),
                'Net Blending Qty': obj.get('net_blending_qty', ''),
                'Gross Vol Crosscheck': obj.get('gross_vol_crosscheck', ''),
                'Cross Check': obj.get('cross_check', ''),
                'Total Value': obj.get('total_value', ''),
                'Per Litre Cost': obj.get('per_litre_cost', ''),
                'Supplier Address': obj.get('supplier_address', ''),
                'Remarks': obj.get('remarks', ''),
                'Approved': 'Yes' if obj.get('approved') else 'No',
            }

            additives = obj.get('additives', [])
            for i in range(max_additives):
                if i < len(additives):
                    extra = additives[i]
                    trade_data[f'Additive {i+1} Name'] = extra.get('additive', {}).get('name', '') if extra.get('additive') else ''
                    trade_data[f'Additive {i+1} Subname'] = extra.get('additive_subname', {}).get('subname_name', '') if extra.get('additive_subname') else ''
                    trade_data[f'Additive {i+1} Rate'] = extra.get('rate', '')
                    trade_data[f'Additive {i+1} Qty %'] = extra.get('qty_in_percent', '')
                    trade_data[f'Additive {i+1} Qty Ltr'] = extra.get('qty_in_litre', '')
                    trade_data[f'Additive {i+1} Value'] = extra.get('value', '')
                else:
                    trade_data[f'Additive {i+1} Name'] = ''
                    trade_data[f'Additive {i+1} Subname'] = ''
                    trade_data[f'Additive {i+1} Rate'] = ''
                    trade_data[f'Additive {i+1} Qty %'] = ''
                    trade_data[f'Additive {i+1} Qty Ltr'] = ''
                    trade_data[f'Additive {i+1} Value'] = ''

            baseoils = obj.get('baseoil', [])
            for i in range(max_baseoils):
                if i < len(baseoils):
                    extra = baseoils[i]
                    trade_data[f'BaseOil {i+1} Name'] = extra.get('raw', {}).get('name', '') if extra.get('raw') else ''
                    trade_data[f'BaseOil {i+1} Subname'] = extra.get('raw_subname', {}).get('subname_name', '') if extra.get('raw_subname') else ''
                    trade_data[f'BaseOil {i+1} Rate'] = extra.get('rate', '')
                    trade_data[f'BaseOil {i+1} Qty %'] = extra.get('qty_in_percent', '')
                    trade_data[f'BaseOil {i+1} Qty Ltr'] = extra.get('qty_in_litre', '')
                    trade_data[f'BaseOil {i+1} Value'] = extra.get('value', '')
                else:
                    trade_data[f'BaseOil {i+1} Name'] = ''
                    trade_data[f'BaseOil {i+1} Subname'] = ''
                    trade_data[f'BaseOil {i+1} Rate'] = ''
                    trade_data[f'BaseOil {i+1} Qty %'] = ''
                    trade_data[f'BaseOil {i+1} Qty Ltr'] = ''
                    trade_data[f'BaseOil {i+1} Value'] = ''
               
            excel_data.append(trade_data)
        
        return excel_data
class ExportConsumptionFormulaExcelView(APIView):
    def get(self, request, *args, **kwargs):
        from costmgt.models import ConsumptionFormula
        from costmgt.serializers import ConsumptionFormulaSerializer
        from costmgt.filters import ConsumptionFormulaFilter
        from accounts.mixins import get_authorized_queryset

        queryset = get_authorized_queryset(request, ConsumptionFormula.objects.all())
        filterset = ConsumptionFormulaFilter(request.GET, queryset=queryset)
        objs = filterset.qs if filterset.is_valid() else queryset
        serializer = ConsumptionFormulaSerializer(objs, many=True)
        data = self.prepare_excel_data(serializer.data)
        df = pd.DataFrame(data)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="consumption_formula.xlsx"'
        df.to_excel(response, index=False)
        return response

    def prepare_excel_data(self, serialized_data):
        excel_data = []
        max_additives = max((len(obj.get('consumptionFormulaAdditive', [])) for obj in serialized_data), default=0)
        max_baseoils = max((len(obj.get('consumptionFormulaBaseOil', [])) for obj in serialized_data), default=0)

        for obj in serialized_data:
            row = {
                'Formula Ref': obj.get('ref', ''),
                'Name': obj.get('name', ''),
                'Date': obj.get('date', ''),
                'Grade': obj.get('grade', ''),
                'SAE': obj.get('sae', ''),
                'Remarks': obj.get('remarks', ''),
                'Approved': 'Yes' if obj.get('approved') else 'No',
            }

            additives = obj.get('consumptionFormulaAdditive', [])
            for i in range(max_additives):
                if i < len(additives):
                    extra = additives[i]
                    row[f'Additive {i+1} Name'] = extra.get('name', '')
                    row[f'Additive {i+1} Qty %'] = extra.get('qty_in_percent', '')
                else:
                    row[f'Additive {i+1} Name'] = ''
                    row[f'Additive {i+1} Qty %'] = ''

            baseoils = obj.get('consumptionFormulaBaseOil', [])
            for i in range(max_baseoils):
                if i < len(baseoils):
                    extra = baseoils[i]
                    row[f'BaseOil {i+1} Name'] = extra.get('name', '')
                    row[f'BaseOil {i+1} Qty %'] = extra.get('qty_in_percent', '')
                else:
                    row[f'BaseOil {i+1} Name'] = ''
                    row[f'BaseOil {i+1} Qty %'] = ''
               
            excel_data.append(row)
        return excel_data

class ExportProductFormulaExcelView(APIView):
    def get(self, request, *args, **kwargs):
        from costmgt.models import ProductFormula
        from costmgt.serializers import ProductFormulaSerializer
        from costmgt.filters import ProductFormulaFilter
        from accounts.mixins import get_authorized_queryset

        queryset = get_authorized_queryset(request, ProductFormula.objects.all())
        filterset = ProductFormulaFilter(request.GET, queryset=queryset)
        objs = filterset.qs if filterset.is_valid() else queryset
        serializer = ProductFormulaSerializer(objs, many=True)
        data = self.prepare_excel_data(serializer.data)
        df = pd.DataFrame(data)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="product_formula.xlsx"'
        df.to_excel(response, index=False)
        return response

    def prepare_excel_data(self, serialized_data):
        excel_data = []
        max_items = max((len(obj.get('product_formula_items', [])) for obj in serialized_data), default=0)

        for obj in serialized_data:
            row = {
                'Formula Name': obj.get('formula_name', ''),
                'Consumption Name': obj.get('consumption', {}).get('formula', {}).get('name', '') if obj.get('consumption') and obj.get('consumption').get('formula') else '',
                'Consumption Qty': obj.get('consumption_qty', ''),
                'Packing Type': obj.get('packing', {}).get('name', '') if obj.get('packing') else '',
                'Remarks': obj.get('remarks', ''),
                'Approved': 'Yes' if obj.get('approved') else 'No',
            }

            items = obj.get('product_formula_items', [])
            for i in range(max_items):
                if i < len(items):
                    extra = items[i]
                    row[f'Item {i+1} Packing Type'] = extra.get('packings_type', {}).get('name', '') if extra.get('packings_type') else ''
                    row[f'Item {i+1} Packing Label'] = extra.get('packings', {}).get('name', '') if extra.get('packings') else ''
                    row[f'Item {i+1} Qty'] = extra.get('qty', '')
                else:
                    row[f'Item {i+1} Packing Type'] = ''
                    row[f'Item {i+1} Packing Label'] = ''
                    row[f'Item {i+1} Qty'] = ''
               
            excel_data.append(row)
        return excel_data

class ExportFinalProductExcelView(APIView):
    def get(self, request, *args, **kwargs):
        from costmgt.models import FinalProduct
        from costmgt.serializers import FinalProductSerializer
        from costmgt.filters import FinalProductFilter
        from accounts.mixins import get_authorized_queryset

        queryset = get_authorized_queryset(request, FinalProduct.objects.all())
        filterset = FinalProductFilter(request.GET, queryset=queryset)
        objs = filterset.qs if filterset.is_valid() else queryset
        serializer = FinalProductSerializer(objs, many=True)
        data = self.prepare_excel_data(serializer.data)
        df = pd.DataFrame(data)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="final_product.xlsx"'
        df.to_excel(response, index=False)
        return response

    def prepare_excel_data(self, serialized_data):
        excel_data = []
        max_packing_items = max((len(obj.get('packing_items', [])) for obj in serialized_data), default=0)
        max_additional_costs = max((len(obj.get('additional_costs', [])) for obj in serialized_data), default=0)

        for obj in serialized_data:
            row = {
                'Date': obj.get('date', ''),
                'Formula Name': obj.get('formula_detail', {}).get('formula_name', '') if obj.get('formula_detail') else '',
                'Consumption Name': obj.get('formula_detail', {}).get('consumption', {}).get('formula', {}).get('name', '') if obj.get('formula_detail') and obj.get('formula_detail').get('consumption') and obj.get('formula_detail').get('consumption').get('formula') else '',
                'Batch': obj.get('batch_detail', {}).get('batch', '') if obj.get('batch_detail') else '',
                'Packing Size': obj.get('packing_size_detail', {}).get('name', '') if obj.get('packing_size_detail') else '',
                'Bottles Per Pack': obj.get('bottles_per_pack', ''),
                'Litres Per Pack': obj.get('litres_per_pack', ''),
                'Consumption Qty': obj.get('consumption_qty', ''),
                'Total Qty': obj.get('total_qty', ''),
                'Qty in Litres': obj.get('qty_in_litres', ''),
                'Total Oil Consumed': obj.get('total_oil_consumed', ''),
                'Per Litre Cost': obj.get('per_litre_cost', ''),
                'Total CFR Pricing': obj.get('total_cfr_pricing', ''),
                'Total Cost Per Pail/Crtn': obj.get('total_cost_per_pail_crtn') or (round(float(obj.get('total_cfr_pricing') or 0) / float(obj.get('total_qty') or 1), 2) if obj.get('total_qty') and obj.get('total_cfr_pricing') else 0.0),
                'Remarks': obj.get('remarks', ''),
                'Approved': 'Yes' if obj.get('approved') else 'No',
            }

            p_items = obj.get('packing_items', [])
            for i in range(max_packing_items):
                if i < len(p_items):
                    extra = p_items[i]
                    row[f'Packing Item {i+1} Type'] = extra.get('packing_type', '')
                    row[f'Packing Item {i+1} Name'] = extra.get('selected_packing_details', {}).get('name', '') if extra.get('selected_packing_details') else ''
                    row[f'Packing Item {i+1} Qty'] = extra.get('qty', '')
                    row[f'Packing Item {i+1} Rate'] = extra.get('rate', '')
                    row[f'Packing Item {i+1} Value'] = extra.get('value', '')
                else:
                    row[f'Packing Item {i+1} Type'] = ''
                    row[f'Packing Item {i+1} Name'] = ''
                    row[f'Packing Item {i+1} Qty'] = ''
                    row[f'Packing Item {i+1} Rate'] = ''
                    row[f'Packing Item {i+1} Value'] = ''

            a_costs = obj.get('additional_costs', [])
            for i in range(max_additional_costs):
                if i < len(a_costs):
                    extra = a_costs[i]
                    row[f'Additional Cost {i+1} Name'] = extra.get('name', '')
                    row[f'Additional Cost {i+1} Rate'] = extra.get('rate', '')
                    row[f'Additional Cost {i+1} Value'] = extra.get('value', '')
                else:
                    row[f'Additional Cost {i+1} Name'] = ''
                    row[f'Additional Cost {i+1} Rate'] = ''
                    row[f'Additional Cost {i+1} Value'] = ''
               
            excel_data.append(row)
        return excel_data

class ExportPackingExcelView(APIView):
    def get(self, request, *args, **kwargs):
        from costmgt.models import Packing
        from costmgt.serializers import PackingSerializer
        objs = Packing.objects.all()
        serializer = PackingSerializer(objs, many=True)
        data = self.prepare_excel_data(serializer.data)
        df = pd.DataFrame(data)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="packing_price.xlsx"'
        df.to_excel(response, index=False)
        return response

    def prepare_excel_data(self, serialized_data):
        excel_data = []
        max_extras = max((len(obj.get('extras', [])) for obj in serialized_data), default=0)

        for obj in serialized_data:
            row = {
                'Date': obj.get('date', ''),
                'Name': obj.get('name', ''),
                'Per Each': obj.get('per_each', ''),
                'Packing Type': obj.get('packing_type_detail', {}).get('name', '') if obj.get('packing_type_detail') else '',
                'Remarks': obj.get('remarks', ''),
                'Approved': 'Yes' if obj.get('approved') else 'No',
            }

            extras = obj.get('extras', [])
            for i in range(max_extras):
                if i < len(extras):
                    extra = extras[i]
                    row[f'Extra {i+1} Name'] = extra.get('name', '')
                    row[f'Extra {i+1} Rate'] = extra.get('rate', '')
                else:
                    row[f'Extra {i+1} Name'] = ''
                    row[f'Extra {i+1} Rate'] = ''
               
            excel_data.append(row)
        return excel_data

class ExportRawMaterialExcelView(APIView):
    def get(self, request, *args, **kwargs):
        from costmgt.models import RawMaterial
        from costmgt.serializers import RawMaterialSerializer
        objs = RawMaterial.objects.all()
        serializer = RawMaterialSerializer(objs, many=True)
        data = self.prepare_excel_data(serializer.data)
        df = pd.DataFrame(data)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="raw_material_pricing.xlsx"'
        df.to_excel(response, index=False)
        return response

    def prepare_excel_data(self, serialized_data):
        excel_data = []
        max_extras = max((len(obj.get('extras', [])) for obj in serialized_data), default=0)

        for obj in serialized_data:
            row = {
                'Date': obj.get('date', ''),
                'Category': obj.get('category_name', ''),
                'Sub Name': obj.get('subname_name', ''),
                'Density': obj.get('density', ''),
                'Buy Price (PMT)': obj.get('buy_price_pmt', ''),
                'ML to KL': obj.get('ml_to_kl', ''),
                'Cost Per Liter': obj.get('cost_per_liter', ''),
                'Add Cost': obj.get('add_cost', ''),
                'Total': obj.get('total', ''),
                'Remarks': obj.get('remarks', ''),
                'Approved': 'Yes' if obj.get('approved') else 'No',
            }

            extras = obj.get('extras', [])
            for i in range(max_extras):
                if i < len(extras):
                    extra = extras[i]
                    row[f'Extra {i+1} Name'] = extra.get('name', '')
                    row[f'Extra {i+1} Rate'] = extra.get('rate', '')
                else:
                    row[f'Extra {i+1} Name'] = ''
                    row[f'Extra {i+1} Rate'] = ''
               
            excel_data.append(row)
        return excel_data

class ExportAdditiveExcelView(APIView):
    def get(self, request, *args, **kwargs):
        from costmgt.models import Additive
        from costmgt.serializers import AdditiveSerializer
        objs = Additive.objects.all()
        serializer = AdditiveSerializer(objs, many=True)
        data = self.prepare_excel_data(serializer.data)
        df = pd.DataFrame(data)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="additive_pricing.xlsx"'
        df.to_excel(response, index=False)
        return response

    def prepare_excel_data(self, serialized_data):
        excel_data = []
        max_extras = max((len(obj.get('extras', [])) for obj in serialized_data), default=0)

        for obj in serialized_data:
            row = {
                'Date': obj.get('date', ''),
                'Category': obj.get('category_name', ''),
                'Sub Name': obj.get('subname_name', ''),
                'Density': obj.get('density', ''),
                'CRF Price': obj.get('crfPrice', ''),
                'Add Cost': obj.get('addCost', ''),
                'Cost Price In Liter': obj.get('costPriceInLiter', ''),
                'Total Cost': obj.get('totalCost', ''),
                'Remarks': obj.get('remarks', ''),
                'Approved': 'Yes' if obj.get('approved') else 'No',
            }

            extras = obj.get('extras', [])
            for i in range(max_extras):
                if i < len(extras):
                    extra = extras[i]
                    row[f'Extra {i+1} Name'] = extra.get('name', '')
                    row[f'Extra {i+1} Rate'] = extra.get('rate', '')
                else:
                    row[f'Extra {i+1} Name'] = ''
                    row[f'Extra {i+1} Rate'] = ''
               
            excel_data.append(row)
        return excel_data

class ExportPackingConsumptionReportExcelView(APIView):
    def get(self, request, *args, **kwargs):
        from costmgt.models import FinalProduct
        from costmgt.serializers import FinalProductSerializer
        objs = FinalProduct.objects.all()
        serializer = FinalProductSerializer(objs, many=True)
        data = self.prepare_excel_data(serializer.data)
        df = pd.DataFrame(data)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="packing_consumption_report.xlsx"'
        df.to_excel(response, index=False)
        return response

    def prepare_excel_data(self, serialized_data):
        excel_data = []
        for item in serialized_data:
            packing_items = item.get('packing_items', [])
            if not packing_items:
                row = {
                    'Final Product Name': item.get('formula_detail', {}).get('formula_name', '') if item.get('formula_detail') else '',
                    'Packing Name': '',
                    'Date': item.get('date', ''),
                    'Qty': '0.00',
                    'Rate': '0.00',
                    'Value': '0.00',
                }
                excel_data.append(row)
            else:
                for p in packing_items:
                    row = {
                        'Final Product Name': item.get('formula_detail', {}).get('formula_name', '') if item.get('formula_detail') else '',
                        'Packing Name': p.get('packing', ''),
                        'Date': item.get('date', ''),
                        'Qty': f"{float(p.get('total_qty') or 0):.2f}",
                        'Rate': f"{float(p.get('rate') or 0):.2f}",
                        'Value': f"{float(p.get('total_value') or 0):.2f}",
                    }
                    excel_data.append(row)
        return excel_data

class ExportAdditiveConsumptionReportExcelView(APIView):
    def get(self, request, *args, **kwargs):
        from costmgt.models import FinalProduct
        from costmgt.serializers import FinalProductSerializer
        objs = FinalProduct.objects.all()
        serializer = FinalProductSerializer(objs, many=True)
        data = self.prepare_excel_data(serializer.data)
        df = pd.DataFrame(data)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="additive_consumption_report.xlsx"'
        df.to_excel(response, index=False)
        return response

    def prepare_excel_data(self, serialized_data):
        excel_data = []
        for item in serialized_data:
            # Check the nested structure
            formula_detail = item.get('formula_detail', {})
            consumption = formula_detail.get('consumption', {}) if formula_detail else {}
            additives = consumption.get('additives', []) if consumption else []
            
            additive_names = ", ".join(filter(bool, [a.get('additive', {}).get('name', '') if a.get('additive') else '' for a in additives]))
            densities = [float(a.get('additive_subname', {}).get('density') or 0) if a.get('additive_subname') else 0 for a in additives]
            quantities_ltr = [float(a.get('qty_in_litre') or 0) for a in additives]
            
            total_kgs = sum(qty * densities[i] for i, qty in enumerate(quantities_ltr))
            total_ltr = sum(quantities_ltr)
            rates = [str(float(a.get('rate') or 0)) for a in additives]
            values = [float(a.get('value') or 0) for a in additives]
            total_value = sum(values)

            row = {
                'Final Product Name': item.get('formula_detail', {}).get('formula_name', '') if item.get('formula_detail') else '',
                'Additive Name': additive_names,
                'Date': item.get('date', ''),
                'Serial No': item.get('batch_detail', {}).get('batch', '') if item.get('batch_detail') else '',
                'Qty (Kgs)': f"{total_kgs:.2f}",
                'Qty (Ltr)': f"{total_ltr:.2f}",
                'Rate/Ltr': ", ".join(rates),
                'Value': f"{total_value:.2f}"
            }
            excel_data.append(row)
        return excel_data

class ExportRawMaterialConsumptionReportExcelView(APIView):
    def get(self, request, *args, **kwargs):
        from costmgt.models import FinalProduct
        from costmgt.serializers import FinalProductSerializer
        objs = FinalProduct.objects.all()
        serializer = FinalProductSerializer(objs, many=True)
        data = self.prepare_excel_data(serializer.data)
        df = pd.DataFrame(data)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="raw_material_consumption_report.xlsx"'
        df.to_excel(response, index=False)
        return response

    def prepare_excel_data(self, serialized_data):
        excel_data = []
        for item in serialized_data:
            formula_detail = item.get('formula_detail', {})
            consumption = formula_detail.get('consumption', {}) if formula_detail else {}
            baseoils = consumption.get('baseoil', []) if consumption else []
            
            rm_names = ", ".join(filter(bool, [b.get('raw', {}).get('name', '') if b.get('raw') else '' for b in baseoils]))
            densities = [float(b.get('raw_subname', {}).get('density') or 0) if b.get('raw_subname') else 0 for b in baseoils]
            quantities_ltr = [float(b.get('qty_in_litre') or 0) for b in baseoils]
            
            total_kgs = sum(qty * densities[i] for i, qty in enumerate(quantities_ltr))
            rates = [str(float(b.get('rate') or 0)) for b in baseoils]
            values = [str(float(b.get('value') or 0)) for b in baseoils]

            row = {
                'Final Product Name': item.get('formula_detail', {}).get('formula_name', '') if item.get('formula_detail') else '',
                'Raw Material Name': rm_names,
                'Date': item.get('date', ''),
                'Batch Number': item.get('batch_detail', {}).get('batch', '') if item.get('batch_detail') else '',
                'Qty (Kgs)': f"{total_kgs:.2f}",
                'Qty (Ltr)': ", ".join([str(q) for q in quantities_ltr]),
                'Rate/Ltr': ", ".join(rates),
                'Value': ", ".join(values)
            }
            excel_data.append(row)
        return excel_data

class ExportRawCategoryExcelView(APIView):
    def get(self, request, *args, **kwargs):
        from costmgt.models import RawCategory
        from costmgt.serializers import RawCategorySerializer
        objs = RawCategory.objects.all()
        serializer = RawCategorySerializer(objs, many=True)
        data = self.prepare_excel_data(serializer.data)
        df = pd.DataFrame(data)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="raw_material_category.xlsx"'
        df.to_excel(response, index=False)
        return response

    def prepare_excel_data(self, serialized_data):
        def get_all_subcategory_names(category):
            names = []
            children = category.get('children', [])
            for child in children:
                names.append(child.get('name', ''))
                names.extend(get_all_subcategory_names(child))
            return names

        excel_data = []
        for obj in serialized_data:
            children_names = get_all_subcategory_names(obj)
            row = {
                'Name': obj.get('name', ''),
                'Parent': obj.get('parent_name') if obj.get('parent_name') else 'Root',
                'Children': ", ".join(children_names) if children_names else '—',
                'Approved': 'Yes' if obj.get('approved') else 'No',
            }
            excel_data.append(row)
        return excel_data

class ExportAdditiveCategoryExcelView(APIView):
    def get(self, request, *args, **kwargs):
        from costmgt.models import AdditiveCategory
        from costmgt.serializers import AdditiveCategorySerializer
        objs = AdditiveCategory.objects.all()
        serializer = AdditiveCategorySerializer(objs, many=True)
        data = self.prepare_excel_data(serializer.data)
        df = pd.DataFrame(data)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="additive_category.xlsx"'
        df.to_excel(response, index=False)
        return response

    def prepare_excel_data(self, serialized_data):
        def get_all_subcategory_names(category):
            names = []
            children = category.get('children', [])
            for child in children:
                names.append(child.get('name', ''))
                names.extend(get_all_subcategory_names(child))
            return names

        excel_data = []
        for obj in serialized_data:
            children_names = get_all_subcategory_names(obj)
            row = {
                'Name': obj.get('name', ''),
                'Parent': obj.get('parent_name') if obj.get('parent_name') else 'Root',
                'Children': ", ".join(children_names) if children_names else '—',
                'Approved': 'Yes' if obj.get('approved') else 'No',
            }
            excel_data.append(row)
        return excel_data

class ExportInventoryExcelView(APIView):
    def get(self, request, *args, **kwargs):
        from trademgt.models import Inventory
        from trademgt.serializers import InventorySerializer
        objs = Inventory.objects.exclude(quantity=0)
        serializer = InventorySerializer(objs, many=True)
        data = self.prepare_excel_data(serializer.data)
        df = pd.DataFrame(data)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="inventory.xlsx"'
        df.to_excel(response, index=False)
        return response

    def prepare_excel_data(self, serialized_data):
        excel_data = []
        for obj in serialized_data:
            closing_stock = obj.get('quantity', '')
            if closing_stock != '' and closing_stock is not None:
                try:
                    closing_stock = round(float(closing_stock), 4)
                except (ValueError, TypeError):
                    pass
            row = {
                'Product Name': obj.get('productName', {}).get('name', '') if obj.get('productName') else obj.get('product_name', ''),
                'Batch Number': obj.get('batch_number', ''),
                'Production Date': obj.get('production_date', ''),
                'Closing Stock': closing_stock,
                'Unit': obj.get('unit', ''),
            }
            excel_data.append(row)
        return excel_data

class ExportDashboardInventoryExcelView(APIView):
    def get(self, request, *args, **kwargs):
        from django.db.models import Sum
        from trademgt.models import Inventory, ProductName
        import pandas as pd

        inventory_summary = (
            Inventory.objects.values('product_name', 'unit')
            .annotate(total_stock=Sum('quantity'))
            .order_by('-total_stock')
        )
        product_name_map = {str(pn.id): pn.name for pn in ProductName.objects.all()}
        
        excel_data = []
        for item in inventory_summary:
            pn_id = str(item['product_name'])
            unit = item['unit'] or ''
            stock_val = round(item['total_stock'] or 0, 4)
            excel_data.append({
                'Product Name': product_name_map.get(pn_id, pn_id),
                'Stock (Quantity)': f"{stock_val} {unit}".strip(),
            })

        df = pd.DataFrame(excel_data)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="dashboard_inventory_summary.xlsx"'
        df.to_excel(response, index=False)
        return response

class ExportTradePendingExcelView(APIView):
    def get(self, request, *args, **kwargs):
        trade_type = request.GET.get('trade_type', None)
        from trademgt.models import TradePending
        from trademgt.serializers import TradePendingSerializer
        
        objs = TradePending.objects.all()
        if trade_type:
            objs = objs.filter(trade_type=trade_type)
            
        serializer = TradePendingSerializer(objs, many=True)
        data = self.prepare_excel_data(serializer.data)
        df = pd.DataFrame(data)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        filename = f"{trade_type.lower()}_pending.xlsx" if trade_type else "trade_pending.xlsx"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        df.to_excel(response, index=False)
        return response

    def prepare_excel_data(self, serialized_data):
        def f4(v):
            if v is None or v == '':
                return ''
            try:
                return round(float(v), 4)
            except (ValueError, TypeError):
                return v

        def f2(v):
            if v is None or v == '':
                return ''
            try:
                return round(float(v), 2)
            except (ValueError, TypeError):
                return v

        excel_data = []
        for obj in serialized_data:
            row = {
                'TRN': obj.get('trade', {}).get('trn', '') if obj.get('trade') else '',
                'TRD': obj.get('trd', ''),
                'Company': obj.get('trade', {}).get('companyName', {}).get('name', '') if obj.get('trade') and obj.get('trade').get('companyName') else '',
                'Payment Term': obj.get('trade', {}).get('paymentTerm', {}).get('name', '') if obj.get('trade') and obj.get('trade').get('paymentTerm') else '',
                'Product Code': obj.get('product_code', ''),
                'Product Name': obj.get('productName', {}).get('name', '') if obj.get('productName') else obj.get('product_name', ''),
                'HS Code': obj.get('hs_code', ''),
                'Trade Qty': f4(obj.get('contract_qty', '')),
                'Trade Unit': obj.get('contract_qty_unit', ''),
                'Balance Qty': f4(obj.get('balance_qty', '')),
                'Balance Unit': obj.get('balance_qty_unit', ''),
                'Tolerance': obj.get('tolerance', ''),
                'Selected Currency Rate': f2(obj.get('selected_currency_rate', '')),
                'Rate in USD': f2(obj.get('rate_in_usd', '')),
                'Logistic': f2(obj.get('logistic', '')),
            }
            excel_data.append(row)
        return excel_data

class ExportTradeProductTraceExcelView(APIView):
    def get(self, request, *args, **kwargs):
        trade_type = request.GET.get('trade_type', None)
        from trademgt.models import TradeProductTrace
        from trademgt.serializers import TradeProductTraceSerializer
        
        objs = TradeProductTrace.objects.all()
        if trade_type:
            objs = objs.filter(trade_type=trade_type)
            
        serializer = TradeProductTraceSerializer(objs, many=True)
        data = self.prepare_excel_data(serializer.data)
        df = pd.DataFrame(data)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        filename = f"{trade_type.lower()}_product_trace.xlsx" if trade_type else "trade_product_trace.xlsx"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        df.to_excel(response, index=False)
        return response

    def prepare_excel_data(self, serialized_data):
        def f4(v):
            if v is None or v == '':
                return ''
            try:
                return round(float(v), 4)
            except (ValueError, TypeError):
                return v

        excel_data = []
        for obj in serialized_data:
            row = {
                'Product Code': obj.get('product_code', ''),
                'Total Contract Qty': f4(obj.get('total_contract_qty', '')),
                'Contract Balance Qty': f4(obj.get('contract_balance_qty', '')),
            }
            excel_data.append(row)
        return excel_data

class ExportTradeProductRefExcelView(APIView):
    def get(self, request, *args, **kwargs):
        from trademgt.models import TradeProductRef
        from trademgt.serializers import TradeProductRefSerializer
        objs = TradeProductRef.objects.all()
        serializer = TradeProductRefSerializer(objs, many=True)
        data = self.prepare_excel_data(serializer.data)
        df = pd.DataFrame(data)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="product_reference.xlsx"'
        df.to_excel(response, index=False)
        return response

    def prepare_excel_data(self, serialized_data):
        def f4(v):
            if v is None or v == '':
                return ''
            try:
                return round(float(v), 4)
            except (ValueError, TypeError):
                return v

        excel_data = []
        for obj in serialized_data:
            row = {
                'Trade Type': obj.get('trade_type', ''),
                'Product Code': obj.get('product_code', ''),
                'Total Contract Qty': f4(obj.get('total_contract_qty', '')),
                'Reference Balance Qty': f4(obj.get('ref_balance_qty', '')),
            }
            excel_data.append(row)
        return excel_data


class ExportAccountReceivablesExcelView(APIView):
    def get(self, request, *args, **kwargs):
        import io
        import openpyxl
        from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
        from openpyxl.utils import get_column_letter
        from django.db.models import Sum
        from accounts.mixins import get_authorized_queryset
        from trademgt.models import (
            Trade, SalesPurchase, PaymentFinance, Company, Kyc, Currency
        )

        company_map = {str(c.id): c.name for c in Company.objects.all()}
        kyc_map = {str(k.id): k.name for k in Kyc.objects.all()}
        currency_map = {str(curr.id): curr.name for curr in Currency.objects.all()}

        auth_sps = get_authorized_queryset(request, SalesPurchase.objects.all()).filter(
            trn__trade_type='Sales'
        ).order_by('-invoice_date', '-id')

        include_all = request.GET.get('all', 'false').lower() == 'true'

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Account Receivables"

        headers = [
            'TRN Ref', 'Company', 'Customer Name', 'Invoice Number', 'Invoice Date',
            'BL Number', 'Currency', 'Invoiced Amount', 'Amount Received',
            'Balance Receivable', 'Trader Name', 'Status'
        ]
        ws.append(headers)

        # Header styling
        header_fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
        header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
        header_alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

        for col_idx in range(1, len(headers) + 1):
            cell = ws.cell(row=1, column=col_idx)
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = header_alignment

        thin_side = Side(style='thin', color="D1D5DB")
        data_border = Border(left=thin_side, right=thin_side, top=thin_side, bottom=thin_side)
        align_left = Alignment(horizontal="left", vertical="center")
        align_center = Alignment(horizontal="center", vertical="center")
        align_right = Alignment(horizontal="right", vertical="center")

        data_rows_count = 0
        for sp in auth_sps:
            pfs = PaymentFinance.objects.filter(sp=sp)
            pf_agg = pfs.aggregate(recv=Sum('balance_payment_received'), adv=Sum('advance_adjusted'))
            total_received = (pf_agg['recv'] or 0.0) + (pf_agg['adv'] or 0.0)
            invoiced_amt = sp.invoice_amount or 0.0
            balance_due = max(0.0, round(invoiced_amt - total_received, 2))

            # Filter: only pending receivables by default unless ?all=true
            if not include_all and balance_due <= 0:
                continue

            trade_obj = sp.trn
            raw_comp = str(trade_obj.company) if trade_obj and trade_obj.company else ''
            raw_cust = str(trade_obj.customer_company_name) if trade_obj and trade_obj.customer_company_name else ''
            raw_curr = str(trade_obj.currency_selection) if trade_obj and trade_obj.currency_selection else ''

            data_rows_count += 1
            current_row = data_rows_count + 1

            row_data = [
                trade_obj.trn if trade_obj else '',
                company_map.get(raw_comp, raw_comp),
                kyc_map.get(raw_cust, raw_cust),
                sp.invoice_number or '',
                str(sp.invoice_date) if sp.invoice_date else '',
                sp.bl_number or '',
                currency_map.get(raw_curr, raw_curr),
                round(invoiced_amt, 2),
                round(total_received, 2),
                f"=H{current_row}-I{current_row}",
                trade_obj.trader_name if trade_obj else '',
                'Settled' if balance_due <= 0 else 'Pending Receivable',
            ]
            ws.append(row_data)

            # Apply cell styles for data row
            for col_idx in range(1, len(headers) + 1):
                cell = ws.cell(row=current_row, column=col_idx)
                cell.border = data_border
                cell.font = Font(name="Calibri", size=10)

                # Format numeric currency columns
                if col_idx in (8, 9, 10):
                    cell.number_format = '#,##0.00'
                    cell.alignment = align_right
                elif col_idx in (1, 5, 6, 7, 12):
                    cell.alignment = align_center
                else:
                    cell.alignment = align_left

        # Add Total Summary Row at the bottom
        if data_rows_count > 0:
            summary_row = data_rows_count + 2
            double_bottom = Border(
                top=Side(style='thin', color="000000"),
                bottom=Side(style='double', color="000000")
            )
            summary_fill = PatternFill(start_color="F3F4F6", end_color="F3F4F6", fill_type="solid")
            summary_font = Font(name="Calibri", size=11, bold=True, color="000000")

            label_cell = ws.cell(row=summary_row, column=7, value="TOTAL")
            label_cell.font = summary_font
            label_cell.alignment = Alignment(horizontal="right", vertical="center")
            label_cell.fill = summary_fill
            label_cell.border = double_bottom

            for c_idx in (8, 9, 10):
                col_let = get_column_letter(c_idx)
                sum_cell = ws.cell(row=summary_row, column=c_idx, value=f"=SUM({col_let}2:{col_let}{data_rows_count + 1})")
                sum_cell.font = summary_font
                sum_cell.number_format = '#,##0.00'
                sum_cell.alignment = align_right
                sum_cell.fill = summary_fill
                sum_cell.border = double_bottom

        # Auto-adjust column widths
        for col in ws.columns:
            col_letter = get_column_letter(col[0].column)
            max_len = 0
            for cell in col:
                val_str = str(cell.value or '')
                if not val_str.startswith('='):
                    max_len = max(max_len, len(val_str))
                else:
                    max_len = max(max_len, 14)
            ws.column_dimensions[col_letter].width = max(max_len + 4, 14)

        # Ensure key descriptive columns have generous minimum width
        ws.column_dimensions['B'].width = max(ws.column_dimensions['B'].width or 14, 28)
        ws.column_dimensions['C'].width = max(ws.column_dimensions['C'].width or 14, 28)
        ws.column_dimensions['D'].width = max(ws.column_dimensions['D'].width or 14, 24)

        buf = io.BytesIO()
        wb.save(buf)
        buf.seek(0)

        response = HttpResponse(
            buf.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="Account_Receivables_Summary.xlsx"'
        return response



class ExportAccountPayablesExcelView(APIView):
    def get(self, request, *args, **kwargs):
        import io
        import openpyxl
        from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
        from openpyxl.utils import get_column_letter
        from django.db.models import Sum
        from accounts.mixins import get_authorized_queryset
        from trademgt.models import (
            Trade, SalesPurchase, PaymentFinance, Company, Kyc, Currency
        )

        company_map = {str(c.id): c.name for c in Company.objects.all()}
        kyc_map = {str(k.id): k.name for k in Kyc.objects.all()}
        currency_map = {str(curr.id): curr.name for curr in Currency.objects.all()}

        auth_sps = get_authorized_queryset(request, SalesPurchase.objects.all()).filter(
            trn__trade_type='Purchase'
        ).order_by('-invoice_date', '-id')

        include_all = request.GET.get('all', 'false').lower() == 'true'

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Account Payables"

        headers = [
            'TRN Ref', 'Company', 'Supplier/Vendor Name', 'Invoice Number', 'Invoice Date',
            'Liner / Logistic Provider', 'Currency', 'Invoice + Logistic', 'Amount Paid',
            'AMOUNT CALC', 'Balance Payable', 'Trader Name', 'Status'
        ]
        ws.append(headers)

        # Header styling
        header_fill = PatternFill(start_color="991B1B", end_color="991B1B", fill_type="solid")  # Crimson Red
        header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
        header_alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

        for col_idx in range(1, len(headers) + 1):
            cell = ws.cell(row=1, column=col_idx)
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = header_alignment

        thin_side = Side(style='thin', color="D1D5DB")
        data_border = Border(left=thin_side, right=thin_side, top=thin_side, bottom=thin_side)
        align_left = Alignment(horizontal="left", vertical="center")
        align_center = Alignment(horizontal="center", vertical="center")
        align_right = Alignment(horizontal="right", vertical="center")

        data_rows_count = 0
        for sp in auth_sps:
            pfs = PaymentFinance.objects.filter(sp=sp)
            pf_agg = pfs.aggregate(paid=Sum('balance_payment_made'), adv=Sum('advance_adjusted'))
            total_paid = (pf_agg['paid'] or 0.0) + (pf_agg['adv'] or 0.0)
            invoiced_amt = (sp.invoice_amount or 0.0) + (sp.logistic_cost or 0.0)
            balance_due = max(0.0, round(invoiced_amt - total_paid, 2))

            if not include_all and balance_due <= 0:
                continue

            trade_obj = sp.trn
            raw_comp = str(trade_obj.company) if trade_obj and trade_obj.company else ''
            raw_cust = str(trade_obj.customer_company_name) if trade_obj and trade_obj.customer_company_name else ''
            raw_curr = str(trade_obj.currency_selection) if trade_obj and trade_obj.currency_selection else ''

            data_rows_count += 1
            current_row = data_rows_count + 1

            row_data = [
                trade_obj.trn if trade_obj else '',
                company_map.get(raw_comp, raw_comp),
                kyc_map.get(raw_cust, raw_cust),
                sp.invoice_number or '',
                str(sp.invoice_date) if sp.invoice_date else '',
                sp.liner or (trade_obj.logistic_provider if trade_obj else ''),
                currency_map.get(raw_curr, raw_curr),
                round(invoiced_amt, 2),
                round(total_paid, 2),
                f"=H{current_row}-I{current_row}",
                balance_due,
                trade_obj.trader_name if trade_obj else '',
                'Settled' if balance_due <= 0 else 'Pending Payable',
            ]
            ws.append(row_data)

            # Cell styles
            for col_idx in range(1, len(headers) + 1):
                cell = ws.cell(row=current_row, column=col_idx)
                cell.border = data_border
                cell.font = Font(name="Calibri", size=10)

                if col_idx in (8, 9, 10, 11):
                    cell.number_format = '#,##0.00'
                    cell.alignment = align_right
                elif col_idx in (1, 5, 7, 13):
                    cell.alignment = align_center
                else:
                    cell.alignment = align_left

        # Add Total Summary Row at the bottom
        if data_rows_count > 0:
            summary_row = data_rows_count + 2
            double_bottom = Border(
                top=Side(style='thin', color="000000"),
                bottom=Side(style='double', color="000000")
            )
            summary_fill = PatternFill(start_color="F3F4F6", end_color="F3F4F6", fill_type="solid")
            summary_font = Font(name="Calibri", size=11, bold=True, color="000000")

            label_cell = ws.cell(row=summary_row, column=7, value="TOTAL")
            label_cell.font = summary_font
            label_cell.alignment = Alignment(horizontal="right", vertical="center")
            label_cell.fill = summary_fill
            label_cell.border = double_bottom

            for c_idx in (8, 9, 10, 11):
                col_let = get_column_letter(c_idx)
                sum_cell = ws.cell(row=summary_row, column=c_idx, value=f"=SUM({col_let}2:{col_let}{data_rows_count + 1})")
                sum_cell.font = summary_font
                sum_cell.number_format = '#,##0.00'
                sum_cell.alignment = align_right
                sum_cell.fill = summary_fill
                sum_cell.border = double_bottom

        # Auto-adjust column widths
        for col in ws.columns:
            col_letter = get_column_letter(col[0].column)
            max_len = 0
            for cell in col:
                val_str = str(cell.value or '')
                if not val_str.startswith('='):
                    max_len = max(max_len, len(val_str))
                else:
                    max_len = max(max_len, 14)
            ws.column_dimensions[col_letter].width = max(max_len + 4, 14)

        # Ensure key descriptive columns have generous minimum width
        ws.column_dimensions['B'].width = max(ws.column_dimensions['B'].width or 14, 28)
        ws.column_dimensions['C'].width = max(ws.column_dimensions['C'].width or 14, 28)
        ws.column_dimensions['D'].width = max(ws.column_dimensions['D'].width or 14, 24)

        buf = io.BytesIO()
        wb.save(buf)
        buf.seek(0)

        response = HttpResponse(
            buf.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="Account_Payables_Summary.xlsx"'
        return response




class ExportInsurancePendingExcelView(APIView):
    def get(self, request, *args, **kwargs):
        import pandas as pd
        from django.db.models import Q
        from accounts.mixins import get_authorized_queryset
        from trademgt.models import (
            Trade, Company, Kyc, PaymentTerm, Currency, Bank
        )

        company_map = {str(c.id): c.name for c in Company.objects.all()}
        kyc_map = {str(k.id): k.name for k in Kyc.objects.all()}
        payment_map = {str(pt.id): pt.name for pt in PaymentTerm.objects.all()}
        currency_map = {str(curr.id): curr.name for curr in Currency.objects.all()}
        bank_map = {str(b.id): b.name for b in Bank.objects.all()}

        auth_trades = get_authorized_queryset(request, Trade.objects.all())
        insurance_pending_query = (
            Q(insurance_policy_number__isnull=True) |
            Q(insurance_policy_number__exact='') |
            Q(insurance_policy_number__iexact='na') |
            Q(insurance_policy_number__iexact='n/a') |
            Q(insurance_policy_number__iexact='n.a.') |
            Q(insurance_policy_number__iexact='pending') |
            Q(insurance_policy_number__iexact='none')
        )
        pending_trades = auth_trades.filter(insurance_pending_query).order_by('-id')

        excel_data = []
        for trade in pending_trades:
            raw_comp = str(trade.company) if trade.company else ''
            raw_cust = str(trade.customer_company_name) if trade.customer_company_name else ''
            raw_bank = str(trade.bank_name_address) if trade.bank_name_address else ''
            raw_pay = str(trade.payment_term) if trade.payment_term else ''
            raw_curr = str(trade.currency_selection) if trade.currency_selection else ''

            excel_data.append({
                'TRN Ref': trade.trn or '',
                'Trade Date': str(trade.trd) if trade.trd else '',
                'Trade Type': trade.trade_type or '',
                # 'Trade Category': trade.trade_category or '',
                # 'Company': company_map.get(raw_comp, raw_comp),
                'Customer / Vendor': kyc_map.get(raw_cust, raw_cust),
                'Trader Name': trade.trader_name or '',
                'Insurance Policy Number': trade.insurance_policy_number or 'NA',
                # 'Approval Status': 'Approved' if trade.approved else 'Pending',
                'Contract Value': fmt_2dec(trade.contract_value),
                'Currency': currency_map.get(raw_curr, raw_curr),
                # 'Exchange Rate': trade.exchange_rate or 1.0,
                # 'Payment Term': payment_map.get(raw_pay, raw_pay),
                # 'Advance Value to Receive': trade.advance_value_to_receive or 0.0,
                'Incoterm': trade.incoterm or '',
                'POL': trade.pol or '',
                'POD': trade.pod or '',
                # 'ETA': trade.eta or '',
                # 'ETD': trade.etd or '',
                # 'Shipper in BL': trade.shipper_in_bl or '',
                # 'Consignee in BL': trade.consignee_in_bl or '',
                # 'Notify Party in BL': trade.notify_party_in_bl or '',
                # 'Logistic Provider': trade.logistic_provider or '',
                # 'Estimated Logistic Cost': trade.estimated_logistic_cost or 0.0,
                # 'Bank': bank_map.get(raw_bank, raw_bank),
                # 'Account Number': trade.account_number or '',
                # 'Swift Code': trade.swift_code or '',
                # 'Commission Agent': trade.commission_agent or '',
                # 'Commission Value': trade.commission_value or 0.0,
                'Remarks': trade.remarks or '',
            })

        df = pd.DataFrame(excel_data)
        if df.empty:
            df = pd.DataFrame(columns=[
                'TRN Ref', 'Trade Date', 'Trade Type', 'Trade Category', 'Company', 'Customer / Vendor',
                'Trader Name', 'Insurance Policy Number', 'Approval Status', 'Contract Value',
                'Currency', 'Exchange Rate', 'Payment Term', 'Advance Value to Receive',
                'Incoterm', 'POL', 'POD', 'ETA', 'ETD', 'Shipper in BL', 'Consignee in BL',
                'Notify Party in BL', 'Logistic Provider', 'Estimated Logistic Cost', 'Bank',
                'Account Number', 'Swift Code', 'Commission Agent', 'Commission Value', 'Remarks'
            ])

        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="Insurance_Pending_Summary.xlsx"'
        df.to_excel(response, index=False)
        return response


class ExportTradeReportExcelView(APIView):
    def get(self, request, *args, **kwargs):
        trn_id = request.query_params.get('trn')
        if not trn_id:
            return Response({'error': 'TRN parameter is required.'}, status=400)

        try:
            trade = Trade.objects.get(id=trn_id)
        except (Trade.DoesNotExist, ValueError):
            return Response({'error': 'Trade record not found'}, status=404)

        serializer = TradeReportSerializer(trade)
        report_data = serializer.data

        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        clean_trn = str(trade.trn).replace('/', '_').replace('\\', '_')
        response['Content-Disposition'] = f'attachment; filename="Trade_Report_{clean_trn}.xlsx"'

        with pd.ExcelWriter(response, engine='openpyxl') as writer:
            # 1. Trade Overview Sheet
            trade_obj = report_data.get('trade') or {}
            trade_overview = [
                {'Field': 'Company', 'Value': trade_obj.get('companyName', {}).get('name') if isinstance(trade_obj.get('companyName'), dict) else (trade_obj.get('company') or 'N/A')},
                {'Field': 'Date (TRD)', 'Value': trade_obj.get('trd') or 'N/A'},
                {'Field': 'Trade Approved Date', 'Value': trade_obj.get('approval_date') or 'N/A'},
                {'Field': 'Trade Reference Number (TRN)', 'Value': trade_obj.get('trn') or 'N/A'},
                {'Field': 'Trade Type', 'Value': trade_obj.get('trade_type') or 'N/A'},
                {'Field': 'Trade Category', 'Value': trade_obj.get('trade_category') or 'N/A'},
                {'Field': 'Country of Origin', 'Value': trade_obj.get('country_of_origin') or 'N/A'},
                {'Field': 'Customer Company Name', 'Value': trade_obj.get('customer', {}).get('name') if isinstance(trade_obj.get('customer'), dict) else (trade_obj.get('customer_company_name') or 'N/A')},
                {'Field': 'Trader Name', 'Value': trade_obj.get('trader_name') or 'N/A'},
                {'Field': 'Address', 'Value': trade_obj.get('address') or 'N/A'},
                {'Field': 'Currency', 'Value': trade_obj.get('currency', {}).get('name') if isinstance(trade_obj.get('currency'), dict) else (trade_obj.get('currency_selection') or 'N/A')},
                {'Field': 'Exchange Rate', 'Value': fmt_2dec(trade_obj.get('exchange_rate'))},
                {'Field': 'Commission Agent', 'Value': trade_obj.get('commission_agent') or 'N/A'},
                {'Field': 'Value of Contract', 'Value': fmt_2dec(trade_obj.get('contract_value'))},
                {'Field': 'Payment Term', 'Value': trade_obj.get('paymentTerm', {}).get('name') if isinstance(trade_obj.get('paymentTerm'), dict) else (trade_obj.get('payment_term') or 'N/A')},
                {'Field': 'Advance Value to Receive/Pay', 'Value': fmt_2dec(trade_obj.get('advance_value_to_receive'))},
                {'Field': 'Commission Value', 'Value': fmt_2dec(trade_obj.get('commission_value'))},
                {'Field': 'Logistic Provider', 'Value': trade_obj.get('logistic_provider') or 'N/A'},
                {'Field': 'Estimated Logistic Cost', 'Value': fmt_2dec(trade_obj.get('estimated_logistic_cost'))},
                {'Field': 'Bank Name & Address', 'Value': f"{trade_obj.get('bank', {}).get('name', '')}, {trade_obj.get('bank', {}).get('address', '')}" if isinstance(trade_obj.get('bank'), dict) else (trade_obj.get('bank_name_address') or 'N/A')},
                {'Field': 'Account Number', 'Value': trade_obj.get('account_number') or 'N/A'},
                {'Field': 'SWIFT Code', 'Value': trade_obj.get('swift_code') or 'N/A'},
                {'Field': 'Incoterm', 'Value': trade_obj.get('incoterm') or 'N/A'},
                {'Field': 'POL', 'Value': trade_obj.get('pol') or 'N/A'},
                {'Field': 'POD', 'Value': trade_obj.get('pod') or 'N/A'},
                {'Field': 'ETD', 'Value': trade_obj.get('etd') or 'N/A'},
                {'Field': 'ETA', 'Value': trade_obj.get('eta') or 'N/A'},
                {'Field': 'Insurance Policy Number', 'Value': trade_obj.get('insurance_policy_number') or 'N/A'},
                {'Field': 'Shipper in BL', 'Value': trade_obj.get('shipper_in_bl') or 'N/A'},
                {'Field': 'Consignee in BL', 'Value': trade_obj.get('consignee_in_bl') or 'N/A'},
                {'Field': 'Notify Party in BL', 'Value': trade_obj.get('notify_party_in_bl') or 'N/A'},
                {'Field': 'BL Fee', 'Value': fmt_2dec(trade_obj.get('bl_fee'))},
                {'Field': 'BL Fee Remarks', 'Value': trade_obj.get('bl_fee_remarks') or 'N/A'},
                {'Field': 'Remarks', 'Value': trade_obj.get('remarks') or 'N/A'},
                {'Field': 'Reviewed', 'Value': 'Yes' if trade_obj.get('reviewed') else 'No'},
                {'Field': 'Approved', 'Value': 'Yes' if trade_obj.get('approved') else 'No'},
            ]
            df_trade = pd.DataFrame(trade_overview)
            df_trade.to_excel(writer, sheet_name='Trade Overview', index=False)

            # 2. Trade Products Sheet
            products_list = []
            for p in trade_obj.get('trade_products', []) or []:
                p_name = p.get('productName', {}).get('name') if isinstance(p.get('productName'), dict) else (p.get('product_name') or 'N/A')
                p_supplier = p.get('supplier', {}).get('name') if isinstance(p.get('supplier'), dict) else (p.get('packaging_supplier') or 'N/A')
                p_packing = p.get('packing', {}).get('name') if isinstance(p.get('packing'), dict) else (p.get('mode_of_packing') or 'N/A')
                p_size = p.get('shipmentSize', {}).get('name') if isinstance(p.get('shipmentSize'), dict) else (p.get('container_shipment_size') or 'N/A')
                products_list.append({
                    'Product Code': p.get('product_code', 'N/A'),
                    'Product Name': p_name,
                    'Product Name for Client': p.get('product_name_for_client', 'N/A'),
                    'HS Code': p.get('hs_code', 'N/A'),
                    'Total Contract Qty': fmt_4dec(p.get('total_contract_qty')),
                    'Contract Qty Unit': p.get('total_contract_qty_unit', 'N/A'),
                    'Tolerance (%)': fmt_2dec(p.get('tolerance')),
                    'Contract Balance Qty': fmt_4dec(p.get('contract_balance_qty')),
                    'Contract Balance Unit': p.get('contract_balance_qty_unit', 'N/A'),
                    'Trade Qty': fmt_4dec(p.get('trade_qty')),
                    'Trade Qty Unit': p.get('trade_qty_unit', 'N/A'),
                    'Selected Currency Rate': fmt_2dec(p.get('selected_currency_rate')),
                    'Rate in USD': fmt_2dec(p.get('rate_in_usd')),
                    'Product Value': fmt_2dec(p.get('product_value')),
                    'Mode of Packing': p_packing,
                    'Rate of Each Packing': fmt_2dec(p.get('rate_of_each_packing')),
                    'Qty of Packing': fmt_4dec(p.get('qty_of_packing')),
                    'Total Packing Cost': fmt_2dec(p.get('total_packing_cost')),
                    'Packaging Supplier': p_supplier,
                    'Markings in Packaging': p.get('markings_in_packaging', 'N/A'),
                    'Commission Rate': fmt_2dec(p.get('commission_rate')),
                    'Total Commission': fmt_2dec(p.get('total_commission')),
                    'Container Shipment Size': p_size,
                    'Logistic Cost': fmt_2dec(p.get('logistic')),
                    'Logistic Remark': p.get('logistic_remark', 'N/A'),
                    'Reference TRN': p.get('ref_trn', 'N/A'),
                    'Reference Product Code': p.get('ref_product_code', 'N/A'),
                })
            df_products = pd.DataFrame(products_list) if products_list else pd.DataFrame(columns=['Product Code', 'Product Name', 'Trade Qty', 'Rate in USD', 'Product Value'])
            df_products.to_excel(writer, sheet_name='Trade Products', index=False)

            # 3. Pre Sales & Purchase Sheet
            presp_obj = report_data.get('presp') or {}
            presp_summary = []
            if presp_obj:
                presp_summary.append({'Field': 'PO / PI Issuance Date', 'Value': presp_obj.get('doc_issuance_date', 'N/A')})
                presp_summary.append({'Field': 'Advance / LC Due Date', 'Value': presp_obj.get('doc_issuance_date', 'N/A')})
                
                docs = [d.get('doc', {}).get('name') if isinstance(d.get('doc'), dict) else d.get('name', '') for d in (presp_obj.get('documentRequired') or []) if d]
                presp_summary.append({'Field': 'Documents Required', 'Value': ', '.join(filter(None, docs)) or 'None'})
                
                ack_pis = [p.get('ackn_pi_name') or 'PI File' for p in (presp_obj.get('acknowledgedPI') or []) if p]
                presp_summary.append({'Field': 'Acknowledged PI', 'Value': ', '.join(ack_pis) or 'None'})

                ack_pos = [p.get('ackn_po_name') or 'PO File' for p in (presp_obj.get('acknowledgedPO') or []) if p]
                presp_summary.append({'Field': 'Acknowledged PO', 'Value': ', '.join(ack_pos) or 'None'})
            df_presp = pd.DataFrame(presp_summary) if presp_summary else pd.DataFrame([{'Field': 'Status', 'Value': 'No Pre Sales/Purchase data available'}])
            df_presp.to_excel(writer, sheet_name='Pre Sales & Purchase', index=False)

            # 4. Prepayment Sheet
            pp_obj = report_data.get('pp') or {}
            pp_summary = []
            if pp_obj:
                pp_summary.append({'Field': 'Advance Received', 'Value': fmt_2dec(pp_obj.get('advance_received'))})
                pp_summary.append({'Field': 'Date of Receipt', 'Value': pp_obj.get('date_of_receipt', 'N/A')})
                pp_summary.append({'Field': 'Advance Paid', 'Value': fmt_2dec(pp_obj.get('advance_paid'))})
                pp_summary.append({'Field': 'Date of Payment', 'Value': pp_obj.get('date_of_payment', 'N/A')})
                pp_summary.append({'Field': 'LC Number', 'Value': pp_obj.get('lc_number', 'N/A')})
                pp_summary.append({'Field': 'LC Opening Bank', 'Value': pp_obj.get('lc_opening_bank', 'N/A')})
                pp_summary.append({'Field': 'LC Expiry Date', 'Value': pp_obj.get('lc_expiry_date', 'N/A')})
                pp_summary.append({'Field': 'Latest Shipment Date in LC', 'Value': pp_obj.get('latest_shipment_date_in_lc', 'N/A')})
                
                lc_copies = [c.get('name', 'LC Copy') for c in (pp_obj.get('lcCopy') or []) if c]
                pp_summary.append({'Field': 'LC Copies', 'Value': ', '.join(lc_copies) or 'None'})
                
                lc_amends = [c.get('name', 'Amendment') for c in (pp_obj.get('lcAmmendment') or []) if c]
                pp_summary.append({'Field': 'LC Amendments', 'Value': ', '.join(lc_amends) or 'None'})

                tt_copies = [c.get('name', 'TT Copy') for c in (pp_obj.get('advanceTTCopy') or []) if c]
                pp_summary.append({'Field': 'Advance TT Copies', 'Value': ', '.join(tt_copies) or 'None'})
            df_pp = pd.DataFrame(pp_summary) if pp_summary else pd.DataFrame([{'Field': 'Status', 'Value': 'No Prepayment data available'}])
            df_pp.to_excel(writer, sheet_name='Prepayment', index=False)

            # 5. Sales & Purchases Sheet
            sp_list = report_data.get('sp') or []
            sp_rows = []
            sp_prods_rows = []
            pf_rows = []

            for sp in sp_list:
                sp_id = sp.get('id', 'N/A')
                sp_rows.append({
                    'S&P ID': sp_id,
                    'Invoice Date': sp.get('invoice_date', 'N/A'),
                    'Invoice Number': sp.get('invoice_number', 'N/A'),
                    'Invoice Amount': fmt_2dec(sp.get('invoice_amount')),
                    'BL Number': sp.get('bl_number', 'N/A'),
                    'BL Fees': fmt_2dec(sp.get('bl_fees')),
                    'BL Collection Cost': fmt_2dec(sp.get('bl_collection_cost')),
                    'BL Date': sp.get('bl_date', 'N/A'),
                    'Logistic Cost': fmt_2dec(sp.get('logistic_cost')),
                    'Logistic Cost Due Date': sp.get('logistic_cost_due_date', 'N/A'),
                    'Liner': sp.get('liner', 'N/A'),
                    'POD': sp.get('pod', 'N/A'),
                    'POL': sp.get('pol', 'N/A'),
                    'ETD': sp.get('etd', 'N/A'),
                    'ETA': sp.get('eta', 'N/A'),
                })

                for prod in sp.get('sp_product', []) or []:
                    p_name = prod.get('productName', {}).get('name') if isinstance(prod.get('productName'), dict) else (prod.get('product_name') or 'N/A')
                    sp_prods_rows.append({
                        'S&P ID': sp_id,
                        'Product Code': prod.get('product_code', 'N/A'),
                        'Product Name': p_name,
                        'BL Qty': fmt_4dec(prod.get('bl_qty')),
                        'Batch Number': prod.get('batch_number', 'N/A'),
                        'Production Date': prod.get('production_date', 'N/A'),
                    })

                for pf in sp.get('pf', []) or []:
                    pf_rows.append({
                        'S&P ID': sp_id,
                        'Balance Payment': fmt_2dec(pf.get('balance_payment')),
                        'Bal Payment Due Date': pf.get('balance_payment_due_date', 'N/A'),
                        'Balance Payment Received': fmt_2dec(pf.get('balance_payment_received')),
                        'Balance Payment Made': fmt_2dec(pf.get('balance_payment_made')),
                        'Balance Payment Date': pf.get('balance_payment_date', 'N/A'),
                        'Net Due in This Trade': fmt_2dec(pf.get('net_due_in_this_trade')),
                        'Document Released Date': pf.get('release_docs_date', 'N/A'),
                        'Document Released By': pf.get('released_by', 'N/A'),
                    })

            df_sp = pd.DataFrame(sp_rows) if sp_rows else pd.DataFrame([{'Status': 'No S&P data available'}])
            df_sp.to_excel(writer, sheet_name='Sales & Purchases', index=False)

            if sp_prods_rows:
                df_sp_prods = pd.DataFrame(sp_prods_rows)
                df_sp_prods.to_excel(writer, sheet_name='S&P Products', index=False)

            if pf_rows:
                df_pf = pd.DataFrame(pf_rows)
                df_pf.to_excel(writer, sheet_name='Payment & Finance', index=False)

        return response




