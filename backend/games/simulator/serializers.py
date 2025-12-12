from rest_framework import serializers
from backend.games.models import Simulator, SimulatorSession

class SimulatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Simulator
        fields = ['id', 'title', 'description', 'parameters', 'scenario', 'is_active', 'created_by', 'created_at']

class SimulatorSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SimulatorSession
        fields = ['id', 'simulator', 'user', 'input_data', 'result_data', 'feedback', 'started_at', 'finished_at']
