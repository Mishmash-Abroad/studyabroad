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
            help='Run in production mode, populates db with production data'
        )

    def handle(self, *args, **options):
        prod_mode = options['prod']
        students_data = [
            ('Emma Wilson', 'EmmaW', 'emma.wilson@hcc.edu', 'guest'),
            ('James Chen', 'JamesC', 'james.chen@hcc.edu', 'guest'),
            ('Maria Garcia', 'MariaG', 'maria.garcia@hcc.edu', 'guest'),
            ('David Kim', 'DavidK', 'david.kim@hcc.edu', 'guest'),
            ('Sarah Johnson', 'SarahJ', 'sarah.johnson@hcc.edu', 'guest'),
            ('Mohammed Ali', 'MohammedA', 'mohammad.ali@hcc.edu', 'guest'),
            ('Priya Patel', 'PriyaP', 'priya.patel@hcc.edu', 'guest'),
            ('Lucas Silva', 'LucasS', 'lucas.silva@hcc.edu', 'guest'),
            ('Nina Williams', 'NinaW', 'nina.williams@hcc.edu', 'guest'),
            ('Tom Anderson', 'TomA', 'tom.anderson@hcc.edu', 'guest')
        ]

        prod_students_data = [
            ("Tyler Harris", "tylerharris352", "tylerharris352@service.net", "bVByhlT1"),
            ("David Clark", "davidclark074", "davidclark074@service.net", "9mtPZ6M2"),
            ("Elizabeth Johnson", "elizabethjohnson303", "elizabethjohnson303@domain.org", "kTr1guGj"),
            ("James Taylor", "jamestaylor121", "jamestaylor121@service.net", "LBUL23vh"),
            ("Emily Harris", "emilyharris658", "emilyharris658@service.net", "Z1HAX9yj"),
            ("Elizabeth Lewis", "elizabethlewis588", "elizabethlewis588@example.com", "TTSRKJtH"),
            ("Jessica Smith", "jessicasmith684", "jessicasmith684@example.com", "JOVMVjjA"),
            ("James Taylor", "jamestaylor844", "jamestaylor844@service.net", "DdukcK85"),
            ("Jessica Smith", "jessicasmith610", "jessicasmith610@mail.com", "b3zCmWYA"),
            ("Jessica Anderson", "jessicaanderson409", "jessicaanderson409@domain.org", "XKqzZq6l"),
            ("Ashley Brown", "ashleybrown862", "ashleybrown862@mail.com", "bq1qw1Kj"),
            ("Emily Bletsch", "emilybletsch943", "emilybletsch943@service.net", "cWdcUokz"),
            ("Emily Walker", "emilywalker026", "emilywalker026@domain.org", "B366kKuA"),
            ("Sarah Smith", "sarahsmith682", "sarahsmith682@domain.org", "ye6GGoNf"),
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

        if prod_mode:
            for display_name, username, email, password in prod_students_data:
                user = User.objects.create(
                    username=username,
                    password=make_password(password),
                    display_name=display_name,
                    email=email,
                    is_admin=False,
                    is_staff=False,
                    is_superuser=False,
                    is_active=True
                )
            
                self.stdout.write(f'Created student: {username}')
        else:
            for display_name, username, email, password in students_data:
                user = User.objects.create(
                    username=username,
                    password=make_password(password),
                    display_name=display_name,
                    email=email,
                    is_admin=False,
                    is_staff=False,
                    is_superuser=False,
                    is_active=True
                )
                
                self.stdout.write(f'Created student: {username}')
