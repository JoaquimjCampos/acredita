from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Episode
from .tasks import notify_episode_created
import logging

@receiver(post_save, sender=Episode)
def episode_post_save(sender, instance, created, **kwargs):
    logger = logging.getLogger('django')
    if created:
        logger.info(f"Episode created: {instance}")
        try:
            notify_episode_created.delay(instance.pk)
        except Exception as e:
            logger.warning(f"Celery task not available: {e}")
    else:
        logger.info(f"Episode updated: {instance}")
