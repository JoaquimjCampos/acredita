from django.contrib import admin

from .models import (
    KixikilaGroup,
    KixikilaMembership,
    KixikilaContribution,
    KixikilaPayout,
    KixikilaRating,
)


@admin.register(KixikilaGroup)
class KixikilaGroupAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "group_type",
        "status",
        "current_members",
        "max_members",
        "monthly_contribution",
        "current_round",
    )
    list_filter = ("status", "group_type", "province", "municipality")
    search_fields = ("name", "description")
    readonly_fields = ("created_at", "updated_at", "current_members")


@admin.register(KixikilaMembership)
class KixikilaMembershipAdmin(admin.ModelAdmin):
    list_display = (
        "member",
        "group",
        "position",
        "is_active",
        "contributions_made",
        "payout_received",
    )
    list_filter = ("is_active", "payout_received", "group")
    search_fields = ("member__username", "group__name")
    readonly_fields = ("joined_at",)


@admin.register(KixikilaContribution)
class KixikilaContributionAdmin(admin.ModelAdmin):
    list_display = (
        "membership",
        "round",
        "amount",
        "status",
        "payment_date",
    )
    list_filter = ("status", "round")
    search_fields = ("membership__member__username",)


@admin.register(KixikilaPayout)
class KixikilaPayoutAdmin(admin.ModelAdmin):
    list_display = (
        "recipient",
        "group",
        "round",
        "net_amount",
        "status",
        "scheduled_date",
    )
    list_filter = ("status",)
    search_fields = ("recipient__username", "group__name")


@admin.register(KixikilaRating)
class KixikilaRatingAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "reputation_score",
        "trust_level",
        "groups_participated",
        "warnings",
    )
    list_filter = ("trust_level",)
    search_fields = ("user__username",)
    readonly_fields = ("created_at", "updated_at")
