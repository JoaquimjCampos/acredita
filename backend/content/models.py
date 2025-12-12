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


class Video(models.Model):
	"""Modelo para vídeos educativos e de entretenimento"""
	VIDEO_TYPE_CHOICES = [
		('entrevista', 'Entrevista'),
		('pitch', 'Pitch'),
		('aula', 'Aula'),
		('tutorial', 'Tutorial'),
		('outro', 'Outro'),
	]

	title = models.CharField(max_length=255, help_text="Título do vídeo")
	description = models.TextField(blank=True, help_text="Descrição do vídeo")
	url = models.URLField(help_text="URL do vídeo (YouTube, Vimeo, etc.)")
	thumbnail = models.URLField(
		blank=True,
		null=True,
		help_text="URL da miniatura do vídeo"
	)
	video_type = models.CharField(
		max_length=20,
		choices=VIDEO_TYPE_CHOICES,
		default='outro',
		help_text="Tipo de vídeo"
	)
	duration = models.PositiveIntegerField(
		null=True,
		blank=True,
		help_text="Duração em segundos"
	)
	author = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name='videos'
	)
	views_count = models.PositiveIntegerField(default=0)
	is_active = models.BooleanField(default=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		verbose_name = 'Vídeo'
		verbose_name_plural = 'Vídeos'
		ordering = ['-created_at']

	def __str__(self):
		return self.title


class Podcast(models.Model):
	"""Modelo para podcasts e conteúdo de áudio"""
	title = models.CharField(max_length=255)
	description = models.TextField(blank=True)
	audio_url = models.URLField(help_text="URL do arquivo de áudio")
	thumbnail = models.URLField(
		blank=True,
		null=True,
		help_text="URL da miniatura do podcast"
	)
	duration = models.PositiveIntegerField(
		null=True,
		blank=True,
		help_text="Duração em segundos"
	)
	author = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name='podcasts'
	)
	is_active = models.BooleanField(default=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		verbose_name = 'Podcast'
		verbose_name_plural = 'Podcasts'
		ordering = ['-created_at']

	def __str__(self):
		return self.title


class Course(models.Model):
	"""Modelo para cursos educativos"""
	title = models.CharField(max_length=255)
	description = models.TextField()
	instructor = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name='courses'
	)
	thumbnail = models.URLField(
		blank=True,
		null=True,
		help_text="URL da miniatura do curso"
	)
	duration_hours = models.PositiveIntegerField(
		null=True,
		blank=True,
		help_text="Duração estimada em horas"
	)
	level = models.CharField(
		max_length=20,
		choices=[
			('beginner', 'Iniciante'),
			('intermediate', 'Intermediário'),
			('advanced', 'Avançado'),
		],
		default='beginner'
	)
	is_active = models.BooleanField(default=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		verbose_name = 'Curso'
		verbose_name_plural = 'Cursos'
		ordering = ['-created_at']

	def __str__(self):
		return self.title

