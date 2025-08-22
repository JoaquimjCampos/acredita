from django.db import models
from django.conf import settings

class GenericSimulator(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    domain = models.CharField(max_length=50, default='generic')  # e.g., finance, health, engineering
    parameters = models.JSONField(default=dict, blank=True)
    logic_module = models.CharField(max_length=100, blank=True)  # Python module for custom logic
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class GenericScenario(models.Model):
    simulator = models.ForeignKey('GenericSimulator', related_name='scenarios', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    choices = models.JSONField(default=list, blank=True)
    outcome = models.TextField(blank=True)

class GenericSimulatorSession(models.Model):
    simulator = models.ForeignKey(GenericSimulator, related_name='sessions', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    input_data = models.JSONField(default=dict, blank=True)
    result_data = models.JSONField(default=dict, blank=True)
    feedback = models.TextField(blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)
