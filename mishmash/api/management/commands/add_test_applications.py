"""
Study Abroad Program - Test Applications Creation Command
===============================================
To run this use docker compose exec backend python manage.py add_test_applications

This Django management command creates test program applications to simulate
various application scenarios and statuses. It creates a realistic distribution
of applications across different programs and students.

Features:
- Creates applications with different statuses (Enrolled, Applied, Withdrawn, Canceled)
- Simulates multiple applications per student
- Creates applications across different programs
- Handles error cases for missing users or programs

Application Scenarios:
1. Multiple applications per student (Emma, James)
2. Single successful applications (Nina)
3. Withdrawn/Canceled applications (James, David)
4. Pending applications (Sarah, Mohammed)
5. Mix of statuses for same student (Mohammed)

Status Types:
- Enrolled: Student accepted and confirmed
- Applied: Application submitted, pending review
- Withdrawn: Student withdrew application
- Canceled: Application canceled by admin/system

Usage:
    python manage.py add_test_applications

Note: This command creates temporary test applications for development.
      The actual application process and database structure may change
      in future versions.

Dependencies:
- Requires add_test_users and add_test_programs to be run first
- All referenced users and programs must exist in database

Related Models:
- User: For student lookup
- Program: For program lookup
- Application: Stores application status and relationships
"""

from django.core.management.base import BaseCommand
from api.models import User, Program, Application
from django.utils import timezone

class Command(BaseCommand):
    help = 'Creates test applications with various statuses'

    def handle(self, *args, **options):
        # Application scenarios with different statuses
        # Format: (username, program_title, status)
        applications_data = [
            # Emma has multiple applications - Mix of enrolled and pending
            ('EmmaW', 'Technology Innovation in Tokyo', 'Enrolled'),
            ('EmmaW', 'Digital Innovation in Silicon Valley', 'Applied'),
            
            # James applied to multiple programs - Shows enrollment and withdrawal
            ('JamesC', 'European Politics Tour', 'Enrolled'),
            ('JamesC', 'Global Business in Singapore', 'Withdrawn'),
            
            # Maria's applications - Environmental focus
            ('MariaG', 'Wildlife Conservation in Kenya', 'Enrolled'),
            ('MariaG', 'Sustainable Engineering in Stockholm', 'Applied'),
            
            # David's applications - Business focus with a cancellation
            ('DavidK', 'Global Business in Singapore', 'Enrolled'),
            ('DavidK', 'European Politics Tour', 'Canceled'),
            
            # Sarah's applications - Single pending application
            ('SarahJ', 'Marine Biology in Great Barrier Reef', 'Applied'),
            
            # Mohammed's applications - Engineering focus with mixed status
            ('MohammedA', 'Sustainable Engineering in Stockholm', 'Applied'),
            ('MohammedA', 'Digital Innovation in Silicon Valley', 'Withdrawn'),
            
            # Priya's applications - Science focus
            ('PriyaP', 'Marine Biology in Great Barrier Reef', 'Enrolled'),
            
            # Lucas's applications - Business focus
            ('LucasS', 'Global Business in Singapore', 'Applied'),
            
            # Nina's applications - Arts focus
            ('NinaW', 'Art and Architecture in Florence', 'Enrolled'),
            
            # Tom's applications - Research focus
            ('TomA', 'Antarctic Research Expedition', 'Applied')
        ]

        # Create each application and handle potential errors
        for username, program_title, status in applications_data:
            try:
                # Lookup student and program objects
                student = User.objects.get(username=username).student
                program = Program.objects.get(title=program_title)
                
                # Create application with specified status
                application = Application.objects.create(
                    student=student,
                    program=program,
                    status=status
                )
                self.stdout.write(
                    f'Created application: {username} -> {program_title} ({status})'
                )
            except (User.DoesNotExist, Program.DoesNotExist) as e:
                # Log error if student or program not found
                self.stdout.write(
                    self.style.ERROR(f'Error creating application: {str(e)}')
                )
