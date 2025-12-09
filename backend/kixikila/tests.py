from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

from .models import KixikilaGroup, KixikilaMembership


@override_settings(DEBUG=True, ACTIVE_FEATURES={"kixikila": True})
class KixikilaStatusTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_status_endpoint_enabled_in_debug(self):
        response = self.client.get(reverse("kixikila-status"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data.get("feature"), "kixikila")
        self.assertTrue(response.data.get("enabled"))


@override_settings(DEBUG=True, ACTIVE_FEATURES={"kixikila": True})
class KixikilaGroupListTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(username="test1", password="pass1234")
        self.group = KixikilaGroup.objects.create(
            name="Motonistas Luanda",
            group_type="professional",
            description="Grupo de motoqueiros",
            monthly_contribution=50000,
            max_members=20,
            duration_months=10,
            start_date="2025-12-15",
            created_by=self.user,
        )

    def test_list_groups(self):
        response = self.client.get(reverse("kixikila-group-list"))
        self.assertEqual(response.status_code, 200)
        results = response.data.get("results") or response.data
        self.assertGreaterEqual(len(results), 1)
