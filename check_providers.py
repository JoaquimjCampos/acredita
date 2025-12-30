#!/usr/bin/env python
"""List all providers and their types"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.acredita_backend.settings')
django.setup()

from backend.marketplace.models import ServiceProvider, ServiceListing

providers = ServiceProvider.objects.all()
print(f'Total providers: {len(providers)}')
for p in providers:
    listings_count = ServiceListing.objects.filter(provider=p).count()
    print(f'  - {p.business_name}: type={p.provider_type}, listings={listings_count}')

# Check which provider the listings are using
print('\nListings by provider:')
for listing in ServiceListing.objects.all()[:2]:
    print(f'  - {listing.title}: provider={listing.provider.business_name} (type={listing.provider.provider_type})')
