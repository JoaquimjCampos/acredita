from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "backend.core"
    verbose_name = "Core - Integração e Métricas"

    def ready(self):
        # Regista sinais de integração entre apps
        try:
            import backend.core.signals  # noqa: F401
        except Exception:
            # Evita crash em migrações iniciais
            pass
