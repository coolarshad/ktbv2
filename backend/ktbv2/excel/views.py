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
        tradeProducts = TradeProduct.objects.all()
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
                'logistic_cost_remarks': trade['trade']['logistic_cost_remarks'],
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
        response['Content-Disposition'] = 'attachment; filename="kyc.xlsx"'
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
