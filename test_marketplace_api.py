#!/usr/bin/env python
"""Test marketplace API for images and provider_type"""
import requests
import json

try:
    resp = requests.get('http://127.0.0.1:8000/api/v2/marketplace/listings/')
    print(f'Status: {resp.status_code}')
    
    data = resp.json()
    listings = data.get('results', [])
    print(f'Total listings: {len(listings)}')
    
    if listings:
        first = listings[0]
        print(f'\nFirst listing:')
        print(f'  - Title: {first.get("title")}')
        print(f'  - Type: {first.get("listing_type")}')
        print(f'  - Has images: {len(first.get("images", []))} images')
        if first.get("images"):
            print(f'  - First image URL: {first["images"][0][:80]}...')
        
        provider = first.get('provider', {})
        print(f'  - Provider name: {provider.get("business_name")}')
        print(f'  - Provider type: {provider.get("provider_type", "N/A")}')
        
        # Check products
        products = [l for l in listings if l.get('listing_type') == 'product']
        print(f'\nProducts with images: {sum(1 for p in products if p.get("images"))}')
        
except Exception as e:
    print(f'Error: {e}')
    print('Backend may not be running. Start it with: python manage.py runserver')
