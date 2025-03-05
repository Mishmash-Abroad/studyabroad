from django.contrib import admin
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

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "username",
        "display_name",
        "email",
        "is_admin",
        "is_faculty",
        "is_reviewer",
        "is_active",
        "is_mfa_enabled",
        "is_sso",
    )
    list_filter = ("is_admin", "is_faculty", "is_reviewer", "is_active")
    search_fields = ("username", "email", "display_name")

    def is_sso(self, obj):
        """Check if user logged in via SSO."""
        return obj.is_sso
    
    is_sso.boolean = True
    is_sso.short_description = "SSO User"

    def get_readonly_fields(self, request, obj=None):
        """
        Make certain fields read-only:
        - Prevent password from being changed
        - Prevent admin from removing their own admin status
        """
        fields = ["password"]
        
        if obj and obj.username == "admin":
            fields.append("is_admin")

        return fields


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "year",
        "semester",
        "application_open_date",
        "application_deadline",
        "essential_document_deadline",
    )
    list_filter = ("year", "semester")
    search_fields = ("title", "faculty_leads")


@admin.register(ApplicationQuestion)
class ApplicationQuestionAdmin(admin.ModelAdmin):
    list_display = ("id", "program", "text", "is_required")
    list_filter = ("program", "is_required")
    search_fields = ("text",)


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ("id", "student", "program", "status", "applied_on")
    list_filter = ("status", "program")
    search_fields = ("student__username", "program__title")


@admin.register(ApplicationResponse)
class ApplicationResponseAdmin(admin.ModelAdmin):
    list_display = ("id", "application", "question", "response")
    search_fields = ("application__id", "question__text")


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ("title", "importance", "is_active", "created_at", "created_by")
    list_filter = ("importance", "is_active", "created_at")
    search_fields = ("title", "content")
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(ConfidentialNote)
class ConfidentialNoteAdmin(admin.ModelAdmin):
    list_display = ["application", "get_author_display", "timestamp", "content"]
    list_filter = ["timestamp"]
    search_fields = ["author__display_name", "application__id", "content"]

    def get_author_display(self, obj):
        return obj.get_author_display()

    get_author_display.admin_order_field = "author"
    get_author_display.short_description = "Author"


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("title", "application", "uploaded_at", "pdf", "type")
    list_filter = ("title", "application", "uploaded_at", "pdf", "type")
    search_fields = ("title", "application", "uploaded_at", "pdf", "type")
