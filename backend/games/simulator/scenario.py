from django.db import models

class Scenario(models.Model):
    simulator = models.ForeignKey('Simulator', related_name='scenarios', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    choices = models.JSONField(default=list, blank=True)  # e.g., [{"label": "Invest", "next": 2}, {"label": "Save", "next": 3}]
    outcome = models.TextField(blank=True)  # Outcome description or result

    def __str__(self):
        return f"{self.simulator.title} - {self.title}"
