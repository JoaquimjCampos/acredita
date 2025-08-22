from django.db import models

from django.conf import settings

class Content(models.Model):
	title = models.CharField(max_length=255)
	description = models.TextField(blank=True)
	category = models.CharField(max_length=100, blank=True)
	tags = models.CharField(max_length=255, blank=True, help_text="Comma-separated tags")
	author = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="contents")
	media_url = models.URLField(blank=True)
	media_file = models.FileField(upload_to="content_media/", blank=True, null=True)
	feedback = models.TextField(blank=True, help_text="User feedback or comments")
	is_active = models.BooleanField(default=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def tag_list(self):
		return [tag.strip() for tag in self.tags.split(",") if tag.strip()]

	def __str__(self):
		return self.title
