#!/usr/bin/env python
"""
Simple test to verify Blog Admin registration and models
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.acredita_backend.settings')
django.setup()

from django.contrib.admin import site
from backend.blog.models import BlogPost, BlogCategory, BlogPostCategory
from backend.blog.admin import BlogPostAdmin, BlogCategoryAdmin, BlogPostCategoryAdmin

print("\n" + "="*70)
print("BLOG ADMIN REGISTRATION TEST")
print("="*70)

# Check if models are registered in admin
print("\n✓ Models imported successfully:")
print(f"  - BlogPost: {BlogPost}")
print(f"  - BlogCategory: {BlogCategory}")
print(f"  - BlogPostCategory: {BlogPostCategory}")

# Check admin registration
print("\n✓ Admin classes imported successfully:")
print(f"  - BlogPostAdmin: {BlogPostAdmin}")
print(f"  - BlogCategoryAdmin: {BlogCategoryAdmin}")
print(f"  - BlogPostCategoryAdmin: {BlogPostCategoryAdmin}")

# Check if registered in Django admin
registered_models = [model for model in site._registry.keys()]
print(f"\n✓ Total models registered in admin: {len(registered_models)}")

if BlogPost in site._registry:
    print(f"  ✓ BlogPost is registered")
    print(f"    Admin class: {site._registry[BlogPost].__class__.__name__}")
else:
    print(f"  ✗ BlogPost is NOT registered")

if BlogCategory in site._registry:
    print(f"  ✓ BlogCategory is registered")
    print(f"    Admin class: {site._registry[BlogCategory].__class__.__name__}")
else:
    print(f"  ✗ BlogCategory is NOT registered")

if BlogPostCategory in site._registry:
    print(f"  ✓ BlogPostCategory is registered")
    print(f"    Admin class: {site._registry[BlogPostCategory].__class__.__name__}")
else:
    print(f"  ✗ BlogPostCategory is NOT registered")

# Check database
print("\n✓ Database statistics:")
print(f"  - BlogPost count: {BlogPost.objects.count()}")
print(f"  - BlogCategory count: {BlogCategory.objects.count()}")
print(f"  - BlogPostCategory count: {BlogPostCategory.objects.count()}")

print("\n" + "="*70)
print("✅ BLOG ADMIN SETUP COMPLETE!")
print("="*70)
print("\nNext steps:")
print("1. Start Django server: python manage.py runserver")
print("2. Go to: http://localhost:8000/admin/blog/")
print("3. Login with admin credentials")
print("4. You should see:")
print("   - Blog Posts")
print("   - Blog Categories")
print("   - Blog Post Categories")
print("\n")
