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
from api.models import User, Program, Application, ApplicationQuestion, ApplicationResponse
from django.utils import timezone
from datetime import datetime

class Command(BaseCommand):
    help = 'Creates test applications with various statuses, matching the updated database schema.'

    def handle(self, *args, **options):
        applications_data = [
            # Format: (username, program_title, status, date_of_birth, gpa, major)
            ('EmmaW', 'Technology Innovation in Tokyo', 'Enrolled', '2002-05-10', 3.8, 'Computer Science'),
            ('EmmaW', 'Digital Innovation in Silicon Valley', 'Applied', '2002-05-10', 3.8, 'Computer Science'),

            ('JamesC', 'European Politics Tour', 'Enrolled', '2001-03-15', 3.6, 'Political Science'),
            ('JamesC', 'Global Business in Singapore', 'Withdrawn', '2001-03-15', 3.6, 'Political Science'),

            ('MariaG', 'Wildlife Conservation in Kenya', 'Enrolled', '2002-07-22', 3.9, 'Environmental Science'),
            ('MariaG', 'Sustainable Engineering in Stockholm', 'Applied', '2002-07-22', 3.9, 'Environmental Science'),

            ('DavidK', 'Global Business in Singapore', 'Enrolled', '2001-12-01', 3.7, 'Business Administration'),
            ('DavidK', 'European Politics Tour', 'Canceled', '2001-12-01', 3.7, 'Business Administration'),

            ('SarahJ', 'Marine Biology in Great Barrier Reef', 'Applied', '2003-02-10', 3.5, 'Marine Biology'),

            ('MohammedA', 'Sustainable Engineering in Stockholm', 'Applied', '2002-09-30', 3.4, 'Mechanical Engineering'),
            ('MohammedA', 'Digital Innovation in Silicon Valley', 'Withdrawn', '2002-09-30', 3.4, 'Mechanical Engineering'),

            ('PriyaP', 'Marine Biology in Great Barrier Reef', 'Enrolled', '2003-03-14', 3.8, 'Marine Biology'),

            ('LucasS', 'Global Business in Singapore', 'Applied', '2001-11-25', 3.6, 'Business Administration'),

            ('NinaW', 'Art and Architecture in Florence', 'Enrolled', '2003-06-17', 3.7, 'Art History'),

            ('TomA', 'Antarctic Research Expedition', 'Applied', '2002-04-20', 3.9, 'Biology')
        ]

        for username, program_title, status, dob, gpa, major in applications_data:
            try:
                # Lookup user and program objects
                user = User.objects.get(username=username)
                program = Program.objects.get(title=program_title)

                # Create application with required fields
                application = Application.objects.create(
                    student=user,
                    program=program,
                    date_of_birth=datetime.strptime(dob, '%Y-%m-%d').date(),
                    gpa=gpa,
                    major=major,
                    status=status
                )
                
                self.stdout.write(f'Created application: {username} -> {program_title} ({status})')

                # Add a specific question and response for TomA's application
                if username == 'TomA' and program_title == 'Antarctic Research Expedition':
                    question = ApplicationQuestion.objects.create(
                        program=program,
                        text="Why do you want to participate in this study abroad program?",
                        is_required=True
                    )
                    ApplicationResponse.objects.create(
                        application=application,
                        question=question,
                        response="I am passionate about studying polar ecosystems and their impact on global climate."
                    )

            except (User.DoesNotExist, Program.DoesNotExist) as e:
                self.stdout.write(self.style.ERROR(f'Error creating application: {str(e)}'))
