from django.contrib import admin
from .models import User, Program, Application, ApplicationQuestion, ApplicationResponse


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'display_name', 'email', 'is_admin')  # Display `is_admin`
    list_filter = ('is_admin',)  # Filter by admin status
    search_fields = ('username', 'email', 'display_name')  # Allow searching users
    readonly_fields = ('password',)  # Ensure password is not editable in admin


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'year_semester', 'application_open_date', 'application_deadline')
    list_filter = ('year_semester',)
    search_fields = ('title', 'faculty_leads')


@admin.register(ApplicationQuestion)
class ApplicationQuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'program', 'text', 'is_required')
    list_filter = ('program', 'is_required')
    search_fields = ('text',)


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'program', 'status', 'applied_on')
    list_filter = ('status', 'program')
    search_fields = ('student__username', 'program__title')


@admin.register(ApplicationResponse)
class ApplicationResponseAdmin(admin.ModelAdmin):
    list_display = ('id', 'application', 'question', 'response')
    search_fields = ('application__id', 'question__text')
