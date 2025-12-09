from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient

from .models import ServiceCategory


@override_settings(DEBUG=True, ACTIVE_FEATURES={"marketplace": True})
class MarketplaceStatusTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            username="tester", password="pass1234"
        )

    def test_status_endpoint_enabled_in_debug(self):
        response = self.client.get(reverse("marketplace-status"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data.get("feature"), "marketplace")
        self.assertTrue(response.data.get("enabled"))


@override_settings(DEBUG=True, ACTIVE_FEATURES={"marketplace": True})
class MarketplaceCategoryListTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.cat = ServiceCategory.objects.create(
            name="Transportes", slug="transportes", description="Serviços de transporte"
        )

    def test_list_categories(self):
        response = self.client.get(reverse("marketplace-category-list"))
        self.assertEqual(response.status_code, 200)
        # Pagination default: response.data is dict with results list
        results = response.data.get("results") or response.data
        self.assertGreaterEqual(len(results), 1)
        first = results[0]
        name = first.get("name") if isinstance(first, dict) else getattr(first, "name", None)
        self.assertEqual(name, "Transportes")
