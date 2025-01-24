from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from api.models import User, Student
from datetime import date

class Command(BaseCommand):
    help = 'Creates test users including admin and students'

    def handle(self, *args, **options):
        # Create admin user
        admin = User.objects.create(
            username='admin',
            password=make_password('admin'),
            display_name='System Administrator',
            is_admin=True,
            is_staff=True,
            is_superuser=True,
            is_active=True
        )
        self.stdout.write(f'Created admin user: {admin.username}')

        # Create students with diverse backgrounds
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

        for display_name, username, major, gpa in students_data:
            # Create user with properly hashed password
            user = User.objects.create(
                username=username,
                password=make_password('guest'),
                display_name=display_name,
                is_admin=False,
                is_staff=False,
                is_superuser=False,
                is_active=True
            )
            
            # Create student profile
            Student.objects.create(
                user=user,
                date_of_birth=date(2000, 1, 1),  # Example date
                gpa=gpa,
                major=major
            )
            self.stdout.write(f'Created student: {username} ({major})')
