from rest_framework import viewsets
from .scenario import Scenario
from .scenario_serializers import ScenarioSerializer

class ScenarioViewSet(viewsets.ModelViewSet):
    queryset = Scenario.objects.all()
    serializer_class = ScenarioSerializer
