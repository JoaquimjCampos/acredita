from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    ProfessionalCategory,
    TrainingProgram,
    CandidateEnrollment,
    SkillAssessment,
    AssessmentResult
)


@admin.register(ProfessionalCategory)
class ProfessionalCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'inefob_code', 'programs_count', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'inefob_code', 'description']
    readonly_fields = ['created_at', 'updated_at', 'programs_count_display']
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('name', 'inefob_code', 'description')
        }),
        ('Detalhes', {
            'fields': ('icon_url', 'is_active')
        }),
        ('Estatísticas', {
            'fields': ('programs_count_display',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def programs_count(self, obj):
        count = obj.programs.count()
        return format_html(
            '<span style="background-color: #ddd; padding: 3px 8px; border-radius: 3px;">{}</span>',
            count
        )
    programs_count.short_description = 'Programas'
    
    def programs_count_display(self, obj):
        count = obj.programs.count()
        active = obj.programs.filter(is_active=True).count()
        return f"{active} ativos de {count} total"
    programs_count_display.short_description = 'Programas'


@admin.register(TrainingProgram)
class TrainingProgramAdmin(admin.ModelAdmin):
    list_display = [
        'title',
        'category',
        'provider',
        'duration_hours',
        'cost_display',
        'participants_display',
        'is_inefob_certified',
        'is_active'
    ]
    list_filter = ['category', 'is_inefob_certified', 'is_active', 'created_at']
    search_fields = ['title', 'provider', 'description', 'category__name']
    readonly_fields = ['created_at', 'updated_at', 'current_participants']
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('title', 'description', 'category', 'provider')
        }),
        ('Detalhes do Programa', {
            'fields': (
                'duration_hours',
                'cost',
                'is_inefob_certified',
                'is_active',
                'max_participants',
                'current_participants'
            )
        }),
        ('Datas', {
            'fields': ('start_date', 'end_date')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def cost_display(self, obj):
        return f"AOA {obj.cost:,.2f}"
    cost_display.short_description = 'Custo'
    
    def participants_display(self, obj):
        current = obj.current_participants
        max_part = obj.max_participants or '∞'
        color = 'red' if obj.is_full else 'green'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}/{}</span>',
            color,
            current,
            max_part
        )
    participants_display.short_description = 'Participantes'


@admin.register(SkillAssessment)
class SkillAssessmentAdmin(admin.ModelAdmin):
    list_display = ['title', 'program', 'weight', 'is_required', 'created_at']
    list_filter = ['program__category', 'is_required', 'created_at']
    search_fields = ['title', 'description', 'program__title']
    readonly_fields = ['created_at']
    fieldsets = (
        ('Informações', {
            'fields': ('program', 'title', 'description')
        }),
        ('Configuração', {
            'fields': ('weight', 'is_required')
        }),
        ('Timestamp', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )


class AssessmentResultInline(admin.TabularInline):
    model = AssessmentResult
    extra = 0
    readonly_fields = ['assessment', 'result', 'score', 'evaluated_by', 'evaluated_at']
    fields = ['assessment', 'result', 'score', 'notes']


@admin.register(CandidateEnrollment)
class CandidateEnrollmentAdmin(admin.ModelAdmin):
    list_display = [
        'candidate_display',
        'program',
        'status_display',
        'enrollment_date',
        'completion_date'
    ]
    list_filter = ['status', 'enrollment_date', 'program__category', 'program__is_inefob_certified']
    search_fields = ['candidate__username', 'candidate__email', 'program__title']
    readonly_fields = [
        'enrollment_date',
        'start_date',
        'completion_date',
        'certificate_code'
    ]
    fieldsets = (
        ('Informações de Inscrição', {
            'fields': ('candidate', 'program', 'status')
        }),
        ('Datas', {
            'fields': (
                'enrollment_date',
                'start_date',
                'completion_date'
            )
        }),
        ('Certificado', {
            'fields': (
                'certificate_url',
                'certificate_code'
            ),
            'classes': ('collapse',)
        }),
        ('Notas', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
    )
    inlines = [AssessmentResultInline]
    
    actions = [
        'mark_as_started',
        'mark_as_completed',
        'mark_as_certified',
        'mark_as_failed',
        'mark_as_cancelled'
    ]
    
    def candidate_display(self, obj):
        return f"{obj.candidate.username} ({obj.candidate.email})"
    candidate_display.short_description = 'Candidato'
    
    def status_display(self, obj):
        colors = {
            'enrolled': '#FFC107',      # Amarelo
            'in_progress': '#2196F3',   # Azul
            'completed': '#4CAF50',     # Verde
            'certified': '#009688',     # Teal
            'failed': '#F44336',        # Vermelho
            'cancelled': '#9E9E9E',     # Cinzento
        }
        color = colors.get(obj.status, '#000')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_display.short_description = 'Status'
    
    def mark_as_started(self, request, queryset):
        updated = 0
        for enrollment in queryset:
            if enrollment.start_program():
                updated += 1
        self.message_user(request, f'{updated} inscrições marcadas como iniciadas')
    mark_as_started.short_description = "✓ Marcar como Iniciado"
    
    def mark_as_completed(self, request, queryset):
        updated = 0
        for enrollment in queryset:
            if enrollment.complete_program():
                updated += 1
        self.message_user(request, f'{updated} inscrições marcadas como concluídas')
    mark_as_completed.short_description = "✓✓ Marcar como Concluído"
    
    def mark_as_certified(self, request, queryset):
        updated = 0
        for enrollment in queryset:
            if enrollment.status in ['completed', 'in_progress']:
                enrollment.certify(certificate_code=f"CERT-{enrollment.id}")
                updated += 1
        self.message_user(request, f'{updated} certificados emitidos')
    mark_as_certified.short_description = "✓✓✓ Emitir Certificados"
    
    def mark_as_failed(self, request, queryset):
        updated = queryset.update(status='failed')
        self.message_user(request, f'{updated} inscrições marcadas como reprovadas')
    mark_as_failed.short_description = "✗ Marcar como Reprovado"
    
    def mark_as_cancelled(self, request, queryset):
        updated = queryset.update(status='cancelled')
        self.message_user(request, f'{updated} inscrições canceladas')
    mark_as_cancelled.short_description = "Cancelar Inscrições"


@admin.register(AssessmentResult)
class AssessmentResultAdmin(admin.ModelAdmin):
    list_display = [
        'enrollment',
        'assessment',
        'result_display',
        'score_display',
        'evaluated_by',
        'evaluated_at'
    ]
    list_filter = ['result', 'assessment__program', 'evaluated_at']
    search_fields = [
        'enrollment__candidate__username',
        'assessment__title',
        'assessment__program__title'
    ]
    readonly_fields = ['evaluated_at']
    fieldsets = (
        ('Avaliação', {
            'fields': ('enrollment', 'assessment')
        }),
        ('Resultado', {
            'fields': ('result', 'score', 'notes')
        }),
        ('Avaliador', {
            'fields': ('evaluated_by', 'evaluated_at')
        }),
    )
    
    def result_display(self, obj):
        colors = {
            'pass': '#4CAF50',
            'fail': '#F44336',
            'pending': '#FFC107',
        }
        color = colors.get(obj.result, '#000')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color,
            obj.get_result_display()
        )
    result_display.short_description = 'Resultado'
    
    def score_display(self, obj):
        if obj.score is not None:
            return f"{obj.score}/100"
        return "-"
    score_display.short_description = 'Pontuação'
