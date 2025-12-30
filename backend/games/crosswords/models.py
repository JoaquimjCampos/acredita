from django.db import models
from django.conf import settings


class Crossword(models.Model):
    """Palavras Cruzadas game model"""
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    difficulty = models.CharField(max_length=50, blank=True, default='Médio')
    grid = models.JSONField(default=dict, blank=True, help_text="Crossword grid structure")
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']


class CrosswordClue(models.Model):
    """Individual clue for a crossword"""
    crossword = models.ForeignKey(Crossword, related_name='clues', on_delete=models.CASCADE)
    clue_text = models.CharField(max_length=300)
    answer = models.CharField(max_length=100)
    direction = models.CharField(max_length=10, choices=[('across', 'Horizontal'), ('down', 'Vertical')], default='across')
    number = models.PositiveIntegerField(default=1)
    order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.number}. {self.clue_text}"

    class Meta:
        ordering = ['crossword', 'order']


class CrosswordSession(models.Model):
    """User session for playing crosswords"""
    crossword = models.ForeignKey(Crossword, related_name='sessions', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    answers = models.JSONField(default=dict, blank=True)
    score = models.PositiveIntegerField(default=0)
    time_taken = models.PositiveIntegerField(default=0, help_text="Time in seconds")
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Session for {self.crossword.title} by {self.user}"

    class Meta:
        ordering = ['-started_at']
