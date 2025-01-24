from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProgramViewSet, ApplicationViewSet, login_view

router = DefaultRouter()
router.register('programs', ProgramViewSet, basename='program')
router.register('applications', ApplicationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', login_view, name='login'),
]
