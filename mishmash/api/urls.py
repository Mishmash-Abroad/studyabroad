from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProgramViewSet, ApplicationViewSet, UserViewSet
from . import views

router = DefaultRouter()
router.register('programs', ProgramViewSet)
router.register('applications', ApplicationViewSet)
router.register('users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
]


