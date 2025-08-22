from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from .models import Content

class ContentAPITestCase(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.user = get_user_model().objects.create_user(username='testuser', password='testpass')
		self.client.force_authenticate(user=self.user)
		self.content = Content.objects.create(
			title="Test Content",
			description="Test Description",
			category="Test Category",
			tags="tag1,tag2",
			author=self.user,
			media_url="http://example.com/media.png",
			feedback="",
			is_active=True
		)

	def test_list_content(self):
		response = self.client.get('/api/content/content/')
		self.assertEqual(response.status_code, 200)
		self.assertTrue(len(response.data) >= 1)

	def test_create_content(self):
		data = {
			"title": "New Content",
			"description": "New Description",
			"category": "New Category",
			"tags": "tag3,tag4",
			"author": self.user.id,
			"media_url": "http://example.com/new.png",
			"feedback": "",
			"is_active": True
		}
		response = self.client.post('/api/content/content/', data)
		self.assertEqual(response.status_code, 201)
		self.assertEqual(response.data["title"], "New Content")

	def test_update_content(self):
		data = {"title": "Updated Title"}
		response = self.client.patch(f'/api/content/content/{self.content.id}/', data)
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data["title"], "Updated Title")

	def test_delete_content(self):
		response = self.client.delete(f'/api/content/content/{self.content.id}/')
		self.assertEqual(response.status_code, 204)
