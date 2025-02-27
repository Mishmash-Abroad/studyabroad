from rest_framework import serializers
from .models import (
    User,
    Program,
    Application,
    ApplicationQuestion,
    ApplicationResponse,
    Announcement,
    Document,
    ConfidentialNote,
)
from allauth.socialaccount.models import SocialAccount


class UserSerializer(serializers.ModelSerializer):
    is_sso = serializers.ReadOnlyField()
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "display_name",
            "email",
            "is_admin",
            "is_mfa_enabled",
            "is_sso",
        ]


class ProgramSerializer(serializers.ModelSerializer):
    faculty_leads = UserSerializer(many=True, read_only=True)
    faculty_lead_ids = serializers.PrimaryKeyRelatedField(
        source="faculty_leads",
        queryset=User.objects.filter(is_admin=True),
        many=True,
        write_only=True,
        required=False,
    )

    class Meta:
        model = Program
        fields = [
            "id",
            "title",
            "year",
            "semester",
            "year_semester",
            "description",
            "faculty_leads",
            "faculty_lead_ids",
            "application_open_date",
            "application_deadline",
            "essential_document_deadline",
            "start_date",
            "end_date",
        ]


class ApplicationQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationQuestion
        fields = ["id", "text", "program", "is_required"]


class ApplicationSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Application
        fields = [
            "id",
            "student",
            "program",
            "date_of_birth",
            "gpa",
            "major",
            "status",
            "applied_on",
        ]


class ApplicationResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationResponse
        fields = ["id", "application", "question", "response"]


class AnnouncementSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(
        source="created_by.display_name", read_only=True
    )
    cover_image_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Announcement
        fields = [
            "id",
            "title",
            "content",
            "cover_image",      # Accept the uploaded file
            "cover_image_url",  # For retrieving the image URL
            "pinned",
            "importance",
            "is_active",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at", "created_by"]

    def get_cover_image_url(self, obj):
        request = self.context.get("request")
        if obj.cover_image and request:
            return request.build_absolute_uri(obj.cover_image.url)
        return None

    def create(self, validated_data):
        # If is_active is missing or falsy (empty string, None, etc.), default to True.
        if not validated_data.get("is_active"):
            validated_data["is_active"] = True
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "is_active" not in validated_data:
            validated_data["is_active"] = instance.is_active
        return super().update(instance, validated_data)


class ConfidentialNoteSerializer(serializers.ModelSerializer):
    author_display = serializers.CharField(source="author.display_name", read_only=True)

    class Meta:
        model = ConfidentialNote
        fields = [
            "id",
            "author",
            "author_display",
            "application",
            "timestamp",
            "content",
        ]
        read_only_fields = ["id", "author", "author_display", "timestamp"]

    def get_author_name(self, obj):
        """Returns 'Deleted user' if author is null."""
        return obj.get_author_display()


class DocumentSerializer(serializers.ModelSerializer):
    pdf_url = serializers.SerializerMethodField()  # ✅ Add this line

    class Meta:
        model = Document
        fields = ["id", "title", "pdf", "uploaded_at", "application", "type", "pdf_url"]

    def get_pdf_url(self, obj):
        """Generate the absolute URL for the PDF file."""
        request = self.context.get("request")  # Get the request context
        if obj.pdf:
            return request.build_absolute_uri(obj.pdf.url) if request else obj.pdf.url
        return None
