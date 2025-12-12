"""
Script para criar dados de teste para o sistema de Payouts do Kixikila
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.acredita_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from backend.kixikila.models import KixikilaGroup, KixikilaMembership, KixikilaContribution
from datetime import date, timedelta

User = get_user_model()

def create_test_data():
    print("🚀 Criando dados de teste para Kixikila Payouts...\n")
    
    # Criar usuários se não existirem
    print("1. Criando usuários...")
    admin, _ = User.objects.get_or_create(
        username='admin_kixikila',
        defaults={
            'email': 'admin@kixikila.test',
            'is_staff': True,
            'is_superuser': True
        }
    )
    admin.set_password('admin123')
    admin.save()
    print(f"   ✓ Admin: {admin.username}")
    
    maria, _ = User.objects.get_or_create(
        username='maria_test',
        defaults={'email': 'maria@test.com'}
    )
    maria.set_password('test123')
    maria.save()
    print(f"   ✓ Maria: {maria.username}")
    
    joao, _ = User.objects.get_or_create(
        username='joao_test',
        defaults={'email': 'joao@test.com'}
    )
    joao.set_password('test123')
    joao.save()
    print(f"   ✓ João: {joao.username}")
    
    ana, _ = User.objects.get_or_create(
        username='ana_test',
        defaults={'email': 'ana@test.com'}
    )
    ana.set_password('test123')
    ana.save()
    print(f"   ✓ Ana: {ana.username}")
    
    # Criar grupo de teste
    print("\n2. Criando grupo de teste...")
    group, created = KixikilaGroup.objects.get_or_create(
        name='Grupo Teste Payouts',
        defaults={
            'created_by': admin,
            'group_type': 'professional',
            'description': 'Grupo de teste para validar sistema de payouts',
            'monthly_contribution': 10000.00,
            'max_members': 3,
            'current_members': 3,
            'duration_months': 12,
            'start_date': date.today() - timedelta(days=30),
            'current_round': 1,
            'status': 'active',
            'province': 'Luanda',
            'municipality': 'Luanda'
        }
    )
    
    if created:
        print(f"   ✓ Grupo criado: {group.name} (ID: {group.id})")
    else:
        print(f"   ✓ Grupo já existe: {group.name} (ID: {group.id})")
    
    # Criar memberships
    print("\n3. Criando memberships...")
    members_data = [
        (maria, 1),
        (joao, 2),
        (ana, 3)
    ]
    
    for member, position in members_data:
        membership, created = KixikilaMembership.objects.get_or_create(
            group=group,
            member=member,
            defaults={
                'position': position,
                'is_active': True,
                'payout_received': False
            }
        )
        if created:
            print(f"   ✓ Membro adicionado: {member.username} (posição {position})")
        else:
            print(f"   ✓ Membro já existe: {member.username} (posição {position})")
    
    # Criar contribuições confirmadas para ronda 1
    print("\n4. Criando contribuições confirmadas para ronda 1...")
    memberships = KixikilaMembership.objects.filter(group=group)
    
    for membership in memberships:
        contribution, created = KixikilaContribution.objects.get_or_create(
            membership=membership,
            round=1,
            defaults={
                'amount': group.monthly_contribution,
                'status': 'confirmed',
                'payment_method': 'bank_transfer',
                'payment_reference': f'TEST-{membership.member.username}-R1'
            }
        )
        if created:
            print(f"   ✓ Contribuição criada: {membership.member.username} - AOA {contribution.amount}")
        else:
            print(f"   ✓ Contribuição já existe: {membership.member.username} - AOA {contribution.amount}")
    
    # Resumo
    print("\n" + "="*60)
    print("✅ DADOS DE TESTE CRIADOS COM SUCESSO!\n")
    print(f"Grupo ID: {group.id}")
    print(f"Nome: {group.name}")
    print(f"Contribuição Mensal: AOA {group.monthly_contribution}")
    print(f"Membros: {memberships.count()}")
    print(f"Contribuições Confirmadas (Ronda 1): {KixikilaContribution.objects.filter(membership__group=group, round=1, status='confirmed').count()}")
    print("\n📋 PRÓXIMOS PASSOS:")
    print("1. Execute: python manage.py auto_create_payouts --dry-run")
    print("2. Execute: python manage.py auto_create_payouts")
    print("3. Acesse: http://localhost:3000/kixikila/{}/manage".format(group.id))
    print("4. Login: admin_kixikila / admin123")
    print("="*60)

if __name__ == '__main__':
    create_test_data()
