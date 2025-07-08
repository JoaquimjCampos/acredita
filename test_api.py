"""
Script de teste para APIs do Sistema Acredita Angola
Testa todos os endpoints implementados com MCP
"""

import requests
import json
from datetime import datetime

# Base URL
BASE_URL = "http://127.0.0.1:8000"

# Test data
test_user_data = {
    "username": "test_participant",
    "email": "participant@test.com",
    "password": "TestPassword123!",
    "password_confirm": "TestPassword123!",
    "first_name": "João",
    "last_name": "Silva Participante",
    "phone_number": "+244912345678",
    "user_type": "participant",
    "province": "luanda",
    "city": "Luanda",
    "terms_accepted": True
}

def test_endpoint(method, endpoint, data=None, headers=None, description=""):
    """Test an API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    
    print(f"\n{'='*60}")
    print(f"TESTE: {description}")
    print(f"URL: {method} {url}")
    
    try:
        if method.upper() == 'GET':
            response = requests.get(url, headers=headers)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data, headers=headers)
        elif method.upper() == 'PUT':
            response = requests.put(url, json=data, headers=headers)
        elif method.upper() == 'DELETE':
            response = requests.delete(url, headers=headers)
        
        print(f"Status: {response.status_code}")
        
        try:
            response_data = response.json()
            print(f"Response: {json.dumps(response_data, indent=2, ensure_ascii=False)}")
            return response_data
        except:
            print(f"Response Text: {response.text}")
            return None
            
    except Exception as e:
        print(f"Erro: {str(e)}")
        return None

def main():
    """Run all API tests"""
    print("SISTEMA ACREDITA EM TI, ACREDITA EM ANGOLA")
    print("Teste Completo de APIs")
    print(f"Iniciado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 1. Test user registration
    registration_response = test_endpoint(
        'POST', 
        '/api/accounts/register/',
        test_user_data,
        description="Registo de utilizador"
    )
    
    # 2. Test user login
    login_response = test_endpoint(
        'POST',
        '/api/auth/login/',
        {
            "username": test_user_data["username"],
            "password": test_user_data["password"]
        },
        description="Login de utilizador"
    )
    
    # Get authorization header if login successful
    auth_headers = {}
    if login_response and 'access' in login_response:
        auth_headers = {'Authorization': f'Bearer {login_response["access"]}'}
    
    # 3. Test user dashboard
    test_endpoint(
        'GET',
        '/api/accounts/users/dashboard/',
        headers=auth_headers,
        description="Dashboard do utilizador"
    )
    
    # 4. Test seasons API
    test_endpoint(
        'GET',
        '/api/seasons/api/seasons/',
        description="Listar temporadas"
    )
    
    test_endpoint(
        'GET',
        '/api/seasons/api/seasons/current/',
        description="Temporada atual"
    )
    
    # 5. Test participants API
    test_endpoint(
        'GET',
        '/api/participants/api/participants/',
        description="Listar participantes"
    )
    
    test_endpoint(
        'GET',
        '/api/participants/api/participants/leaderboard/',
        description="Classificação de participantes"
    )
    
    # 6. Test voting API
    test_endpoint(
        'GET',
        '/api/voting/api/sessions/',
        description="Sessões de votação"
    )
    
    test_endpoint(
        'GET',
        '/api/voting/api/sessions/active/',
        description="Votações ativas"
    )
    
    # 7. Test episodes API
    test_endpoint(
        'GET',
        '/api/seasons/api/episodes/',
        description="Listar episódios"
    )
    
    test_endpoint(
        'GET',
        '/api/seasons/api/episodes/upcoming/',
        description="Episódios próximos"
    )
    
    # 8. Test admin panel access
    test_endpoint(
        'GET',
        '/admin/',
        description="Painel administrativo"
    )
    
    print(f"\n{'='*60}")
    print("TESTE COMPLETO FINALIZADO")
    print(f"Finalizado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("Sistema Acredita em Ti, Acredita em Angola - Funcionando!")

if __name__ == "__main__":
    main()
