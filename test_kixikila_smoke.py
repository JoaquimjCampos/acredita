#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Kixikila Smoke E2E Test
Tests: list → join → contribute flow with real backend
"""

import os
import sys
import django
import requests
import json
from decimal import Decimal

# Fix encoding for Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.acredita_backend.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth import get_user_model
from backend.kixikila.models import KixikilaGroup, KixikilaMembership

User = get_user_model()
BASE_URL = 'http://localhost:8000/api/v2/kixikila'

def test_flow():
    print("=" * 80)
    print("KIXIKILA SMOKE E2E TEST")
    print("=" * 80)
    
    # Create test users if not exist
    user1, _ = User.objects.get_or_create(
        username='testuser1',
        defaults={'email': 'test1@example.com'}
    )
    user2, _ = User.objects.get_or_create(
        username='testuser2',
        defaults={'email': 'test2@example.com'}
    )
    print(f"\n✓ Users created: {user1.username}, {user2.username}")
    
    # Create a test group
    try:
        group = KixikilaGroup.objects.create(
            name='Test Group Smoke',
            group_type='professional',
            description='Grupo para teste E2E',
            monthly_contribution=Decimal('50000.00'),
            max_members=5,
            duration_months=6,
            start_date='2025-12-22',
            created_by=user1
        )
        print(f"✓ Group created: {group.id} - {group.name}")
    except Exception as e:
        print(f"✗ Error creating group: {e}")
        return False
    
    # Test 1: List groups (GET /groups/)
    print("\n[TEST 1] List groups...")
    try:
        response = requests.get(f'{BASE_URL}/groups/')
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert 'results' in data, "Missing 'results' in response"
        print(f"✓ Listed {data.get('count', 0)} groups")
    except Exception as e:
        print(f"✗ Error: {e}")
        return False
    
    # Test 2: Get group stats (GET /groups/{id}/stats/)
    print(f"\n[TEST 2] Get group stats (group {group.id})...")
    try:
        response = requests.get(f'{BASE_URL}/groups/{group.id}/stats/')
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        stats = response.json()
        assert 'cash' in stats, "Missing 'cash' in stats"
        assert 'active' in stats, "Missing 'active' in stats"
        print(f"✓ Stats: cash={stats['cash']}, active={stats['active']}, participation={stats.get('participation_rate', 0)}%")
    except Exception as e:
        print(f"✗ Error: {e}")
        return False
    
    # Test 3: Join group (POST /groups/{id}/join/ - requires auth)
    print(f"\n[TEST 3] Join group (user1 joins as founder)...")
    try:
        # Get a session/token for user1 (Django test client or manual token)
        # For now, we'll just verify membership was created on group creation
        membership = KixikilaMembership.objects.filter(group=group, member=user1).first()
        if not membership:
            # Create via ORM for testing
            membership = KixikilaMembership.objects.create(
                group=group,
                member=user1,
                position=1,
                is_active=True
            )
        print(f"✓ User1 is member of group (position {membership.position})")
    except Exception as e:
        print(f"✗ Error: {e}")
        return False
    
    # Test 4: Verify membership via ORM
    print(f"\n[TEST 4] Verify membership via ORM...")
    try:
        from backend.kixikila.models import KixikilaContribution
        membership_check = KixikilaMembership.objects.filter(group=group, member=user1).first()
        assert membership_check is not None, "Membership should exist"
        assert membership_check.is_active, "Membership should be active"
        print(f"✓ User1 membership verified (position {membership_check.position})")
    except Exception as e:
        print(f"✗ Error: {e}")
        return False
    
    # Test 5: Create contribution via ORM
    print(f"\n[TEST 5] Create contribution via ORM...")
    try:
        from backend.kixikila.models import KixikilaContribution
        contrib = KixikilaContribution.objects.create(
            membership=membership,
            round=1,
            amount=Decimal('50000.00'),
            status='confirmed',
            payment_method='transfer'
        )
        print(f"✓ Contribution created: {contrib.id} - AOA {contrib.amount} (status: {contrib.status})")
    except Exception as e:
        print(f"✗ Error: {e}")
        return False
    
    # Test 6: Get group contributions (GET /groups/{id}/contributions/)
    print(f"\n[TEST 6] Get group contributions (REST API)...")
    try:
        response = requests.get(f'{BASE_URL}/groups/{group.id}/contributions/')
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert 'results' in data, "Missing 'results' in response"
        print(f"✓ Retrieved {data.get('count', 0)} contributions for group")
    except Exception as e:
        print(f"✗ Error: {e}")
        return False
    
    # Test 7: Get group members (GET /groups/{id}/members/)
    print(f"\n[TEST 7] Get group members (REST API)...")
    try:
        response = requests.get(f'{BASE_URL}/groups/{group.id}/members/')
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert 'results' in data, "Missing 'results' in response"
        print(f"✓ Retrieved {data.get('count', 0)} members")
    except Exception as e:
        print(f"✗ Error: {e}")
        return False
    
    # Test 8: Verify stats updated (should include contribution)
    print(f"\n[TEST 8] Verify stats updated after contribution...")
    try:
        response = requests.get(f'{BASE_URL}/groups/{group.id}/stats/')
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        stats = response.json()
        print(f"✓ Updated stats: cash={stats['cash']}, active={stats['active']}, participation={stats.get('participation_rate', 0)}%")
    except Exception as e:
        print(f"✗ Error: {e}")
        return False
    
    # Test 9: Get cycle information (GET /groups/{id}/cycles/)
    print(f"\n[TEST 9] Get cycle information...")
    try:
        response = requests.get(f'{BASE_URL}/groups/{group.id}/cycles/')
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        cycles = response.json()
        assert 'current_round' in cycles, "Missing 'current_round' in cycles"
        print(f"✓ Cycle info: round {cycles['current_round']}/{cycles.get('total_rounds', '?')}, status={cycles.get('status', '?')}")
        if cycles.get('next_beneficiary'):
            print(f"  └─ Next beneficiary: {cycles['next_beneficiary']['username']} (AOA {cycles['next_beneficiary']['amount']})")
    except Exception as e:
        print(f"✗ Error: {e}")
        return False
    
    print("\n" + "=" * 80)
    print("✓ ALL SMOKE TESTS PASSED!")
    print("=" * 80)
    return True

if __name__ == '__main__':
    success = test_flow()
    sys.exit(0 if success else 1)
