"""
Management command para criar payouts automaticamente quando todas as contribuições de uma ronda forem confirmadas.
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from backend.kixikila.models import (
    KixikilaGroup,
    KixikilaMembership,
    KixikilaContribution,
    KixikilaPayout,
)
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class Command(BaseCommand):
    help = 'Auto-create payouts for completed rounds'

    def add_arguments(self, parser):
        parser.add_argument(
            '--group-id',
            type=int,
            help='Process only specific group ID',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Simulate without creating payouts',
        )

    def handle(self, *args, **options):
        group_id = options.get('group_id')
        dry_run = options.get('dry_run', False)

        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No payouts will be created'))

        # Filtrar grupos ativos
        groups_qs = KixikilaGroup.objects.filter(status='active')
        if group_id:
            groups_qs = groups_qs.filter(id=group_id)

        groups_count = groups_qs.count()
        self.stdout.write(f'Processing {groups_count} active group(s)...')

        payouts_created = 0
        payouts_skipped = 0

        for group in groups_qs:
            self.stdout.write(f'\nProcessing group: {group.name} (ID: {group.id})')

            # Obter membros ativos
            active_members = KixikilaMembership.objects.filter(
                group=group, is_active=True
            )
            total_members = active_members.count()

            if total_members == 0:
                self.stdout.write(self.style.WARNING(f'  No active members, skipping'))
                continue

            # Obter ronda atual do grupo
            current_round = group.current_round or 1

            # Verificar todas as rondas até a atual
            for round_num in range(1, current_round + 1):
                # Verificar se já existe payout para esta ronda
                existing_payout = KixikilaPayout.objects.filter(
                    group=group, round=round_num
                ).first()

                if existing_payout:
                    self.stdout.write(
                        f'  Round {round_num}: Payout already exists (ID: {existing_payout.id})'
                    )
                    payouts_skipped += 1
                    continue

                # Contar contribuições confirmadas desta ronda
                confirmed_contributions = KixikilaContribution.objects.filter(
                    membership__group=group,
                    round=round_num,
                    status='confirmed'
                )

                confirmed_count = confirmed_contributions.count()
                self.stdout.write(
                    f'  Round {round_num}: {confirmed_count}/{total_members} contributions confirmed'
                )

                # Se todas as contribuições estiverem confirmadas, criar payout
                if confirmed_count >= total_members:
                    # Determinar próximo beneficiário (por ordem de position)
                    # Membros que ainda não receberam payout
                    eligible_members = active_members.filter(
                        payout_received=False
                    ).order_by('position')

                    if not eligible_members.exists():
                        self.stdout.write(
                            self.style.WARNING(
                                f'  Round {round_num}: All members already received payout, resetting cycle'
                            )
                        )
                        # Reset cycle - todos voltam a ser elegíveis
                        active_members.update(payout_received=False, payout_date=None)
                        eligible_members = active_members.order_by('position')

                    next_recipient_membership = eligible_members.first()
                    next_recipient = next_recipient_membership.member

                    # Calcular total de contribuições confirmadas
                    total_amount = sum(
                        float(c.amount) for c in confirmed_contributions
                    )

                    # Calcular taxa da plataforma (2.5%)
                    platform_fee_rate = 0.025
                    platform_fee = total_amount * platform_fee_rate
                    net_amount = total_amount - platform_fee

                    self.stdout.write(
                        self.style.SUCCESS(
                            f'  Round {round_num}: Creating payout for {next_recipient.username}'
                        )
                    )
                    self.stdout.write(
                        f'    Total: {total_amount:.2f} AOA'
                    )
                    self.stdout.write(
                        f'    Fee: {platform_fee:.2f} AOA'
                    )
                    self.stdout.write(
                        f'    Net: {net_amount:.2f} AOA'
                    )

                    if not dry_run:
                        try:
                            payout = KixikilaPayout.objects.create(
                                group=group,
                                recipient=next_recipient,
                                round=round_num,
                                total_amount=total_amount,
                                platform_fee=platform_fee,
                                net_amount=net_amount,
                                scheduled_date=timezone.now().date(),
                                payment_method='transfer',
                                status='scheduled'
                            )
                            self.stdout.write(
                                self.style.SUCCESS(
                                    f'    ✓ Payout created (ID: {payout.id})'
                                )
                            )
                            payouts_created += 1
                        except Exception as e:
                            self.stdout.write(
                                self.style.ERROR(
                                    f'    ✗ Error creating payout: {str(e)}'
                                )
                            )
                    else:
                        self.stdout.write(
                            self.style.WARNING(
                                f'    [DRY RUN] Would create payout for {next_recipient.username}'
                            )
                        )
                        payouts_created += 1
                else:
                    self.stdout.write(
                        f'  Round {round_num}: Waiting for {total_members - confirmed_count} more contribution(s)'
                    )

        # Summary
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS(f'Summary:'))
        self.stdout.write(f'  Groups processed: {groups_count}')
        self.stdout.write(f'  Payouts created: {payouts_created}')
        self.stdout.write(f'  Payouts skipped: {payouts_skipped}')

        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    '\nDRY RUN MODE - No actual changes were made'
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n✓ Successfully processed {payouts_created} payout(s)'
                )
            )
