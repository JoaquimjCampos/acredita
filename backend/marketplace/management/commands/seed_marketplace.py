from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils.text import slugify

from backend.marketplace.models import ServiceCategory, ServiceProvider, ServiceListing


class Command(BaseCommand):
    help = "Seed comprehensive marketplace data with services and products"

    def handle(self, *args, **options):
        User = get_user_model()
        user = User.objects.first()
        if not user:
            self.stderr.write(self.style.ERROR("No users found; create one via admin or registration first."))
            return

        # Create categories
        categories_data = [
            ("Consultoria", "Serviços de consultoria e orientação"),
            ("Design", "Design gráfico, web e UX/UI"),
            ("Desenvolvimento", "Desenvolvimento web e mobile"),
            ("Fotografia", "Serviços e produtos fotográficos"),
            ("Artesanato", "Produtos artesanais e handmade"),
            ("Educação", "Cursos e treinamentos online"),
        ]

        categories = {}
        for name, desc in categories_data:
            cat, _ = ServiceCategory.objects.get_or_create(
                name=name,
                defaults={
                    "slug": slugify(name),
                    "description": desc,
                    "is_active": True,
                },
            )
            categories[name] = cat

        # Ensure provider exists
        provider = getattr(user, "service_provider", None)
        if not provider:
            provider = ServiceProvider.objects.create(
                user=user,
                business_name="Loja Demo Acredita",
                business_type="Freelancer",
                description="Demonstração de produtos e serviços no Marketplace",
                province="Luanda",
                municipality="Luanda",
                address="Centro",
            )
        
        # Add all categories to provider
        for cat in categories.values():
            provider.categories.add(cat)

        # Seed services
        services_data = [
            {
                "title": "Logo Design Express",
                "description": "Pacote rápido de branding e logo profissional",
                "category": categories["Design"],
                "price": 5000,
                "price_type": "fixed",
                "delivery_time": "3-5 dias",
                "images": ["https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=400&fit=crop"],
            },
            {
                "title": "Consultoria de Negócios",
                "description": "Orientação estratégica para startups e PMEs",
                "category": categories["Consultoria"],
                "price": 50000,
                "price_type": "hourly",
                "delivery_time": "Agendável",
                "images": ["https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=400&fit=crop"],
            },
            {
                "title": "Desenvolvimento Web Rápido",
                "description": "Website responsivo com CMS incluído",
                "category": categories["Desenvolvimento"],
                "price": 100000,
                "price_type": "fixed",
                "delivery_time": "2-3 semanas",
                "images": ["https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=400&fit=crop"],
            },
            {
                "title": "Sessão de Fotografia Profissional",
                "description": "Fotos para redes sociais, retrato ou evento",
                "category": categories["Fotografia"],
                "price": 15000,
                "price_type": "fixed",
                "delivery_time": "7 dias",
                "images": ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&h=400&fit=crop"],
            },
        ]

        for service_data in services_data:
            ServiceListing.objects.get_or_create(
                title=service_data["title"],
                provider=provider,
                defaults={
                    "listing_type": "service",
                    "category": service_data["category"],
                    "description": service_data["description"],
                    "price_type": service_data["price_type"],
                    "base_price": service_data["price"],
                    "delivery_time": service_data.get("delivery_time", ""),
                    "available": True,
                    "tags": ["profissional", "qualidade"],
                    "images": service_data.get("images", []),
                },
            )

        # Seed products
        products_data = [
            {
                "title": "Camiseta Premium Acredita",
                "description": "100% algodão premium, disponível em vários tamanhos e cores",
                "category": categories["Artesanato"],
                "price": 2500,
                "quantity": 50,
                "sku": "TSHIRT-PREMIUM-001",
                "images": ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=400&fit=crop"],
            },
            {
                "title": "Caneta Personalisada com Logo",
                "description": "Canetas de metal personalizadas, mínimo 50 unidades",
                "category": categories["Artesanato"],
                "price": 500,
                "quantity": 200,
                "sku": "PEN-METAL-CUSTOM-001",
                "images": ["https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=500&h=400&fit=crop"],
            },
            {
                "title": "E-book: Guia Empreendedor",
                "description": "88 páginas sobre como começar e escalar seu negócio",
                "category": categories["Educação"],
                "price": 1500,
                "quantity": 999,
                "sku": "EBOOK-GUIDE-001",
                "images": ["https://images.unsplash.com/photo-1507842217343-583f20270319?w=500&h=400&fit=crop"],
            },
            {
                "title": "Álbum Fotográfico Premium",
                "description": "Álbum impresso de alta qualidade com 50 páginas",
                "category": categories["Fotografia"],
                "price": 8000,
                "quantity": 20,
                "sku": "ALBUM-PHOTO-PREMIUM-001",
                "images": ["https://images.unsplash.com/photo-1609034227505-5876f6aa4e90?w=500&h=400&fit=crop"],
            },
        ]

        for product_data in products_data:
            ServiceListing.objects.get_or_create(
                title=product_data["title"],
                provider=provider,
                defaults={
                    "listing_type": "product",
                    "category": product_data["category"],
                    "description": product_data["description"],
                    "price_type": "fixed",
                    "base_price": product_data["price"],
                    "quantity_available": product_data["quantity"],
                    "sku": product_data["sku"],
                    "available": True,
                    "tags": ["produto", "premium"],
                    "images": product_data.get("images", []),
                },
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"✓ Seeded marketplace: {len(categories)} categories, "
                f"{len(services_data)} services, {len(products_data)} products"
            )
        )
