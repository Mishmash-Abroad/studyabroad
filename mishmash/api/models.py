from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.timezone import now
from allauth.socialaccount.models import SocialAccount


from auditlog.registry import auditlog



class User(AbstractUser):
    display_name = models.CharField(max_length=100, default="New User")
    is_admin = models.BooleanField(default=False)
    is_mfa_enabled = models.BooleanField(default=False)
    
    groups = models.ManyToManyField(
        "auth.Group",
        related_name="custom_user_set",  # Avoid conflict with 'auth.User.groups'
        blank=True,
        help_text="The groups this user belongs to.",
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="custom_user_permissions_set",  # Avoid conflict with 'auth.User.user_permissions'
        blank=True,
        help_text="Specific permissions for this user.",
    )

    @property
    def is_sso(self):
        """Check if user logged in via SSO."""
        return SocialAccount.objects.filter(user=self).exists()


class Program(models.Model):
    title = models.CharField(max_length=80)
    year = models.CharField(max_length=4)
    semester = models.CharField(max_length=20)
    description = models.TextField(blank=True, default="No description provided.")
    faculty_leads = models.ManyToManyField('User', related_name='led_programs', limit_choices_to={'is_admin': True}, default=[1])
    application_open_date = models.DateField(null=True, blank=True)
    application_deadline = models.DateField(null=True, blank=True)
    essential_document_deadline = models.DateField(null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    @property
    def year_semester(self):
        """Returns 'YYYY Semester' format."""
        return f"{self.year} {self.semester}"

    def __str__(self):
        return self.title


class Application(models.Model):
    student = models.ForeignKey("User", on_delete=models.CASCADE)
    program = models.ForeignKey("Program", on_delete=models.CASCADE)
    date_of_birth = models.DateField(
        null=True, blank=True
    )  # Allow null to avoid immediate data issues
    gpa = models.DecimalField(
        max_digits=4,
        decimal_places=3,
        null=True,
        blank=True,
        default=0.000,
    )
    major = models.CharField(max_length=100, default="Undeclared")
    status = models.CharField(
        max_length=20,
        choices=[
            ("Applied", "Applied"),
            ("Enrolled", "Enrolled"),
            ("Eligible", "Eligible"),
            ("Approved", "Approved"),
            ("Completed", "Completed"),
            ("Withdrawn", "Withdrawn"),
            ("Canceled", "Canceled"),
        ],
        default="Applied",
    )
    applied_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.display_name} - {self.program.title}"


class ApplicationQuestion(models.Model):
    text = models.TextField(default="Default question text.")
    program = models.ForeignKey(
        "Program", on_delete=models.CASCADE, related_name="questions"
    )
    is_required = models.BooleanField(default=True)

    def __str__(self):
        return f"Question for {self.program.title}: {self.text}"
    
class ConfidentialNote(models.Model):
    author = models.ForeignKey('User', null=True, blank=True, on_delete=models.SET_NULL, related_name='authored_notes')
    application = models.ForeignKey('Application', on_delete=models.CASCADE, related_name='confidential_notes')
    content = models.TextField(default="Confidential note text. Only admin accounts will be able to see this content.")
    timestamp = models.DateTimeField(default=now, editable=False)

    def get_author_display(self):
        return self.author.display_name if self.author else "Deleted user"

    def __str__(self):
        return f"Note by {self.get_author_display()} on {self.timestamp}"


class ApplicationResponse(models.Model):
    application = models.ForeignKey(
        "Application", on_delete=models.CASCADE, related_name="responses"
    )
    question = models.ForeignKey(
        "ApplicationQuestion", on_delete=models.CASCADE, default=1
    )  # Replace 1 with the ID of an existing ApplicationQuestion
    response = models.TextField(blank=True, default="")

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["application", "question"], name="unique_response_per_question"
            )
        ]

    def __str__(self):
        return f"Response to {self.question.text[:30]}..."


class Announcement(models.Model):
    """
    Model for storing announcements that can be displayed on the homepage and dashboard.
    Uses a JSON field to store rich text content to avoid security issues with raw HTML.
    """

    IMPORTANCE_LEVELS = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("urgent", "Urgent"),
    ]

    title = models.CharField(max_length=200)
    content = models.JSONField(
        help_text="JSON representation of rich text content (compatible with Tiptap/ProseMirror)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    importance = models.CharField(
        max_length=10, choices=IMPORTANCE_LEVELS, default="medium"
    )
    is_active = models.BooleanField(
        default=True, help_text="If false, announcement won't be displayed"
    )
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="announcements"
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["-created_at"]),
            models.Index(fields=["importance", "-created_at"]),
        ]

    def __str__(self):
        return f"{self.title} ({self.get_importance_display()})"


class Document(models.Model):
    TYPES_OF_DOCS = [
        ("Assumption of risk form", "Assumption of risk form"),
        ("Acknowledgement of the code of conduct", "Acknowledgement of the code of conduct"),
        ("Housing questionnaire", "Housing questionnaire"),
        ("Medical/health history and immunization records", "Medical/health history and immunization records"),
    ]
    title = models.CharField(max_length=255)
    pdf = models.FileField(upload_to="pdfs/")  # Uploads to MEDIA_ROOT/pdfs/
    uploaded_at = models.DateTimeField(auto_now_add=True)
    application = models.ForeignKey("Application", on_delete=models.CASCADE)
    type = models.CharField(  # Change TextField to CharField
        max_length=100,  # Set a max_length that fits your longest choice
        choices=TYPES_OF_DOCS
    )

    def __str__(self):
        return f"{self.title}"






auditlog.register(User)
auditlog.register(Program)
auditlog.register(Application)
auditlog.register(ApplicationResponse)
auditlog.register(Announcement)
auditlog.register(ConfidentialNote)
auditlog.register(Document)
