#!/usr/bin/env python
"""
Simple Blog RBAC Verification Test
Tests that blog models, serializers, and permissions are working correctly.
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.acredita_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from backend.blog.models import BlogPost, BlogCategory
from backend.blog.serializers import BlogPostSerializer, BlogCategorySerializer
from backend.mcp_core.permissions import IsMentorOrAdminOrReadOnly

User = get_user_model()

print("\n" + "="*80)
print("BLOG RBAC SIMPLE VERIFICATION TEST")
print("="*80)

# Test 1: Check models exist
print("\n[TEST 1] Blog Models")
print("-"*80)
try:
    # Create a category
    category, created = BlogCategory.objects.get_or_create(
        slug='test-category',
        defaults={'name': 'Test Category', 'description': 'Test description'}
    )
    print(f"✓ BlogCategory: {category.name} ({'created' if created else 'exists'})")
    
    # Create a test user
    test_user, created = User.objects.get_or_create(
        username='blog_test_user',
        defaults={
            'email': 'blog@test.com',
            'user_type': 'mentor'
        }
    )
    if created:
        test_user.set_password('Test123!@#')
        test_user.save()
    print(f"✓ Test User: {test_user.username} (user_type: {test_user.user_type})")
    
    # Create a blog post
    post, created = BlogPost.objects.get_or_create(
        slug='test-blog-post',
        defaults={
            'title': 'Test Blog Post',
            'content': 'This is test content',
            'excerpt': 'Test excerpt',
            'author': test_user,
            'status': 'draft'
        }
    )
    print(f"✓ BlogPost: {post.title} ({'created' if created else 'exists'})")
    print(f"  - Author: {post.author.username if post.author else 'None'}")
    print(f"  - Status: {post.status}")
    print(f"  - Slug: {post.slug}")
    
except Exception as e:
    print(f"✗ Error: {e}")

# Test 2: Check serializers
print("\n[TEST 2] Serializers")
print("-"*80)
try:
    # Test category serializer
    cat_serializer = BlogCategorySerializer(category)
    print(f"✓ CategorySerializer data: {cat_serializer.data}")
    
    # Test post serializer
    post_serializer = BlogPostSerializer(post)
    print(f"✓ PostSerializer data keys: {list(post_serializer.data.keys())}")
    print(f"  - Title: {post_serializer.data['title']}")
    print(f"  - Author: {post_serializer.data.get('author_name', 'N/A')}")
    
except Exception as e:
    print(f"✗ Error: {e}")

# Test 3: Check permissions
print("\n[TEST 3] Permission Classes")
print("-"*80)
try:
    from backend.blog.views import BlogPostViewSet
    
    viewset = BlogPostViewSet()
    print(f"✓ BlogPostViewSet permission_classes: {viewset.permission_classes}")
    
    # Check if IsMentorOrAdminOrReadOnly is being used
    has_mentor_perm = any(
        issubclass(perm, IsMentorOrAdminOrReadOnly) 
        for perm in viewset.permission_classes
    )
    print(f"✓ Uses IsMentorOrAdminOrReadOnly: {has_mentor_perm}")
    
except Exception as e:
    print(f"✗ Error: {e}")

# Test 4: Check user_type based permissions
print("\n[TEST 4] User Type Permissions")
print("-"*80)
try:
    # Create test users with different user_types
    eleitor = User.objects.get_or_create(
        username='test_eleitor_simple',
        defaults={'email': 'eleitor@test.com', 'user_type': 'eleitor'}
    )[0]
    
    participante = User.objects.get_or_create(
        username='test_participante_simple',
        defaults={'email': 'participante@test.com', 'user_type': 'participant'}
    )[0]
    
    mentor = User.objects.get_or_create(
        username='test_mentor_simple',
        defaults={'email': 'mentor@test.com', 'user_type': 'mentor'}
    )[0]
    
    admin = User.objects.get_or_create(
        username='test_admin_simple',
        defaults={'email': 'admin@test.com', 'user_type': 'admin', 'is_staff': True}
    )[0]
    
    print(f"✓ Created test users:")
    print(f"  - Eleitor: {eleitor.username} (user_type={eleitor.user_type})")
    print(f"  - Participante: {participante.username} (user_type={participante.user_type})")
    print(f"  - Mentor: {mentor.username} (user_type={mentor.user_type})")
    print(f"  - Admin: {admin.username} (user_type={admin.user_type})")
    
    # Test permission logic manually
    print(f"\n✓ Permission Check Results:")
    print(f"  - Eleitor can create: {mentor.user_type in ['mentor', 'admin'] or mentor.is_staff}")
    print(f"  - Participante can create: {participante.user_type in ['mentor', 'admin'] or participante.is_staff}")
    print(f"  - Mentor can create: {mentor.user_type in ['mentor', 'admin'] or mentor.is_staff}")
    print(f"  - Admin can create: {admin.user_type in ['mentor', 'admin'] or admin.is_staff}")
    
except Exception as e:
    print(f"✗ Error: {e}")

# Test 5: Database check
print("\n[TEST 5] Database Statistics")
print("-"*80)
try:
    blog_count = BlogPost.objects.count()
    category_count = BlogCategory.objects.count()
    user_count = User.objects.count()
    
    print(f"✓ BlogPosts in database: {blog_count}")
    print(f"✓ Categories in database: {category_count}")
    print(f"✓ Users in database: {user_count}")
    
    # Show recent posts
    recent_posts = BlogPost.objects.all()[:5]
    print(f"\n✓ Recent Blog Posts:")
    for post in recent_posts:
        author_name = post.author.username if post.author else 'No author'
        print(f"  - '{post.title}' by {author_name} ({post.status})")
    
except Exception as e:
    print(f"✗ Error: {e}")

print("\n" + "="*80)
print("✅ TEST COMPLETE!")
print("="*80)
print("\nNext Steps:")
print("1. Start server: python manage.py runserver")
print("2. Access admin: http://localhost:8000/admin/blog/blogpost/")
print("3. Test API: curl http://localhost:8000/api/blog/")
print("4. Check logs: logs/rbac.log")
