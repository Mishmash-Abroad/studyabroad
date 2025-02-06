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

    def add_arguments(self, parser):
        parser.add_argument(
            '-prod',
            action='store_true',
            help='Run in production mode, setting is_superuser=False for admin'
        )

    def handle(self, *args, **options):
        prod_mode = options['prod']
        students_data = [
            ('Emma Wilson', 'EmmaW', 'emma.wilson@hcc.edu'),
            ('James Chen', 'JamesC', 'james.chen@hcc.edu'),
            ('Maria Garcia', 'MariaG', 'maria.garcia@hcc.edu'),
            ('David Kim', 'DavidK', 'david.kim@hcc.edu'),
            ('Sarah Johnson', 'SarahJ', 'sarah.johnson@hcc.edu'),
            ('Mohammed Ali', 'MohammedA', 'mohammad.ali@hcc.edu'),
            ('Priya Patel', 'PriyaP', 'priya.patel@hcc.edu'),
            ('Lucas Silva', 'LucasS', 'lucas.silva@hcc.edu'),
            ('Nina Williams', 'NinaW', 'nina.williams@hcc.edu'),
            ('Tom Anderson', 'TomA', 'tom.anderson@hcc.edu')
        ]

        User.objects.all().delete()
        self.stdout.write('Cleared existing users')

        admin = User.objects.create(
            username='admin',
            password=make_password('hcc_admin'),
            display_name='System Administrator',
            is_admin=True,
            is_staff=True,  # Allows access to Django admin interface
            is_superuser=not prod_mode,  # Denies system access to admin in prod mode
            is_active=True
        )
        self.stdout.write(f'Created admin user: {admin.username} (Superuser: {admin.is_superuser})')

        for display_name, username, email in students_data:
            user = User.objects.create(
                username=username,
                password=make_password('guest'),  # All test users have password 'guest'
                display_name=display_name,
                email=email,
                is_admin=False,
                is_staff=False,
                is_superuser=False,
                is_active=True
            )
            
            self.stdout.write(f'Created student: {username}')
