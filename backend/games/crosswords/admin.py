from django.contrib import admin
from .models import Crossword, CrosswordClue, CrosswordSession


class CrosswordClueInline(admin.TabularInline):
    model = CrosswordClue
    extra = 1
    fields = ('number', 'clue_text', 'answer', 'direction', 'order')


@admin.register(Crossword)
class CrosswordAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'difficulty', 'is_active', 'created_at')
    list_filter = ('is_active', 'difficulty', 'created_at')
    search_fields = ('title', 'description')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [CrosswordClueInline]


@admin.register(CrosswordSession)
class CrosswordSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'crossword', 'user', 'score', 'time_taken', 'started_at', 'finished_at')
    list_filter = ('started_at', 'finished_at')
    search_fields = ('user__username', 'crossword__title')
    readonly_fields = ('started_at',)
