from celery import shared_task

@shared_task
def notify_episode_created(episode_id):
    # Dummy implementation for development
    print(f"Celery: Episode created with ID {episode_id}")
    return True
