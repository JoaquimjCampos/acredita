from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from decimal import Decimal

User = get_user_model()

class DonationCampaign(models.Model):
    """Model for fundraising campaigns"""
    
    STATUS_CHOICES = (
        ('draft', 'Rascunho'),
        ('active', 'Ativa'),
        ('paused', 'Pausada'),
        ('completed', 'Concluída'),
        ('cancelled', 'Cancelada'),
    )
    
    title = models.CharField(max_length=100, verbose_name='Título')
    description = models.TextField(verbose_name='Descrição')
    goal_amount = models.DecimalField(
        max_digits=12, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name='Meta de Arrecadação'
    )
    raised_amount = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0,
        verbose_name='Valor Arrecadado'
    )
    
    # Timeline
    start_date = models.DateTimeField(verbose_name='Data de Início')
    end_date = models.DateTimeField(verbose_name='Data de Fim')
    
    # Media
    image = models.URLField(
        null=True, 
        blank=True,
        verbose_name='URL da Imagem da Campanha',
        help_text='URL da imagem da campanha'
    )
    video_url = models.URLField(blank=True, verbose_name='Vídeo da Campanha')
    
    # Configuration
    min_donation = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=Decimal('5.00'),
        verbose_name='Doação Mínima'
    )
    max_donation = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        verbose_name='Doação Máxima'
    )
    anonymous_allowed = models.BooleanField(default=True, verbose_name='Permitir Doações Anónimas')
    
    # Associated entities
    participant = models.ForeignKey(
        'participants.Participant', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='campaigns',
        verbose_name='Participante'
    )
    season = models.ForeignKey(
        'seasons.Season', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='campaigns'
    )
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name='Estado')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Campanha de Doações'
        verbose_name_plural = 'Campanhas de Doações'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def progress_percentage(self):
        if self.goal_amount > 0:
            return min((self.raised_amount / self.goal_amount) * 100, 100)
        return 0
    
    @property
    def donors_count(self):
        return self.donations.filter(status='completed').values('donor_email').distinct().count()


class Donation(models.Model):
    """Model for individual donations"""
    
    STATUS_CHOICES = (
        ('pending', 'Pendente'),
        ('processing', 'Processando'),
        ('completed', 'Concluída'),
        ('failed', 'Falhada'),
        ('refunded', 'Reembolsada'),
        ('cancelled', 'Cancelada'),
    )
    
    PAYMENT_METHODS = (
        ('stripe', 'Stripe'),
        ('paypal', 'PayPal'),
        ('multicaixa', 'Multicaixa Express'),
        ('bank_transfer', 'Transferência Bancária'),
        ('mobile_money', 'Dinheiro Móvel'),
    )
    
    campaign = models.ForeignKey(DonationCampaign, on_delete=models.CASCADE, related_name='donations')
    
    # Donor information
    donor = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='donations'
    )
    donor_name = models.CharField(max_length=100, verbose_name='Nome do Doador')
    donor_email = models.EmailField(verbose_name='Email do Doador')
    donor_phone = models.CharField(max_length=15, blank=True, verbose_name='Telefone do Doador')
    is_anonymous = models.BooleanField(default=False, verbose_name='Doação Anónima')
    
    # Donation details
    amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name='Valor'
    )
    currency = models.CharField(max_length=3, default='AOA', verbose_name='Moeda')
    message = models.TextField(blank=True, max_length=500, verbose_name='Mensagem')
    
    # Payment processing
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, verbose_name='Método de Pagamento')
    payment_reference = models.CharField(max_length=100, unique=True, verbose_name='Referência de Pagamento')
    transaction_id = models.CharField(max_length=100, blank=True, verbose_name='ID da Transação')
    
    # Status and tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='Estado')
    processing_fee = models.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        default=0,
        verbose_name='Taxa de Processamento'
    )
    net_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        verbose_name='Valor Líquido'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    # Receipt
    receipt_sent = models.BooleanField(default=False, verbose_name='Recibo Enviado')
    receipt_number = models.CharField(max_length=50, blank=True, verbose_name='Número do Recibo')
    
    class Meta:
        verbose_name = 'Doação'
        verbose_name_plural = 'Doações'
        ordering = ['-created_at']
    
    def __str__(self):
        donor_display = "Anónimo" if self.is_anonymous else self.donor_name
        return f"{donor_display} - {self.amount} {self.currency}"
    
    def save(self, *args, **kwargs):
        if not self.net_amount:
            self.net_amount = self.amount - self.processing_fee
        super().save(*args, **kwargs)


class DonationGoal(models.Model):
    """Milestone goals for campaigns"""
    
    campaign = models.ForeignKey(DonationCampaign, on_delete=models.CASCADE, related_name='goals')
    title = models.CharField(max_length=100, verbose_name='Título')
    description = models.TextField(verbose_name='Descrição')
    target_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        verbose_name='Valor Alvo'
    )
    reward_description = models.TextField(blank=True, verbose_name='Descrição da Recompensa')
    
    is_achieved = models.BooleanField(default=False, verbose_name='Alcançado')
    achieved_at = models.DateTimeField(null=True, blank=True, verbose_name='Data de Alcance')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Meta de Doação'
        verbose_name_plural = 'Metas de Doação'
        ordering = ['target_amount']
    
    def __str__(self):
        return f"{self.title} - {self.target_amount} AOA"


class DonationReport(models.Model):
    """Reports and analytics for donations"""
    
    REPORT_TYPES = (
        ('daily', 'Diário'),
        ('weekly', 'Semanal'),
        ('monthly', 'Mensal'),
        ('campaign', 'Por Campanha'),
    )
    
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES, verbose_name='Tipo de Relatório')
    start_date = models.DateField(verbose_name='Data de Início')
    end_date = models.DateField(verbose_name='Data de Fim')
    
    # Metrics
    total_donations = models.PositiveIntegerField(default=0, verbose_name='Total de Doações')
    total_amount = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0,
        verbose_name='Valor Total'
    )
    total_fees = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        verbose_name='Total de Taxas'
    )
    net_amount = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0,
        verbose_name='Valor Líquido'
    )
    unique_donors = models.PositiveIntegerField(default=0, verbose_name='Doadores Únicos')
    
    generated_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Relatório de Doações'
        verbose_name_plural = 'Relatórios de Doações'
        ordering = ['-generated_at']
    
    def __str__(self):
        return f"{self.get_report_type_display()} - {self.start_date} a {self.end_date}"
