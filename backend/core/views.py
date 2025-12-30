from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Sum, Count
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta

from backend.core.models import TrustEvent, RevenueStream

# Imports tardios para evitar dependências duras
from django.contrib.auth import get_user_model

User = get_user_model()

try:
    from backend.certifications.models import CandidateEnrollment, AssessmentResult
except Exception:
    CandidateEnrollment = None
    AssessmentResult = None

try:
    from backend.marketplace.models import ServiceProvider, ServiceOrder
except Exception:
    ServiceProvider = None
    ServiceOrder = None

try:
    from backend.kixikila.models import KixikilaMembership, KixikilaPayout
except Exception:
    KixikilaMembership = None
    KixikilaPayout = None

try:
    from backend.participants.models import Participant
except Exception:
    Participant = None


class MeDashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["get"], url_path="dashboard")
    def dashboard(self, request):
        user = request.user

        # Trust score derivado de eventos
        trust_total = TrustEvent.objects.filter(user=user).aggregate(total=Sum("points")).get(
            "total", 0
        ) or 0
        trust_events = (
            TrustEvent.objects.filter(user=user)
            .values("event_type")
            .annotate(points=Sum("points"), count=Count("id"))
        )

        # Certificações
        cert_total = 0
        avg_score = None
        if CandidateEnrollment is not None:
            cert_total = CandidateEnrollment.objects.filter(
                candidate=user, status__in=["completed", "certified"]
            ).count()
        if AssessmentResult is not None:
            avg_score = AssessmentResult.objects.filter(
                enrollment__candidate=user, score__isnull=False
            ).aggregate(Avg("score"))["score__avg"]

        # Marketplace
        market = {
            "total_sales": 0,
            "revenue_estimate": 0.0,
            "rating": None,
            "reviews": 0,
        }
        if ServiceProvider is not None and ServiceOrder is not None:
            try:
                provider = ServiceProvider.objects.get(user=user)
                orders = ServiceOrder.objects.filter(
                    listing__provider=provider, status="completed"
                )
                market["total_sales"] = orders.count()
                total_amount = orders.aggregate(Sum("total_amount"))["total_amount__sum"] or 0
                market["revenue_estimate"] = float(total_amount) * 0.85
                market["rating"] = float(provider.rating) if provider.rating is not None else None
                market["reviews"] = provider.total_reviews
            except ServiceProvider.DoesNotExist:
                pass

        # Kixikila
        kixi = {"groups": 0, "cycles_completed": 0, "total_saved_estimate": 0.0}
        if KixikilaMembership is not None and KixikilaPayout is not None:
            kixi["groups"] = KixikilaMembership.objects.filter(member=user, is_active=True).count()
            payouts = KixikilaPayout.objects.filter(recipient=user, status="completed")
            kixi["cycles_completed"] = payouts.count()
            kixi["total_saved_estimate"] = float(
                payouts.aggregate(Sum("net_amount"))["net_amount__sum"] or 0
            )

        # Reality / Temporadas
        reality = {"seasons_participated": 0, "is_winner": False}
        if Participant is not None:
            reality["seasons_participated"] = Participant.objects.filter(user=user).count()
            reality["is_winner"] = Participant.objects.filter(user=user, status="winner").exists()

        return Response(
            {
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                },
                "trust": {
                    "score": int(trust_total or 0),
                    "breakdown": list(trust_events),
                },
                "certifications": {"total": cert_total, "avg_score": avg_score},
                "marketplace": market,
                "kixikila": kixi,
                "reality": reality,
            }
        )

    @action(detail=False, methods=["get"], url_path="revenue")
    def revenue(self, request):
        # Sumário de receitas (geral – admins podem cruzar; para users, apenas agregados)
        summary = (
            RevenueStream.objects.values("source").annotate(total=Sum("amount"))
        )
        return Response({"by_source": list(summary)})

    @action(detail=False, methods=["get"], url_path="activity")
    def activity(self, request):
        """
        Returns recent user activity (TrustEvents) for dashboard enrichment.
        Cached for 5 minutes per user.
        """
        user = request.user
        cache_key = f"core:activity:{user.id}"
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)

        # Get last 30 days of trust events
        since = timezone.now() - timedelta(days=30)
        events = TrustEvent.objects.filter(user=user, created_at__gte=since).order_by('-created_at')[:50]
        
        activity_data = {
            "recent_events": [
                {
                    "event_type": e.event_type,
                    "points": e.points,
                    "created_at": e.created_at.isoformat(),
                    "metadata": e.metadata or {}
                }
                for e in events
            ],
            "total_events": events.count(),
        }
        
        cache.set(cache_key, activity_data, timeout=300)  # 5 min cache
        return Response(activity_data)
