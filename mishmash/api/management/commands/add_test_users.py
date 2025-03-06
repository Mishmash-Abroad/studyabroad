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
            ('bruh', 'bruh', 'bruh.bruh@hcc.edu', 'bruh'),
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
        ]


        User.objects.all().delete()
        self.stdout.write('Cleared existing users')

        admin = User.objects.create(
            username='admin',
            password=make_password('hcc_admin'),
            display_name='System Administrator',
            is_admin=True,
            is_faculty=True,
            is_staff=True,  # Allows access to Django admin interface
            is_superuser=not prod_mode,  # Denies system access to admin in prod mode
            is_active=True
        )
        self.stdout.write(f'Created admin user: {admin.username} (Superuser: {admin.is_superuser})')

        # Faculty Users
        faculty_users = [
            ('elena.papadopoulos', 'Elena Papadopoulos', 'elena.p@example.com', 'faculty123'),
            ('marcus.wisdom', 'Marcus Wisdom', 'marcus.w@example.com', 'faculty123'),
            ('rachel.ocean', 'Rachel Ocean', 'rachel.o@example.com', 'faculty123'),
            ('james.coral', 'James Coral', 'james.c@example.com', 'faculty123'),
            ('isabella.romano', 'Isabella Romano', 'isabella.r@example.com', 'faculty123'),
            ('robert.art', 'Robert Art', 'robert.a@example.com', 'faculty123'),
            ('samuel.health', 'Samuel Health', 'samuel.h@example.com', 'faculty123'),
            ('nomvula.mbeki', 'Nomvula Mbeki', 'nomvula.m@example.com', 'faculty123'),
            ('marie.laurent', 'Marie Laurent', 'marie.l@example.com', 'faculty123'),
            ('sarah.chen', 'Sarah Chen', 'sarah.c@example.com', 'faculty123'),
            ('hiroshi.tanaka', 'Hiroshi Tanaka', 'hiroshi.t@example.com', 'faculty123'),
            ('erik.anderson', 'Erik Anderson', 'erik.a@example.com', 'faculty123'),
            ('maria.nilsson', 'Maria Nilsson', 'maria.n@example.com', 'faculty123'),
            ('michael.chang', 'Michael Chang', 'michael.c@example.com', 'faculty123'),
            ('lisa.tan', 'Lisa Tan', 'lisa.t@example.com', 'faculty123'),
            ('carlos.verde', 'Carlos Verde', 'carlos.v@example.com', 'faculty123'),
            ('emma.nature', 'Emma Nature', 'emma.n@example.com', 'faculty123'),
            ('giulia.fashion', 'Giulia Fashion', 'giulia.f@example.com', 'faculty123'),
            ('alice.lee', 'Alice Lee', 'alice.l@example.com', 'faculty123'),
            ('alice.garcia', 'Alice Garcia', 'alice.g@example.com', 'faculty123'),
            ('alice.johnson', 'Alice Johnson', 'alice.j@example.com', 'faculty123'),
            ('daniel.garcia', 'Daniel Garcia', 'daniel.g@example.com', 'faculty123'),
            ('daniel.lee', 'Daniel Lee', 'daniel.l@example.com', 'faculty123'),
            ('emily.garcia', 'Emily Garcia', 'emily.g@example.com', 'faculty123'),
            ('alice.brown', 'Alice Brown', 'alice.b@example.com', 'faculty123'),
            ('catherine.taylor', 'Catherine Taylor', 'catherine.t@example.com', 'faculty123'),
            ('alice.smith', 'Alice Smith', 'alice.s@example.com', 'faculty123'),
            ('emily.smith', 'Emily Smith', 'emily.s@example.com', 'faculty123'),
            ('frank.taylor', 'Frank Taylor', 'frank.t@example.com', 'faculty123'),
            ('david.space', 'David Space', 'david.s@example.com', 'faculty123'),
            ('john.astronomy', 'John Astronomy', 'john.a@example.com', 'faculty123'),
            ('sophie.polar', 'Sophie Polar', 'sophie.p@example.com', 'faculty123'),
            ('marco.urban', 'Marco Urban', 'marco.u@example.com', 'faculty123'),
            ('claire.design', 'Claire Design', 'claire.d@example.com', 'faculty123'),
            ('paul.game', 'Paul Game', 'paul.g@example.com', 'faculty123'),
            ('anna.digital', 'Anna Digital', 'anna.d@example.com', 'faculty123'),
            ('james.journalism', 'James Journalism', 'james.j@example.com', 'faculty123'),
            ('maria.media', 'Maria Media', 'maria.m@example.com', 'faculty123'),
            ('thomas.farm', 'Thomas Farm', 'thomas.f@example.com', 'faculty123'),
            ('linda.sustainable', 'Linda Sustainable', 'linda.s@example.com', 'faculty123'),
        ]

        prod_faculty_users = [
            ('jessicaanderson409', 'Jessica Anderson', 'jessicaanderson409@domain.org', 'XKqzZq6l'),
            ('ashleybrown862', 'Ashley Brown', 'ashleybrown862@mail.com', 'bq1qw1Kj'),
            ('emilybletsch943', 'Emily Bletsch', 'emilybletsch943@service.net', 'cWdcUokz'),
            ('emilywalker026', 'Emily Walker', 'emilywalker026@domain.org', 'B366kKuA'),
            ('sarahsmith682', 'Sarah Smith', 'sarahsmith682@domain.org', 'ye6GGoNf'),
        ]

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
            for username, display_name, email, password in prod_faculty_users:
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    display_name=display_name,
                    is_admin=True
                )
                self.stdout.write(f'Created faculty user: {display_name}')
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
            for username, display_name, email, password in faculty_users:
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    display_name=display_name,
                    is_admin=True
                )
                self.stdout.write(f'Created faculty user: {display_name}')
