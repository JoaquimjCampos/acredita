"""
URL configuration for Acredita em Ti, Acredita em Angola Backend
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from backend.accounts.views import LoginView

# Admin customization
admin.site.site_header = "Acredita - Painel Administrativo"
admin.site.site_title = "Acredita Admin"
admin.site.index_title = "Bem-vindo ao Painel Acredita"

urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),
    
    # Authentication
    path('api/auth/login/', LoginView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # API Endpoints
    path('api/accounts/', include('backend.accounts.urls')),
    path('api/participants/', include('backend.participants.urls')),
    path('api/seasons/', include('backend.seasons.urls')),
    path('api/voting/', include('backend.voting.urls')),
    path('api/donations/', include('backend.donations.urls')),
    # path('api/store/', include('backend.store.urls')),  # DEPRECATED: Use marketplace instead
    path('api/blog/', include('backend.blog.urls')),
    path('api/content/', include('backend.content.urls')),
    path('api/games/', include('backend.games.urls')),
    path('api/ads/', include('backend.ads.urls')),
    path('api/sponsors/', include('backend.sponsors.urls')),
    path('api/analytics/', include('backend.analytics.urls')),
    # New v2 APIs with new features
    path('api/v2/certifications/', include('backend.certifications.urls')),
    path('api/v2/marketplace/', include('backend.marketplace.urls')),
    path('api/v2/kixikila/', include('backend.kixikila.urls')),
    path('api/v2/core/', include('backend.core.urls')),
]

# Static and media files
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
