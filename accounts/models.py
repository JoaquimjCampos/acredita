"""
Modelos de Autenticação e Utilizadores - Sistema Acredita Angola
Integração com MCP (Model Context Protocol)
"""

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator
from django.conf import settings
import uuid

class User(AbstractUser):
    """Modelo de utilizador estendido para plataforma Acredita com integração MCP"""
    
    # Identificador único para MCP
    mcp_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    
    USER_TYPES = (
        ('participant', 'Participante'),
        ('voter', 'Eleitor'),
        ('admin', 'Administrador'),
        ('mentor', 'Mentor'),
        ('donor', 'Contribuinte'),
    )
    
    user_type = models.CharField(
        max_length=20, 
        choices=USER_TYPES, 
        default='voter',
        verbose_name='Tipo de Utilizador'
    )
    phone_number = models.CharField(
        max_length=15,
        validators=[RegexValidator(r'^\+?244\d{9}$', 'Número de telefone angolano inválido')],
        blank=True,
        null=True,
        verbose_name='Número de Telefone'
    )
    date_of_birth = models.DateField(null=True, blank=True, verbose_name='Data de Nascimento')
    
    # Campos específicos para Angola
    province = models.CharField(
        max_length=50, 
        blank=True, 
        verbose_name='Província',
        choices=[
            ('luanda', 'Luanda'),
            ('benguela', 'Benguela'),
            ('huila', 'Huíla'),
            ('namibe', 'Namibe'),
            ('cunene', 'Cunene'),
            ('huambo', 'Huambo'),
            ('bie', 'Bié'),
            ('malanje', 'Malanje'),
            ('lunda_norte', 'Lunda Norte'),
            ('lunda_sul', 'Lunda Sul'),
            ('moxico', 'Moxico'),
            ('cuando_cubango', 'Cuando Cubango'),
            ('cabinda', 'Cabinda'),
            ('zaire', 'Zaire'),
            ('uige', 'Uíge'),
            ('bengo', 'Bengo'),
            ('cuanza_norte', 'Cuanza Norte'),
            ('cuanza_sul', 'Cuanza Sul'),
        ]
    )
    city = models.CharField(max_length=50, blank=True, verbose_name='Cidade')
    profile_image = models.ImageField(
        upload_to='profiles/', 
        null=True, 
        blank=True,
        verbose_name='Imagem de Perfil'
    )
    bio = models.TextField(max_length=500, blank=True, verbose_name='Biografia')
    is_verified = models.BooleanField(default=False, verbose_name='Verificado')
    terms_accepted = models.BooleanField(default=False, verbose_name='Termos Aceites')
    newsletter_subscription = models.BooleanField(default=True, verbose_name='Subscrição Newsletter')
    
    # Preferências de comunicação formal MCP
    preferencia_comunicacao_formal = models.BooleanField(
        default=True,
        verbose_name="Comunicação Formal",
        help_text="Receber comunicações em formato formal angolano"
    )
    
    # Metadata MCP para rastreamento
    mcp_metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text="Metadados para comunicação MCP"
    )
    
    # Tracking
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Utilizador'
        verbose_name_plural = 'Utilizadores'
        
    def __str__(self):
        """Representação formal do utilizador"""
        formal_title = self._get_formal_title()
        full_name = self.get_full_name() or self.username
        return f"{formal_title} {full_name}"
    
    def _get_formal_title(self):
        """Obtém título formal baseado no tipo de utilizador"""
        titles = {
            'participant': 'Candidato(a)',
            'voter': 'Eleitor(a)', 
            'admin': 'Excelência',
            'mentor': 'Professor(a)',
            'donor': 'Contribuinte'
        }
        return titles.get(self.user_type, '')
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_formal_name(self):
        """Retorna nome formal para comunicação oficial"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.username
    
    def update_mcp_metadata(self, key: str, value):
        """Actualiza metadados MCP do utilizador"""
        if not self.mcp_metadata:
            self.mcp_metadata = {}
        self.mcp_metadata[key] = value
        self.save()


class UserProfile(models.Model):
    """Additional profile information for users"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Social Media
    facebook_url = models.URLField(blank=True, verbose_name='Facebook')
    instagram_url = models.URLField(blank=True, verbose_name='Instagram')
    linkedin_url = models.URLField(blank=True, verbose_name='LinkedIn')
    twitter_url = models.URLField(blank=True, verbose_name='Twitter')
    
    # Preferences
    language_preference = models.CharField(
        max_length=10,
        choices=[('pt', 'Português'), ('en', 'English')],
        default='pt',
        verbose_name='Idioma Preferido'
    )
    email_notifications = models.BooleanField(default=True, verbose_name='Notificações por Email')
    sms_notifications = models.BooleanField(default=False, verbose_name='Notificações por SMS')
    
    # Privacy
    show_email = models.BooleanField(default=False, verbose_name='Mostrar Email Publicamente')
    show_phone = models.BooleanField(default=False, verbose_name='Mostrar Telefone Publicamente')
    
    class Meta:
        verbose_name = 'Perfil de Utilizador'
        verbose_name_plural = 'Perfis de Utilizadores'
    
    def __str__(self):
        return f"Perfil de {self.user.username}"
