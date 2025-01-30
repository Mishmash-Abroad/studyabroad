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
from decouple import config

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY SETTINGS
# ================
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "django-insecure-@!eu$%lhnaya2er!or!-@(g$4o_z=zod2dqunf*0nlot&*r-=v"

# SECURITY WARNING: don't run with debug turned on in production!
# Reads from environment variable, defaults to False for security
DEBUG = config('DEBUG', default=False, cast=bool)

# Allowed hosts are read from environment variable
# Format: comma-separated list (e.g., "localhost,example.com")
ALLOWED_HOSTS = config('DJANGO_ALLOWED_HOSTS', default='localhost,127.0.0.1').split(',')

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
    
    # Third-party apps
    'rest_framework',               # REST API framework
    'rest_framework.authtoken',     # Token authentication
    'corsheaders',                  # CORS handling
    
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
]

# URL Configuration
ROOT_URLCONF = "mishmash.urls"

# TEMPLATE CONFIGURATION
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
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
        'NAME': config('DATABASE_NAME'),
        'USER': config('DATABASE_USER'),
        'PASSWORD': config('DATABASE_PASSWORD'),
        'HOST': config('DATABASE_HOST', default='127.0.0.1'),
        'PORT': config('DATABASE_PORT', default='3306'),
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

# INTERNATIONALIZATION
# ===================
LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True

# STATIC FILES
# ============
STATIC_URL = "/static/"
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
