from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import logging

logger = logging.getLogger('acredita.quiz')

User = get_user_model()


class QuizAccessLog(models.Model):
    """
    Registra acessos públicos e autenticados a quizzes.
    Útil para análise de engajamento e detecção de abuso.
    """
    
    ACCESS_TYPES = (
        ('public', 'Acesso Público'),
        ('authenticated', 'Acesso Autenticado'),
        ('admin', 'Acesso Administrativo'),
    )
    
    quiz_id = models.IntegerField(db_index=True)
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='quiz_accesses')
    ip_address = models.GenericIPAddressField()
    access_type = models.CharField(max_length=20, choices=ACCESS_TYPES)
    user_agent = models.CharField(max_length=500, blank=True)
    referrer = models.URLField(blank=True, null=True)
    endpoint = models.CharField(max_length=255)
    is_bot = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        verbose_name = 'Quiz Access Log'
        verbose_name_plural = 'Quiz Access Logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['quiz_id', '-created_at']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['ip_address', '-created_at']),
        ]
    
    def __str__(self):
        user_info = f"User: {self.user.username}" if self.user else f"IP: {self.ip_address}"
        return f"{self.get_access_type_display()} - {user_info} - Quiz: {self.quiz_id}"


class QuizAccessLogMixin:
    """Mixin para registrar acessos a quizzes automaticamente"""
    
    @staticmethod
    def log_access(request, quiz_id, access_type='public', endpoint=''):
        """Registra um acesso a um quiz"""
        from .permissions import QuizPermissionHelper
        
        try:
            QuizAccessLog.objects.create(
                quiz_id=quiz_id,
                user=request.user if request.user.is_authenticated else None,
                ip_address=QuizPermissionHelper.get_client_ip(request),
                access_type=access_type,
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
                referrer=request.META.get('HTTP_REFERER'),
                endpoint=endpoint,
                is_bot=QuizPermissionHelper.is_bot(request),
            )
        except Exception as e:
            logger.error(f"Erro ao registrar acesso ao quiz: {e}")
