# DEPRECATED: This app has been replaced by backend.marketplace
# All product and service functionality is now unified in marketplace app
# ServiceListing model handles both products and services via listing_type field
# Keep this file for migration compatibility only

from django.db import models

class Product(models.Model):
    """DEPRECATED: Use marketplace.ServiceListing instead"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        managed = False  # Don't create/modify this table

class Order(models.Model):
    """DEPRECATED: Use marketplace.ServiceOrder instead"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        managed = False  # Don't create/modify this table
