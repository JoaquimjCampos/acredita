"""
Management command to advance Kixikila group cycles and auto-create payouts.

Usage:
    python manage.py advance_kixikila_cycles

This command:
1. Finds groups where all members have contributed for the current round
2. Marks contributions as confirmed if eligible
3. Auto-creates payouts for the next beneficiary
4. Advances the group to the next round
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Count, Q
from backend.kixikila.models import (
    KixikilaGroup,
    KixikilaMembership,
    KixikilaContribution,
    KixikilaPayout,
)
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Advance Kixikila group cycles and auto-create payouts'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting Kixikila cycle advancement...'))

        # Get all active groups
        groups = KixikilaGroup.objects.filter(status='active')
        processed = 0
        errors = 0

        for group in groups:
            try:
                # Check if all active members have contributed this round
                active_members = KixikilaMembership.objects.filter(
                    group=group, is_active=True
                ).count()

                contributions_this_round = KixikilaContribution.objects.filter(
                    membership__group=group,
                    round=group.current_round
                ).count()

                # If all members contributed, auto-confirm and advance
                if contributions_this_round >= active_members and active_members > 0:
                    self.advance_group_cycle(group)
                    processed += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'✓ Advanced group {group.id} ({group.name})')
                    )
                else:
                    self.stdout.write(
                        f'  Group {group.id}: waiting ({contributions_this_round}/{active_members})'
                    )

            except Exception as e:
                logger.error(f'Error processing group {group.id}: {str(e)}', exc_info=True)
                errors += 1
                self.stdout.write(self.style.ERROR(f'✗ Error processing group {group.id}: {str(e)}'))

        self.stdout.write(
            self.style.SUCCESS(
                f'\nCompleted: {processed} groups advanced, {errors} errors'
            )
        )

    def advance_group_cycle(self, group):
        """
        Advance a group to the next cycle:
        1. Auto-confirm pending contributions from this round
        2. Create payout for current beneficiary
        3. Advance current_round
        """
        # Auto-confirm pending contributions
        pending_contribs = KixikilaContribution.objects.filter(
            membership__group=group,
            round=group.current_round,
            status='pending'
        )

        confirmed_count = 0
        for contrib in pending_contribs:
            # Only confirm if member is still active and on time
            if contrib.membership.is_active:
                contrib.status = 'confirmed'
                contrib.save()
                confirmed_count += 1

        logger.info(f'Group {group.id}: {confirmed_count} contributions auto-confirmed')

        # Calculate total for payout
        total_amount = KixikilaContribution.objects.filter(
            membership__group=group,
            round=group.current_round,
            status='confirmed'
        ).aggregate(total=models.Sum('amount'))['total'] or 0

        if total_amount > 0:
            # Find current beneficiary (by position)
            beneficiary = KixikilaMembership.objects.filter(
                group=group,
                position=group.current_round,
                is_active=True
            ).first()

            if beneficiary:
                # Create payout
                platform_fee_rate = 0.025
                platform_fee = float(total_amount) * platform_fee_rate
                net_amount = float(total_amount) - platform_fee

                payout = KixikilaPayout.objects.create(
                    group=group,
                    recipient=beneficiary.member,
                    round=group.current_round,
                    total_amount=total_amount,
                    platform_fee=platform_fee,
                    net_amount=net_amount,
                    scheduled_date=timezone.now().date(),
                    status='scheduled'
                )

                logger.info(
                    f'Group {group.id}: Payout created for {beneficiary.member.username} '
                    f'(round {group.current_round})'
                )

        # Advance to next round
        group.current_round += 1
        group.save(update_fields=['current_round'])

        logger.info(f'Group {group.id}: Advanced to round {group.current_round}')


# Import at end to avoid circular imports
from django.db import models
