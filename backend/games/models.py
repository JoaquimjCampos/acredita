
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
