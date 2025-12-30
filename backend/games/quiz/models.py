from django.db import models
from django.conf import settings
from django.utils import timezone

# Quiz grouping model
class Quiz(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    difficulty = models.CharField(max_length=50, blank=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_quizzes')
    time_limit = models.PositiveIntegerField(default=0, help_text="Time limit in seconds (0 = no limit)")
    is_public = models.BooleanField(default=False, help_text="Se True, permite acesso público sem autenticação")
    is_active = models.BooleanField(default=True, help_text="Se True, o quiz está disponível para acesso")
    allow_anonymous_submission = models.BooleanField(default=True, help_text="Se True, usuários anônimos podem submeter respostas")
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    season_number = models.PositiveIntegerField(default=1, help_text="Season number for harmonization")
    
    # Campos para rastreamento
    public_access_count = models.PositiveIntegerField(default=0)
    authenticated_access_count = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = 'Quiz'
        verbose_name_plural = 'Quizzes'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['season_number', 'is_active']),
            models.Index(fields=['is_public', 'is_active']),
        ]

    def __str__(self):
        return self.title
    
    def is_available(self):
        """Verifica se o quiz está disponível no período especificado"""
        if not self.is_active:
            return False
        now = timezone.now()
        if self.start_date and now < self.start_date:
            return False
        if self.end_date and now > self.end_date:
            return False
        return True

# Question, Answer, and Session models

class Question(models.Model):
    quiz = models.ForeignKey('Quiz', related_name='questions', on_delete=models.CASCADE, null=True, blank=True)
    text = models.CharField(max_length=512)
    category = models.CharField(max_length=100, blank=True)
    explanation = models.TextField(blank=True, default="")
    hint = models.CharField(max_length=256, blank=True, default="")
    difficulty = models.CharField(max_length=50, blank=True, default="")
    is_multi_select = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.text

class Answer(models.Model):
    question = models.ForeignKey(Question, related_name='answers', on_delete=models.CASCADE)
    text = models.CharField(max_length=256)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.text} ({'Correta' if self.is_correct else 'Errada'})"

class GameSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    score = models.IntegerField(default=0)
    feedback = models.TextField(blank=True, default="")
    season_number = models.PositiveIntegerField(default=1, help_text="Season number for harmonization")

    def __str__(self):
        return f"Sessão de {self.user} em {self.started_at}"

class UserAnswer(models.Model):
    session = models.ForeignKey(GameSession, related_name='user_answers', on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer = models.ForeignKey(Answer, on_delete=models.CASCADE)
    answered_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.session.user} respondeu '{self.answer.text}' para '{self.question.text}'"
