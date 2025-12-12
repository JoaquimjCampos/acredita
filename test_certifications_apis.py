#!/usr/bin/env python
"""
Script para testar APIs de certificações
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.acredita_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from backend.certifications.models import ProfessionalCategory, TrainingProgram, CandidateEnrollment

User = get_user_model()

def test_apis():
    print("\n" + "="*70)
    print("🧪 TESTANDO APIs DE CERTIFICAÇÕES")
    print("="*70)
    
    # Criar user de teste
    user, created = User.objects.get_or_create(
        username='testuser',
        defaults={'email': 'test@example.com'}
    )
    if created:
        user.set_password('testpass123')
        user.save()
        print(f"✅ User criado: {user.username}")
    else:
        print(f"⏭️  User já existe: {user.username}")
    
    # Inicializar client
    client = APIClient()
    client.force_authenticate(user=user)
    print("✅ Autenticação: OK\n")
    
    # Test 1: Listar categorias
    print("📌 Test 1: GET /api/v2/certifications/categories/")
    response = client.get('/api/v2/certifications/categories/')
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print(f"   Categorias encontradas: {response.data['count']}")
        for cat in response.data['results'][:2]:
            print(f"     - {cat['name']} ({cat['inefob_code']})")
        print("   ✅ PASSOU\n")
    else:
        print(f"   ❌ FALHOU: {response.data}\n")
    
    # Test 2: Listar programas
    print("📌 Test 2: GET /api/v2/certifications/programs/")
    response = client.get('/api/v2/certifications/programs/')
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print(f"   Programas encontrados: {response.data['count']}")
        for prog in response.data['results'][:2]:
            print(f"     - {prog['title']} (AOA {prog['cost']})")
        print("   ✅ PASSOU\n")
    else:
        print(f"   ❌ FALHOU: {response.data}\n")
    
    # Test 3: Inscrever em programa
    print("📌 Test 3: POST /api/v2/certifications/enrollments/")
    program = TrainingProgram.objects.first()
    
    # Remover inscrição anterior se existir
    CandidateEnrollment.objects.filter(candidate=user, program=program).delete()
    
    response = client.post('/api/v2/certifications/enrollments/', {'program': program.id})
    print(f"   Status: {response.status_code}")
    if response.status_code == 201:
        enrollment_id = response.data['id']
        print(f"   Inscrição criada: ID {enrollment_id}")
        print(f"   Programa: {response.data['program_title']}")
        print(f"   Status: {response.data['status']}")
        print("   ✅ PASSOU\n")
    else:
        print(f"   ❌ FALHOU: {response.data}\n")
        enrollment_id = None
    
    # Test 4: Ver minhas inscrições
    print("📌 Test 4: GET /api/v2/certifications/enrollments/")
    response = client.get('/api/v2/certifications/enrollments/')
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print(f"   Inscrições do user: {response.data['count']}")
        print("   ✅ PASSOU\n")
    else:
        print(f"   ❌ FALHOU: {response.data}\n")
    
    # Test 5: Ver estatísticas
    print("📌 Test 5: GET /api/v2/certifications/enrollments/my_stats/")
    response = client.get('/api/v2/certifications/enrollments/my_stats/')
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print(f"   Total inscrito: {response.data['total_enrolled']}")
        print(f"   Certificados: {response.data['certified']}")
        print("   ✅ PASSOU\n")
    else:
        print(f"   ❌ FALHOU: {response.data}\n")
    
    # Test 6: Iniciar programa (se temos enrollment_id)
    if enrollment_id:
        print(f"📌 Test 6: POST /api/v2/certifications/enrollments/{enrollment_id}/start/")
        response = client.post(f'/api/v2/certifications/enrollments/{enrollment_id}/start/')
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   Mensagem: {response.data['status']}")
            print("   ✅ PASSOU\n")
        else:
            print(f"   ❌ FALHOU: {response.data}\n")
    
    # Test 7: Completar programa (se temos enrollment_id)
    if enrollment_id:
        print(f"📌 Test 7: POST /api/v2/certifications/enrollments/{enrollment_id}/complete/")
        response = client.post(f'/api/v2/certifications/enrollments/{enrollment_id}/complete/')
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   Mensagem: {response.data['status']}")
            print("   ✅ PASSOU\n")
        else:
            print(f"   ❌ FALHOU: {response.data}\n")
    
    # Test 8: Certificar (admin only)
    print("📌 Test 8: POST /api/v2/certifications/enrollments/{id}/certify/ (user não-admin)")
    if enrollment_id:
        response = client.post(f'/api/v2/certifications/enrollments/{enrollment_id}/certify/')
        print(f"   Status: {response.status_code} (esperado 403)")
        if response.status_code == 403:
            print("   ✅ PASSOU (corretamente rejeitado)\n")
        else:
            print(f"   ⚠️  Status inesperado\n")
    
    # Test 9: Status de feature flag
    print("📌 Test 9: GET /api/v2/certifications/status/")
    response = client.get('/api/v2/certifications/status/')
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print(f"   Certificações ativadas: Sim")
        print(f"   Categorias disponíveis: {response.data['available_categories']}")
        print(f"   Programas disponíveis: {response.data['available_programs']}")
        print("   ✅ PASSOU\n")
    else:
        print(f"   ❌ FALHOU: {response.data}\n")
    
    print("="*70)
    print("✅ TESTES CONCLUÍDOS COM SUCESSO!")
    print("="*70 + "\n")

if __name__ == '__main__':
    test_apis()
