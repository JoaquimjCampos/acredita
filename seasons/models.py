from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

class Season(models.Model):
    """Model for program seasons"""
    
    STATUS_CHOICES = (
        ('upcoming', 'Próxima'),
        ('registration_open', 'Inscrições Abertas'),
        ('active', 'Ativa'),
        ('completed', 'Concluída'),
    )
    
    title = models.CharField(max_length=100, verbose_name='Título')
    description = models.TextField(verbose_name='Descrição')
    season_number = models.PositiveIntegerField(unique=True, verbose_name='Número da Temporada')
    
    # Timeline
    registration_start = models.DateTimeField(verbose_name='Início das Inscrições')
    registration_end = models.DateTimeField(verbose_name='Fim das Inscrições')
    start_date = models.DateTimeField(verbose_name='Data de Início')
    end_date = models.DateTimeField(verbose_name='Data de Fim')
    
    # Configuration
    max_participants = models.PositiveIntegerField(default=20, verbose_name='Máximo de Participantes')
    prize_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        verbose_name='Valor do Prémio'
    )
    
    # Media
    poster_image = models.ImageField(
        upload_to='seasons/posters/', 
        null=True, 
        blank=True,
        verbose_name='Imagem da Temporada'
    )
    trailer_video = models.URLField(blank=True, verbose_name='Vídeo Promocional')
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming', verbose_name='Estado')
    is_current = models.BooleanField(default=False, verbose_name='Temporada Atual')
    
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
    
    STATUS_CHOICES = (
        ('upcoming', 'Próximo'),
        ('live', 'Ao Vivo'),
        ('completed', 'Concluído'),
        ('cancelled', 'Cancelado'),
    )
    
    season = models.ForeignKey(Season, on_delete=models.CASCADE, related_name='episodes')
    episode_number = models.PositiveIntegerField(verbose_name='Número do Episódio')
    title = models.CharField(max_length=100, verbose_name='Título')
    description = models.TextField(verbose_name='Descrição')
    
    # Scheduling
    air_date = models.DateTimeField(verbose_name='Data de Transmissão')
    duration_minutes = models.PositiveIntegerField(default=60, verbose_name='Duração (minutos)')
    
    # Content
    video_url = models.URLField(blank=True, verbose_name='URL do Vídeo')
    thumbnail = models.ImageField(
        upload_to='episodes/thumbnails/', 
        null=True, 
        blank=True,
        verbose_name='Miniatura'
    )
    
    # Engagement
    view_count = models.PositiveIntegerField(default=0, verbose_name='Visualizações')
    like_count = models.PositiveIntegerField(default=0, verbose_name='Likes')
    
    # Competition
    has_elimination = models.BooleanField(default=False, verbose_name='Tem Eliminação')
    voting_enabled = models.BooleanField(default=False, verbose_name='Votação Habilitada')
    voting_end_date = models.DateTimeField(null=True, blank=True, verbose_name='Fim da Votação')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming', verbose_name='Estado')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Episódio'
        verbose_name_plural = 'Episódios'
        ordering = ['season', 'episode_number']
        unique_together = ['season', 'episode_number']
    
    def __str__(self):
        return f"S{self.season.season_number}E{self.episode_number}: {self.title}"
    
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
        verbose_name='Pontuação de Performance'
    )
    mentor_feedback = models.TextField(blank=True, verbose_name='Feedback do Mentor')
    
    # Status in episode
    is_featured = models.BooleanField(default=False, verbose_name='Em Destaque')
    is_eliminated = models.BooleanField(default=False, verbose_name='Eliminado')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Participante do Episódio'
        verbose_name_plural = 'Participantes dos Episódios'
        unique_together = ['episode', 'participant']
    
    def __str__(self):
        return f"{self.participant.business_name} - {self.episode.title}"
