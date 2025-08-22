from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'products', views.ProductViewSet)
router.register(r'orders', views.OrderViewSet)

app_name = 'store'

urlpatterns = [
    path('', include(router.urls)),
    path('cart/', views.CartView.as_view(), name='cart'),
    path('checkout/', views.CheckoutView.as_view(), name='checkout'),
]
