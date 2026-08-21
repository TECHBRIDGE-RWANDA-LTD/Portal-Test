from django.apps import AppConfig


class PermitsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "permits"

    def ready(self):
        try:
            from django.core.management import call_command
            call_command('migrate', verbosity=0, interactive=False)
        except Exception:
            pass
