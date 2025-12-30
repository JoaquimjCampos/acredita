from typing import Any, Dict


def _to_number(value: Any, default: float = 0.0) -> float:
    try:
        if isinstance(value, (int, float)):
            return float(value)
        if isinstance(value, str):
            v = value.strip().replace(',', '.')
            return float(v) if v else default
        return default
    except Exception:
        return default


def _difficulty_factor(difficulty: str | None) -> float:
    d = (difficulty or '').lower()
    if d.startswith('fá') or d == 'facil' or d == 'fácil':
        return 0.8
    if d.startswith('méd') or d == 'medio' or d == 'médio':
        return 1.0
    if d.startswith('dif') or d == 'dificil' or d == 'difícil':
        return 1.2
    return 1.0


def finance_logic(simulator, input_data: Dict[str, Any]) -> Dict[str, Any]:
    principal = _to_number(input_data.get('initial_balance', simulator.parameters.get('initial_balance', 0)))
    rate = _to_number(input_data.get('interest_rate', simulator.parameters.get('interest_rate', 0)))
    periods = int(_to_number(input_data.get('periods', simulator.parameters.get('periods', 12))) or 12)
    # Compound interest
    final_balance = principal * ((1.0 + rate) ** periods)
    profit = final_balance - principal
    roi = (profit / principal) if principal else 0.0
    return {
        'final_balance': round(final_balance, 2),
        'profit': round(profit, 2),
        'roi': round(roi, 4),
        'inputs': {'initial_balance': principal, 'interest_rate': rate, 'periods': periods},
        'kpis': {'profit': round(profit, 2), 'roi': round(roi, 4)}
    }


def business_logic(simulator, input_data: Dict[str, Any]) -> Dict[str, Any]:
    # Basic P&L model
    revenue = _to_number(input_data.get('revenue', simulator.parameters.get('revenue', 0)))
    variable_costs = _to_number(input_data.get('variable_costs', simulator.parameters.get('variable_costs', 0)))
    fixed_costs = _to_number(input_data.get('fixed_costs', simulator.parameters.get('fixed_costs', 0)))
    initial_balance = _to_number(input_data.get('initial_balance', simulator.parameters.get('initial_balance', 0)))
    difficulty = simulator.difficulty
    risk_factor = _difficulty_factor(difficulty)

    gross_margin = revenue - variable_costs
    operating_profit = gross_margin - fixed_costs
    adjusted_profit = operating_profit * (1.0 - 0.05 * (risk_factor - 1.0))
    final_balance = initial_balance + adjusted_profit
    roi = (adjusted_profit / (variable_costs + fixed_costs)) if (variable_costs + fixed_costs) else 0.0
    breakeven_revenue = fixed_costs + variable_costs

    return {
        'final_balance': round(final_balance, 2),
        'profit': round(adjusted_profit, 2),
        'roi': round(roi, 4),
        'gross_margin': round(gross_margin, 2),
        'breakeven_revenue': round(breakeven_revenue, 2),
        'inputs': {
            'revenue': revenue, 'variable_costs': variable_costs, 'fixed_costs': fixed_costs,
            'initial_balance': initial_balance, 'difficulty': difficulty
        },
        'kpis': {
            'profit': round(adjusted_profit, 2),
            'roi': round(roi, 4),
            'gross_margin': round(gross_margin, 2)
        }
    }


def investment_logic(simulator, input_data: Dict[str, Any]) -> Dict[str, Any]:
    amount = _to_number(input_data.get('amount', simulator.parameters.get('amount', simulator.parameters.get('initial_balance', 0))))
    growth_rate = _to_number(input_data.get('growth_rate', simulator.parameters.get('growth_rate', simulator.parameters.get('interest_rate', 0))))
    volatility = _to_number(input_data.get('volatility', simulator.parameters.get('volatility', 0.1)))
    periods = int(_to_number(input_data.get('periods', simulator.parameters.get('periods', 12))) or 12)
    difficulty = simulator.difficulty
    risk_factor = _difficulty_factor(difficulty)

    # Geometric-like growth with volatility penalty
    effective_rate = max(growth_rate - volatility * (risk_factor - 0.8), -0.99)
    final_balance = amount * ((1.0 + effective_rate) ** periods)
    profit = final_balance - amount
    roi = (profit / amount) if amount else 0.0

    return {
        'final_balance': round(final_balance, 2),
        'profit': round(profit, 2),
        'roi': round(roi, 4),
        'inputs': {'amount': amount, 'growth_rate': growth_rate, 'volatility': volatility, 'periods': periods},
        'kpis': {'profit': round(profit, 2), 'roi': round(roi, 4)}
    }


def default_logic(simulator, input_data: Dict[str, Any]) -> Dict[str, Any]:
    principal = _to_number(input_data.get('initial_balance', simulator.parameters.get('initial_balance', 0)))
    rate = _to_number(input_data.get('interest_rate', simulator.parameters.get('interest_rate', 0)))
    final_balance = principal * (1.0 + rate)
    profit = final_balance - principal
    roi = (profit / principal) if principal else 0.0
    return {
        'final_balance': round(final_balance, 2),
        'profit': round(profit, 2),
        'roi': round(roi, 4),
        'inputs': {'initial_balance': principal, 'interest_rate': rate},
        'kpis': {'profit': round(profit, 2), 'roi': round(roi, 4)}
    }


def compute_result(simulator, input_data: Dict[str, Any]) -> Dict[str, Any]:
    st = (getattr(simulator, 'scenario_type', None) or getattr(simulator, 'domain', None) or '').lower()
    if 'finance' in st or 'finan' in st:
        return finance_logic(simulator, input_data)
    if 'business' in st or 'neg' in st:
        return business_logic(simulator, input_data)
    if 'invest' in st:
        return investment_logic(simulator, input_data)
    return default_logic(simulator, input_data)


def required_inputs(simulator) -> list[str]:
    st = (getattr(simulator, 'scenario_type', None) or getattr(simulator, 'domain', None) or '').lower()
    if 'finance' in st or 'finan' in st:
        return ['initial_balance', 'interest_rate', 'periods']
    if 'business' in st or 'neg' in st:
        return ['revenue', 'variable_costs', 'fixed_costs', 'initial_balance']
    if 'invest' in st:
        return ['amount', 'growth_rate', 'periods']
    return ['initial_balance', 'interest_rate']


def validate_required_inputs(simulator, input_data: Dict[str, Any]) -> list[str]:
    missing = []
    for key in required_inputs(simulator):
        val = input_data.get(key)
        if val is None or (isinstance(val, str) and not val.strip()):
            # Also allow default from simulator.parameters
            if simulator.parameters.get(key) in (None, ''):
                missing.append(key)
    return missing
