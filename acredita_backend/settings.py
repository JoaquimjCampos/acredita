"""
Django settings for acredita_backend project - Acredita em Ti, Acredita em Angola
"""

from pathlib import Path
from decouple import config
from datetime import timedelta
import dj_database_url
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Security settings
SECRET_KEY = config('SECRET_KEY', default="django-insecure-n4$eo4@&-2w+@@-jc1w3g*7+2uuw$r#^gyu)^_q(v^7isdxrk!")
DEBUG = config('DEBUG', default=True, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=lambda v: [s.strip() for s in v.split(',')])


# Application definition
DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'crispy_forms',
    'crispy_tailwind',
]

LOCAL_APPS = [
    'mcp_core',  # Núcleo MCP como primeira aplicação
    'accounts',
    'participants',
    'seasons',
    'voting',
    'donations',
    'store',
    'blog',
    'content',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "mcp_core.middleware.MCPMiddleware",  # Middleware MCP
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "acredita_backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "acredita_backend.wsgi.application"


# Database
# Production: PostgreSQL, Development: SQLite
if config('DATABASE_URL', default=None):
    DATABASES = {
        'default': dj_database_url.parse(config('DATABASE_URL'))
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }


# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = "pt-br"

TIME_ZONE = "Africa/Luanda"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"]

# Media files
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# CORS Configuration
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', 
                              default='http://localhost:3000,http://127.0.0.1:3000', 
                              cast=lambda v: [s.strip() for s in v.split(',')])

CORS_ALLOW_CREDENTIALS = True

# CSRF Configuration  
CSRF_TRUSTED_ORIGINS = config('CSRF_TRUSTED_ORIGINS',
                              default='http://localhost:3000,http://127.0.0.1:3000',
                              cast=lambda v: [s.strip() for s in v.split(',')])

# Crispy Forms Configuration
CRISPY_ALLOWED_TEMPLATE_PACKS = "tailwind"
CRISPY_TEMPLATE_PACK = "tailwind"

# Email Configuration
EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = config('EMAIL_HOST', default='localhost')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@acredita.ao')

# Celery Configuration (for async tasks)
CELERY_BROKER_URL = config('CELERY_BROKER_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = config('CELERY_RESULT_BACKEND', default='redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE

# Security Settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# File Upload Settings
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB

# Logging Configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'acredita.log',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
}

# Modelo de utilizador personalizado
AUTH_USER_MODEL = 'accounts.User'

# Configurações MCP (Model Context Protocol) - Sistema Acredita
MCP_CONFIG = {
    'PROTOCOL_VERSION': config('MCP_PROTOCOL_VERSION', default='2024-11-05'),
    'IMPLEMENTATION_NAME': config('MCP_IMPLEMENTATION_NAME', default='acredita-mcp-server'),
    'IMPLEMENTATION_VERSION': config('MCP_IMPLEMENTATION_VERSION', default='1.0.0'),
    'SERVER_HOST': config('MCP_SERVER_HOST', default='localhost'),
    'SERVER_PORT': config('MCP_SERVER_PORT', default=8080, cast=int),
    'LANGUAGE': 'pt-AO',  # Português formal de Angola
    'TIMEOUT': 30,  # Timeout para processamento de mensagens
    'MAX_QUEUE_SIZE': 1000,  # Tamanho máximo da fila de mensagens
    'LOG_LEVEL': 'INFO',
    'FORMAL_COMMUNICATION': True,  # Activar comunicação formal
}

# Configurações de Comunicação Formal Angola
ACREDITA_COMMUNICATION = {
    'FORMAL_LANGUAGE': True,
    'COUNTRY_CODE': 'AO',
    'TIMEZONE': 'Africa/Luanda',
    'CURRENCY': 'AOA',  # Kwanza Angolano
    'PHONE_PREFIX': '+244',
    'FORMAL_TITLES': {
        'PARTICIPANT': 'Candidato(a)',
        'VOTER': 'Eleitor(a)',
        'DONOR': 'Contribuinte',
        'ADMIN': 'Excelência',
        'MENTOR': 'Professor(a)',
    },
    'FORMAL_MESSAGES': {
        'WELCOME': 'Seja bem-vindo(a) ao Programa Acredita em Ti, Acredita em Angola',
        'REGISTRATION_SUCCESS': 'A sua candidatura foi submetida com sucesso e encontra-se em análise',
        'VOTING_SUCCESS': 'O seu voto foi registado com sucesso no sistema',
        'DONATION_SUCCESS': 'A sua contribuição foi processada com sucesso',
        'ERROR': 'Lamentamos, mas ocorreu um erro. A equipa técnica foi notificada',
    }
}
