"""
Script para popular categorias iniciais do marketplace.
Run: python manage.py shell < backend/marketplace/populate_categories.py
Ou:  python run_populate_marketplace.py
"""

from backend.marketplace.models import ServiceCategory

# 10 categorias prioritárias conforme roadmap
CATEGORIES = [
    {
        "name": "Transportes",
        "slug": "transportes",
        "description": "Serviços de transporte: motos, táxis, entregas, transportadoras"
    },
    {
        "name": "Construção",
        "slug": "construcao",
        "description": "Pedreiros, pintores, eletricistas, canalizadores, carpinteiros"
    },
    {
        "name": "Beleza & Estética",
        "slug": "beleza-estetica",
        "description": "Cabeleireiros, manicures, maquilhadores, esteticistas"
    },
    {
        "name": "Alimentação",
        "slug": "alimentacao",
        "description": "Quituteiras, catering, padarias artesanais, chefs particulares"
    },
    {
        "name": "Reparações",
        "slug": "reparacoes",
        "description": "Eletrónica, mecânica, eletrodomésticos, informática"
    },
    {
        "name": "Limpeza",
        "slug": "limpeza",
        "description": "Doméstica, empresarial, limpeza de eventos, higienização"
    },
    {
        "name": "Educação",
        "slug": "educacao",
        "description": "Explicadores, professores particulares, cursos online, tutoria"
    },
    {
        "name": "Tecnologia",
        "slug": "tecnologia",
        "description": "Designers, programadores, marketing digital, consultoria IT"
    },
    {
        "name": "Artesanato",
        "slug": "artesanato",
        "description": "Produtos locais, arte, decoração, peças artesanais"
    },
    {
        "name": "Consultoria Financeira",
        "slug": "consultoria-financeira",
        "description": "Contabilistas, consultores, assessoria fiscal, planejamento"
    },
]


def populate():
    """Popula categorias usando get_or_create para segurança."""
    created_count = 0
    existing_count = 0
    
    for cat_data in CATEGORIES:
        obj, created = ServiceCategory.objects.get_or_create(
            slug=cat_data["slug"],
            defaults={
                "name": cat_data["name"],
                "description": cat_data["description"],
                "is_active": True
            }
        )
        if created:
            print(f"✅ Criado: {obj.name}")
            created_count += 1
        else:
            print(f"➡️ Já existe: {obj.name}")
            existing_count += 1
    
    print(f"\n📊 Estatísticas:")
    print(f"   Criadas: {created_count}")
    print(f"   Existentes: {existing_count}")
    print(f"   Total: {ServiceCategory.objects.count()}")


if __name__ == "__main__":
    populate()
