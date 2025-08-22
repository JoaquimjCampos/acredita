from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Simulator, SimulatorSession
from .serializers import SimulatorSerializer, SimulatorSessionSerializer

class SimulatorViewSet(viewsets.ModelViewSet):
    queryset = Simulator.objects.filter(is_active=True)
    serializer_class = SimulatorSerializer

    @action(detail=True, methods=['post'], url_path='run')
    def run_simulation(self, request, pk=None):
        simulator = self.get_object()
        input_data = request.data.get('input_data', {})
        # Example simulation logic (replace with real logic)
        result = {"final_balance": input_data.get("initial_balance", 0) * (1 + input_data.get("interest_rate", 0))}
        session = SimulatorSession.objects.create(
            simulator=simulator,
            user=request.user,
            input_data=input_data,
            result_data=result
        )
        return Response({"session_id": session.id, "result": result})

class SimulatorSessionViewSet(viewsets.ModelViewSet):
    queryset = SimulatorSession.objects.all()
    serializer_class = SimulatorSessionSerializer
