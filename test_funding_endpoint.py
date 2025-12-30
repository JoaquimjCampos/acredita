"""
Test funding endpoint directly
"""
import os
import sys
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.acredita_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from backend.participants.models import Participant
from backend.participants.serializers_kixikila import KixikilaFundingDashboardSerializer

User = get_user_model()

try:
    user = User.objects.get(username='testuser')
    participant = Participant.objects.get(user=user)
    
    print(f'✓ Found participant: {participant.business_name}')
    print(f'✓ primary_savings_group: {participant.primary_savings_group}')
    
    serializer = KixikilaFundingDashboardSerializer(participant)
    data = serializer.data
    
    print('\n✓✓✓ Serialization successful!\n')
    print(json.dumps(data, indent=2, default=str))
    
except Exception as e:
    print(f'❌ Error: {e}')
    import traceback
    traceback.print_exc()
