# Pluggable simulation logic registry
from importlib import import_module

def run_simulation(simulator, input_data):
    """
    Dynamically import and run domain-specific simulation logic.
    """
    if simulator.logic_module:
        try:
            logic = import_module(simulator.logic_module)
            return logic.run(input_data, simulator.parameters)
        except Exception as e:
            return {'error': str(e)}
    # Default logic (generic)
    return {'result': 'No custom logic defined', 'input': input_data}
