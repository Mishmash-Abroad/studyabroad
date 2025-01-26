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
            # Emma's diverse application history - Tech and Innovation focus
            ('EmmaW', 'Technology Innovation in Tokyo', 'Enrolled'),
            ('EmmaW', 'Business Innovation in Singapore', 'Applied'),
            ('EmmaW', 'Digital Innovation in Berlin', 'Applied'),
            ('EmmaW', 'Game Development in Seoul', 'Applied'),
            ('EmmaW', 'Finance and Economics in London', 'Withdrawn'),
            ('EmmaW', 'Artificial Intelligence in Montreal', 'Canceled'),
            
            # David's extensive program history - Business and Tech focus
            ('DavidK', 'Business Innovation in Singapore', 'Enrolled'),
            ('DavidK', 'Sustainable Engineering in Stockholm', 'Applied'),
            ('DavidK', 'Environmental Science in Costa Rica', 'Applied'),
            ('DavidK', 'Urban Planning in Barcelona', 'Applied'),
            ('DavidK', 'Finance and Economics in London', 'Withdrawn'),
            ('DavidK', 'Renewable Energy in Dubai', 'Withdrawn'),
            ('DavidK', 'Film and Media Studies in Mumbai', 'Canceled'),
            ('DavidK', 'Artificial Intelligence in Montreal', 'Canceled'),
            
            # James's applications - Humanities and Culture
            ('JamesC', 'Ancient Philosophy in Athens', 'Enrolled'),
            ('JamesC', 'Art and Architecture in Florence', 'Withdrawn'),
            ('JamesC', 'Culinary Arts in Paris', 'Applied'),
            ('JamesC', 'Film and Media Studies in Mumbai', 'Applied'),
            
            # Maria's applications - Environmental and Sustainability focus
            ('MariaG', 'Environmental Science in Costa Rica', 'Enrolled'),
            ('MariaG', 'Sustainable Engineering in Stockholm', 'Applied'),
            ('MariaG', 'Marine Biology in Great Barrier Reef', 'Applied'),
            ('MariaG', 'Renewable Energy in Dubai', 'Withdrawn'),
            
            # Sarah's applications - Health and Science
            ('SarahJ', 'Marine Biology in Great Barrier Reef', 'Applied'),
            ('SarahJ', 'Global Health in Cape Town', 'Enrolled'),
            ('SarahJ', 'Environmental Science in Costa Rica', 'Applied'),
            ('SarahJ', 'Archaeology in Petra', 'Withdrawn'),
            
            # Mohammed's applications - Engineering and Tech
            ('MohammedA', 'Sustainable Engineering in Stockholm', 'Applied'),
            ('MohammedA', 'Technology Innovation in Tokyo', 'Withdrawn'),
            ('MohammedA', 'Digital Innovation in Berlin', 'Applied'),
            ('MohammedA', 'Renewable Energy in Dubai', 'Canceled'),
            
            # Priya's applications - Science and Health
            ('PriyaP', 'Marine Biology in Great Barrier Reef', 'Enrolled'),
            ('PriyaP', 'Global Health in Cape Town', 'Applied'),
            ('PriyaP', 'Environmental Science in Costa Rica', 'Applied'),
            ('PriyaP', 'Archaeology in Petra', 'Withdrawn'),
            
            # Lucas's applications - Business and Urban Studies
            ('LucasS', 'Business Innovation in Singapore', 'Applied'),
            ('LucasS', 'Urban Planning in Barcelona', 'Applied'),
            ('LucasS', 'Finance and Economics in London', 'Withdrawn'),
            ('LucasS', 'Renewable Energy in Dubai', 'Canceled'),
            
            # Nina's applications - Arts and Culture
            ('NinaW', 'Art and Architecture in Florence', 'Enrolled'),
            ('NinaW', 'Ancient Philosophy in Athens', 'Applied'),
            ('NinaW', 'Fashion Design in Milan', 'Applied'),
            ('NinaW', 'Film and Media Studies in Mumbai', 'Withdrawn'),
            ('NinaW', 'Culinary Arts in Paris', 'Canceled'),
            
            # Tom's applications - Technology and Innovation
            ('TomA', 'Digital Innovation in Berlin', 'Applied'),
            ('TomA', 'Technology Innovation in Tokyo', 'Withdrawn'),
            ('TomA', 'Game Development in Seoul', 'Applied'),
            ('TomA', 'Artificial Intelligence in Montreal', 'Canceled')
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
                self.stdout.write(f'Created application for {username} - {program_title}: {status}')
                
            except User.DoesNotExist:
                self.stderr.write(f'Error: User {username} not found')
            except Program.DoesNotExist:
                self.stderr.write(f'Error: Program {program_title} not found')
            except Exception as e:
                self.stderr.write(f'Error creating application: {str(e)}')
