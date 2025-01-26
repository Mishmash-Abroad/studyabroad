from rest_framework import serializers
from .models import User, Program, Application, ApplicationQuestion, ApplicationResponse


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'display_name', 'email', 'is_admin']


class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ['id', 'title', 'year_semester', 'description', 'faculty_leads', 
                  'application_open_date', 'application_deadline', 'start_date', 'end_date']


class ApplicationQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationQuestion
        fields = ['id', 'text', 'program', 'is_required']


class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['id', 'student', 'program', 'date_of_birth', 'gpa', 'major', 
                  'status', 'applied_on']


class ApplicationResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationResponse
        fields = ['id', 'application', 'question', 'response']
