from django.contrib import admin
from .generic_models import Simulator, Scenario, SimulatorSession

@admin.register(Simulator)
class SimulatorAdmin(admin.ModelAdmin):
    list_display = ('title', 'domain', 'is_active', 'created_by', 'created_at')
    search_fields = ('title', 'description', 'domain')
    list_filter = ('domain', 'is_active')

@admin.register(Scenario)
class ScenarioAdmin(admin.ModelAdmin):
    list_display = ('title', 'simulator', 'order')
    search_fields = ('title', 'description')
    list_filter = ('simulator',)

@admin.register(SimulatorSession)
class SimulatorSessionAdmin(admin.ModelAdmin):
    list_display = ('simulator', 'user', 'started_at', 'finished_at')
    search_fields = ('simulator__title', 'user__username', 'feedback')
    list_filter = ('simulator',)
