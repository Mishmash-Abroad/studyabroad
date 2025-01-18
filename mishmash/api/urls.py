from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProgramViewSet, ApplicationViewSet

router = DefaultRouter()
router.register('programs', ProgramViewSet)
router.register('applications', ApplicationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
