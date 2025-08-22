# Example: health simulation logic

def run(input_data, parameters):
    age = input_data.get('age', parameters.get('age', 30))
    bmi = input_data.get('bmi', parameters.get('bmi', 22))
    exercise = input_data.get('exercise', parameters.get('exercise', 'moderate'))
    risk = 0.1 if exercise == 'high' else 0.2 if exercise == 'moderate' else 0.3
    health_score = max(0, 100 - (age * 0.5 + bmi * 1.5 + risk * 20))
    return {
        'health_score': health_score,
        'age': age,
        'bmi': bmi,
        'exercise': exercise
    }
