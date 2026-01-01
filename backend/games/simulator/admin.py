from django.contrib import admin
from django.utils.html import format_html
from django.urls import path
from django.template.response import TemplateResponse
import json
from backend.games.models import Simulator, SimulatorSession
from .scenario import Scenario

class ScenarioInline(admin.TabularInline):
    model = Scenario
    extra = 1
    fields = ('title', 'order', 'choices', 'outcome')
    show_change_link = True

class SimulatorAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_active', 'created_by', 'created_at', 'session_count', 'dashboard_widget', 'analytics_link')
    search_fields = ('title', 'description')
    list_filter = ('is_active',)
    inlines = [ScenarioInline]

    def session_count(self, obj):
        return obj.sessions.count()
    session_count.short_description = 'Sessions'

    def dashboard_widget(self, obj):
        color = '#10b981' if obj.is_active else '#ef4444'
        return format_html('<span style="color:{};font-weight:bold;">{}</span>', color, 'Active' if obj.is_active else 'Inactive')
    dashboard_widget.short_description = 'Status'

    def analytics_link(self, obj):
        return format_html('<a href="{}">View Analytics</a>', f'/admin/games/simulator/{obj.pk}/analytics/')
    analytics_link.short_description = 'Analytics'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('<int:simulator_id>/analytics/', self.admin_site.admin_view(self.analytics_view), name='simulator-analytics'),
        ]
        return custom_urls + urls

    def analytics_view(self, request, simulator_id):
        simulator = Simulator.objects.get(pk=simulator_id)
        sessions = simulator.sessions.all()
        session_data = [
            {
                'user': str(s.user),
                'started_at': s.started_at,
                'finished_at': s.finished_at,
                'choices': getattr(s, 'choices', None),
                'feedback': s.feedback,
            }
            for s in sessions
        ]
        # Example chart data: session count per day
        from collections import Counter
        days = [s.started_at.date().isoformat() for s in sessions if s.started_at]
        day_counts = Counter(days)
        chart_labels = list(day_counts.keys())
        chart_values = list(day_counts.values())

        context = self.admin_site.each_context(request)
        context['simulator'] = simulator
        context['session_data'] = json.dumps(session_data, default=str)
        context['chart_labels'] = json.dumps(chart_labels)
        context['chart_values'] = json.dumps(chart_values)
        return TemplateResponse(request, "admin/simulator_analytics.html", context)
import os
from django.conf import settings

if not os.path.exists(os.path.join(settings.BASE_DIR, "backend/games/simulator/templates/admin/simulator_analytics.html")):
    os.makedirs(os.path.join(settings.BASE_DIR, "backend/games/simulator/templates/admin"), exist_ok=True)
    with open(os.path.join(settings.BASE_DIR, "backend/games/simulator/templates/admin/simulator_analytics.html"), "w", encoding="utf-8") as f:
        f.write("""
{% extends 'admin/base_site.html' %}
{% block content %}
<h1>Simulator Analytics: {{ simulator.title }}</h1>
<canvas id='sessionsChart' width='600' height='300'></canvas>
<script src='https://cdn.jsdelivr.net/npm/chart.js'></script>
<script>
const ctx = document.getElementById('sessionsChart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: {{ chart_labels|safe }},
        datasets: [{
            label: 'Sessions per Day',
            data: {{ chart_values|safe }},
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: { beginAtZero: true }
        }
    }
});
</script>
<h2>Session Details</h2>
<pre>{{ session_data }}</pre>
{% endblock %}
""")

class ScenarioAdmin(admin.ModelAdmin):
    list_display = ('title', 'simulator', 'order')
    search_fields = ('title', 'description')
    list_filter = ('simulator',)

class SimulatorSessionAdmin(admin.ModelAdmin):
    list_display = ('simulator', 'user', 'started_at', 'finished_at', 'feedback')
    search_fields = ('simulator__title', 'user__username', 'feedback')
    list_filter = ('simulator',)

admin.site.register(Simulator, SimulatorAdmin)
admin.site.register(Scenario, ScenarioAdmin)
admin.site.register(SimulatorSession, SimulatorSessionAdmin)
