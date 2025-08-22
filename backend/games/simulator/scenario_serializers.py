from rest_framework import serializers
from .scenario import Scenario

class ScenarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scenario
        fields = ['id', 'simulator', 'title', 'description', 'order', 'choices', 'outcome']
