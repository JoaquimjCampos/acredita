from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _

class Season(models.Model):
    """Model for program seasons"""
    
    STATUS_CHOICES = (
        ('upcoming', 'Próxima'),
        ('registration_open', 'Inscrições Abertas'),
        ('active', 'Ativa'),
        ('completed', 'Concluída'),
    )
    
    title = models.CharField(max_length=100, verbose_name=_('Título'))
    description = models.TextField(verbose_name=_('Descrição'))
    season_number = models.PositiveIntegerField(unique=True, verbose_name=_('Número da Temporada'))
    
    # Timeline
    registration_start = models.DateTimeField(verbose_name=_('Início das Inscrições'))
    registration_end = models.DateTimeField(verbose_name=_('Fim das Inscrições'))
    start_date = models.DateTimeField(verbose_name=_('Data de Início'))
    end_date = models.DateTimeField(verbose_name=_('Data de Fim'))
    
    # Configuration
    max_participants = models.PositiveIntegerField(default=20, verbose_name=_('Máximo de Participantes'))
    prize_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        verbose_name=_('Valor do Prémio')
    )
    
    # Media
    poster_image = models.CharField(
        max_length=255,
        null=True, 
        blank=True,
        verbose_name=_('Imagem da Temporada')
    )
    trailer_video = models.URLField(blank=True, verbose_name=_('Vídeo Promocional'))
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming', verbose_name=_('Estado'))
    is_current = models.BooleanField(default=False, verbose_name=_('Temporada Atual'))
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Temporada'
        verbose_name_plural = 'Temporadas'
        ordering = ['-season_number']
    
    def __str__(self):
        return f"Temporada {self.season_number}: {self.title}"
    
    @property
    def is_registration_open(self):
        now = timezone.now()
        return self.registration_start <= now <= self.registration_end
    
    @property
    def participant_count(self):
        return self.participants.count()
    
    def save(self, *args, **kwargs):
        if self.is_current:
            # Ensure only one season is current
            Season.objects.filter(is_current=True).update(is_current=False)
        super().save(*args, **kwargs)


class Episode(models.Model):
    """Model for season episodes"""
    # ...existing code...

    
    STATUS_CHOICES = (
        ('upcoming', 'Próximo'),
        ('live', 'Ao Vivo'),
        ('completed', 'Concluído'),
        ('cancelled', 'Cancelado'),
    )
    
    season = models.ForeignKey(Season, on_delete=models.CASCADE, related_name='episodes', db_index=True)
    episode_number = models.PositiveIntegerField(verbose_name=_('Número do Episódio'), db_index=True)
    title = models.CharField(max_length=100, verbose_name=_('Título'), db_index=True)
    description = models.TextField(verbose_name=_('Descrição'))
    
    # Scheduling
    air_date = models.DateTimeField(verbose_name=_('Data de Transmissão'))
    duration_minutes = models.PositiveIntegerField(default=60, verbose_name=_('Duração (minutos)'))
    
    # Content
    video_url = models.URLField(blank=True, verbose_name=_('URL do Vídeo'))
    thumbnail = models.CharField(
        max_length=255,
        null=True, 
        blank=True,
        verbose_name=_('Miniatura')
    )
    
    # Engagement
    view_count = models.PositiveIntegerField(default=0, verbose_name=_('Visualizações'))
    like_count = models.PositiveIntegerField(default=0, verbose_name=_('Likes'))
    
    # Competition
    has_elimination = models.BooleanField(default=False, verbose_name=_('Tem Eliminação'))
    voting_enabled = models.BooleanField(default=False, verbose_name=_('Votação Habilitada'))
    voting_end_date = models.DateTimeField(null=True, blank=True, verbose_name=_('Fim da Votação'))
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming', verbose_name=_('Estado'))
    is_deleted = models.BooleanField(default=False, verbose_name=_('Removido'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.CharField(max_length=100, blank=True, null=True, verbose_name='Atualizado por')
    
    class Meta:
        verbose_name = 'Episódio'
        verbose_name_plural = 'Episódios'
        ordering = ['season', 'episode_number']
        unique_together = ['season', 'episode_number']
        indexes = [
            models.Index(fields=['season', 'episode_number']),
            models.Index(fields=['status']),
            models.Index(fields=['air_date']),
        ]
    
    def __str__(self):
        return f"S{self.season.season_number}E{self.episode_number}: {self.title}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Audit logging
        from django.conf import settings
        import logging
        logger = logging.getLogger('django')
        logger.info(f"Episode {self.pk} saved: season={self.season_id}, number={self.episode_number}, deleted={self.is_deleted}")
    
    @property
    def is_voting_active(self):
        if not self.voting_enabled or not self.voting_end_date:
            return False
        return timezone.now() <= self.voting_end_date


class EpisodeParticipant(models.Model):
    """Relationship between episodes and participants with performance tracking"""
    
    episode = models.ForeignKey(Episode, on_delete=models.CASCADE, related_name='episode_participants')
    participant = models.ForeignKey('participants.Participant', on_delete=models.CASCADE)
    
    # Performance
    performance_score = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        null=True,
        blank=True,
        verbose_name=_('Pontuação de Performance')
    )
    mentor_feedback = models.TextField(blank=True, verbose_name=_('Feedback do Mentor'))

    # Votação
    vote_count = models.PositiveIntegerField(default=0, verbose_name=_('Votos Recebidos'))

    # Status in episode
    is_featured = models.BooleanField(default=False, verbose_name=_('Em Destaque'))
    is_eliminated = models.BooleanField(default=False, verbose_name=_('Eliminado'))

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.CharField(max_length=100, blank=True, null=True, verbose_name='Atualizado por')

    class Meta:
        verbose_name = 'Participante do Episódio'
        verbose_name_plural = 'Participantes dos Episódios'
        unique_together = ['episode', 'participant']

    def __str__(self):
        return f"{self.participant.business_name} - {self.episode.title}"
