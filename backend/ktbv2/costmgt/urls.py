from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
# router.register(r'trades', TradeViewSet)
router.register(r'packings', PackingViewSet)
router.register(r'raw-materials', RawMaterialViewSet)
router.register(r'additives', AdditiveViewSet)
router.register(r'final-products', FinalProductViewSet)

urlpatterns = [
    path('', include(router.urls)),

    path('consumption/', ConsumptionView.as_view(), name='consumption'),
    path('consumption/<int:pk>/', ConsumptionView.as_view(), name='consumption-detail'),

]+ router.urls