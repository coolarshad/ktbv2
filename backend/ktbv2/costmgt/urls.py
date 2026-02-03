from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
# router.register(r'trades', TradeViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'raw-categories', RawCategoryViewSet)
router.register(r'additive-categories', AdditiveCategoryViewSet)
router.register(r'packings', PackingViewSet)
router.register(r'raw-materials', RawMaterialViewSet)
router.register(r'additives', AdditiveViewSet)
# router.register(r'final-products', FinalProductViewSet)
router.register(r'packing-type', PackingTypeViewSet)
router.register(r'packing-size', PackingSizeViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('consumption-formula/', ConsumptionFormulaView.as_view(), name='consumption-formula'),
    path('consumption-formula/<int:pk>/', ConsumptionFormulaView.as_view(), name='consumption-formula-detail'),

    path('product-formula/', ProductFormulaView.as_view(), name='product-formula'),
    path('product-formula/<int:pk>/', ProductFormulaView.as_view(), name='product-formula-detail'),

    path('consumption/', ConsumptionView.as_view(), name='consumption'),
    path('consumption/<int:pk>/', ConsumptionView.as_view(), name='consumption-detail'),

    path('final-product/', FinalProductView.as_view(), name='final-product'),
    path('final-product/<int:pk>/', FinalProductView.as_view(), name='final-product-detail'),

    path('packings-approve/<int:pk>/', PackingApprovalView.as_view(), name='packings-approve'),
    path('raw-materials-approve/<int:pk>/', RawMaterialApprovalView.as_view(), name='raw-materials-approve'),
    path('additives-approve/<int:pk>/', AdditiveApprovalView.as_view(), name='additives-approve'),
    path('consumption-formula-approve/<int:pk>/', ConsumptionFormulaApprovalView.as_view(), name='consumption-formula-approve'),
    path('consumption-approve/<int:pk>/', ConsumptionApprovalView.as_view(), name='consumption-approve'),
    path('final-product-approve/<int:pk>/', FinalProductApprovalView.as_view(), name='final-product-approve'),
    path('product-formula-approve/<int:pk>/', ProductFormulaApprovalView.as_view(), name='product-formula-approve'),

    path('next-consumption-ref/',NextConsumptionRef.as_view(),name="consumption-ref")

]+ router.urls