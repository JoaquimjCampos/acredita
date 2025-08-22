# Scenario model import
from .scenario import Scenario
from django.db import models
from django.conf import settings

class Simulator(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    parameters = models.JSONField(default=dict, blank=True)  # e.g., {"initial_balance": 1000, "interest_rate": 0.05}
    scenario = models.TextField(blank=True)  # Scenario description or instructions
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class SimulatorSession(models.Model):
    simulator = models.ForeignKey(Simulator, related_name='sessions', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    input_data = models.JSONField(default=dict, blank=True)  # User's simulation inputs
    result_data = models.JSONField(default=dict, blank=True)  # Simulation results
    feedback = models.TextField(blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Session for {self.simulator.title} by {self.user}"
