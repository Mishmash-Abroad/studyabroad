from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Program, Application, ApplicationQuestion, ApplicationResponse, Announcement


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'display_name', 'is_admin', 'is_active')
    list_filter = ('is_admin', 'is_active')
    search_fields = ('email', 'display_name')
    ordering = ('email',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('display_name',)}),
        ('Permissions', {'fields': ('is_admin', 'is_active', 'is_staff', 'is_superuser')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'display_name', 'password1', 'password2'),
        }),
    )


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ('title', 'location', 'start_date', 'end_date', 'capacity')
    list_filter = ('location', 'start_date')
    search_fields = ('title', 'description', 'location')
    ordering = ('start_date',)


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('user', 'program', 'status', 'created_at', 'updated_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__email', 'program__title')
    raw_id_fields = ('user', 'program')


@admin.register(ApplicationQuestion)
class ApplicationQuestionAdmin(admin.ModelAdmin):
    list_display = ('program', 'text', 'order', 'required')
    list_filter = ('program', 'required')
    search_fields = ('text', 'program__title')
    ordering = ('program', 'order')


@admin.register(ApplicationResponse)
class ApplicationResponseAdmin(admin.ModelAdmin):
    list_display = ('application', 'question', 'response')
    search_fields = ('application__user__email', 'question__text', 'response')
    raw_id_fields = ('application', 'question')


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('title', 'importance', 'is_active', 'created_at', 'created_by')
    list_filter = ('importance', 'is_active', 'created_at')
    search_fields = ('title', 'content')
    ordering = ('-created_at',)
    raw_id_fields = ('created_by',)
