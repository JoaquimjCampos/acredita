from django.contrib import admin
from .models import Episode, EpisodeParticipant

@admin.register(Episode)
class EpisodeAdmin(admin.ModelAdmin):
	list_display = ('id', 'season', 'episode_number', 'title', 'status', 'is_deleted', 'created_at', 'updated_at', 'updated_by')
	search_fields = ('title', 'season__title')
	list_filter = ('season', 'status', 'is_deleted')
	readonly_fields = ('created_at', 'updated_at')

@admin.register(EpisodeParticipant)
class EpisodeParticipantAdmin(admin.ModelAdmin):
	list_display = ('id', 'episode', 'participant', 'vote_count', 'is_featured', 'is_eliminated', 'created_at', 'updated_at', 'updated_by')
	search_fields = ('participant__business_name', 'episode__title')
	list_filter = ('is_featured', 'is_eliminated')
	readonly_fields = ('created_at', 'updated_at')
