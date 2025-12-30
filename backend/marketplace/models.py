"""Marketplace domain models (versão inicial)."""

from django.conf import settings
from django.db import models


class ServiceCategory(models.Model):
	"""Categorias de serviços/produtos."""

	name = models.CharField(max_length=120, unique=True)
	slug = models.SlugField(max_length=140, unique=True)
	description = models.TextField(blank=True)
	is_active = models.BooleanField(default=True)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ["name"]
		indexes = [
			models.Index(fields=["slug"]),
			models.Index(fields=["is_active"]),
		]

	def __str__(self) -> str:  # pragma: no cover
		return self.name


class ServiceProvider(models.Model):
	"""Prestadores de serviços e comerciantes (integrado com certificações INEFOB)."""

	PROVIDER_TYPES = (
		("service_provider", "Prestador de Serviço"),
		("merchant", "Comerciante"),
	)

	user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="service_provider")
	business_name = models.CharField(max_length=200)
	business_type = models.CharField(max_length=100)  # ex: Freelancer, Loja, Serviço
	provider_type = models.CharField(max_length=20, choices=PROVIDER_TYPES, default="service_provider")
	categories = models.ManyToManyField(ServiceCategory, related_name="providers")
	# Link to INEFOB certifications (optional - for certified professionals)
	professional_category = models.ForeignKey(
		'certifications.ProfessionalCategory',
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name="marketplace_providers",
		help_text="Categoria profissional INEFOB (se aplicável)"
	)
	description = models.TextField(blank=True)

	# Documentação e formalização
	nif_number = models.CharField(max_length=50, blank=True)
	is_formal = models.BooleanField(default=False)

	# Localização
	province = models.CharField(max_length=100)
	municipality = models.CharField(max_length=100)
	neighborhood = models.CharField(max_length=200, blank=True)
	address = models.TextField(blank=True)
	location_lat = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
	location_lng = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)

	# Reputação
	rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
	total_reviews = models.PositiveIntegerField(default=0)
	verified = models.BooleanField(default=False)

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ["-verified", "-rating", "business_name"]
		indexes = [
			models.Index(fields=["province", "municipality"]),
			models.Index(fields=["verified", "rating"]),
		]

	def __str__(self) -> str:  # pragma: no cover
		return self.business_name


class ServiceListing(models.Model):
	"""Unified model for both services and products."""

	LISTING_TYPES = (
		("service", "Serviço"),
		("product", "Produto"),
	)

	PRICE_TYPES = (
		("fixed", "Preço fixo"),
		("hourly", "Por hora"),
		("negotiable", "Negociável"),
	)

	provider = models.ForeignKey(ServiceProvider, on_delete=models.CASCADE, related_name="listings")
	category = models.ForeignKey(ServiceCategory, on_delete=models.PROTECT, related_name="listings")
	listing_type = models.CharField(max_length=20, choices=LISTING_TYPES, default="service")
	title = models.CharField(max_length=200)
	description = models.TextField()
	price_type = models.CharField(max_length=20, choices=PRICE_TYPES, default="fixed")
	base_price = models.DecimalField(max_digits=12, decimal_places=2)
	currency = models.CharField(max_length=10, default="AOA")
	available = models.BooleanField(default=True)
	delivery_time = models.CharField(max_length=100, blank=True)  # e.g. "2-3 dias", "Imediato"
	quantity_available = models.PositiveIntegerField(null=True, blank=True)  # For products
	sku = models.CharField(max_length=100, blank=True)  # For products
	tags = models.JSONField(default=list, blank=True)
	images = models.JSONField(default=list, blank=True)
	video_url = models.URLField(blank=True)
	views = models.PositiveIntegerField(default=0)
	featured = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ["-featured", "-created_at"]
		indexes = [
			models.Index(fields=["listing_type", "available"]),
			models.Index(fields=["featured", "views"]),
			models.Index(fields=["category", "price_type"]),
		]

	def __str__(self) -> str:  # pragma: no cover
		return f"{self.get_listing_type_display()} - {self.title}"


class ServiceOrder(models.Model):
	"""Pedidos de serviços/produtos."""

	STATUS_CHOICES = (
		("pending", "Pendente"),
		("accepted", "Aceite"),
		("in_progress", "Em progresso"),
		("completed", "Concluído"),
		("cancelled", "Cancelado"),
	)

	listing = models.ForeignKey(ServiceListing, on_delete=models.PROTECT, related_name="orders")
	customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="service_orders")
	status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
	total_amount = models.DecimalField(max_digits=12, decimal_places=2)
	payment_status = models.CharField(max_length=50, default="pending")
	payment_method = models.CharField(max_length=50, blank=True)
	notes = models.TextField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	accepted_at = models.DateTimeField(null=True, blank=True)
	completed_at = models.DateTimeField(null=True, blank=True)

	class Meta:
		ordering = ["-created_at"]
		indexes = [
			models.Index(fields=["status"]),
			models.Index(fields=["payment_status"]),
			models.Index(fields=["customer"]),
		]

	def __str__(self) -> str:  # pragma: no cover
		return f"Order #{self.id} - {self.status}"


class MarketplaceReview(models.Model):
	"""Avaliações ligadas a pedidos."""

	order = models.OneToOneField(ServiceOrder, on_delete=models.CASCADE, related_name="review")
	rating = models.PositiveSmallIntegerField()
	comment = models.TextField(blank=True)
	response = models.TextField(blank=True)
	helpful_count = models.PositiveIntegerField(default=0)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ["-created_at"]
		indexes = [models.Index(fields=["rating"])]

	def __str__(self) -> str:  # pragma: no cover
		return f"Review for order #{self.order_id}"
