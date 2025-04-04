"""
Django settings for Study Abroad Program project.

This file contains all the configuration settings for the Study Abroad Program portal.
The application uses Django for the backend API and includes:
- Token-based authentication for secure API access
- MySQL database for data persistence
- CORS configuration for frontend communication
- Custom user model for extended functionality

Environment Variables Required:
    DEBUG: Boolean flag for development mode
    DJANGO_ALLOWED_HOSTS: Comma-separated list of allowed hosts
    DATABASE_NAME: MySQL database name
    DATABASE_USER: Database username
    DATABASE_PASSWORD: Database password
    DATABASE_HOST: Database host address
    DATABASE_PORT: Database port number

For more information on Django settings, see:
https://docs.djangoproject.com/en/5.1/topics/settings/
"""

from pathlib import Path
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY SETTINGS
# ================
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = str(os.getenv('SECRET_KEY'))
OIDC_CLIENT_SECRET = str(os.getenv('OIDC_CLIENT_SECRET'))
AES_CIPHER_KEY = str(os.getenv('AES_CIPHER_KEY'))


# SECURITY WARNING: don't run with debug turned on in production!
# Reads from environment variable, defaults to False for security
DEBUG = os.getenv('DEBUG', 'False').lower() in ['true', '1', 't', 'y', 'yes']

# Allowed hosts are read from environment variable
# Format: comma-separated list (e.g., "localhost,example.com")
ALLOWED_HOSTS = os.getenv('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1,testserver').split(',')

# Email Settings
SENDGRID_API_KEY = str(os.getenv('SENDGRID_API_KEY', 'wrongkey'))
SENDGRID_DEFAULT_FROM = str(os.getenv('SENDGRID_DEFAULT_FROM', 'wrongkey'))


# CSRF COOKIE AND SESSION SECURITY
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
CSRF_TRUSTED_ORIGINS = [
    'https://dev-mishmash.colab.duke.edu',
    'https://test-mishmash.colab.duke.edu',
    'https://mishmash.colab.duke.edu',
    'http://localhost',
    'http://127.0.0.1'
]

# APPLICATION CONFIGURATION
# =======================
# List of all Django apps used in the project
INSTALLED_APPS = [
    # Django built-in apps
    'django.contrib.admin',          # Admin interface
    'django.contrib.auth',           # Authentication system
    'django.contrib.contenttypes',   # Content type system
    'django.contrib.sessions',       # Session framework
    'django.contrib.messages',       # Messaging framework
    'django.contrib.staticfiles',    # Static file management
    'django_otp',
    'django_otp.plugins.otp_totp',
    
    # Third-party apps
    'rest_framework',               # REST API framework
    'rest_framework.authtoken',     # Token authentication
    'corsheaders',                  # CORS handling
    
    #oauth2 setup
    "django.contrib.sites",
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.openid_connect',
    "allauth.mfa",

    #audit logging
    'auditlog',
    
    # backups
    'django_archive',
    
    # Local apps
    'api',                         # Main application API
]

# MIDDLEWARE CONFIGURATION
# ======================
# Order is important for middleware
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',   # Must be at the top for CORS to work
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # Add the account middleware:
    'allauth.account.middleware.AccountMiddleware',

    'auditlog.middleware.AuditlogMiddleware',
]

# URL Configuration
ROOT_URLCONF = "mishmash.urls"

# TEMPLATE CONFIGURATION
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

WSGI_APPLICATION = "mishmash.wsgi.application"

# DATABASE CONFIGURATION
# ====================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': str(os.getenv('DATABASE_NAME', 'mishmash')),
        'USER': str(os.getenv('DATABASE_USER', 'root')),
        'PASSWORD': str(os.getenv('DATABASE_PASSWORD', 'root')),
        'HOST': str(os.getenv('DATABASE_HOST', '127.0.0.1')),
        'PORT': int(os.getenv('DATABASE_PORT', '3306')),
    }
}

