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

Application States:
- Enrolled: Student accepted and confirmed for the program
- Applied: Application submitted, pending review
- Withdrawn: Student withdrew their application
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
            # Past Programs (Fall 2024)
            ('EmmaW', 'Ancient Philosophy in Athens', 'Enrolled', '2002-05-10', 3.8, 'Philosophy'),
            ('JamesC', 'Digital Innovation in Silicon Valley', 'Enrolled', '2001-03-15', 3.6, 'Computer Science'),
            ('MariaG', 'Digital Innovation in Silicon Valley', 'Withdrawn', '2002-07-22', 3.9, 'Computer Science'),
            ('DavidK', 'Ancient Philosophy in Athens', 'Canceled', '2001-12-01', 3.7, 'Philosophy'),
            ('SarahJ', 'Sustainable Agriculture in New Zealand', 'Enrolled', '2003-02-10', 3.5, 'Environmental Science'),
            ('MohammedA', 'Sustainable Agriculture in New Zealand', 'Withdrawn', '2002-09-30', 3.4, 'Agricultural Science'),
            ('PriyaP', 'Journalism in New York City', 'Enrolled', '2003-03-14', 3.8, 'Journalism'),
            ('LucasS', 'Journalism in New York City', 'Canceled', '2001-11-25', 3.6, 'Communications'),
            ('NinaW', 'Journalism in New York City', 'Withdrawn', '2003-06-17', 3.7, 'Media Studies'),
            ('TomA', 'Sustainable Agriculture in New Zealand', 'Enrolled', '2002-04-20', 3.9, 'Environmental Science'),
            
            # Current Programs (Spring 2025)
            ('EmmaW', 'European Politics Tour', 'Enrolled', '2002-05-10', 3.8, 'Political Science'),
            ('JamesC', 'Wildlife Conservation in Kenya', 'Enrolled', '2001-03-15', 3.6, 'Environmental Science'),
            ('MariaG', 'European Politics Tour', 'Withdrawn', '2002-07-22', 3.9, 'Political Science'),
            ('DavidK', 'Wildlife Conservation in Kenya', 'Canceled', '2001-12-01', 3.7, 'Biology'),
            ('SarahJ', 'European Politics Tour', 'Enrolled', '2003-02-10', 3.5, 'International Relations'),
            ('MohammedA', 'Film Production in Los Angeles', 'Enrolled', '2002-09-30', 3.4, 'Film Studies'),
            ('PriyaP', 'Film Production in Los Angeles', 'Withdrawn', '2003-03-14', 3.8, 'Media Arts'),
            ('LucasS', 'Robotics Research in Seoul', 'Enrolled', '2001-11-25', 3.6, 'Robotics Engineering'),
            ('NinaW', 'Robotics Research in Seoul', 'Enrolled', '2003-06-17', 3.7, 'Computer Engineering'),
            ('TomA', 'Film Production in Los Angeles', 'Canceled', '2002-04-20', 3.9, 'Film Production'),
            
            # Summer 2025 Programs (Currently Open)
            ('EmmaW', 'Marine Biology in Great Barrier Reef', 'Enrolled', '2002-05-10', 3.8, 'Marine Biology'),
            ('JamesC', 'Art and Architecture in Florence', 'Applied', '2001-03-15', 3.6, 'Art History'),
            ('MariaG', 'Global Health in Cape Town', 'Applied', '2002-07-22', 3.9, 'Public Health'),
            ('DavidK', 'Marine Biology in Great Barrier Reef', 'Withdrawn', '2001-12-01', 3.7, 'Biology'),
            ('SarahJ', 'Art and Architecture in Florence', 'Applied', '2003-02-10', 3.5, 'Art History'),
            ('MohammedA', 'Global Health in Cape Town', 'Applied', '2002-09-30', 3.4, 'Pre-Med'),
            ('PriyaP', 'Marine Biology in Great Barrier Reef', 'Applied', '2003-03-14', 3.8, 'Marine Biology'),
            ('LucasS', 'Art and Architecture in Florence', 'Withdrawn', '2001-11-25', 3.6, 'Architecture'),
            ('NinaW', 'Global Health in Cape Town', 'Canceled', '2003-06-17', 3.7, 'Biology'),
            ('TomA', 'Culinary Arts in Paris', 'Applied', '2002-04-20', 3.9, 'Culinary Arts'),
            ('EmmaW', 'Music Performance in Vienna', 'Applied', '2002-05-10', 3.8, 'Music Performance'),
            ('JamesC', 'Culinary Arts in Paris', 'Withdrawn', '2001-03-15', 3.6, 'Hospitality'),
            ('MariaG', 'Music Performance in Vienna', 'Applied', '2002-07-22', 3.9, 'Music'),
            ('DavidK', 'Culinary Arts in Paris', 'Applied', '2001-12-01', 3.7, 'Culinary Arts'),
            ('SarahJ', 'Music Performance in Vienna', 'Canceled', '2003-02-10', 3.5, 'Music Education'),
            
            # Fall 2025 Programs (Currently Open)
            ('EmmaW', 'Technology Innovation in Tokyo', 'Withdrawn', '2002-05-10', 3.8, 'Computer Science'),
            ('EmmaW', 'Sustainable Engineering in Stockholm', 'Canceled', '2002-05-10', 3.8, 'Computer Science'),
            ('JamesC', 'Sustainable Engineering in Stockholm', 'Applied', '2001-03-15', 3.6, 'Engineering'),
            ('MariaG', 'Global Business in Singapore', 'Applied', '2002-07-22', 3.9, 'Business Administration'),
            ('DavidK', 'Technology Innovation in Tokyo', 'Withdrawn', '2001-12-01', 3.7, 'Computer Engineering'),
            ('SarahJ', 'Sustainable Engineering in Stockholm', 'Applied', '2003-02-10', 3.5, 'Environmental Engineering'),
            ('MohammedA', 'Global Business in Singapore', 'Applied', '2002-09-30', 3.4, 'Business Administration'),
            ('PriyaP', 'Technology Innovation in Tokyo', 'Applied', '2003-03-14', 3.8, 'Computer Science'),
            ('LucasS', 'Sustainable Engineering in Stockholm', 'Withdrawn', '2001-11-25', 3.6, 'Engineering'),
            ('NinaW', 'Global Business in Singapore', 'Canceled', '2003-06-17', 3.7, 'International Business'),
            ('TomA', 'Psychology Research in Copenhagen', 'Applied', '2002-04-20', 3.9, 'Psychology'),
            ('EmmaW', 'Urban Design in Barcelona', 'Applied', '2002-05-10', 3.8, 'Architecture'),
            ('JamesC', 'Psychology Research in Copenhagen', 'Withdrawn', '2001-03-15', 3.6, 'Psychology'),
            ('MariaG', 'Urban Design in Barcelona', 'Applied', '2002-07-22', 3.9, 'Urban Planning'),
            ('DavidK', 'Psychology Research in Copenhagen', 'Applied', '2001-12-01', 3.7, 'Psychology'),
            ('SarahJ', 'Urban Design in Barcelona', 'Canceled', '2003-02-10', 3.5, 'Architecture'),
        ]

        # Clear existing applications and questions
        Application.objects.all().delete()
        ApplicationQuestion.objects.all().delete()
        self.stdout.write('Cleared existing applications and questions')

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

                # Add program-specific questions and responses
                if program_title == 'Antarctic Research Expedition':
                    question = ApplicationQuestion.objects.create(
                        program=program,
                        text="Why do you want to participate in this research expedition? What relevant experience do you have?",
                        is_required=True
                    )
                    ApplicationResponse.objects.create(
                        application=application,
                        question=question,
                        response="I am passionate about studying polar ecosystems and their impact on global climate. I have previous research experience in climate science and field work in extreme environments."
                    )
                elif program_title == 'Technology Innovation in Tokyo':
                    question = ApplicationQuestion.objects.create(
                        program=program,
                        text="What specific areas of Japanese technology innovation interest you most?",
                        is_required=True
                    )
                    ApplicationResponse.objects.create(
                        application=application,
                        question=question,
                        response="I am particularly interested in Japan's advancements in robotics and artificial intelligence. I want to learn how cultural factors influence technological innovation."
                    )
                elif program_title == 'Global Health in Cape Town':
                    question = ApplicationQuestion.objects.create(
                        program=program,
                        text="How do you plan to apply your public health experience from this program in your future career?",
                        is_required=True
                    )
                    ApplicationResponse.objects.create(
                        application=application,
                        question=question,
                        response="I plan to work in international healthcare policy, focusing on improving healthcare access in developing regions. This program will provide valuable firsthand experience."
                    )
                elif program_title == 'Space Science in Houston':
                    question = ApplicationQuestion.objects.create(
                        program=program,
                        text="What aspects of space science most interest you, and how will this program help your career goals?",
                        is_required=True
                    )
                    ApplicationResponse.objects.create(
                        application=application,
                        question=question,
                        response="I am fascinated by space exploration and want to work on future Mars missions. This program will give me hands-on experience with NASA's technologies and methodologies."
                    )
                elif program_title == 'Game Design in Montreal':
                    question = ApplicationQuestion.objects.create(
                        program=program,
                        text="What type of games do you want to create, and what experience do you have in game development?",
                        is_required=True
                    )
                    ApplicationResponse.objects.create(
                        application=application,
                        question=question,
                        response="I am interested in creating educational games that make learning fun and accessible. I have experience with Unity and have developed several small indie games."
                    )

            except (User.DoesNotExist, Program.DoesNotExist) as e:
                self.stdout.write(self.style.ERROR(f'Error creating application: {str(e)}'))
