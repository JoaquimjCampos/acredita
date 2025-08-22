from django.contrib import admin
from .models import Content

@admin.register(Content)
class ContentAdmin(admin.ModelAdmin):
	list_display = ("id", "title", "category", "author", "is_active", "created_at")
	search_fields = ("title", "description", "tags", "author")
	list_filter = ("category", "is_active", "created_at")
