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
            ('Emma Wilson', 'EmmaW', 'emma.wilson@hcc.edu', 'guest', False, False, False),
            ('bruh', 'bruh', 'bruh.bruh@hcc.edu', 'bruh', False, False, False),
            ('James Chen', 'JamesC', 'james.chen@hcc.edu', 'guest', False, False, False),
            ('Maria Garcia', 'MariaG', 'maria.garcia@hcc.edu', 'guest', False, False, False),
            ('David Kim', 'DavidK', 'david.kim@hcc.edu', 'guest', False, False, False),
            ('Sarah Johnson', 'SarahJ', 'sarah.johnson@hcc.edu', 'guest', False, False, False),
            ('Mohammed Ali', 'MohammedA', 'mohammad.ali@hcc.edu', 'guest', False, False, False),
            ('Priya Patel', 'PriyaP', 'priya.patel@hcc.edu', 'guest', False, False, False),
            ('Lucas Silva', 'LucasS', 'lucas.silva@hcc.edu', 'guest', False, False, False),
            ('Nina Williams', 'NinaW', 'nina.williams@hcc.edu', 'guest', False, False, False),
            ('Tom Anderson', 'TomA', 'tom.anderson@hcc.edu', 'guest', False, False, False),
            ('Elena Papadopoulos', 'elena.papadopoulos', 'elena.p@example.com', 'faculty123', False, False, True),
            ('Marcus Wisdom', 'marcus.wisdom', 'marcus.w@example.com', 'faculty123', False, False, True),
            ('Rachel Ocean', 'rachel.ocean', 'rachel.o@example.com', 'faculty123', False, False, True),
            ('James Coral', 'james.coral', 'james.c@example.com', 'faculty123', False, False, True),
            ('Isabella Romano', 'isabella.romano', 'isabella.r@example.com', 'faculty123', False, False, True),
            ('Robert Art', 'robert.art', 'robert.a@example.com', 'faculty123', False, True, False),
            ('Samuel Health', 'samuel.health', 'samuel.h@example.com', 'faculty123', False, True, False),
            ('Nomvula Mbeki', 'nomvula.mbeki', 'nomvula.m@example.com', 'faculty123', False, True, False),
            ('Marie Laurent', 'marie.laurent', 'marie.l@example.com', 'faculty123', False, True, False),
            ('Sarah Chen', 'sarah.chen', 'sarah.c@example.com', 'faculty123', False, True, False),
            ('Hiroshi Tanaka', 'hiroshi.tanaka', 'hiroshi.t@example.com', 'faculty123', False, True, False),
            ('Erik Anderson', 'erik.anderson', 'erik.a@example.com', 'faculty123', False, True, False),
            ('Maria Nilsson', 'maria.nilsson', 'maria.n@example.com', 'faculty123', False, True, False),
            ('Michael Chang', 'michael.chang', 'michael.c@example.com', 'faculty123', False, True, False),
            ('Lisa Tan', 'lisa.tan', 'lisa.t@example.com', 'faculty123', False, True, False),
            ('Carlos Verde', 'carlos.verde', 'carlos.v@example.com', 'faculty123', False, True, False),
            ('Emma Nature', 'emma.nature', 'emma.n@example.com', 'faculty123', True, False, False),
            ('Giulia Fashion', 'giulia.fashion', 'giulia.f@example.com', 'faculty123', True, False, False),
            ('Alice Lee', 'alice.lee', 'alice.l@example.com', 'faculty123', True, False, False),
            ('Alice Garcia', 'alice.garcia', 'alice.g@example.com', 'faculty123', True, False, False),
            ('Alice Johnson', 'alice.johnson', 'alice.j@example.com', 'faculty123', True, False, False),
            ('Daniel Garcia', 'daniel.garcia', 'daniel.g@example.com', 'faculty123', True, False, False),
            ('Daniel Lee', 'daniel.lee', 'daniel.l@example.com', 'faculty123', True, False, False),
            ('Emily Garcia', 'emily.garcia', 'emily.g@example.com', 'faculty123', True, False, False),
            ('Alice Brown', 'alice.brown', 'alice.b@example.com', 'faculty123', True, False, False),
            ('Catherine Taylor', 'catherine.taylor', 'catherine.t@example.com', 'faculty123', True, False, False),
            ('Alice Smith', 'alice.smith', 'alice.s@example.com', 'faculty123', True, False, False),
            ('Emily Smith', 'emily.smith', 'emily.s@example.com', 'faculty123', True, False, False),
            ('Frank Taylor', 'frank.taylor', 'frank.t@example.com', 'faculty123', True, False, False),
            ('David Space', 'david.space', 'david.s@example.com', 'faculty123', True, False, False),
            ('John Astronomy', 'john.astronomy', 'john.a@example.com', 'faculty123', True, False, False),
            ('Sophie Polar', 'sophie.polar', 'sophie.p@example.com', 'faculty123', True, False, False),
            ('Marco Urban', 'marco.urban', 'marco.u@example.com', 'faculty123', True, False, False),
            ('Claire Design', 'claire.design', 'claire.d@example.com', 'faculty123', True, False, False),
            ('Paul Game', 'paul.game', 'paul.g@example.com', 'faculty123', True, False, False),
            ('Anna Digital', 'anna.digital', 'anna.d@example.com', 'faculty123', True, False, False),
            ('James Journalism', 'james.journalism', 'james.j@example.com', 'faculty123', True, False, False),
            ('Maria Media', 'maria.media', 'maria.m@example.com', 'faculty123', True, False, False),
            ('Thomas Farm', 'thomas.farm', 'thomas.f@example.com', 'faculty123', True, False, False),
            ('Linda Sustainable', 'linda.sustainable', 'linda.s@example.com', 'faculty123', True, False, False),
        ]

        prod_user_data = [
            ("Tyler Harris", "tylerharris352", "tylerharris352@service.net", "bVByhlT1", False, False, False, "th352"),
            ("David Clark", "davidclark074", "davidclark074@service.net", "9mtPZ6M2", False, False, False, "dc74"),
            ("Elizabeth Johnson", "elizabethjohnson303", "elizabethjohnson303@domain.org", "kTr1guGj", False, False, False, None),
            ("James Taylor", "jamestaylor121", "jamestaylor121@service.net", "LBUL23vh", False, False, False, None),
            ("Emily Harris", "emilyharris658", "emilyharris658@service.net", "Z1HAX9yj", False, False, False, None),
            ("Elizabeth Lewis", "elizabethlewis588", "elizabethlewis588@example.com", "TTSRKJtH", False, False, False, "el58"),
            ("Jessica Smith", "jessicasmith684", "jessicasmith684@example.com", "JOVMVjjA", False, False, False, None),
            ("James Taylor", "jamestaylor844", "jamestaylor844@service.net", "DdukcK85", False, True, False, None),
            ("Jessica Smith", "jessicasmith610", "jessicasmith610@mail.com", "b3zCmWYA", False, False, False, None),
            ('Jessica Anderson', 'jessicaanderson409', 'jessicaanderson409@domain.org', 'XKqzZq6l', True, False, True, None),
            ('Ashley Brown', 'ashleybrown862', 'ashleybrown862@mail.com', 'bq1qw1Kj', False, False, True, None),
            ('Emily Bletsch', 'emilybletsch943', 'emilybletsch943@service.net', 'cWdcUokz', True, False, False, None),
            ('Emily Walker', 'emilywalker026', 'emilywalker026@domain.org', 'B366kKuA', True, False, False, None),
            ('Sarah Smith', 'sarahsmith682', 'sarahsmith682@domain.org', 'ye6GGoNf', True, False, True, None),
        ]

        prod_partners = [
            ("jamescarter92", "James Carter", "H1j94D-x", "james.carter92@example.com"),
            ("emilywatson88", "Emily Watson", "Kjs13ski!", "emily.watson88@example.com"),
            ("danielbrooks77", "Daniel Brooks", "Jsk8k9q+", "daniel.brooks77@example.com"),
            ("oliviagreen21", "Olivia Green", "A3jsa0-", "olivia.green21@example.com"),
        ]

        User.objects.all().delete()
        self.stdout.write('Cleared existing users')

        admin = User.objects.create(
            username='admin',
            password=make_password('hcc_admin'),
            display_name='System Administrator',
            is_admin=True,
            is_faculty=True,
            is_staff=True,
            is_superuser=True,
            is_active=True
        )
        self.stdout.write(f'Created admin user: {admin.username} (Superuser: {admin.is_superuser})')

        if prod_mode:
            for display_name, username, email, password, is_faculty, is_reviewer, is_admin, ulink_username in prod_user_data:
                user = User.objects.create(
                    username=username,
                    password=make_password(password),
                    display_name=display_name,
                    email=email,
                    is_faculty=is_faculty,
                    is_reviewer=is_reviewer,
                    is_admin=is_admin,
                    ulink_username=ulink_username,
                )
                self.stdout.write(f'Created user: {display_name} - Faculty = {is_faculty}, Reviewer = {is_reviewer}, Administrator = {is_admin}')

            for username, display_name, password, email in prod_partners:
                user = User.objects.create(
                    username=username,
                    password=make_password(password),
                    display_name=display_name,
                    email=email,
                    is_provider_partner=True,
                )
                self.stdout.write(f'Created partner: {display_name}')
                
        else:
            for display_name, username, email, password, is_faculty, is_reviewer, is_admin in students_data:
                user = User.objects.create(
                    username=username,
                    password=make_password(password),
                    display_name=display_name,
                    email=email,
                    is_faculty=is_faculty,
                    is_reviewer=is_reviewer,
                    is_admin=is_admin
                )
                self.stdout.write(f'Created user: {display_name} - Faculty = {is_faculty}, Reviewer = {is_reviewer}, Administrator = {is_admin}')
