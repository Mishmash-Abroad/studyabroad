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
    faculty_leads = models.CharField(max_length=255)
    description = models.TextField()
    application_open_date = models.DateField()
    application_deadline = models.DateField()
    start_date = models.DateField()
    end_date = models.DateField()

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    date_of_birth = models.DateField()
    gpa = models.DecimalField(max_digits=3, decimal_places=2)
    major = models.CharField(max_length=100)

class Application(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    program = models.ForeignKey(Program, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=10,
        choices=[('Applied', 'Applied'), ('Enrolled', 'Enrolled'), ('Withdrawn', 'Withdrawn'), ('Canceled', 'Canceled')]
    )
    applied_on = models.DateTimeField(auto_now_add=True)

class ApplicationResponse(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE)
    question_number = models.IntegerField()
    response = models.TextField()
