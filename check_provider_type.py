#!/usr/bin/env python
"""Check current database provider type"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.acredita_backend.settings')
django.setup()

from backend.marketplace.models import ServiceProvider

sp = ServiceProvider.objects.first()
if sp:
    print(f'Provider: {sp.business_name}')
    print(f'Provider type field value: "{sp.provider_type}"')
    print(f'Provider type choices: {ServiceProvider._meta.get_field("provider_type").choices}')
else:
    print('No providers found')
