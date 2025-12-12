
from django.db import models


# Basic Game model
class Game(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    GAME_TYPE_CHOICES = (
        ('quiz', 'Quiz'),
        ('simulator', 'Simulador'),
        ('association', 'Associação'),
        ('crosswords', 'Palavras Cruzadas'),
    )
    type = models.CharField(max_length=50, choices=GAME_TYPE_CHOICES, default='quiz')
    instructions = models.TextField(blank=True, default="")
    assets = models.JSONField(blank=True, null=True, default=list)
    ranking_enabled = models.BooleanField(default=False)
    feedback_enabled = models.BooleanField(default=False)
    max_score = models.PositiveIntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

# --- Simulator models moved from simulator/models.py ---
from django.conf import settings

class Simulator(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    parameters = models.JSONField(default=dict, blank=True)
    scenario = models.TextField(blank=True)
    scenario_type = models.CharField(max_length=100, blank=True)  # e.g., 'finance', 'marketing'
    difficulty = models.CharField(max_length=50, blank=True)
    kpi_targets = models.JSONField(default=dict, blank=True)  # e.g., {"profit": 10000}
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class SimulatorSession(models.Model):
    simulator = models.ForeignKey(Simulator, related_name='sessions', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    input_data = models.JSONField(default=dict, blank=True)
    result_data = models.JSONField(default=dict, blank=True)
    feedback = models.TextField(blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Session for {self.simulator.title} by {self.user}"
