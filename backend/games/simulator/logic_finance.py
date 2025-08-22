# Example: finance simulation logic

def run(input_data, parameters):
    initial_balance = input_data.get('initial_balance', parameters.get('initial_balance', 1000))
    interest_rate = input_data.get('interest_rate', parameters.get('interest_rate', 0.05))
    years = input_data.get('years', 1)
    final_balance = initial_balance * ((1 + interest_rate) ** years)
    return {
        'final_balance': final_balance,
        'years': years,
        'interest_rate': interest_rate,
        'initial_balance': initial_balance
    }
