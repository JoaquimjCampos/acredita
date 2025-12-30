from django.contrib import admin
from .models import AuditLog, RoleTransition, TrustEvent, RevenueStream


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'resource', 'status_code', 'user_role', 'timestamp')
    list_filter = ('action', 'user_role', 'timestamp', 'status_code')
    search_fields = ('user__username', 'resource', 'endpoint')
    readonly_fields = ('timestamp', 'user', 'action', 'resource', 'request_data')
    date_hierarchy = 'timestamp'


@admin.register(RoleTransition)
class RoleTransitionAdmin(admin.ModelAdmin):
    list_display = ('user', 'from_role', 'to_role', 'status', 'requested_at')
    list_filter = ('status', 'requested_at')
    search_fields = ('user__username',)
    readonly_fields = ('requested_at',)


@admin.register(TrustEvent)
class TrustEventAdmin(admin.ModelAdmin):
    list_display = ('user', 'event_type', 'points', 'created_at')
    list_filter = ('event_type', 'created_at')
    search_fields = ('user__username', 'description')


@admin.register(RevenueStream)
class RevenueStreamAdmin(admin.ModelAdmin):
    list_display = ('source', 'amount', 'created_at')
    list_filter = ('source', 'created_at')
    date_hierarchy = 'created_at'
