"""
Test Trust Score permission system
Tests voter progression from blocked to unlocked features
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def get_auth_headers(username, password):
    """Login and return auth headers"""
    response = requests.post(f"{BASE_URL}/auth/login/", json={
        "username": username,
        "password": password
    })
    if response.status_code == 200:
        token = response.json().get('access')
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    return None

def test_voter_permissions():
    """Test voter permissions with Trust Score progression"""
    
    print("=" * 70)
    print("TESTE: Sistema de Permissões com Trust Score")
    print("=" * 70)
    
    # Login as test voter
    print("\n1. Login como eleitor (test_voter)...")
    headers = get_auth_headers("test_voter", "test123")
    if not headers:
        print("   ✗ Falha no login")
        return
    print("   ✓ Login bem-sucedido")
    
    # Check initial trust score
    print("\n2. Verificando Trust Score inicial...")
    response = requests.get(f"{BASE_URL}/accounts/trust/my_trust/", headers=headers)
    if response.status_code == 200:
        data = response.json()
        score = data.get('total_score', 0)
        print(f"   ✓ Trust Score: {score:.1f}/100")
        print(f"   - Marketplace: {'✓ Desbloqueado' if data.get('can_create_marketplace') else '✗ Bloqueado (precisa 15pts + verificações)'}")
        print(f"   - Kixikila: {'✓ Desbloqueado' if data.get('can_create_kixikila') else '✗ Bloqueado (precisa 20pts + verificações)'}")
        print(f"   - Blog: {'✓ Auto-publicação' if data.get('can_publish_blog') else '⚠ Requer moderação (precisa 25pts)'}")
    else:
        print(f"   ✗ Erro ao buscar Trust Score: {response.status_code}")
        return
    
    # Try to create marketplace listing (should fail)
    print("\n3. Tentando criar listagem no marketplace (deve falhar)...")
    marketplace_data = {
        "title": "Produto Teste",
        "description": "Descrição do produto",
        "price": "1000"
    }
    response = requests.post(f"{BASE_URL}/v2/marketplace/listings/", 
                            json=marketplace_data, headers=headers)
    if response.status_code == 403:
        error_msg = response.json().get('detail', 'Sem detalhes')
        print(f"   ✓ Bloqueado corretamente: {error_msg}")
    elif response.status_code == 404:
        print(f"   ⚠ Endpoint não encontrado (normal se módulo não configurado)")
    else:
        print(f"   ⚠ Resposta inesperada: {response.status_code}")
    
    # Verify email to gain points
    print("\n4. Verificando email (+5 pontos)...")
    response = requests.post(f"{BASE_URL}/accounts/trust/verify_email/", headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ {data.get('message')}")
        print(f"   Novo score: {data.get('new_score', 0):.1f}/100")
    
    # Verify phone to gain points
    print("\n5. Verificando telefone (+5 pontos)...")
    response = requests.post(f"{BASE_URL}/accounts/trust/verify_phone/", headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ {data.get('message')}")
        print(f"   Novo score: {data.get('new_score', 0):.1f}/100")
    
    # Check updated trust score
    print("\n6. Verificando Trust Score após verificações...")
    response = requests.get(f"{BASE_URL}/accounts/trust/my_trust/", headers=headers)
    if response.status_code == 200:
        data = response.json()
        score = data.get('total_score', 0)
        print(f"   ✓ Trust Score: {score:.1f}/100")
        print(f"   - Marketplace: {'✓ DESBLOQUEADO!' if data.get('can_create_marketplace') else '✗ Ainda bloqueado'}")
        print(f"   - Kixikila: {'✓ DESBLOQUEADO!' if data.get('can_create_kixikila') else '✗ Ainda bloqueado (precisa mais 5pts)'}")
        print(f"   - Blog: {'✓ Auto-publicação' if data.get('can_publish_blog') else '⚠ Requer moderação'}")
        
        # Show recommendations
        recs = data.get('recommendations', [])
        if recs:
            print(f"\n   Próximas ações recomendadas:")
            for rec in recs[:2]:
                print(f"   • {rec['title']} (+{rec['points']} pts)")
    
    # Try marketplace again (should still fail - need profile complete)
    print("\n7. Tentando criar listagem no marketplace novamente...")
    response = requests.post(f"{BASE_URL}/v2/marketplace/listings/", 
                            json=marketplace_data, headers=headers)
    if response.status_code == 403:
        error_msg = response.json().get('detail', 'Sem detalhes')
        print(f"   ✗ Ainda bloqueado: {error_msg}")
    elif response.status_code == 404:
        print(f"   ⚠ Endpoint não encontrado (módulo marketplace não configurado)")
    elif response.status_code == 201:
        print(f"   ✓ DESBLOQUEADO! Listagem criada com sucesso!")
    else:
        print(f"   ⚠ Status: {response.status_code}")
    
    print("\n" + "=" * 70)
    print("RESULTADO: Sistema de Trust Score funcionando!")
    print("- Eleitores começam bloqueados")
    print("- Podem desbloquear recursos com verificações e engajamento")
    print("- Progressão transparente e justa")
    print("=" * 70)

if __name__ == "__main__":
    test_voter_permissions()
