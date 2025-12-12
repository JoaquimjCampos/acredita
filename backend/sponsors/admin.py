from django.contrib import admin
from .models import Sponsor


@admin.register(Sponsor)
class SponsorAdmin(admin.ModelAdmin):
    list_display = ['name', 'sponsor_type', 'order', 'is_active', 'created_at']
    list_filter = ['sponsor_type', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['order', 'name']
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('name', 'description', 'sponsor_type')
        }),
        ('Branding', {
            'fields': ('logo', 'url')
        }),
        ('Exibição', {
            'fields': ('order', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    readonly_fields = ['created_at', 'updated_at']
