"""
Signals for accounts app
Auto-create related models and update trust scores
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

User = get_user_model()


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Create UserProfile automatically when User is created"""
    if created:
        from backend.accounts.models import UserProfile
        UserProfile.objects.get_or_create(user=instance)


@receiver(post_save, sender=User)
def create_user_trust_score(sender, instance, created, **kwargs):
    """Create UserTrustScore automatically when User is created"""
    if created:
        from backend.accounts.models import UserTrustScore
        UserTrustScore.objects.get_or_create(user=instance)


@receiver(post_save, sender=User)
def update_profile_complete_status(sender, instance, **kwargs):
    """Update profile_complete flag in trust score"""
    from backend.accounts.models import UserTrustScore
    
    try:
        trust = instance.trust_score
        
        # Check if profile is complete
        profile_complete = all([
            instance.first_name,
            instance.last_name,
            instance.email,
            instance.province,
            instance.bio,
        ])
        
        if trust.profile_complete != profile_complete:
            trust.profile_complete = profile_complete
            trust.save()
    except UserTrustScore.DoesNotExist:
        pass
