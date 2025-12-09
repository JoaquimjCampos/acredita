from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProfessionalCategoryViewSet,
    TrainingProgramViewSet,
    CandidateEnrollmentViewSet,
    certification_feature_status
)

router = DefaultRouter()
router.register(r'categories', ProfessionalCategoryViewSet, basename='category')
router.register(r'programs', TrainingProgramViewSet, basename='program')
router.register(r'enrollments', CandidateEnrollmentViewSet, basename='enrollment')

urlpatterns = [
    path('', include(router.urls)),
    path('status/', certification_feature_status, name='certification-status'),
]
