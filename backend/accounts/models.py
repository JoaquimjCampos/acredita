from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator
from django.utils import timezone

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
    profile_image = models.CharField(
        max_length=255,
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


class UserTrustScore(models.Model):
    """Track trust/reputation score for progressive feature access"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='trust_score')
    
    # Verification (max 15 points)
    email_verified = models.BooleanField(default=False, verbose_name='Email Verificado')
    phone_verified = models.BooleanField(default=False, verbose_name='Telefone Verificado')
    profile_complete = models.BooleanField(default=False, verbose_name='Perfil Completo')
    
    # Engagement metrics (max 30 points)
    votes_cast = models.IntegerField(default=0, verbose_name='Votos Realizados')
    content_published = models.IntegerField(default=0, verbose_name='Conteúdo Publicado')
    positive_feedback_received = models.IntegerField(default=0, verbose_name='Feedback Positivo')
    reports_filed = models.IntegerField(default=0, verbose_name='Reportes Enviados')
    
    # Creator metrics (max 25 points)
    sales_completed = models.IntegerField(default=0, verbose_name='Vendas Completas')
    average_rating = models.FloatField(default=0.0, verbose_name='Rating Médio')
    dispute_count = models.IntegerField(default=0, verbose_name='Disputas')
    
    # Account health (max 10 points)
    account_age_days = models.IntegerField(default=0, verbose_name='Idade da Conta (dias)')
    last_flagged_date = models.DateTimeField(null=True, blank=True, verbose_name='Última Flag')
    flag_reason = models.CharField(max_length=255, blank=True, verbose_name='Razão da Flag')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Email verification code
    email_verification_code = models.CharField(max_length=12, blank=True, null=True, verbose_name='Código de Verificação de Email')
    email_verification_sent_at = models.DateTimeField(blank=True, null=True, verbose_name='Data de Envio do Código de Email')

    # Phone verification code
    phone_verification_code = models.CharField(max_length=12, blank=True, null=True, verbose_name='Código de Verificação de Telefone')
    phone_verification_sent_at = models.DateTimeField(blank=True, null=True, verbose_name='Data de Envio do Código de Telefone')
    
    class Meta:
        verbose_name = 'Pontuação de Confiança'
        verbose_name_plural = 'Pontuações de Confiança'
    
    def __str__(self):
        return f"Trust Score de {self.user.username}: {self.total_score:.1f}"
    
    @property
    def total_score(self) -> float:
        """Calculate total trust score (0-100)"""
        score = 0.0
        
        # Account age (max 10)
        score += min(10, self.account_age_days / 36.5)
        
        # Verification (max 15)
        score += 5 if self.email_verified else 0
        score += 5 if self.phone_verified else 0
        score += 5 if self.profile_complete else 0
        
        # Engagement (max 30)
        score += min(10, self.votes_cast / 10)
        score += min(10, self.content_published * 3)
        score += min(10, self.positive_feedback_received)
        
        # Creator (max 25)
        score += min(10, self.sales_completed * 2)
        score += min(10, self.average_rating * 2)
        score += max(0, 5 - (self.dispute_count * 2.5))
        
        # Penalties
        if self.flag_reason:
            score *= 0.5
        
        return min(100, max(0, score))
    
    def can_create_marketplace_listing(self) -> bool:
        """Voter needs trust_score >= 15 + verification"""
        if self.user.user_type in ['participant', 'mentor', 'admin']:
            return True
        
        return (
            self.total_score >= 15 and 
            self.email_verified and 
            self.phone_verified
        )
    
    def can_create_kixikila_group(self) -> bool:
        """Voter needs high trust OR subscription"""
        if self.user.user_type in ['participant', 'mentor', 'admin']:
            return True
        
        # Check subscription (if subscription model exists)
        # subscription = Subscription.objects.filter(user=self.user, active=True).first()
        # if subscription:
        #     return True
        
        # OR high trust score
        return (
            self.total_score >= 20 and 
            self.email_verified and 
            self.phone_verified
        )
    
    def can_publish_article(self) -> bool:
        """Voters need high trust for auto-publish"""
        if self.user.user_type in ['participant', 'mentor', 'admin']:
            return True
        
        return self.total_score >= 25 and self.profile_complete
    
    def update_account_age(self):
        """Update account age in days"""
        age_days = (timezone.now() - self.user.date_joined).days
        if age_days > self.account_age_days:
            self.account_age_days = age_days
            self.save()
    
    def increment_votes_cast(self):
        """Increment votes cast counter"""
        self.votes_cast += 1
        self.save()
    
    def increment_content_published(self):
        """Increment content published counter"""
        self.content_published += 1
        self.save()
    
    def add_positive_feedback(self):
        """Add positive feedback point"""
        self.positive_feedback_received += 1
        self.save()
    
    def add_sale(self, rating: float = None):
        """Add completed sale"""
        self.sales_completed += 1
        if rating:
            # Update average rating
            total = self.average_rating * (self.sales_completed - 1) + rating
            self.average_rating = total / self.sales_completed
        self.save()
    
    def flag_user(self, reason: str):
        """Flag user for suspicious activity"""
        self.flag_reason = reason
        self.last_flagged_date = timezone.now()
        self.save()
    
    def clear_flag(self):
        """Clear flag after review"""
        self.flag_reason = ''
        self.last_flagged_date = None
        self.save()
