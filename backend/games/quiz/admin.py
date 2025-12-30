from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count, Q
from .models import Quiz, Question, Answer, GameSession, UserAnswer
from .audit import QuizAccessLog


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'is_public', 'is_active', 'season_number', 'access_stats', 'created_at']
    list_filter = ['is_public', 'is_active', 'season_number', 'created_at']
    search_fields = ['title', 'description', 'category']
    readonly_fields = ['created_at', 'updated_at', 'public_access_count', 'authenticated_access_count']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('title', 'description', 'category', 'difficulty')
        }),
        ('Configuração de Acesso', {
            'fields': ('is_public', 'is_active', 'allow_anonymous_submission', 'author')
        }),
        ('Período de Disponibilidade', {
            'fields': ('start_date', 'end_date')
        }),
        ('Configurações de Competição', {
            'fields': ('season_number', 'time_limit')
        }),
        ('Estatísticas', {
            'fields': ('public_access_count', 'authenticated_access_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def access_stats(self, obj):
        """Exibe estatísticas de acesso"""
        return format_html(
            '<span style="color: #17a2b8;">👥 Público: {}</span> | '
            '<span style="color: #28a745;">✓ Auth: {}</span>',
            obj.public_access_count,
            obj.authenticated_access_count
        )
    access_stats.short_description = 'Acessos'


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['text', 'quiz', 'category', 'difficulty', 'correct_answer_count']
    list_filter = ['quiz', 'category', 'difficulty', 'created_at']
    search_fields = ['text', 'quiz__title']
    readonly_fields = ['created_at']
    
    def correct_answer_count(self, obj):
        count = obj.answers.filter(is_correct=True).count()
        return format_html(
            '<span style="color: #28a745; font-weight: bold;">✓ {}</span>',
            count
        )
    correct_answer_count.short_description = 'Respostas Corretas'


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ['text', 'question', 'is_correct_badge']
    list_filter = ['is_correct', 'question__quiz']
    search_fields = ['text', 'question__text']
    
    def is_correct_badge(self, obj):
        if obj.is_correct:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 8px; '
                'border-radius: 3px; font-weight: bold;">✓ Correta</span>'
            )
        return format_html(
            '<span style="background-color: #dc3545; color: white; padding: 3px 8px; '
            'border-radius: 3px;">✗ Errada</span>'
        )
    is_correct_badge.short_description = 'Status'


@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'score', 'duration', 'started_at']
    list_filter = ['started_at', 'user']
    search_fields = ['user__username']
    readonly_fields = ['started_at', 'finished_at']
    
    def duration(self, obj):
        if obj.started_at and obj.finished_at:
            duration = obj.finished_at - obj.started_at
            minutes = duration.total_seconds() / 60
            return format_html(
                '<span style="color: #17a2b8;">{:.1f} min</span>',
                minutes
            )
        return '-'
    duration.short_description = 'Duração'


@admin.register(QuizAccessLog)
class QuizAccessLogAdmin(admin.ModelAdmin):
    list_display = ['quiz_id', 'access_type_badge', 'user_or_ip', 'is_bot_badge', 'created_at']
    list_filter = ['access_type', 'is_bot', 'created_at']
    search_fields = ['ip_address', 'user__username']
    readonly_fields = ['quiz_id', 'user', 'ip_address', 'access_type', 'user_agent', 'referrer', 'endpoint', 'is_bot', 'created_at']
    date_hierarchy = 'created_at'
    
    def has_add_permission(self, request):
        return False  # Registros são criados automaticamente
    
    def has_change_permission(self, request, obj=None):
        return False  # Registros não podem ser editados
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser  # Apenas superuser pode deletar
    
    def access_type_badge(self, obj):
        colors = {
            'public': '#17a2b8',
            'authenticated': '#28a745',
            'admin': '#ffc107'
        }
        color = colors.get(obj.access_type, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; '
            'border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_access_type_display()
        )
    access_type_badge.short_description = 'Tipo de Acesso'
    
    def user_or_ip(self, obj):
        if obj.user:
            return format_html(
                '<span style="font-weight: bold;">👤 {}</span>',
                obj.user.username
            )
        return format_html(
            '<span style="color: #6c757d;">🌐 {}</span>',
            obj.ip_address
        )
    user_or_ip.short_description = 'Usuário/IP'
    
    def is_bot_badge(self, obj):
        if obj.is_bot:
            return format_html(
                '<span style="background-color: #dc3545; color: white; padding: 2px 6px; '
                'border-radius: 3px; font-size: 0.85em;">🤖 Bot</span>'
            )
        return format_html(
            '<span style="background-color: #28a745; color: white; padding: 2px 6px; '
            'border-radius: 3px; font-size: 0.85em;">👤 Humano</span>'
        )
    is_bot_badge.short_description = 'Tipo'
    
    def get_queryset(self, request):
        """Ordena por data decrescente e otimiza queries"""
        queryset = super().get_queryset(request)
        return queryset.select_related('user').order_by('-created_at')
