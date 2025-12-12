from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Sponsor


class SponsorModelTest(TestCase):
    def setUp(self):
        self.sponsor = Sponsor.objects.create(
            name='Test Sponsor',
            description='A test sponsor',
            sponsor_type='sponsor',
            is_active=True,
        )

    def test_sponsor_creation(self):
        self.assertEqual(self.sponsor.name, 'Test Sponsor')
        self.assertTrue(self.sponsor.is_active)

    def test_sponsor_str(self):
        self.assertEqual(str(self.sponsor), 'Test Sponsor (Patrocinador)')


class SponsorAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        Sponsor.objects.create(
            name='Active Sponsor',
            sponsor_type='sponsor',
            is_active=True,
        )
        Sponsor.objects.create(
            name='Inactive Sponsor',
            sponsor_type='partner',
            is_active=False,
        )

    def test_list_sponsors(self):
        response = self.client.get('/api/sponsors/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_sponsors_only_active(self):
        response = self.client.get('/api/sponsors/')
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], 'Active Sponsor')

    def test_filter_by_type(self):
        response = self.client.get('/api/sponsors/?sponsor_type=partner&is_active=false')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
