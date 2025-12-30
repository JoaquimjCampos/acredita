"""Serializers para marketplace (versão inicial)."""

from rest_framework import serializers

from .models import (
	ServiceCategory,
	ServiceProvider,
	ServiceListing,
	ServiceOrder,
	MarketplaceReview,
)

try:
    from backend.certifications.models import ProfessionalCategory
except Exception:  # pragma: no cover
    ProfessionalCategory = None


class ServiceCategorySerializer(serializers.ModelSerializer):
	class Meta:
		model = ServiceCategory
		fields = ["id", "name", "slug", "description", "is_active"]


class ServiceProviderSerializer(serializers.ModelSerializer):
	categories = ServiceCategorySerializer(many=True, read_only=True)
	professional_category = serializers.SerializerMethodField()

	class Meta:
		model = ServiceProvider
		fields = [
			"id",
			"business_name",
			"business_type",
			"provider_type",
			"description",
			"categories",
			"professional_category",
			"province",
			"municipality",
			"neighborhood",
			"address",
			"rating",
			"total_reviews",
			"verified",
		]

	def get_professional_category(self, obj):
		pc = getattr(obj, "professional_category", None)
		if not pc:
			return None
		return {
			"id": pc.id,
			"name": pc.name,
			"inefob_code": getattr(pc, "inefob_code", None),
		}


class ServiceListingSerializer(serializers.ModelSerializer):
	provider = ServiceProviderSerializer(read_only=True)
	category = ServiceCategorySerializer(read_only=True)
	category_id = serializers.PrimaryKeyRelatedField(
		queryset=ServiceCategory.objects.all(),
		write_only=True,
		source="category"
	)

	class Meta:
		model = ServiceListing
		fields = [
			"id",
			"provider",
			"category_id",
			"category",
			"listing_type",
			"title",
			"description",
			"price_type",
			"base_price",
			"currency",
			"available",
			"delivery_time",
			"quantity_available",
			"sku",
			"tags",
			"images",
			"video_url",
			"views",
			"featured",
			"created_at",
			"updated_at",
		]


class ServiceListingCreateUpdateSerializer(serializers.ModelSerializer):
	"""Write-only serializer for creating/updating listings (services and products)."""
	category_id = serializers.PrimaryKeyRelatedField(
		queryset=ServiceCategory.objects.all(),
		source="category"
	)
	price = serializers.DecimalField(max_digits=12, decimal_places=2, write_only=True, source="base_price")
	
	class Meta:
		model = ServiceListing
		fields = [
			"title",
			"description",
			"listing_type",
			"category_id",
			"price_type",
			"price",
			"currency",
			"available",
			"delivery_time",
			"quantity_available",
			"sku",
			"tags",
			"images",
			"video_url",
		]

	def validate(self, data):
		"""Validate product-specific fields."""
		listing_type = data.get("listing_type", "service")
		if listing_type == "product" and not data.get("quantity_available"):
			raise serializers.ValidationError(
				{"quantity_available": "Produtos requerem quantidade disponível."}
			)
		return data

	def create(self, validated_data):
		"""Attach provider from context (set by view)."""
		return ServiceListing.objects.create(**validated_data)


class ServiceOrderSerializer(serializers.ModelSerializer):
	listing = ServiceListingSerializer(read_only=True)

	class Meta:
		model = ServiceOrder
		fields = [
			"id",
			"listing",
			"status",
			"total_amount",
			"payment_status",
			"payment_method",
			"notes",
			"created_at",
		]


class MarketplaceReviewSerializer(serializers.ModelSerializer):
	order = ServiceOrderSerializer(read_only=True)

	class Meta:
		model = MarketplaceReview
		fields = [
			"id",
			"order",
			"rating",
			"comment",
			"response",
			"helpful_count",
			"created_at",
		]
