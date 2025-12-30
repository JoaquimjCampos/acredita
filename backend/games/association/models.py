from django.db import models
from django.conf import settings


class Association(models.Model):
    """Association game model - match pairs of concepts"""
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    difficulty = models.CharField(max_length=50, blank=True, default='Médio')
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']


class AssociationPair(models.Model):
    """Individual pair for an association game"""
    association = models.ForeignKey(Association, related_name='pairs', on_delete=models.CASCADE)
    left_item = models.CharField(max_length=200, help_text="Conceito/termo")
    right_item = models.CharField(max_length=200, help_text="Definição/correspondência")
    order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.left_item} → {self.right_item}"

    class Meta:
        ordering = ['association', 'order']


class AssociationSession(models.Model):
    """User session for playing association games"""
    association = models.ForeignKey(Association, related_name='sessions', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    matches = models.JSONField(default=dict, blank=True, help_text="User matches: {left: right}")
    score = models.PositiveIntegerField(default=0)
    time_taken = models.PositiveIntegerField(default=0, help_text="Time in seconds")
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Session for {self.association.title} by {self.user}"

    class Meta:
        ordering = ['-started_at']
