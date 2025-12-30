from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

User = get_user_model()

class Participant(models.Model):
    """Model for program participants"""
    
    STATUS_CHOICES = (
        ('pending', 'Pendente'),
        ('approved', 'Aprovado'),
        ('rejected', 'Rejeitado'),
        ('active', 'Ativo'),
        ('eliminated', 'Eliminado'),
        ('winner', 'Vencedor'),
    )
    
    BUSINESS_CATEGORIES = (
        ('technology', 'Tecnologia'),
        ('agriculture', 'Agricultura'),
        ('education', 'Educação'),
        ('health', 'Saúde'),
        ('commerce', 'Comércio'),
        ('services', 'Serviços'),
        ('manufacturing', 'Indústria'),
        ('tourism', 'Turismo'),
        ('arts', 'Artes e Cultura'),
        ('other', 'Outros'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='participant_profile')
    
    # Basic Information
    participant_number = models.CharField(max_length=10, unique=True, verbose_name='Número do Participante')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='Estado')
    
    # Business Idea
    business_name = models.CharField(max_length=100, verbose_name='Nome do Negócio')
    business_category = models.CharField(max_length=50, choices=BUSINESS_CATEGORIES, verbose_name='Categoria')
    business_description = models.TextField(verbose_name='Descrição do Negócio')
    pitch_video = models.FileField(
        upload_to='pitches/videos/', 
        null=True, 
        blank=True,
        verbose_name='Vídeo de Apresentação'
    )
    pitch_document = models.FileField(
        upload_to='pitches/documents/', 
        null=True, 
        blank=True,
        verbose_name='Documento de Apresentação'
    )
    
    # Competition Details
    season = models.ForeignKey('seasons.Season', on_delete=models.CASCADE, related_name='participants', verbose_name='Temporada')
    episode_joined = models.ForeignKey(
        'seasons.Episode', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name='Episódio de Entrada'
    )
    episode_eliminated = models.ForeignKey(
        'seasons.Episode', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='eliminated_participants',
        verbose_name='Episódio de Eliminação'
    )
    
    # Scoring
    mentor_score = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        null=True,
        blank=True,
        verbose_name='Pontuação do Mentor'
    )
    public_votes = models.PositiveIntegerField(default=0, verbose_name='Votos do Público')
    
    # Funding
    funding_goal = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        verbose_name='Meta de Financiamento'
    )
    funding_received = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        verbose_name='Financiamento Recebido'
    )
    
    # Kixikila Integration
    primary_savings_group = models.ForeignKey(
        'kixikila.KixikilaGroup',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='primary_participants',
        verbose_name='Grupo de Poupança Principal'
    )
    
    # Timeline
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Participante'
        verbose_name_plural = 'Participantes'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.business_name} - {self.user.full_name}"
    
    @property
    def funding_percentage(self):
        if self.funding_goal and self.funding_goal > 0:
            return (self.funding_received / self.funding_goal) * 100
        return 0
    
    def save(self, *args, **kwargs):
        if not self.participant_number:
            # Generate participant number
            current_year = timezone.now().year
            last_participant = Participant.objects.filter(
                participant_number__startswith=f"{current_year}"
            ).order_by('-participant_number').first()
            
            if last_participant:
                last_number = int(last_participant.participant_number[-3:])
                new_number = last_number + 1
            else:
                new_number = 1
            
            self.participant_number = f"{current_year}{new_number:03d}"
        
        super().save(*args, **kwargs)


class ParticipantTask(models.Model):
    """Tasks assigned to participants during the program"""
    
    STATUS_CHOICES = (
        ('pending', 'Pendente'),
        ('in_progress', 'Em Progresso'),
        ('completed', 'Concluída'),
        ('overdue', 'Atrasada'),
    )
    
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200, verbose_name='Título')
    description = models.TextField(verbose_name='Descrição')
    due_date = models.DateTimeField(verbose_name='Data Limite')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='Estado')
    submission = models.FileField(
        upload_to='task_submissions/', 
        null=True, 
        blank=True,
        verbose_name='Submissão'
    )
    submission_notes = models.TextField(blank=True, verbose_name='Notas da Submissão')
    
    # Scoring
    score = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        null=True,
        blank=True,
        verbose_name='Pontuação'
    )
    feedback = models.TextField(blank=True, verbose_name='Feedback')
    
    created_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Tarefa do Participante'
        verbose_name_plural = 'Tarefas dos Participantes'
        ordering = ['due_date']
    
    def __str__(self):
        return f"{self.title} - {self.participant.business_name}"
