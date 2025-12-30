"""
Create test user and participant for API testing
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.acredita_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from backend.participants.models import Participant
from backend.seasons.models import Season
from decimal import Decimal

User = get_user_model()

# Create or get test user
username = 'testuser'
password = 'Test123!'
email = 'test@acredita.ao'

user, created = User.objects.get_or_create(
    username=username,
    defaults={
        'email': email,
        'first_name': 'Test',
        'last_name': 'User',
        'user_type': 'participant',
        'is_verified': True,
        'province': 'Luanda'
    }
)

if created:
    user.set_password(password)
    user.save()
    print(f'✓ Created user: {username}')
else:
    # Reset password in case it changed
    user.set_password(password)
    user.save()
    print(f'✓ User exists (password reset): {username}')

# Create or get test participant
try:
    participant = Participant.objects.get(user=user)
    print(f'✓ Participant exists: {participant.business_name}')
except Participant.DoesNotExist:
    # Get or create a season
    from django.utils import timezone
    season, _ = Season.objects.get_or_create(
        season_number=999,
        defaults={
            'title': 'Test Season',
            'description': 'Test season for development',
            'status': 'active',
            'registration_start': timezone.now(),
            'registration_end': timezone.now() + timezone.timedelta(days=30),
            'start_date': timezone.now(),
            'end_date': timezone.now() + timezone.timedelta(days=365)
        }
    )
    
    # Create participant
    participant = Participant.objects.create(
        user=user,
        participant_number='P001',
        business_name='Test Business',
        business_category='technology',
        business_description='A test business for development',
        status='active',
        season=season,
        funding_goal=Decimal('100000.00'),
        funding_received=Decimal('25000.00')
    )
    print(f'✓ Created participant: {participant.business_name}')

print('\n=== Test Credentials ===')
print(f'Username: {username}')
print(f'Password: {password}')
print(f'Email: {email}')
print('========================\n')
