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
    LetterOfRecommendation,
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
            "is_faculty",
            "is_reviewer",
            "is_provider_partner",
            "is_mfa_enabled",
            "is_sso",
            "roles_object",
        ]


class ProgramSerializer(serializers.ModelSerializer):
    faculty_leads = UserSerializer(many=True, read_only=True)
    provider_partners = UserSerializer(many=True, read_only=True)
    faculty_lead_ids = serializers.PrimaryKeyRelatedField(
        source="faculty_leads",
        queryset=User.objects.filter(is_faculty=True),
        many=True,
        write_only=True,
        required=False,
    )
    provider_partner_ids = serializers.PrimaryKeyRelatedField(
        source="provider_partners",
        queryset=User.objects.filter(is_provider_partner=True),
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
            "provider_partners",
            "provider_partner_ids",
            "application_open_date",
            "application_deadline",
            "essential_document_deadline",
            "start_date",
            "end_date",
            "track_payment",
        ]


class ApplicationQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationQuestion
        fields = ["id", "text", "program", "is_required"]


class ApplicationSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(read_only=True)
    gpa = serializers.DecimalField(
        max_digits=4, decimal_places=3, coerce_to_string=True
    )

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
            "cover_image",  # Accept the uploaded file
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
    author_display = serializers.SerializerMethodField()

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

    def get_author_display(self, obj):
        """Returns 'Deleted user' if author is null."""
        return obj.author.display_name if obj.author else "Deleted User"


class DocumentSerializer(serializers.ModelSerializer):
    pdf_url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = ["id", "title", "pdf", "uploaded_at", "application", "type", "pdf_url"]

    def get_pdf_url(self, obj):
        """Generate the URL for securely accessing the PDF file."""
        # return only the relative path which will be combined with the baseURL by axios
        if obj.pdf:
            return f"/api/documents/{obj.id}/secure_file/"
        return None


class LetterOfRecommendationSerializer(serializers.ModelSerializer):
    pdf_url = serializers.SerializerMethodField()
    is_fulfilled = serializers.ReadOnlyField()
    student_name = serializers.SerializerMethodField()
    program_title = serializers.SerializerMethodField()

    class Meta:
        model = LetterOfRecommendation
        fields = [
            "id",
            "application",
            "writer_name",
            "writer_email",
            "pdf",
            "letter_timestamp",
            "token",
            "created_at",
            "updated_at",
            "pdf_url",
            "is_fulfilled",
            "student_name",
            "program_title",
        ]
        read_only_fields = [
            "id",
            "application",
            "pdf",
            "letter_timestamp",
            "token",
            "created_at",
            "updated_at",
            "pdf_url",
            "is_fulfilled",
            "student_name",
            "program_title",
        ]

    def get_pdf_url(self, obj):
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            user = request.user
            if user.is_admin or user.is_faculty or user.is_reviewer:
                if obj.pdf and obj.is_fulfilled:
                    return f"/api/letters/{obj.id}/secure_file/"
        return None

    def get_student_name(self, obj):
        return obj.application.student.display_name

    def get_program_title(self, obj):
        return obj.application.program.title

    def get_is_fulfilled(self, obj):
        return obj.is_fulfilled
