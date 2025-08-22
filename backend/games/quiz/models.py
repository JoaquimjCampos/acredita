from django.db import models
from django.conf import settings
# Quiz grouping model

class Quiz(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    difficulty = models.CharField(max_length=50, blank=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    time_limit = models.PositiveIntegerField(default=0, help_text="Time limit in seconds (0 = no limit)")
    is_public = models.BooleanField(default=True)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
# Models for Quiz game

from django.db import models
from django.conf import settings

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

    def __str__(self):
        return f"Sessão de {self.user} em {self.started_at}"

class UserAnswer(models.Model):
    session = models.ForeignKey(GameSession, related_name='user_answers', on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer = models.ForeignKey(Answer, on_delete=models.CASCADE)
    answered_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.session.user} respondeu '{self.answer.text}' para '{self.question.text}'"