# PASSWORD VALIDATION
# ==================
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
# OAUTH AUTHEENTICATION
# ==================
AUTHENTICATION_BACKENDS = [
    
    # Needed to login by username in Django admin, regardless of `allauth`
    'django.contrib.auth.backends.ModelBackend',

    # `allauth` specific authentication methods, such as login by email
    'allauth.account.auth_backends.AuthenticationBackend',
    
]


# Provider specific settings

SOCIALACCOUNT_LOGIN_ON_GET = True
ACCOUNT_LOGIN_REDIRECT_URL = '/dashboard/overview/'
LOGIN_REDIRECT_URL = '/dashboard/overview/'
ACCOUNT_DEFAULT_HTTP_PROTOCOL = "https"
ACCOUNT_AUTHENTICATED_LOGIN_REDIRECTS = False


#should use default site
SITE_ID = 1

# Disable email verification and set the login redirect URL
ACCOUNT_EMAIL_VERIFICATION = "none"
ACCOUNT_LOGOUT_ON_GET = True

# Enable SSO login

SOCIALACCOUNT_PROVIDERS = {
    "openid_connect": {
        "OAUTH_PKCE_ENABLED": True,  # PKCE support, if required
        "APPS": [
            {
                "provider_id": "duke-oidc",
                "name": "Duke University Login",
                "client_id": "ece-spring-2025-sc814",
                "secret": OIDC_CLIENT_SECRET,
                "settings": {
                    "server_url": "https://oauth.oit.duke.edu/oidc",
                    "token_auth_method": "client_secret_basic",
                    "oauth_pkce_enabled": True,
                },
            }
        ]
    }
}

SOCIALACCOUNT_ADAPTER = "api.adapters.CustomSocialAccountAdapter"

# Session Settings
SESSION_COOKIE_AGE = 24 * 60 * 60      # 86400 seconds = 24 hours
SESSION_EXPIRE_AT_BROWSER_CLOSE = False
SESSION_SAVE_EVERY_REQUEST = False     # We do NOT want to reset the clock on each request.

# INTERNATIONALIZATION
# ===================
LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True

# STATIC FILES
# ============
STATIC_URL = "/django-static/"
STATIC_ROOT = BASE_DIR / "static"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# AUTHENTICATION AND SECURITY
# =========================
# Custom user model
AUTH_USER_MODEL = 'api.User'

# Rest Framework settings for API authentication
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',  # Token-based auth
        'rest_framework.authentication.SessionAuthentication', # Session auth for browsable API
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',  # Require authentication by default
    ],
    'COERCE_DECIMAL_TO_STRING': True,
}

# CORS Configuration for frontend communication
CORS_ALLOW_ALL_ORIGINS = True  # TODO: Restrict in production
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost",
    "http://localhost:3000",
]

# DEFAULT PRIMARY KEY FIELD TYPE
# ===============================
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


MFA_SUPPORTED_TYPES = ["totp"]
MFA_PASSKEY_LOGIN_ENABLED = True
MFA_PASSKEY_SIGNUP_ENABLED = True


# Sentry Configuration
import sentry_sdk

sentry_sdk.init(
    dsn="https://dfa2f3f4b7b087e327da924f83723e59@o4508874878812161.ingest.us.sentry.io/4508874881826816",
    # Add data like request headers and IP for users,
    # see https://docs.sentry.io/platforms/python/data-management/data-collected/ for more info
    send_default_pii=True,
    # Set traces_sample_rate to 1.0 to capture 100%
    # of transactions for tracing.
    traces_sample_rate=1.0,
    _experiments={
        # Set continuous_profiling_auto_start to True
        # to automatically start the profiler on when
        # possible.
        "continuous_profiling_auto_start": True,
    },
)


#logging settings

import logging
import os

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "[{levelname}] {asctime} {name} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": True,
        },
        "auditlog": {  # Capture audit logs
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
    },
}


# Add this line to define the backup directory (archive directory)
ARCHIVE_DIRECTORY = BASE_DIR / 'backups'
ARCHIVE_FILENAME = '%Y-%m-%d--%H-%M'
