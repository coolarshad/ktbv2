import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ktbv2.settings")
django.setup()

from trademgt.views import TradeApproveView, PreSalePurchaseApprove
print(getattr(TradeApproveView, 'filterset_class', None))
print(getattr(PreSalePurchaseApprove, 'filterset_class', None))
