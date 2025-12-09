from django.contrib import admin

from .models import (
	ServiceCategory,
	ServiceProvider,
	ServiceListing,
	ServiceOrder,
	MarketplaceReview,
)


@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
	list_display = ("name", "slug", "is_active", "created_at")
	list_filter = ("is_active",)
	search_fields = ("name", "slug")
	prepopulated_fields = {"slug": ("name",)}


@admin.register(ServiceProvider)
class ServiceProviderAdmin(admin.ModelAdmin):
	list_display = (
		"business_name",
		"business_type",
		"province",
		"municipality",
		"verified",
		"rating",
		"total_reviews",
	)
	list_filter = ("verified", "province", "municipality")
	search_fields = ("business_name", "nif_number", "province", "municipality")
	filter_horizontal = ("categories",)


@admin.register(ServiceListing)
class ServiceListingAdmin(admin.ModelAdmin):
	list_display = (
		"title",
		"provider",
		"category",
		"price_type",
		"base_price",
		"currency",
		"available",
		"featured",
		"created_at",
	)
	list_filter = ("available", "featured", "price_type", "category")
	search_fields = ("title", "description", "tags")


@admin.register(ServiceOrder)
class ServiceOrderAdmin(admin.ModelAdmin):
	list_display = (
		"id",
		"listing",
		"customer",
		"status",
		"payment_status",
		"total_amount",
		"created_at",
	)
	list_filter = ("status", "payment_status")
	search_fields = ("id", "customer__username", "listing__title")


@admin.register(MarketplaceReview)
class MarketplaceReviewAdmin(admin.ModelAdmin):
	list_display = ("order", "rating", "helpful_count", "created_at")
	list_filter = ("rating",)
	search_fields = ("order__id", "comment")
