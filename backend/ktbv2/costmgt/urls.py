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
    path('consumption-formula/', ConsumptionFormulaView.as_view(), name='consumption-formula'),
    path('consumption-formula/<int:pk>/', ConsumptionFormulaView.as_view(), name='consumption-formula-detail'),

    path('consumption/', ConsumptionView.as_view(), name='consumption'),
    path('consumption/<int:pk>/', ConsumptionView.as_view(), name='consumption-detail'),

    path('packings-approve/<int:pk>/', PackingApprovalView.as_view(), name='packings-approve'),
    path('raw-materials-approve/<int:pk>/', RawMaterialApprovalView.as_view(), name='raw-materials-approve'),
    path('additives-approve/<int:pk>/', AdditiveApprovalView.as_view(), name='additives-approve'),
    path('consumption-formula-approve/<int:pk>/', ConsumptionFormulaApprovalView.as_view(), name='consumption-formula-approve'),

]+ router.urls