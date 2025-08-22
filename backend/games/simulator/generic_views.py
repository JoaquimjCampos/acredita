from rest_framework.decorators import api_view
from rest_framework.response import Response
from .generic_models import GenericSimulator, GenericSimulatorSession, GenericScenario
from .logic_registry import run_simulation

@api_view(['POST'])
def run_generic_simulation(request, simulator_id):
    simulator = GenericSimulator.objects.get(id=simulator_id)
    input_data = request.data.get('input_data', {})
    result = run_simulation(simulator, input_data)
    session = GenericSimulatorSession.objects.create(
        simulator=simulator,
        user=request.user,
        input_data=input_data,
        result_data=result
    )
    return Response({
        'session_id': session.id,
        'result': result
    })
