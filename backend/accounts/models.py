from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator

from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """Extended User model for Acredita platform"""
    # ...existing code...
    
    USER_TYPES = (
        ('participant', 'Participante'),
        ('voter', 'Eleitor'),
        ('admin', 'Administrador'),
        ('mentor', 'Mentor'),
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
    province = models.CharField(max_length=50, blank=True, verbose_name='Província')
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
    
    # Tracking
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Utilizador'
        verbose_name_plural = 'Utilizadores'
        
    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()


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
