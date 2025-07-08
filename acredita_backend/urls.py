"""
URL configuration for Acredita em Ti, Acredita em Angola Backend
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Admin customization
admin.site.site_header = "Acredita - Painel Administrativo"
admin.site.site_title = "Acredita Admin"
admin.site.index_title = "Bem-vindo ao Painel Acredita"

urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),
    
    # Authentication
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # API Endpoints
    path('api/accounts/', include('accounts.urls')),
    path('api/participants/', include('participants.urls')),
    path('api/seasons/', include('seasons.urls')),
    path('api/voting/', include('voting.urls')),
    # Comentado temporariamente até implementação das views
    # path('api/donations/', include('donations.urls')),
    # path('api/store/', include('store.urls')),
    # path('api/blog/', include('blog.urls')),
    # path('api/content/', include('content.urls')),
]

# Static and media files
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
