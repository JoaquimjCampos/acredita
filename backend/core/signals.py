from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Q, Sum, Count

from backend.core.models import TrustEvent, RevenueStream

# Importações tardias para evitar ciclos durante migrações
try:
    from backend.certifications.models import AssessmentResult, SkillAssessment
except Exception:
    AssessmentResult = None
    SkillAssessment = None

try:
    from backend.marketplace.models import ServiceOrder
except Exception:
    ServiceOrder = None

try:
    from backend.kixikila.models import KixikilaPayout
except Exception:
    KixikilaPayout = None

try:
    from backend.participants.models import Participant
except Exception:
    Participant = None

try:
    from backend.games.models import SimulatorSession
except Exception:
    SimulatorSession = None


# Certificações → evento de confiança quando APROVADO
if AssessmentResult is not None and SkillAssessment is not None:

    @receiver(post_save, sender=AssessmentResult)
    def certifications_trust_event(sender, instance, created, **kwargs):
        try:
            if instance.result == SkillAssessment.PASS:
                TrustEvent.objects.create(
                    user=instance.enrollment.candidate,
                    event_type="cert_pass",
                    points=20,
                    description=f"Aprovado: {instance.assessment.title} ({instance.enrollment.program.title})",
                )
        except Exception:
            # Não quebra fluxo principal
            pass


# Marketplace → evento + receita quando ordem concluída
if ServiceOrder is not None:

    @receiver(post_save, sender=ServiceOrder)
    def marketplace_order_completed(sender, instance, created, **kwargs):
        try:
            if instance.status == "completed":
                provider_user = instance.listing.provider.user
                # Evento de confiança
                TrustEvent.objects.create(
                    user=provider_user,
                    event_type="market_order",
                    points=5,
                    description=f"Ordem concluída: {instance.listing.title}",
                )
                # Receita da plataforma (comissão estimada 15%)
                commission = (instance.total_amount or 0) * 0.15
                RevenueStream.objects.create(
                    source="marketplace_commission",
                    amount=commission,
                    notes=f"Order #{instance.id} - {instance.listing.title}",
                )
        except Exception:
            pass


# Kixikila → evento + receita ao registrar payout
if KixikilaPayout is not None:

    @receiver(post_save, sender=KixikilaPayout)
    def kixikila_payout_completed(sender, instance, created, **kwargs):
        try:
            if instance.status == "completed":
                TrustEvent.objects.create(
                    user=instance.recipient,
                    event_type="kix_cycle",
                    points=20,
                    description=f"Payout ciclo {instance.round} - {instance.group.name}",
                )
                if instance.platform_fee:
                    RevenueStream.objects.create(
                        source="kixikila_platform_fee",
                        amount=instance.platform_fee,
                        notes=f"Payout {instance.id} - {instance.group.name}",
                    )
        except Exception:
            pass


# Participants/Reality → vencedor concede grande confiança
if Participant is not None:

    @receiver(post_save, sender=Participant)
    def participant_winner_event(sender, instance, created, **kwargs):
        try:
            if instance.status == "winner":
                TrustEvent.objects.create(
                    user=instance.user,
                    event_type="reality_winner",
                    points=50,
                    description=f"Vencedor da Temporada {instance.season.season_number}",
                )
        except Exception:
            pass


# Games → sessão de simulador concluída (pequenos pontos de comunidade)
if SimulatorSession is not None:

    @receiver(post_save, sender=SimulatorSession)
    def simulator_session_completed(sender, instance, created, **kwargs):
        try:
            if instance.finished_at is not None:
                TrustEvent.objects.create(
                    user=instance.user,
                    event_type="game_session",
                    points=2,
                    description=f"Simulador concluído: {instance.simulator.title}",
                )
        except Exception:
            pass
