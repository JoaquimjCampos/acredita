#!/usr/bin/env python
"""Check if newly uploaded images appear in API"""
import os
import django
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.acredita_backend.settings')
django.setup()

from backend.marketplace.models import ServiceListing

# Get the newest listing
newest = ServiceListing.objects.order_by('-created_at').first()
if newest:
    print(f'Newest listing: {newest.title}')
    print(f'  - Images stored: {len(newest.images)} images')
    if newest.images:
        print(f'  - First image starts with: {newest.images[0][:80]}...')
    
    # Check API response
    resp = requests.get(f'http://127.0.0.1:8000/api/v2/marketplace/listings/{newest.id}/')
    if resp.status_code == 200:
        data = resp.json()
        print(f'\nAPI Response:')
        print(f'  - Images returned: {len(data.get("images", []))} images')
        if data.get('images'):
            print(f'  - First image URL: {data["images"][0][:80]}...')
    else:
        print(f'API error: {resp.status_code}')
else:
    print('No listings found')
