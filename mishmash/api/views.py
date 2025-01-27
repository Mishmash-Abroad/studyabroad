from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from .models import Program, Application, User
from .serializers import ProgramSerializer, ApplicationSerializer, UsersSerializer
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.shortcuts import render, redirect

class ProgramViewSet(ModelViewSet):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer

class ApplicationViewSet(ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer

class UserViewSet(ModelViewSet):
    queryset = UsersSerializer.objects.all()
    serializer_class = User
