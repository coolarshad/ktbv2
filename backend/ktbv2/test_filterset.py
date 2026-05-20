import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ktbv2.settings")
django.setup()

from trademgt.views import TradeView, PreSalePurchaseView
print("TradeView model:", TradeView.filterset_class.Meta.model)
print("PreSalePurchaseView model:", getattr(PreSalePurchaseView, 'filterset_class', None))
if getattr(PreSalePurchaseView, 'filterset_class', None):
    print("PreSalePurchaseView Meta:", PreSalePurchaseView.filterset_class.Meta.model)
