"""
Study Abroad Program - Test Programs Creation Command
===============================================
To run this use docker compose exec backend python manage.py add_test_programs

This Django management command creates a diverse set of test study abroad programs
with various scenarios to simulate real-world program offerings and timelines.

Features:
- Creates programs with different application windows
- Simulates various program durations (short-term to year-long)
- Includes programs in different phases (future, current, past deadline)
- Sets up realistic faculty assignments and program descriptions
- Uses relative dates based on current date for testing

Program Scenarios:
1. Currently open programs
2. Future programs (not yet open)
3. Programs with imminent deadlines
4. Short intensive programs
5. Long-term programs
6. Programs starting very soon
7. Multiple faculty programs
8. Far future programs
9. Rolling admissions programs

Usage:
    python manage.py add_test_programs

Note: This command uses relative dates based on the current date to ensure
      programs are always in appropriate phases for testing.

Related Models:
- Program: Study abroad program model with all program details
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import Program
from datetime import timedelta

class Command(BaseCommand):
    help = 'Creates test programs with various scenarios'

    def handle(self, *args, **options):
        # Use current date as reference point for all program dates
        today = timezone.now().date()
        
        # Define program data with various scenarios and timelines
        # Note: Dr. Smith appears in multiple programs to simulate faculty teaching multiple courses
        programs_data = [
            # Currently open programs - Active application period
            {
                'title': 'Technology Innovation in Tokyo',
                'year_semester': '2025 Fall',
                'faculty_leads': 'Dr. Smith, Prof. Tanaka',
                'description': 'Explore the intersection of traditional culture and cutting-edge technology in Japan\'s bustling capital.',
                'application_open_date': today - timedelta(days=10),  # Opened recently
                'application_deadline': today + timedelta(days=45),   # Plenty of time to apply
                'start_date': today + timedelta(days=180),           # Starts in 6 months
                'end_date': today + timedelta(days=270)              # 3-month program
            },
            {
                'title': 'Sustainable Engineering in Stockholm',
                'year_semester': '2025 Fall',
                'faculty_leads': 'Dr. Smith, Dr. Anderson',
                'description': 'Learn about sustainable engineering practices and renewable energy solutions in one of the world\'s greenest cities.',
                'application_open_date': today - timedelta(days=5),   # Just opened
                'application_deadline': today + timedelta(days=60),   # 2-month application window
                'start_date': today + timedelta(days=200),           # Starts in ~6.5 months
                'end_date': today + timedelta(days=290)              # 3-month program
            },
            # Future program - Applications not yet open
            {
                'title': 'Ancient Philosophy in Athens',
                'year_semester': '2026 Spring',
                'faculty_leads': 'Prof. Papadopoulos',
                'description': 'Study ancient Greek philosophy where it all began. Visit historical sites and engage with contemporary scholars.',
                'application_open_date': today + timedelta(days=90),  # Opens in 3 months
                'application_deadline': today + timedelta(days=150),  # 2-month application window
                'start_date': today + timedelta(days=400),           # Starts in ~13 months
                'end_date': today + timedelta(days=490)              # 3-month program
            },
            # Program with imminent deadline - Testing urgent application scenarios
            {
                'title': 'Marine Biology in Great Barrier Reef',
                'year_semester': '2025 Summer',
                'faculty_leads': 'Dr. Ocean, Dr. Marine',
                'description': 'Study marine ecosystems and conservation efforts in the world\'s largest coral reef system.',
                'application_open_date': today - timedelta(days=25),  # Opened a while ago
                'application_deadline': today + timedelta(days=5),    # Deadline very soon
                'start_date': today + timedelta(days=120),           # Starts in 4 months
                'end_date': today + timedelta(days=150)              # 1-month intensive
            },
            # Short intensive program - Summer session
            {
                'title': 'Art and Architecture in Florence',
                'year_semester': '2025 Summer',
                'faculty_leads': 'Prof. Rossi, Dr. Smith',
                'description': 'Intensive four-week program studying Renaissance art and architecture in the heart of Tuscany.',
                'application_open_date': today - timedelta(days=15),  # Recently opened
                'application_deadline': today + timedelta(days=30),   # 1.5-month application window
                'start_date': today + timedelta(days=150),           # Starts in 5 months
                'end_date': today + timedelta(days=178)              # 4-week intensive
            },
            # Long-term program - Full academic year
            {
                'title': 'Global Business in Singapore',
                'year_semester': '2025-2026',
                'faculty_leads': 'Dr. Lee, Prof. Chen',
                'description': 'Year-long program studying international business in Asia\'s leading financial hub.',
                'application_open_date': today - timedelta(days=30),  # Opened a month ago
                'application_deadline': today + timedelta(days=90),   # 4-month application window
                'start_date': today + timedelta(days=180),           # Starts in 6 months
                'end_date': today + timedelta(days=545)              # Full year program
            },
            # Program starting very soon - Testing late phase scenarios
            {
                'title': 'Wildlife Conservation in Kenya',
                'year_semester': '2025 Spring',
                'faculty_leads': 'Dr. Kimani, Dr. Wildlife',
                'description': 'Hands-on experience in wildlife conservation and ecosystem management.',
                'application_open_date': today - timedelta(days=60),  # Opened 2 months ago
                'application_deadline': today - timedelta(days=10),   # Recently closed
                'start_date': today + timedelta(days=20),            # Starts very soon
                'end_date': today + timedelta(days=110)              # 3-month program
            },
            # Multiple faculty program - Large teaching team
            {
                'title': 'European Politics Tour',
                'year_semester': '2025 Fall',
                'faculty_leads': 'Dr. Schmidt, Prof. Martin, Dr. Bernard, Prof. Garcia',
                'description': 'Study European politics while traveling through Brussels, Berlin, Paris, and Madrid.',
                'application_open_date': today - timedelta(days=5),   # Just opened
                'application_deadline': today + timedelta(days=75),   # 2.5-month window
                'start_date': today + timedelta(days=200),           # ~6.5 months away
                'end_date': today + timedelta(days=290)              # 3-month program
            },
            # Far future program - Long-term planning
            {
                'title': 'Antarctic Research Expedition',
                'year_semester': '2026 Summer',
                'faculty_leads': 'Dr. Frost, Prof. Ice',
                'description': 'Unique opportunity to conduct environmental research in Antarctica.',
                'application_open_date': today + timedelta(days=180), # Opens in 6 months
                'application_deadline': today + timedelta(days=270),  # 3-month window
                'start_date': today + timedelta(days=540),           # 18 months away
                'end_date': today + timedelta(days=600)              # 2-month expedition
            },
            # Program with rolling admissions - Extended application window
            {
                'title': 'Digital Innovation in Silicon Valley',
                'year_semester': '2025 Fall',
                'faculty_leads': 'Dr. Smith, Prof. Tech',
                'description': 'Immersive experience in technology entrepreneurship and innovation.',
                'application_open_date': today - timedelta(days=30),  # Opened a month ago
                'application_deadline': today + timedelta(days=120),  # 5-month window
                'start_date': today + timedelta(days=240),           # 8 months away
                'end_date': today + timedelta(days=330)              # 3-month program
            }
        ]

        # Create all programs and log success
        for program_data in programs_data:
            program = Program.objects.create(**program_data)
            self.stdout.write(f'Created program: {program.title}')
