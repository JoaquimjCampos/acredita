from django.apps import AppConfig


class SeasonsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "backend.seasons"

    def ready(self):
        import backend.seasons.signals
