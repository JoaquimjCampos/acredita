#!/usr/bin/env python
"""Update Loja Demo to merchant type"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.acredita_backend.settings')
django.setup()

from backend.marketplace.models import ServiceProvider

# Update the provider with listings to merchant
p = ServiceProvider.objects.get(business_name='Loja Demo')
p.provider_type = 'merchant'
p.save()
print(f'✓ Updated {p.business_name} to type: {p.provider_type}')
