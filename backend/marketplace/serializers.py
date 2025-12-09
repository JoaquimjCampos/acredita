"""Serializers para marketplace (versão inicial)."""

from rest_framework import serializers

from .models import (
	ServiceCategory,
	ServiceProvider,
	ServiceListing,
	ServiceOrder,
	MarketplaceReview,
)


class ServiceCategorySerializer(serializers.ModelSerializer):
	class Meta:
		model = ServiceCategory
		fields = ["id", "name", "slug", "description", "is_active"]


class ServiceProviderSerializer(serializers.ModelSerializer):
	categories = ServiceCategorySerializer(many=True, read_only=True)

	class Meta:
		model = ServiceProvider
		fields = [
			"id",
			"business_name",
			"business_type",
			"description",
			"categories",
			"province",
			"municipality",
			"neighborhood",
			"address",
			"rating",
			"total_reviews",
			"verified",
		]


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
			"title",
			"description",
			"price_type",
			"base_price",
			"currency",
			"available",
			"delivery_time",
			"tags",
			"images",
			"video_url",
			"views",
			"featured",
			"created_at",
			"updated_at",
		]


class ServiceListingCreateUpdateSerializer(serializers.ModelSerializer):
	"""Write-only serializer for creating/updating listings."""
	category_id = serializers.PrimaryKeyRelatedField(
		queryset=ServiceCategory.objects.all(),
		source="category"
	)
	
	class Meta:
		model = ServiceListing
		fields = [
			"title",
			"description",
			"category_id",
			"price_type",
			"base_price",
			"currency",
			"available",
			"delivery_time",
			"tags",
			"images",
			"video_url",
		]

	def create(self, validated_data):
		"""Attach provider from request user."""
		provider = self.context["request"].user.service_provider
		return ServiceListing.objects.create(provider=provider, **validated_data)


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
