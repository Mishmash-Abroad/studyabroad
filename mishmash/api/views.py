from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from .models import Program, Application
from .serializers import ProgramSerializer, ApplicationSerializer

class ProgramViewSet(ModelViewSet):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer

class ApplicationViewSet(ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer

