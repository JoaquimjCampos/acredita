"""
Script para popular dados iniciais de certificações
Execute com: python manage.py shell < backend/certifications/populate_data.py
"""

from backend.certifications.models import ProfessionalCategory, TrainingProgram

# Dados de categorias profissionais INEFOB
CATEGORIES_DATA = [
    {
        'name': 'Motoqueiro',
        'inefob_code': 'MTQ001',
        'description': 'Condutor profissional de motociclo para transportes de carga e passageiros'
    },
    {
        'name': 'Pedreiro',
        'inefob_code': 'PDR001',
        'description': 'Profissional especializado em construção e alvenaria'
    },
    {
        'name': 'Eletricista',
        'inefob_code': 'ELC001',
        'description': 'Técnico em instalações e manutenção elétrica'
    },
    {
        'name': 'Cabeleireiro',
        'inefob_code': 'CBL001',
        'description': 'Profissional de beleza e estética capilar'
    },
    {
        'name': 'Carpinteiro',
        'inefob_code': 'CRP001',
        'description': 'Especialista em trabalhos de madeira e carpintaria'
    },
]

# Dados de programas de formação
PROGRAMS_DATA = [
    {
        'category': 'Motoqueiro',
        'title': 'Formação em Segurança de Transportes Motorizados',
        'description': 'Programa de 40 horas sobre segurança, legislação e manutenção básica de motos',
        'provider': 'Instituto de Transportes Angola',
        'duration_hours': 40,
        'cost': 5000.00,
        'is_inefob_certified': True,
        'max_participants': 20,
    },
    {
        'category': 'Pedreiro',
        'title': 'Técnicas Modernas de Construção',
        'description': 'Aprender técnicas atualizadas de construção com materiais sustentáveis',
        'provider': 'Instituto Técnico de Construção',
        'duration_hours': 60,
        'cost': 7500.00,
        'is_inefob_certified': True,
        'max_participants': 15,
    },
    {
        'category': 'Eletricista',
        'title': 'Segurança em Instalações Elétricas',
        'description': 'Formação completa em segurança e boas práticas elétricas',
        'provider': 'Academia de Eletricistas',
        'duration_hours': 50,
        'cost': 6500.00,
        'is_inefob_certified': True,
        'max_participants': 12,
    },
    {
        'category': 'Cabeleireiro',
        'title': 'Técnicas de Corte e Coloração',
        'description': 'Programa avançado de técnicas de corte, coloração e styling',
        'provider': 'Instituto de Beleza Angola',
        'duration_hours': 30,
        'cost': 4000.00,
        'is_inefob_certified': False,
        'max_participants': 10,
    },
    {
        'category': 'Carpinteiro',
        'title': 'Carpintaria Tradicional e Moderna',
        'description': 'Técnicas de carpintaria combinando métodos tradicionais e modernos',
        'provider': 'Escola Profissional de Madeiras',
        'duration_hours': 55,
        'cost': 6000.00,
        'is_inefob_certified': True,
        'max_participants': 14,
    },
]

def populate():
    print("🔄 Populando categorias profissionais...")
    
    for cat_data in CATEGORIES_DATA:
        category, created = ProfessionalCategory.objects.get_or_create(
            inefob_code=cat_data['inefob_code'],
            defaults={
                'name': cat_data['name'],
                'description': cat_data['description'],
            }
        )
        if created:
            print(f"  ✅ Criado: {category.name}")
        else:
            print(f"  ⏭️  Já existe: {category.name}")
    
    print("\n🔄 Populando programas de formação...")
    
    for prog_data in PROGRAMS_DATA:
        category = ProfessionalCategory.objects.get(name=prog_data['category'])
        program, created = TrainingProgram.objects.get_or_create(
            title=prog_data['title'],
            provider=prog_data['provider'],
            defaults={
                'category': category,
                'description': prog_data['description'],
                'duration_hours': prog_data['duration_hours'],
                'cost': prog_data['cost'],
                'is_inefob_certified': prog_data['is_inefob_certified'],
                'max_participants': prog_data['max_participants'],
            }
        )
        if created:
            print(f"  ✅ Criado: {program.title}")
        else:
            print(f"  ⏭️  Já existe: {program.title}")
    
    print("\n✅ Dados populados com sucesso!")
    
    # Mostrar estatísticas
    categories_count = ProfessionalCategory.objects.count()
    programs_count = TrainingProgram.objects.count()
    print(f"\n📊 Estatísticas:")
    print(f"   Categorias: {categories_count}")
    print(f"   Programas: {programs_count}")

if __name__ == '__main__':
    populate()
