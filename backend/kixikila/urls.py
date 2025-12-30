from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    KixikilaStatusView,
    KixikilaGroupViewSet,
    KixikilaMembershipViewSet,
    KixikilaContributionViewSet,
    KixikilaPayoutViewSet,
    KixikilaLeaderboardViewSet,
)

router = DefaultRouter()
router.register(r"groups", KixikilaGroupViewSet, basename="kixikila-group")
router.register(r"memberships", KixikilaMembershipViewSet, basename="kixikila-membership")
router.register(r"contributions", KixikilaContributionViewSet, basename="kixikila-contribution")
router.register(r"payouts", KixikilaPayoutViewSet, basename="kixikila-payout")
router.register(r"leaderboard", KixikilaLeaderboardViewSet, basename="kixikila-leaderboard")

urlpatterns = [
    path("status/", KixikilaStatusView.as_view(), name="kixikila-status"),
    path("", include(router.urls)),
]
