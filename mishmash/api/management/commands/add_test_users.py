"""
Study Abroad Program - Test Users Creation Command
===============================================
To run this use docker compose exec backend python manage.py add_test_users

This Django management command creates test users for development and testing purposes.
It populates the database with an admin user and multiple student users with diverse
backgrounds to simulate real-world usage scenarios.

Features:
- Creates one admin user with full system access
- Creates multiple student users with varied academic backgrounds
- Sets up proper password hashing for security
- Creates associated student profiles with academic information
- All users created have password set to 'guest'

Usage:
    python manage.py add_test_users

Note: This command should only be used in development/testing environments,
      never in production as it creates users with known passwords.

Related Models:
- User: Custom user model with authentication fields
- Student: Profile model containing academic information
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from api.models import User, Student
from datetime import date

class Command(BaseCommand):
    help = 'Creates test users including admin and students'

    def handle(self, *args, **options):
        # Create admin user with full system access
        admin = User.objects.create(
            username='admin',
            password=make_password('admin'),  # Properly hashed password
            display_name='System Administrator',
            is_admin=True,
            is_staff=True,  # Allows access to Django admin interface
            is_superuser=True,  # Grants all system permissions
            is_active=True  # Account is active and can log in
        )
        self.stdout.write(f'Created admin user: {admin.username}')

        # List of diverse student profiles with varied academic backgrounds
        # Format: (display_name, username, major, gpa)
        students_data = [
            ('Emma Wilson', 'EmmaW', 'Computer Science', 3.8),
            ('James Chen', 'JamesC', 'International Relations', 3.9),
            ('Maria Garcia', 'MariaG', 'Environmental Science', 3.7),
            ('David Kim', 'DavidK', 'Business Administration', 3.6),
            ('Sarah Johnson', 'SarahJ', 'Psychology', 3.95),
            ('Mohammed Ali', 'MohammedA', 'Engineering', 3.85),
            ('Priya Patel', 'PriyaP', 'Biology', 3.75),
            ('Lucas Silva', 'LucasS', 'Economics', 3.5),
            ('Nina Williams', 'NinaW', 'Art History', 3.9),
            ('Tom Anderson', 'TomA', 'Physics', 3.7)
        ]

        # Create student users and their associated profiles
        for display_name, username, major, gpa in students_data:
            # Create base user account with authentication fields
            user = User.objects.create(
                username=username,
                password=make_password('guest'),  # All test users have password 'guest'
                display_name=display_name,
                is_admin=False,
                is_staff=False,
                is_superuser=False,
                is_active=True  # Account is active and can log in
            )
            
            # Create associated student profile with academic information
            Student.objects.create(
                user=user,
                date_of_birth=date(2000, 1, 1),  # Example birthdate
                major=major,
                gpa=gpa
            )
            self.stdout.write(f'Created student: {username} ({major})')
