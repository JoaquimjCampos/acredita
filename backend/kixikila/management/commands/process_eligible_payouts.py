"""
Management command para processar payouts elegíveis automaticamente.
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from backend.kixikila.models import KixikilaPayout
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Process eligible payouts (scheduled payouts that reached their scheduled date)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Simulate without actually processing payouts',
        )

    def handle(self, *args, **options):
        dry_run = options.get('dry_run', False)

        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No payouts will be processed'))

        # Buscar payouts elegíveis (scheduled + data chegou + contribuições completas)
        eligible_payouts = KixikilaPayout.objects.filter(
            status='scheduled',
            scheduled_date__lte=timezone.now().date()
        )

        total_eligible = eligible_payouts.count()
        self.stdout.write(f'Found {total_eligible} eligible payout(s)')

        processed_count = 0
        skipped_count = 0

        for payout in eligible_payouts:
            self.stdout.write(f'\nProcessing payout ID {payout.id}:')
            self.stdout.write(f'  Group: {payout.group.name}')
            self.stdout.write(f'  Recipient: {payout.recipient.username}')
            self.stdout.write(f'  Round: {payout.round}')
            self.stdout.write(f'  Amount: {payout.net_amount} AOA')

            # Verificar se pode ser desembolsado
            if payout.can_be_disbursed:
                self.stdout.write(self.style.SUCCESS('  ✓ All contributions confirmed'))

                if not dry_run:
                    try:
                        payout.mark_as_processing()
                        self.stdout.write(
                            self.style.SUCCESS(
                                f'  ✓ Marked as processing'
                            )
                        )
                        processed_count += 1

                        # Aqui você pode integrar com gateway de pagamento
                        # initiate_payment_transfer(payout)

                    except Exception as e:
                        self.stdout.write(
                            self.style.ERROR(
                                f'  ✗ Error processing: {str(e)}'
                            )
                        )
                else:
                    self.stdout.write(
                        self.style.WARNING(
                            f'  [DRY RUN] Would mark as processing'
                        )
                    )
                    processed_count += 1
            else:
                self.stdout.write(
                    self.style.WARNING(
                        '  ⚠ Not all contributions confirmed yet, skipping'
                    )
                )
                skipped_count += 1

        # Summary
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('Summary:'))
        self.stdout.write(f'  Total eligible: {total_eligible}')
        self.stdout.write(f'  Processed: {processed_count}')
        self.stdout.write(f'  Skipped: {skipped_count}')

        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    '\nDRY RUN MODE - No actual changes were made'
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n✓ Successfully processed {processed_count} payout(s)'
                )
            )
