from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import Program
from datetime import timedelta

class Command(BaseCommand):
    help = 'Creates test programs with various scenarios'

    def handle(self, *args, **options):
        today = timezone.now().date()
        
        # Note: Dr. Smith appears in multiple programs
        programs_data = [
            # Currently open programs
            {
                'title': 'Technology Innovation in Tokyo',
                'year_semester': '2025 Fall',
                'faculty_leads': 'Dr. Smith, Prof. Tanaka',
                'description': 'Explore the intersection of traditional culture and cutting-edge technology in Japan\'s bustling capital.',
                'application_open_date': today - timedelta(days=10),
                'application_deadline': today + timedelta(days=45),
                'start_date': today + timedelta(days=180),
                'end_date': today + timedelta(days=270)
            },
            {
                'title': 'Sustainable Engineering in Stockholm',
                'year_semester': '2025 Fall',
                'faculty_leads': 'Dr. Smith, Dr. Anderson',
                'description': 'Learn about sustainable engineering practices and renewable energy solutions in one of the world\'s greenest cities.',
                'application_open_date': today - timedelta(days=5),
                'application_deadline': today + timedelta(days=60),
                'start_date': today + timedelta(days=200),
                'end_date': today + timedelta(days=290)
            },
            # Future program (applications not yet open)
            {
                'title': 'Ancient Philosophy in Athens',
                'year_semester': '2026 Spring',
                'faculty_leads': 'Prof. Papadopoulos',
                'description': 'Study ancient Greek philosophy where it all began. Visit historical sites and engage with contemporary scholars.',
                'application_open_date': today + timedelta(days=90),
                'application_deadline': today + timedelta(days=150),
                'start_date': today + timedelta(days=400),
                'end_date': today + timedelta(days=490)
            },
            # Program with imminent deadline
            {
                'title': 'Marine Biology in Great Barrier Reef',
                'year_semester': '2025 Summer',
                'faculty_leads': 'Dr. Ocean, Dr. Marine',
                'description': 'Study marine ecosystems and conservation efforts in the world\'s largest coral reef system.',
                'application_open_date': today - timedelta(days=25),
                'application_deadline': today + timedelta(days=5),
                'start_date': today + timedelta(days=120),
                'end_date': today + timedelta(days=150)
            },
            # Short intensive program
            {
                'title': 'Art and Architecture in Florence',
                'year_semester': '2025 Summer',
                'faculty_leads': 'Prof. Rossi, Dr. Smith',
                'description': 'Intensive four-week program studying Renaissance art and architecture in the heart of Tuscany.',
                'application_open_date': today - timedelta(days=15),
                'application_deadline': today + timedelta(days=30),
                'start_date': today + timedelta(days=150),
                'end_date': today + timedelta(days=178)
            },
            # Long-term program
            {
                'title': 'Global Business in Singapore',
                'year_semester': '2025-2026',
                'faculty_leads': 'Dr. Lee, Prof. Chen',
                'description': 'Year-long program studying international business in Asia\'s leading financial hub.',
                'application_open_date': today - timedelta(days=30),
                'application_deadline': today + timedelta(days=90),
                'start_date': today + timedelta(days=180),
                'end_date': today + timedelta(days=545)
            },
            # Program starting very soon
            {
                'title': 'Wildlife Conservation in Kenya',
                'year_semester': '2025 Spring',
                'faculty_leads': 'Dr. Kimani, Dr. Wildlife',
                'description': 'Hands-on experience in wildlife conservation and ecosystem management.',
                'application_open_date': today - timedelta(days=60),
                'application_deadline': today - timedelta(days=10),
                'start_date': today + timedelta(days=20),
                'end_date': today + timedelta(days=110)
            },
            # Multiple faculty program
            {
                'title': 'European Politics Tour',
                'year_semester': '2025 Fall',
                'faculty_leads': 'Dr. Schmidt, Prof. Martin, Dr. Bernard, Prof. Garcia',
                'description': 'Study European politics while traveling through Brussels, Berlin, Paris, and Madrid.',
                'application_open_date': today - timedelta(days=5),
                'application_deadline': today + timedelta(days=75),
                'start_date': today + timedelta(days=200),
                'end_date': today + timedelta(days=290)
            },
            # Far future program
            {
                'title': 'Antarctic Research Expedition',
                'year_semester': '2026 Summer',
                'faculty_leads': 'Dr. Frost, Prof. Ice',
                'description': 'Unique opportunity to conduct environmental research in Antarctica.',
                'application_open_date': today + timedelta(days=180),
                'application_deadline': today + timedelta(days=270),
                'start_date': today + timedelta(days=540),
                'end_date': today + timedelta(days=600)
            },
            # Program with rolling admissions
            {
                'title': 'Digital Innovation in Silicon Valley',
                'year_semester': '2025 Fall',
                'faculty_leads': 'Dr. Smith, Prof. Tech',
                'description': 'Immersive experience in technology entrepreneurship and innovation.',
                'application_open_date': today - timedelta(days=30),
                'application_deadline': today + timedelta(days=120),
                'start_date': today + timedelta(days=240),
                'end_date': today + timedelta(days=330)
            }
        ]

        for program_data in programs_data:
            program = Program.objects.create(**program_data)
            self.stdout.write(f'Created program: {program.title}')
