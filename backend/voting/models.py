from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

User = get_user_model()

class VotingSession(models.Model):
    """Model for voting sessions"""
    
    STATUS_CHOICES = (
        ('upcoming', 'Próxima'),
        ('active', 'Ativa'),
        ('paused', 'Pausada'),
        ('completed', 'Concluída'),
    )
    
    episode = models.OneToOneField(
        'seasons.Episode', 
        on_delete=models.CASCADE, 
        related_name='voting_session'
    )
    title = models.CharField(max_length=100, verbose_name='Título')
    description = models.TextField(verbose_name='Descrição')
    
    # Timeline
    start_date = models.DateTimeField(verbose_name='Data de Início')
    end_date = models.DateTimeField(verbose_name='Data de Fim')
    
    # Configuration
    max_votes_per_user = models.PositiveIntegerField(default=1, verbose_name='Máximo de Votos por Utilizador')
    requires_registration = models.BooleanField(default=False, verbose_name='Requer Registo')
    show_results_live = models.BooleanField(default=False, verbose_name='Mostrar Resultados em Tempo Real')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming', verbose_name='Estado')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Sessão de Votação'
        verbose_name_plural = 'Sessões de Votação'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Votação: {self.title}"
    
    @property
    def is_active(self):
        now = timezone.now()
        return self.status == 'active' and self.start_date <= now <= self.end_date
    
    @property
    def total_votes(self):
        return self.votes.count()


class Vote(models.Model):
    """Model for individual votes"""
    
    voting_session = models.ForeignKey(VotingSession, on_delete=models.CASCADE, related_name='votes')
    participant = models.ForeignKey(
        'participants.Participant', 
        on_delete=models.CASCADE, 
        related_name='received_votes'
    )
    voter = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='cast_votes'
    )
    
    # Anonymous voting support
    voter_email = models.EmailField(null=True, blank=True, verbose_name='Email do Eleitor')
    voter_phone = models.CharField(max_length=15, null=True, blank=True, verbose_name='Telefone do Eleitor')
    voter_ip = models.GenericIPAddressField(verbose_name='IP do Eleitor')
    
    # Vote details
    weight = models.IntegerField(default=1, verbose_name='Peso do Voto')
    comment = models.TextField(blank=True, max_length=500, verbose_name='Comentário')
    
    # Tracking
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False, verbose_name='Verificado')
    verification_token = models.CharField(max_length=100, blank=True, verbose_name='Token de Verificação')
    
    class Meta:
        verbose_name = 'Voto'
        verbose_name_plural = 'Votos'
        ordering = ['-created_at']
        # Prevent duplicate votes
        unique_together = [
            ['voting_session', 'voter'],
            ['voting_session', 'voter_email'],
            ['voting_session', 'voter_phone'],
        ]
    
    def __str__(self):
        voter_info = self.voter.username if self.voter else (self.voter_email or self.voter_phone)
        return f"Voto para {self.participant.business_name} por {voter_info}"


class VotingResult(models.Model):
    """Aggregated voting results"""
    
    voting_session = models.ForeignKey(VotingSession, on_delete=models.CASCADE, related_name='results')
    participant = models.ForeignKey(
        'participants.Participant', 
        on_delete=models.CASCADE,
        related_name='voting_results'
    )
    
    # Results
    vote_count = models.PositiveIntegerField(default=0, verbose_name='Total de Votos')
    vote_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0,
        verbose_name='Percentagem de Votos'
    )
    rank = models.PositiveIntegerField(null=True, blank=True, verbose_name='Posição')
    
    # Additional metrics
    verified_votes = models.PositiveIntegerField(default=0, verbose_name='Votos Verificados')
    weighted_score = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        verbose_name='Pontuação Ponderada'
    )
    
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Resultado de Votação'
        verbose_name_plural = 'Resultados de Votação'
        ordering = ['-vote_count']
        unique_together = ['voting_session', 'participant']
    
    def __str__(self):
        return f"{self.participant.business_name}: {self.vote_count} votos"


class VotingReport(models.Model):
    """Reports for suspicious voting activity"""
    
    REPORT_TYPES = (
        ('duplicate', 'Voto Duplicado'),
        ('fake', 'Voto Falso'),
        ('bot', 'Voto Automatizado'),
        ('other', 'Outro'),
    )
    
    voting_session = models.ForeignKey(VotingSession, on_delete=models.CASCADE, related_name='reports')
    vote = models.ForeignKey(Vote, on_delete=models.CASCADE, related_name='reports')
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES, verbose_name='Tipo de Relatório')
    description = models.TextField(verbose_name='Descrição')
    
    # Reporter info
    reporter_email = models.EmailField(verbose_name='Email do Denunciante')
    reporter_ip = models.GenericIPAddressField(verbose_name='IP do Denunciante')
    
    # Status
    is_reviewed = models.BooleanField(default=False, verbose_name='Revisto')
    is_valid = models.BooleanField(null=True, blank=True, verbose_name='Válido')
    admin_notes = models.TextField(blank=True, verbose_name='Notas do Administrador')
    
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Relatório de Votação'
        verbose_name_plural = 'Relatórios de Votação'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Relatório: {self.get_report_type_display()} - {self.voting_session.title}"
