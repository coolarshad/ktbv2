from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse
import pandas as pd
from trademgt.models import *
from trademgt.serializers import *

class ExportTradeExcelView(APIView):
    def get(self, request, *args, **kwargs):
        trades = Trade.objects.all()
        serializer = TradeSerializer(trades, many=True)
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
                'Trade ID': trade['id'],
                'Trade Type': trade['trade_type'],
                'Trade Category': trade['trade_category'],
                # Include any other trade fields you want
            }

            for product in trade['trade_products']:
                trade_data.update({
                    'Product Code': product['product_code'],
                    'Trade Quantity': product['trade_qty'],
                    # Add other product fields as necessary
                })
                
            excel_data.append(trade_data)
        
        return excel_data

