from django.conf import settings
from django.db import models
from django.contrib.auth import get_user_model
import json

User = get_user_model()


class TrustEvent(models.Model):
    """Registo de eventos que contribuem para confiança do utilizador."""

    EVENT_TYPES = [
        ("cert_pass", "Certificação aprovada"),
        ("market_order", "Ordem concluída no Marketplace"),
        ("kix_cycle", "Ciclo Kixikila concluído"),
        ("reality_winner", "Vencedor de Temporada"),
        ("game_session", "Sessão de jogo concluída"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="trust_events")
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES)
    points = models.IntegerField(default=0)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["event_type"]),
        ]


class RevenueStream(models.Model):
    """Receitas por fonte para relatórios e sustentabilidade."""

    SOURCES = [
        ("cert_enrollment", "Inscrição Certificação"),
        ("marketplace_commission", "Comissão Marketplace"),
        ("kixikila_platform_fee", "Taxa Kixikila"),
        ("reality_sponsorship", "Patrocínio Reality"),
        ("ads", "Publicidade"),
        ("donations", "Doações"),
    ]

    source = models.CharField(max_length=50, choices=SOURCES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["source", "created_at"]),
        ]


# ============================================================================
# RBAC Models (Role-Based Access Control)
# ============================================================================

class AuditLog(models.Model):
    """
    Modelo para registrar todas as ações de usuários no sistema.
    
    Campos:
    - user: Usuário que executou a ação
    - action: Tipo de ação (create, read, update, delete, login, logout)
    - resource: Recurso acessado (e.g., 'certifications', 'marketplace')
    - resource_id: ID do recurso (se aplicável)
    - method: HTTP method (GET, POST, PUT, DELETE)
    - endpoint: URL do request
    - status_code: HTTP status da resposta
    - user_role: Role do usuário no momento (para auditoria histórica)
    - ip_address: IP do cliente
    - user_agent: User agent do cliente
    - request_data: Dados do request (sanitizado)
    - response_status: Status da resposta
    - duration_ms: Duração da requisição em ms
    - timestamp: Quando aconteceu
    """

    ACTION_CHOICES = [
        ('create', 'Create'),
        ('read', 'Read'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('permission_denied', 'Permission Denied'),
        ('error', 'Error'),
    ]

    STATUS_CHOICES = [
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('denied', 'Permission Denied'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    resource = models.CharField(max_length=100)  # e.g., 'certifications', 'marketplace'
    resource_id = models.IntegerField(null=True, blank=True)
    method = models.CharField(max_length=10, default='GET')  # HTTP method
    endpoint = models.CharField(max_length=255)  # e.g., '/api/certifications/'
    status_code = models.IntegerField(null=True, blank=True)  # HTTP status (200, 403, etc)
    user_role = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        choices=[
            ('voter', 'Eleitor'),
            ('participant', 'Participante'),
            ('mentor', 'Mentor'),
            ('admin', 'Administrador'),
        ]
    )
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    request_data = models.TextField(blank=True)  # JSON serializado
    response_status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    duration_ms = models.IntegerField(null=True, blank=True)  # ms
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'core_auditlog'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['user_role', '-timestamp']),
            models.Index(fields=['action', '-timestamp']),
            models.Index(fields=['resource', '-timestamp']),
        ]

    def __str__(self):
        return f'{self.user} - {self.action} - {self.resource} - {self.timestamp}'

    @classmethod
    def log_action(cls, user, action, resource, resource_id=None, 
                   method='GET', endpoint='', status_code=None,
                   ip_address='127.0.0.1', user_agent='', request_data=None,
                   response_status='success', duration_ms=None):
        """
        Método auxiliar para registrar ações.
        
        Exemplo:
            AuditLog.log_action(
                user=request.user,
                action='create',
                resource='certifications',
                resource_id=cert.id,
                method='POST',
                endpoint='/api/certifications/',
                status_code=201,
                ip_address='192.168.1.1',
                response_status='success'
            )
        """
        user_role = getattr(user, 'user_type', None) if user and user.is_authenticated else None

        # Sanitizar request_data
        safe_request_data = ''
        if request_data:
            try:
                safe_data = {
                    k: v for k, v in request_data.items()
                    if k not in ['password', 'token', 'secret']
                }
                safe_request_data = json.dumps(safe_data, default=str)
            except:
                safe_request_data = str(request_data)

        return cls.objects.create(
            user=user if user and user.is_authenticated else None,
            action=action,
            resource=resource,
            resource_id=resource_id,
            method=method,
            endpoint=endpoint,
            status_code=status_code,
            user_role=user_role,
            ip_address=ip_address,
            user_agent=user_agent,
            request_data=safe_request_data,
            response_status=response_status,
            duration_ms=duration_ms,
        )


class RoleTransition(models.Model):
    """
    Modelo para registrar transições de role (upgrade de usuário).
    
    Exemplo: Eleitor → Participante
    """

    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('approved', 'Aprovado'),
        ('rejected', 'Rejeitado'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='role_transitions'
    )
    from_role = models.CharField(
        max_length=50,
        choices=[
            ('voter', 'Eleitor'),
            ('participant', 'Participante'),
            ('mentor', 'Mentor'),
        ]
    )
    to_role = models.CharField(
        max_length=50,
        choices=[
            ('participant', 'Participante'),
            ('mentor', 'Mentor'),
        ]
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reason = models.TextField()
    requested_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_transitions'
    )
    rejection_reason = models.TextField(blank=True)

    class Meta:
        db_table = 'core_roletransition'
        ordering = ['-requested_at']

    def __str__(self):
        return f'{self.user} - {self.from_role} → {self.to_role} ({self.status})'
