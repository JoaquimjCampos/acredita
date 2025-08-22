
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets

# Basic CheckoutView for API
class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # Placeholder logic for checkout
        return Response({"message": "Checkout completed successfully."})

# Basic CartView for API
class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Placeholder logic for cart
        return Response({"cart": []})
from rest_framework import viewsets
from .serializers import ProductSerializer



from .models import Product, Order

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

from .serializers import OrderSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
from django.shortcuts import render

# Create your views here.
