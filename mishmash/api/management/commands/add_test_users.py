"""
Study Abroad Program - Test Users Creation Command
===============================================
To run this use docker compose exec backend python manage.py add_test_users

This Django management command creates test users for development and testing purposes.
It populates the database with an admin user and multiple student users.

Features:
- Creates one admin user with full system access
- Creates multiple student users 
- Sets up proper password hashing for security
- All users created have password set to 'guest'

Usage:
    python manage.py add_test_users

Note: This command should only be used in development/testing environments,
      never in production as it creates users with known passwords.

Related Models:
- User: Custom user model with authentication fields
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from api.models import User

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
        # Format: (display_name, username)
        students_data = [
            ('Emma Wilson', 'EmmaW'),
            ('James Chen', 'JamesC'),
            ('Maria Garcia', 'MariaG'),
            ('David Kim', 'DavidK'),
            ('Sarah Johnson', 'SarahJ'),
            ('Mohammed Ali', 'MohammedA'),
            ('Priya Patel', 'PriyaP'),
            ('Lucas Silva', 'LucasS'),
            ('Nina Williams', 'NinaW'),
            ('Tom Anderson', 'TomA')
        ]

        # Create student users and their associated profiles
        for display_name, username in students_data:
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
            
            self.stdout.write(f'Created student: {username}')
