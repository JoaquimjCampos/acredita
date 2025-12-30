from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from backend.games.models import Simulator, SimulatorSession
from .serializers import SimulatorSerializer, SimulatorSessionSerializer
from .business_logic import compute_result, validate_required_inputs


class SimulatorViewSet(viewsets.ModelViewSet):
    queryset = Simulator.objects.filter(is_active=True)
    serializer_class = SimulatorSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    @action(detail=True, methods=['post'], url_path='run')
    def run_simulation(self, request, pk=None):
        simulator = self.get_object()
        input_data = request.data.get('input_data', {})
        # Validate required inputs per simulator type
        missing = validate_required_inputs(simulator, input_data)
        if missing:
            return Response({
                "error": "Missing required inputs",
                "missing": missing
            }, status=status.HTTP_400_BAD_REQUEST)
        # Compute result using scenario_type/domain-specific logic
        result = compute_result(simulator, input_data)
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
