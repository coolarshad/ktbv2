from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse
import pandas as pd
from trademgt.models import *
from trademgt.serializers import *
from . import helper
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
                'Exchange rate': trade['trade']['exchange_rate'],
                'Commission agent': trade['trade']['commission_agent'],
                'contract_value': trade['trade']['contract_value'],
                'payment_term': trade['trade']['paymentTerm']['name'],
                'advance_value_to_receive': trade['trade']['advance_value_to_receive'],
                'commission_value': trade['trade']['commission_value'],
                'logistic_provider': trade['trade']['logistic_provider'],
                'estimated_logistic_cost': trade['trade']['estimated_logistic_cost'],
                'logistic_cost_tolerence': trade['trade']['logistic_cost_tolerence'],
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
                'bl_fee': trade['trade']['bl_fee'],
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
                'total_contract_qty': trade['total_contract_qty'],
                'total_contract_qty_unit': trade['total_contract_qty_unit'],
                'tolerance': trade['tolerance'],
                'contract_balance_qty': trade['contract_balance_qty'],
                'contract_balance_qty_unit': trade['contract_balance_qty_unit'],
                'trade_qty': trade['trade_qty'],
                'trade_qty_unit': trade['trade_qty_unit'],
                'selected_currency_rate': trade['selected_currency_rate'],
                'rate_in_usd': trade['rate_in_usd'],
                'product_value': trade['product_value'],
                'markings_in_packaging': trade['markings_in_packaging'],
                'packaging_supplier': trade['supplier']['name'],
                'mode_of_packing': trade['packing']['name'],
                'rate_of_each_packing': trade['rate_of_each_packing'],
                'qty_of_packing': trade['qty_of_packing'],
                'total_packing_cost': trade['total_packing_cost'],
                'commission_rate': trade['commission_rate'],

                'total_commission': trade['total_commission'],
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
                trade_data[f'extra_cost {i+1}'] = extra.get('extra_cost', '')
               
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
                'Value of Contract':obj['trn']['contract_value'],
                
                'Advance to Pay': obj['trn']['companyName']['name'],
                'Advance to Receive': obj['trn']['country_of_origin'],
                'Advance Due Date': obj['trn']['customer']['name'],
                'Trader Name': obj['trn']['trader_name'],
                'Insurance Policy Number': obj['trn']['insurance_policy_number'],
                
                'LC Number': obj['lc_number'],
                'LC Opening Bank': obj['lc_opening_bank'],
                'Advance Received': obj['advance_received'],
                'Date of Receipt': obj['date_of_receipt'],
                'Advance Paid': obj['advance_paid'],
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
                'Commission Value': helper.calculate_sp_commission_value(obj,obj['sp']['trn']['trade_products']),
                'Logistic Provider': obj['sp']['trn']['logistic_provider'],
              
                
                'Invoice Date': obj['sp']['invoice_date'],
                'Invoice Number': obj['sp']['invoice_number'],
                'Invoice Amount': obj['sp']['invoice_amount'],
                'BL Number': obj['sp']['bl_number'],
                'BL Fees': obj['sp']['bl_fees'],
                'BL Collection Cost': obj['sp']['bl_collection_cost'],
                'BL Date': obj['sp']['bl_date'],
                'Logistic Cost': obj['sp']['logistic_cost'],
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
                'BL Quantity': obj['bl_qty'],
                'Trade Qty Unit': obj['trade_qty_unit'],
                'Selected Currency Rate': obj['selected_currency_rate'],
                'Rate in USD': obj['rate_in_usd'],
                'Product Value': obj['bl_value'],

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

            obj_data = {
                'TRN':obj['sp']['trn']['trn'],
                'SP ID':obj['sp']['id'],
                'Trade Type': obj['sp']['trn']['trade_type'],
                'Payment Term': obj['sp']['trn']['paymentTerm']['name'],
                'Customer Company Name': obj['sp']['trn']['customer']['name'],
                'Trader Name': obj['sp']['trn']['trader_name'],
                'Insurance Policy Number': obj['sp']['trn']['insurance_policy_number'],

                'Invoice Amount':obj['sp']['invoice_amount'],
                'Invoice Number':obj['sp']['invoice_number'],
                'Invoice Date':obj['sp']['invoice_date'],
                'BL Number':obj['sp']['bl_number'],
                'Advance Received':obj['sp']['prepayment']['advance_received'],
                'Advance Paid':obj['sp']['prepayment']['advance_paid'],
                'Advance Received Date':obj['sp']['prepayment']['date_of_receipt'],
                'Advance Paid Date':obj['sp']['prepayment']['date_of_payment'],
                'Balance Payment':float(obj['sp']['invoice_amount'])-float(obj['sp']['prepayment']['advance_received'])-float(obj['sp']['prepayment']['advance_paid']),
                'Balance Payment Due Date':obj['sp']['bl_date'],
                'Logistic Cost':obj['sp']['logistic_cost'],
                'Logistic Provider':obj['sp']['trn']['logistic_provider'],
                'Logistic Cost Due Date':obj['sp']['logistic_cost_due_date'],

                
                'Commission Agent':obj['sp']['trn']['commission_agent'],
                'Commission Value':helper.calculate_pf_commission_value(obj['sp']['sp_product'],obj['sp']['trn']['trade_products']),
                'BL Fees': obj['sp']['bl_fees'],
                'BL Collection Cost': obj['sp']['bl_collection_cost'],
                'Shipment Status': obj['sp']['shipment_status'],
                
                
                'Remarks from S&P': obj['sp']['remarks'],

                'Advance Adjusted': obj['advance_adjusted'],
                'Balance Payment Received': obj['balance_payment_received'],
                'Balance Payment Made': obj['balance_payment_made'],
                'Balance Payment Date': obj['balance_payment_date'],
                'Net Due in This Trade': obj['net_due_in_this_trade'],
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
                'Sales Invoice Amount': obj['salesPF']['sp']['invoice_amount'],
                'Sales COMMISSION VALUE': obj['salesPF']['sp']['id'],
                'Sales BL Number': obj['salesPF']['sp']['bl_number'],
                'Sales BL FEES': obj['salesPF']['sp']['bl_fees'],
                'Sales BL COLLECTION COST': obj['salesPF']['sp']['bl_collection_cost'],
                'Sales OTHER CHARGES': obj['salesPF']['sp']['id'],
                'Sales BL Date': obj['salesPF']['sp']['bl_date'],
                'Sales Logitics Cost': obj['salesPF']['sp']['logistic_cost'],
                'Sales CHARGES P & F': obj['salesPF']['sp']['id'],
                'Sales Total Income': obj['salesPF']['sp']['invoice_amount'],

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
                'Purchase Invoice Amount': obj['purchasePF']['sp']['invoice_amount'],
                'Purchase COMMISSION VALUE': obj['purchasePF']['sp']['id'],
                'Purchase BL Number': obj['purchasePF']['sp']['bl_number'],
                'Purchase BL FEES': obj['purchasePF']['sp']['bl_fees'],
                'Purchase BL COLLECTION COST': obj['purchasePF']['sp']['bl_collection_cost'],
                'Purchase OTHER CHARGES': obj['purchasePF']['sp']['id'],
                'Purchase BL Date': obj['purchasePF']['sp']['bl_date'],
                'Purchase Logitics Cost': obj['purchasePF']['sp']['logistic_cost'],
                'Purchase CHARGES P & F': obj['purchasePF']['sp']['id'],
                'Purchase Total Expense': obj['salesPF']['sp']['invoice_amount'],
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
        objs = Consumption.objects.all()
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
        objs = ConsumptionFormula.objects.all()
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
        objs = ProductFormula.objects.all()
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
        objs = FinalProduct.objects.all()
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
        objs = Inventory.objects.all()
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
            row = {
                'Product Name': obj.get('productName', {}).get('name', '') if obj.get('productName') else obj.get('product_name', ''),
                'Batch Number': obj.get('batch_number', ''),
                'Production Date': obj.get('production_date', ''),
                'Closing Stock': obj.get('quantity', ''),
                'Unit': obj.get('unit', ''),
            }
            excel_data.append(row)
        return excel_data

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
                'Trade Qty': obj.get('contract_qty', ''),
                'Trade Unit': obj.get('contract_qty_unit', ''),
                'Balance Qty': obj.get('balance_qty', ''),
                'Balance Unit': obj.get('balance_qty_unit', ''),
                'Tolerance': obj.get('tolerance', ''),
                'Selected Currency Rate': obj.get('selected_currency_rate', ''),
                'Rate in USD': obj.get('rate_in_usd', ''),
                'Logistic': obj.get('logistic', ''),
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
        excel_data = []
        for obj in serialized_data:
            row = {
                'Product Code': obj.get('product_code', ''),
                'Total Contract Qty': obj.get('total_contract_qty', ''),
                'Contract Balance Qty': obj.get('contract_balance_qty', ''),
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
        excel_data = []
        for obj in serialized_data:
            row = {
                'Trade Type': obj.get('trade_type', ''),
                'Product Code': obj.get('product_code', ''),
                'Total Contract Qty': obj.get('total_contract_qty', ''),
                'Reference Balance Qty': obj.get('ref_balance_qty', ''),
            }
            excel_data.append(row)
        return excel_data

