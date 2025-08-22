from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SimulatorViewSet, SimulatorSessionViewSet
from .scenario_views import ScenarioViewSet
from .analytics import simulator_analytics, simulator_session_replay
from .generic_views import run_generic_simulation

router = DefaultRouter()
router.register(r'simulators', SimulatorViewSet)
router.register(r'sessions', SimulatorSessionViewSet)
router.register(r'scenarios', ScenarioViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('analytics/<int:simulator_id>/', simulator_analytics, name='simulator-analytics'),
    path('session-replay/<int:session_id>/', simulator_session_replay, name='simulator-session-replay'),
    path('run-generic/<int:simulator_id>/', run_generic_simulation, name='run-generic-simulation'),
]
