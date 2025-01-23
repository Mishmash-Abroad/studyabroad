from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    display_name = models.CharField(max_length=100)
    is_admin = models.BooleanField(default=False)

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',  # Avoid conflict with 'auth.User.groups'
        blank=True,
        help_text='The groups this user belongs to.',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions_set',  # Avoid conflict with 'auth.User.user_permissions'
        blank=True,
        help_text='Specific permissions for this user.',
    )

class Program(models.Model):
    title = models.CharField(max_length=80)
    year_semester = models.CharField(max_length=20)
    description = models.TextField()
    faculty_leads = models.CharField(max_length=255)
    application_open_date = models.DateField()
    application_deadline = models.DateField()
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return self.title

class Application(models.Model):
    student = models.ForeignKey('User', on_delete=models.CASCADE)
    program = models.ForeignKey('Program', on_delete=models.CASCADE)
    date_of_birth = models.DateField()
    gpa = models.DecimalField(max_digits=3, decimal_places=2)
    major = models.CharField(max_length=100)
    status = models.CharField(
        max_length=20,
        choices=[
            ('Applied', 'Applied'),
            ('Enrolled', 'Enrolled'),
            ('Withdrawn', 'Withdrawn'),
            ('Canceled', 'Canceled'),
        ],
        default='Applied'
    )
    applied_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.display_name} - {self.program.title}"

class ApplicationQuestion(models.Model):
    text = models.TextField()
    program = models.ForeignKey('Program', on_delete=models.CASCADE, related_name='questions')
    is_required = models.BooleanField(default=True)

    def __str__(self):
        return f"Question for {self.program.title}: {self.text}"

class ApplicationResponse(models.Model):
    application = models.ForeignKey('Application', on_delete=models.CASCADE, related_name='responses')
    question = models.ForeignKey('ApplicationQuestion', on_delete=models.CASCADE)
    response = models.TextField()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['application', 'question'], name='unique_response_per_question')
        ]

    def __str__(self):
        return f"Response to {self.question.text[:30]}..."
