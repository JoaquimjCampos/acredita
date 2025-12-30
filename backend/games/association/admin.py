from django.contrib import admin
from .models import Association, AssociationPair, AssociationSession


class AssociationPairInline(admin.TabularInline):
    model = AssociationPair
    extra = 1
    fields = ('left_item', 'right_item', 'order')


@admin.register(Association)
class AssociationAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'difficulty', 'is_active', 'created_at')
    list_filter = ('is_active', 'difficulty', 'created_at')
    search_fields = ('title', 'description')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [AssociationPairInline]


@admin.register(AssociationSession)
class AssociationSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'association', 'user', 'score', 'time_taken', 'started_at', 'finished_at')
    list_filter = ('started_at', 'finished_at')
    search_fields = ('user__username', 'association__title')
    readonly_fields = ('started_at',)
