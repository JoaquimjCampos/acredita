# Example: engineering simulation logic

def run(input_data, parameters):
    load = input_data.get('load', parameters.get('load', 100))
    material = input_data.get('material', parameters.get('material', 'steel'))
    safety_factor = 1.5 if material == 'steel' else 1.2
    max_load = load * safety_factor
    return {
        'max_load': max_load,
        'material': material,
        'safety_factor': safety_factor
    }
