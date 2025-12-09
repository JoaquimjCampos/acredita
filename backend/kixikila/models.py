"""Modelos para Kixikila - Sistema de Poupança Rotativa (versão inicial)."""

from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class KixikilaGroup(models.Model):
    """Grupo de poupança rotativa."""

    TYPE_CHOICES = (
        ("professional", "Profissional"),  # Motoqueiros, costureiras, etc
        ("neighborhood", "Bairro"),
        ("family", "Familiar"),
        ("business", "Empresarial"),
    )

    STATUS_CHOICES = (
        ("forming", "Formando"),
        ("active", "Ativo"),
        ("completed", "Concluído"),
        ("suspended", "Suspenso"),
    )

    name = models.CharField(max_length=200)
    group_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    description = models.TextField(blank=True)

    # Configuração
    monthly_contribution = models.DecimalField(max_digits=12, decimal_places=2)
    max_members = models.PositiveIntegerField()
    current_members = models.PositiveIntegerField(default=0)
    duration_months = models.PositiveIntegerField()

    # Timeline
    start_date = models.DateField()
    current_round = models.PositiveIntegerField(default=1)

    # Segurança
    requires_verification = models.BooleanField(default=True)
    min_reputation_score = models.IntegerField(default=0)
    insurance_enabled = models.BooleanField(default=False)

    # Status
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="forming")

    # Localização
    province = models.CharField(max_length=100, blank=True)
    municipality = models.CharField(max_length=100, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="created_kixikila_groups"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["group_type", "status"]),
            models.Index(fields=["province", "municipality"]),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.name} ({self.get_group_type_display()})"


class KixikilaMembership(models.Model):
    """Participação em grupo kixikila."""

    POSITION_PRIORITY_CHOICES = (
        ("random", "Aleatória"),
        ("auction", "Leilão"),
        ("need_based", "Baseada em necessidade"),
    )

    group = models.ForeignKey(KixikilaGroup, on_delete=models.CASCADE, related_name="memberships")
    member = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="kixikila_memberships")

    # Ordem de recebimento
    position = models.PositiveIntegerField()  # 1, 2, 3...
    position_priority = models.CharField(max_length=50, choices=POSITION_PRIORITY_CHOICES, default="random")

    # Status
    is_active = models.BooleanField(default=True)
    contributions_made = models.PositiveIntegerField(default=0)
    payout_received = models.BooleanField(default=False)
    payout_date = models.DateTimeField(null=True, blank=True)

    # Garantias
    guarantor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="guaranteed_kixikila_members"
    )
    collateral_type = models.CharField(max_length=100, blank=True)

    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["group", "position"]
        unique_together = ["group", "member"]
        indexes = [
            models.Index(fields=["group", "position"]),
            models.Index(fields=["is_active"]),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.member.username} in {self.group.name} (pos {self.position})"


class KixikilaContribution(models.Model):
    """Contribuição mensal a um grupo."""

    STATUS_CHOICES = (
        ("pending", "Pendente"),
        ("confirmed", "Confirmada"),
        ("late", "Atrasada"),
        ("missed", "Falhada"),
    )

    membership = models.ForeignKey(KixikilaMembership, on_delete=models.CASCADE, related_name="contributions")
    round = models.PositiveIntegerField()  # Mês do ciclo
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    payment_date = models.DateTimeField(auto_now_add=True)
    payment_method = models.CharField(max_length=50, blank=True)
    payment_reference = models.CharField(max_length=200, blank=True)

    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="pending")

    class Meta:
        ordering = ["membership", "round"]
        unique_together = ["membership", "round"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["membership", "round"]),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f"Contribution {self.membership.member.username} round {self.round}"


class KixikilaPayout(models.Model):
    """Pagamento ao beneficiário do mês."""

    STATUS_CHOICES = (
        ("scheduled", "Agendado"),
        ("processing", "A processar"),
        ("completed", "Concluído"),
        ("failed", "Falhou"),
    )

    group = models.ForeignKey(KixikilaGroup, on_delete=models.CASCADE, related_name="payouts")
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="kixikila_payouts")
    round = models.PositiveIntegerField()

    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    platform_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_amount = models.DecimalField(max_digits=12, decimal_places=2)

    scheduled_date = models.DateField()
    disbursed_at = models.DateTimeField(null=True, blank=True)
    payment_method = models.CharField(max_length=50)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="scheduled")

    intended_use = models.CharField(max_length=200, blank=True)
    proof_of_use = models.FileField(upload_to="kixikila_proofs/", null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-scheduled_date"]
        unique_together = ["group", "round"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["recipient"]),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f"Payout {self.recipient.username} - {self.group.name} round {self.round}"


class KixikilaRating(models.Model):
    """Reputação de membros no sistema kixikila."""

    TRUST_LEVELS = (
        ("beginner", "Iniciante"),
        ("reliable", "Confiável"),
        ("trusted", "De Confiança"),
        ("champion", "Campeão"),
    )

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="kixikila_rating")

    # Histórico
    groups_participated = models.PositiveIntegerField(default=0)
    contributions_on_time = models.PositiveIntegerField(default=0)
    contributions_late = models.PositiveIntegerField(default=0)
    contributions_missed = models.PositiveIntegerField(default=0)

    # Score (0-100)
    reputation_score = models.PositiveIntegerField(
        default=50, validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    trust_level = models.CharField(max_length=50, choices=TRUST_LEVELS, default="beginner")

    # Penalidades
    warnings = models.PositiveIntegerField(default=0)
    suspended_until = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-reputation_score"]
        indexes = [models.Index(fields=["trust_level"])]

    def __str__(self) -> str:  # pragma: no cover
        return f"Rating {self.user.username} ({self.get_trust_level_display()})"
