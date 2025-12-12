"""
Script de teste para validar a API de Payouts do Kixikila
"""

import requests
import json
from datetime import datetime

# Configuração
BASE_URL = "http://localhost:8000/api"
USERNAME = "admin_kixikila"
PASSWORD = "admin123"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_success(msg):
    print(f"{Colors.GREEN}✓ {msg}{Colors.END}")

def print_error(msg):
    print(f"{Colors.RED}✗ {msg}{Colors.END}")

def print_info(msg):
    print(f"{Colors.BLUE}ℹ {msg}{Colors.END}")

def print_section(title):
    print(f"\n{Colors.YELLOW}{'='*60}")
    print(f"{title}")
    print(f"{'='*60}{Colors.END}\n")

# 1. Login e obter token
def test_login():
    print_section("1. AUTENTICAÇÃO")
    
    # Tentar endpoint de token DRF
    endpoints_to_try = [
        f"{BASE_URL}/token/",
        f"{BASE_URL}/auth/login/",
        f"{BASE_URL}/accounts/login/",
    ]
    
    for endpoint in endpoints_to_try:
        try:
            print_info(f"Tentando: {endpoint}")
            response = requests.post(
                endpoint,
                json={"username": USERNAME, "password": PASSWORD},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'access' in data:
                    print_success(f"Login bem-sucedido via {endpoint}")
                    return data['access']
                elif 'token' in data:
                    print_success(f"Login bem-sucedido via {endpoint}")
                    return data['token']
            else:
                print_info(f"Status {response.status_code}: {response.text[:100]}")
        except Exception as e:
            print_info(f"Erro: {str(e)[:100]}")
    
    print_error("Não foi possível obter token. Testando sem autenticação...")
    return None

# 2. Listar payouts
def test_list_payouts(token):
    print_section("2. LISTAR PAYOUTS")
    
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    try:
        response = requests.get(f"{BASE_URL}/kixikila/payouts/", headers=headers)
        
        print_info(f"GET /kixikila/payouts/")
        print_info(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            payouts = data.get('results', []) if isinstance(data, dict) else data
            
            print_success(f"Listados {len(payouts)} payout(s)")
            
            for payout in payouts:
                print(f"\n  ID: {payout['id']}")
                print(f"  Beneficiário: {payout.get('recipient_email', 'N/A')}")
                print(f"  Ronda: {payout['round']}")
                print(f"  Valor Total: AOA {payout['total_amount']}")
                print(f"  Taxa: AOA {payout['platform_fee']}")
                print(f"  Valor Líquido: AOA {payout['net_amount']}")
                print(f"  Status: {payout['status']}")
                print(f"  Data Agendada: {payout['scheduled_date']}")
            
            return payouts
        else:
            print_error(f"Erro {response.status_code}: {response.text[:200]}")
            return []
    except Exception as e:
        print_error(f"Exceção: {str(e)}")
        return []

# 3. Ver payout específico
def test_get_payout(token, payout_id):
    print_section(f"3. OBTER PAYOUT #{payout_id}")
    
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    try:
        response = requests.get(f"{BASE_URL}/kixikila/payouts/{payout_id}/", headers=headers)
        
        print_info(f"GET /kixikila/payouts/{payout_id}/")
        print_info(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            payout = response.json()
            print_success("Payout obtido com sucesso")
            
            print(f"\n  Grupo: {payout.get('group_name', 'N/A')}")
            print(f"  Beneficiário: {payout.get('recipient_email', 'N/A')}")
            print(f"  Ronda: {payout['round']}")
            print(f"  Valor Líquido: AOA {payout['net_amount']}")
            print(f"  Status: {payout['status']}")
            print(f"  Elegível: {payout.get('is_eligible', 'N/A')}")
            print(f"  Pode Desembolsar: {payout.get('can_be_disbursed', 'N/A')}")
            
            return payout
        else:
            print_error(f"Erro {response.status_code}: {response.text[:200]}")
            return None
    except Exception as e:
        print_error(f"Exceção: {str(e)}")
        return None

# 4. Processar payout
def test_process_payout(token, payout_id):
    print_section(f"4. PROCESSAR PAYOUT #{payout_id}")
    
    if not token:
        print_error("Token necessário para processar payout")
        return False
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/kixikila/payouts/{payout_id}/process/",
            headers=headers
        )
        
        print_info(f"POST /kixikila/payouts/{payout_id}/process/")
        print_info(f"Status: {response.status_code}")
        
        if response.status_code in [200, 201]:
            print_success("Payout processado com sucesso")
            payout = response.json()
            print(f"\n  Novo Status: {payout.get('status', 'N/A')}")
            return True
        else:
            print_error(f"Erro {response.status_code}: {response.text[:200]}")
            return False
    except Exception as e:
        print_error(f"Exceção: {str(e)}")
        return False

# 5. Completar payout
def test_complete_payout(token, payout_id):
    print_section(f"5. COMPLETAR PAYOUT #{payout_id}")
    
    if not token:
        print_error("Token necessário para completar payout")
        return False
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/kixikila/payouts/{payout_id}/complete/",
            json={"payment_method": "bank_transfer"},
            headers=headers
        )
        
        print_info(f"POST /kixikila/payouts/{payout_id}/complete/")
        print_info(f"Status: {response.status_code}")
        
        if response.status_code in [200, 201]:
            print_success("Payout completado com sucesso")
            payout = response.json()
            print(f"\n  Novo Status: {payout.get('status', 'N/A')}")
            print(f"  Método: {payout.get('payment_method', 'N/A')}")
            return True
        else:
            print_error(f"Erro {response.status_code}: {response.text[:200]}")
            return False
    except Exception as e:
        print_error(f"Exceção: {str(e)}")
        return False

# Main
def main():
    print(f"\n{Colors.BLUE}{'*'*60}")
    print("TESTE DA API DE PAYOUTS - KIXIKILA")
    print(f"{'*'*60}{Colors.END}")
    print(f"\nData/Hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Base URL: {BASE_URL}")
    
    # 1. Login
    token = test_login()
    
    # 2. Listar payouts
    payouts = test_list_payouts(token)
    
    if not payouts:
        print_error("\nNenhum payout encontrado. Crie um com:")
        print("  python manage.py auto_create_payouts --group-id=3")
        return
    
    # 3. Obter primeiro payout
    payout_id = payouts[0]['id']
    payout = test_get_payout(token, payout_id)
    
    if not payout:
        return
    
    # 4. Processar se estiver agendado
    if payout['status'] == 'scheduled' and token:
        if test_process_payout(token, payout_id):
            # Reobter para ver mudança
            payout = test_get_payout(token, payout_id)
    
    # 5. Completar se estiver em processamento
    if payout and payout['status'] == 'processing' and token:
        test_complete_payout(token, payout_id)
        # Reobter para ver mudança final
        test_get_payout(token, payout_id)
    
    print_section("RESUMO FINAL")
    print_success("Testes concluídos!")
    print_info(f"Total de payouts testados: {len(payouts)}")

if __name__ == "__main__":
    main()
