from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from backend.seasons.models import Season, Episode, EpisodeParticipant
from backend.participants.models import Participant
from django.utils import timezone

class GlobalVoteAPITest(APITestCase):
    def setUp(self):
            # Create a test user
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user = User.objects.create_user(username="testuser", password="testpass")

            # Create a season
            season = Season.objects.create(
                title="Temporada Teste",
                description="Teste",
                season_number=1,
                registration_start=timezone.now(),
                registration_end=timezone.now(),
                start_date=timezone.now(),
                end_date=timezone.now(),
                status="active",
                is_current=True
            )
            # Create an episode with voting enabled
            episode = Episode.objects.create(
                season=season,
                episode_number=1,
                title="Episódio Teste",
                description="Teste",
                air_date=timezone.now(),
                voting_enabled=True,
                voting_end_date=timezone.now() + timezone.timedelta(days=1)
            )
            # Create a participant linked to the season and user
            participant = Participant.objects.create(
                business_name="Participante Teste",
                business_category="technology",  # Use a valid category from your model
                business_description="Descrição do negócio",
                season=season,
                user_id=user.id
            )
            # Link participant to episode
            EpisodeParticipant.objects.create(
                episode=episode,
                participant=participant
            )
            self.episode_id = episode.id
            self.participant_id = participant.id

    def test_global_vote(self):
        url = '/api/seasons/global-vote/'
        response = self.client.post(url, {
            "episode_id": self.episode_id,
            "participant_id": self.participant_id
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIn("Voto registrado com sucesso", response.data['detail'])


class EpisodeSignalTest(TestCase):
    def test_episode_creation_triggers_signal_and_audit_fields(self):
        from backend.seasons.models import Season, Episode
        from django.utils import timezone
        import logging
        season = Season.objects.create(
            title="Temporada Signal",
            description="Teste",
            season_number=99,
            registration_start=timezone.now(),
            registration_end=timezone.now(),
            start_date=timezone.now(),
            end_date=timezone.now(),
            status="active",
            is_current=True
        )
        # Patch logger to capture signal output
        logger = logging.getLogger('django')
        with self.assertLogs(logger, level='INFO') as cm:
            episode = Episode.objects.create(
                season=season,
                episode_number=1,
                title="Episódio Signal",
                description="Teste",
                air_date=timezone.now(),
                voting_enabled=True,
                voting_end_date=timezone.now() + timezone.timedelta(days=1)
            )
        # Check signal log
        self.assertTrue(any("Episode created" in m for m in cm.output))
        # Check audit fields
        self.assertIsNotNone(episode.created_at)
        self.assertIsNotNone(episode.updated_at)

class CeleryTaskTest(TestCase):
    def test_notify_episode_created_task(self):
        from backend.seasons.tasks import notify_episode_created
        result = notify_episode_created.apply(args=[123])
        self.assertTrue(result.successful())

# Create your tests here.
