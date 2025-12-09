from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class ProfessionalCategory(models.Model):
    """
    Categorias profissionais reconhecidas pelo INEFOB
    Exemplo: Motoqueiro, Pedreiro, Eletricista, etc.
    """
    name = models.CharField(
        max_length=200,
        unique=True,
        help_text="Nome da categoria profissional"
    )
    inefob_code = models.CharField(
        max_length=50,
        unique=True,
        help_text="Código INEFOB para esta categoria"
    )
    description = models.TextField(
        help_text="Descrição detalhada da profissão"
    )
    icon_url = models.URLField(
        null=True,
        blank=True,
        help_text="URL do ícone da categoria"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Categoria ativa ou arquivada"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'Professional Categories'
        ordering = ['name']
        db_table = 'certifications_professionalcategory'
        indexes = [
            models.Index(fields=['inefob_code']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.inefob_code})"


class TrainingProgram(models.Model):
    """
    Programas de formação profissional
    Vinculados a categorias profissionais
    """
    category = models.ForeignKey(
        ProfessionalCategory,
        on_delete=models.CASCADE,
        related_name='programs',
        help_text="Categoria profissional"
    )
    title = models.CharField(
        max_length=200,
        help_text="Título do programa de formação"
    )
    description = models.TextField(
        help_text="Descrição detalhada do programa"
    )
    provider = models.CharField(
        max_length=200,
        help_text="Provedor/instituição da formação"
    )
    duration_hours = models.IntegerField(
        help_text="Duração total em horas"
    )
    cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Custo do programa em AOA"
    )
    is_inefob_certified = models.BooleanField(
        default=False,
        help_text="Certificado pelo INEFOB"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Programa ativo ou arquivado"
    )
    max_participants = models.IntegerField(
        null=True,
        blank=True,
        help_text="Limite de participantes (null = ilimitado)"
    )
    start_date = models.DateField(
        null=True,
        blank=True,
        help_text="Data de início do programa"
    )
    end_date = models.DateField(
        null=True,
        blank=True,
        help_text="Data de término do programa"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        db_table = 'certifications_trainingprogram'
        indexes = [
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['is_inefob_certified']),
        ]
    
    def __str__(self):
        return self.title
    
    @property
    def current_participants(self):
        """Contar inscrições atuais"""
        return self.enrollments.filter(
            status__in=['enrolled', 'in_progress']
        ).count()
    
    @property
    def is_full(self):
        """Verificar se programa está cheio"""
        if self.max_participants is None:
            return False
        return self.current_participants >= self.max_participants


class SkillAssessment(models.Model):
    """
    Avaliações de competências durante o programa
    """
    PASS = 'pass'
    FAIL = 'fail'
    PENDING = 'pending'
    
    RESULT_CHOICES = [
        (PASS, 'Aprovado'),
        (FAIL, 'Reprovado'),
        (PENDING, 'Pendente'),
    ]
    
    program = models.ForeignKey(
        TrainingProgram,
        on_delete=models.CASCADE,
        related_name='assessments'
    )
    title = models.CharField(
        max_length=200,
        help_text="Título da avaliação"
    )
    description = models.TextField(
        blank=True,
        help_text="Descrição dos critérios"
    )
    weight = models.IntegerField(
        default=100,
        help_text="Peso relativo (%)"
    )
    is_required = models.BooleanField(
        default=True,
        help_text="Obrigatório para certificação"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
        db_table = 'certifications_skillassessment'
    
    def __str__(self):
        return f"{self.program.title} - {self.title}"


class CandidateEnrollment(models.Model):
    """
    Inscrição de candidato em programa de formação
    """
    ENROLLED = 'enrolled'
    IN_PROGRESS = 'in_progress'
    COMPLETED = 'completed'
    CERTIFIED = 'certified'
    FAILED = 'failed'
    CANCELLED = 'cancelled'
    
    STATUS_CHOICES = [
        (ENROLLED, 'Inscrito'),
        (IN_PROGRESS, 'Em Progresso'),
        (COMPLETED, 'Concluído'),
        (CERTIFIED, 'Certificado'),
        (FAILED, 'Reprovado'),
        (CANCELLED, 'Cancelado'),
    ]
    
    candidate = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='certifications_enrollments'
    )
    program = models.ForeignKey(
        TrainingProgram,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=ENROLLED
    )
    enrollment_date = models.DateTimeField(auto_now_add=True)
    start_date = models.DateTimeField(null=True, blank=True)
    completion_date = models.DateTimeField(null=True, blank=True)
    certificate_url = models.URLField(null=True, blank=True)
    certificate_code = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True,
        help_text="Código único do certificado"
    )
    notes = models.TextField(blank=True)
    
    class Meta:
        unique_together = ('candidate', 'program')
        ordering = ['-enrollment_date']
        db_table = 'certifications_candidateenrollment'
        indexes = [
            models.Index(fields=['candidate', 'status']),
            models.Index(fields=['program', 'status']),
        ]
    
    def __str__(self):
        return f"{self.candidate.username} - {self.program.title}"
    
    def start_program(self):
        """Iniciar programa"""
        if self.status == self.ENROLLED:
            self.status = self.IN_PROGRESS
            self.start_date = timezone.now()
            self.save()
            return True
        return False
    
    def complete_program(self):
        """Marcar programa como concluído"""
        if self.status == self.IN_PROGRESS:
            self.status = self.COMPLETED
            self.completion_date = timezone.now()
            self.save()
            return True
        return False
    
    def certify(self, certificate_url=None, certificate_code=None):
        """Emitir certificado"""
        if self.status in [self.COMPLETED, self.IN_PROGRESS]:
            self.status = self.CERTIFIED
            if certificate_url:
                self.certificate_url = certificate_url
            if certificate_code:
                self.certificate_code = certificate_code
            self.save()
            return True
        return False


class AssessmentResult(models.Model):
    """
    Resultado de avaliação de um candidato
    """
    enrollment = models.ForeignKey(
        CandidateEnrollment,
        on_delete=models.CASCADE,
        related_name='assessment_results'
    )
    assessment = models.ForeignKey(
        SkillAssessment,
        on_delete=models.CASCADE,
        related_name='results'
    )
    result = models.CharField(
        max_length=20,
        choices=SkillAssessment.RESULT_CHOICES,
        default=SkillAssessment.PENDING
    )
    score = models.IntegerField(
        null=True,
        blank=True,
        help_text="Pontuação (0-100)"
    )
    notes = models.TextField(blank=True)
    evaluated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='assessments_evaluated'
    )
    evaluated_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-evaluated_at']
        db_table = 'certifications_assessmentresult'
        unique_together = ('enrollment', 'assessment')
        indexes = [
            models.Index(fields=['enrollment', 'result']),
        ]
    
    def __str__(self):
        return f"{self.enrollment} - {self.assessment.title}: {self.result}"
