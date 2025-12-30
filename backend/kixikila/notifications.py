"""
Kixikila notification service for contribution reminders and payout notifications.

Sends reminders when:
- Contribution is due (3 days before round end)
- Contribution is overdue
- Payout is scheduled
- Payout is completed
"""

from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class KixikilaNotificationService:
    """Centralized notification service for Kixikila."""

    @staticmethod
    def send_contribution_reminder(contribution):
        """Send reminder to member about pending contribution."""
        try:
            membership = contribution.membership
            user = membership.member
            group = membership.group

            subject = f'Lembrete: Contribuição Kixikila {group.name} - Ronda {contribution.round}'
            
            message = (
                f'Olá {user.first_name or user.username},\n\n'
                f'Este é um lembrete de que a sua contribuição de {contribution.amount} AOA '
                f'para o grupo "{group.name}" (Ronda {contribution.round}) está pendente.\n\n'
                f'Por favor, efetue o pagamento logo para não perder a sua posição no grupo.\n\n'
                f'Obrigado,\nEquipa Acredita'
            )

            # Send email
            if user.email:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=True,
                )
                logger.info(f'[EMAIL_SENT] Contribution reminder to {user.email}')

        except Exception as e:
            logger.error(f'Error sending contribution reminder: {str(e)}')

    @staticmethod
    def send_payout_scheduled_notification(payout):
        """Notify member that payout is scheduled."""
        try:
            user = payout.recipient
            group = payout.group

            subject = f'Desembolso Kixikila Agendado - {group.name}'
            
            message = (
                f'Parabéns {user.first_name or user.username}!\n\n'
                f'O seu desembolso de {payout.net_amount} AOA do grupo "{group.name}" '
                f'(Ronda {payout.round}) foi agendado para {payout.scheduled_date}.\n\n'
                f'Valor bruto: {payout.total_amount} AOA\n'
                f'Taxa de plataforma: {payout.platform_fee} AOA\n'
                f'Valor líquido: {payout.net_amount} AOA\n\n'
                f'Obrigado por participar no Kixikila!\nEquipa Acredita'
            )

            if user.email:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=True,
                )
                logger.info(f'[EMAIL_SENT] Payout scheduled notification to {user.email}')

        except Exception as e:
            logger.error(f'Error sending payout scheduled notification: {str(e)}')

    @staticmethod
    def send_payout_completed_notification(payout):
        """Notify member that payout has been completed."""
        try:
            user = payout.recipient
            group = payout.group

            subject = f'Desembolso Kixikila Concluído - {group.name}'

            message = (
                f'Olá {user.first_name or user.username}!\n\n'
                f'O seu desembolso de {payout.net_amount} AOA do grupo "{group.name}" '
                f'foi concluído em {payout.disbursed_at.strftime("%d/%m/%Y") if payout.disbursed_at else "breve"}.\n\n'
                f'Valor: {payout.net_amount} AOA\n'
                f'Método de pagamento: {payout.payment_method}\n\n'
                f'Obrigado por participar no Kixikila!\nEquipa Acredita'
            )

            if user.email:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=True,
                )
                logger.info(f'[EMAIL_SENT] Payout completed notification to {user.email}')

        except Exception as e:
            logger.error(f'Error sending payout completed notification: {str(e)}')

    @staticmethod
    def send_member_suspended_notification(membership):
        """Notify member that they have been suspended from group."""
        try:
            user = membership.member
            group = membership.group

            subject = f'Adesão Suspensa - {group.name}'

            message = (
                f'Olá {user.first_name or user.username},\n\n'
                f'A sua adesão ao grupo "{group.name}" foi suspensa.\n\n'
                f'Se acredita que isto é um erro, por favor contacte o administrador do grupo.\n\n'
                f'Equipa Acredita'
            )

            if user.email:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=True,
                )
                logger.info(f'[EMAIL_SENT] Member suspended notification to {user.email}')

        except Exception as e:
            logger.error(f'Error sending member suspended notification: {str(e)}')


def send_daily_contribution_reminders():
    """
    Send reminders for pending contributions.
    Run daily via cron or scheduled task.
    """
    from backend.kixikila.models import KixikilaContribution

    # Get contributions that are pending and created >1 day ago
    overdue_contributions = KixikilaContribution.objects.filter(
        status='pending',
        created_at__lt=timezone.now() - timezone.timedelta(days=1)
    )

    for contrib in overdue_contributions:
        KixikilaNotificationService.send_contribution_reminder(contrib)

    logger.info(f'Sent {overdue_contributions.count()} contribution reminders')


def send_payout_notifications():
    """
    Send notifications for recently created or completed payouts.
    Run daily via cron or scheduled task.
    """
    from backend.kixikila.models import KixikilaPayout

    # Recently scheduled (within last 24 hours)
    scheduled_payouts = KixikilaPayout.objects.filter(
        status='scheduled',
        created_at__gte=timezone.now() - timezone.timedelta(hours=24)
    )

    for payout in scheduled_payouts:
        KixikilaNotificationService.send_payout_scheduled_notification(payout)

    # Recently completed (within last 24 hours)
    completed_payouts = KixikilaPayout.objects.filter(
        status='completed',
        disbursed_at__gte=timezone.now() - timezone.timedelta(hours=24)
    )

    for payout in completed_payouts:
        KixikilaNotificationService.send_payout_completed_notification(payout)

    logger.info(f'Sent payout notifications: {len(scheduled_payouts)} scheduled, {len(completed_payouts)} completed')
