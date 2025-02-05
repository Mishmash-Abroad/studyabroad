from rest_framework import serializers
from .models import User, Program, Application, ApplicationQuestion, ApplicationResponse, Announcement


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


class AnnouncementSerializer(serializers.ModelSerializer):
    """
    Serializer for Announcements with rich text content stored as JSON
    """
    created_by_name = serializers.CharField(source='created_by.display_name', read_only=True)

    class Meta:
        model = Announcement
        fields = [
            'id', 'title', 'content', 'created_at', 'updated_at',
            'importance', 'is_active', 'created_by', 'created_by_name'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by']

    def create(self, validated_data):
        # Set the created_by field to the current user
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
