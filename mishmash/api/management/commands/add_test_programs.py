"""
Study Abroad Program - Test Programs Creation Command
===============================================
To run this use docker compose exec backend python manage.py add_test_programs

This Django management command creates a diverse set of test study abroad programs
with various scenarios to simulate real-world program offerings and timelines.

Program States:
- Past Programs: Already completed
- Current Programs: Currently running
- Future Programs: Not yet started
- Open Applications: Currently accepting applications
- Closed Applications: Application deadline passed
- Upcoming Applications: Not yet open for applications
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
        programs_data = [
            # Past Programs (Fall 2024)
            {
                'title': 'Ancient Philosophy in Athens',
                'year_semester': '2024 Fall',
                'faculty_leads': 'Prof. Elena Papadopoulos, Dr. Marcus Wisdom',
                'description': 'Study ancient Greek philosophy where it all began. Visit historical sites and engage with contemporary scholars in philosophical discussions.',
                'application_open_date': today - timedelta(days=300),
                'application_deadline': today - timedelta(days=240),
                'start_date': today - timedelta(days=180),
                'end_date': today - timedelta(days=90)
            },
            {
                'title': 'Digital Innovation in Silicon Valley',
                'year_semester': '2024 Fall',
                'faculty_leads': 'Dr. Tech Expert, Prof. Innovation Leader',
                'description': 'Experience Silicon Valley\'s thriving tech scene and startup ecosystem. Work on projects with local tech companies and attend industry events.',
                'application_open_date': today - timedelta(days=310),
                'application_deadline': today - timedelta(days=250),
                'start_date': today - timedelta(days=190),
                'end_date': today - timedelta(days=100)
            },
            {
                'title': 'Sustainable Agriculture in New Zealand',
                'year_semester': '2024 Fall',
                'faculty_leads': 'Dr. Farm Expert, Prof. Sustainable Practices',
                'description': 'Study sustainable farming practices and agricultural innovation in New Zealand. Work with local farmers and research sustainable methods.',
                'application_open_date': today - timedelta(days=305),
                'application_deadline': today - timedelta(days=245),
                'start_date': today - timedelta(days=185),
                'end_date': today - timedelta(days=95)
            },
            {
                'title': 'Journalism in New York City',
                'year_semester': '2024 Fall',
                'faculty_leads': 'Prof. Media Expert, Dr. Journalism Pro',
                'description': 'Experience journalism in the media capital of the world. Work with leading news organizations and learn modern digital journalism.',
                'application_open_date': today - timedelta(days=315),
                'application_deadline': today - timedelta(days=255),
                'start_date': today - timedelta(days=195),
                'end_date': today - timedelta(days=105)
            },
            
            # Currently Running Programs (Spring 2025)
            {
                'title': 'European Politics Tour',
                'year_semester': '2025 Spring',
                'faculty_leads': 'Dr. Euro Expert, Prof. Political Science',
                'description': 'Travel through major European capitals studying political systems and international relations. Meet with government officials and policy makers.',
                'application_open_date': today - timedelta(days=150),
                'application_deadline': today - timedelta(days=90),
                'start_date': today - timedelta(days=30),
                'end_date': today + timedelta(days=60)
            },
            {
                'title': 'Wildlife Conservation in Kenya',
                'year_semester': '2025 Spring',
                'faculty_leads': 'Dr. Nature Expert, Prof. Wildlife Studies',
                'description': 'Study wildlife conservation and ecological preservation in Kenya\'s national parks. Work with local conservation experts and research teams.',
                'application_open_date': today - timedelta(days=160),
                'application_deadline': today - timedelta(days=100),
                'start_date': today - timedelta(days=40),
                'end_date': today + timedelta(days=50)
            },
            {
                'title': 'Film Production in Los Angeles',
                'year_semester': '2025 Spring',
                'faculty_leads': 'Prof. Cinema Arts, Dr. Film Studies',
                'description': 'Learn film production in Hollywood. Work on actual film sets and learn from industry professionals.',
                'application_open_date': today - timedelta(days=155),
                'application_deadline': today - timedelta(days=95),
                'start_date': today - timedelta(days=35),
                'end_date': today + timedelta(days=55)
            },
            {
                'title': 'Robotics Research in Seoul',
                'year_semester': '2025 Spring',
                'faculty_leads': 'Dr. Robotics Expert, Prof. AI Science',
                'description': 'Study advanced robotics in South Korea\'s tech hub. Work with leading robotics companies and research labs.',
                'application_open_date': today - timedelta(days=165),
                'application_deadline': today - timedelta(days=105),
                'start_date': today - timedelta(days=45),
                'end_date': today + timedelta(days=45)
            },
            
            # Currently Open for Applications (Summer 2025)
            {
                'title': 'Marine Biology in Great Barrier Reef',
                'year_semester': '2025 Summer',
                'faculty_leads': 'Dr. Rachel Ocean, Prof. James Coral',
                'description': 'Study marine ecosystems and conservation efforts in the world\'s largest coral reef system. Includes diving certification and hands-on research projects.',
                'application_open_date': today - timedelta(days=25),
                'application_deadline': today + timedelta(days=35),
                'start_date': today + timedelta(days=120),
                'end_date': today + timedelta(days=150)
            },
            {
                'title': 'Art and Architecture in Florence',
                'year_semester': '2025 Summer',
                'faculty_leads': 'Prof. Isabella Romano, Dr. Robert Art',
                'description': 'Immerse yourself in Renaissance art and architecture. Study in historic studios and visit world-renowned museums and architectural sites.',
                'application_open_date': today - timedelta(days=20),
                'application_deadline': today + timedelta(days=40),
                'start_date': today + timedelta(days=130),
                'end_date': today + timedelta(days=160)
            },
            {
                'title': 'Global Health in Cape Town',
                'year_semester': '2025 Summer',
                'faculty_leads': 'Dr. Samuel Health, Prof. Nomvula Mbeki',
                'description': 'Study healthcare systems and public health challenges in South Africa. Work with local clinics and healthcare professionals.',
                'application_open_date': today - timedelta(days=30),
                'application_deadline': today + timedelta(days=30),
                'start_date': today + timedelta(days=140),
                'end_date': today + timedelta(days=170)
            },
            {
                'title': 'Culinary Arts in Paris',
                'year_semester': '2025 Summer',
                'faculty_leads': 'Chef Marie Laurent, Prof. Gastronomy',
                'description': 'Master French culinary techniques and food culture. Study at prestigious cooking schools and visit local markets.',
                'application_open_date': today - timedelta(days=15),
                'application_deadline': today + timedelta(days=45),
                'start_date': today + timedelta(days=125),
                'end_date': today + timedelta(days=155)
            },
            {
                'title': 'Music Performance in Vienna',
                'year_semester': '2025 Summer',
                'faculty_leads': 'Maestro Classical, Dr. Music History',
                'description': 'Study classical music in the heart of Europe. Perform in historic venues and learn from world-class musicians.',
                'application_open_date': today - timedelta(days=18),
                'application_deadline': today + timedelta(days=42),
                'start_date': today + timedelta(days=128),
                'end_date': today + timedelta(days=158)
            },
            
            # Currently Open for Applications (Fall 2025)
            {
                'title': 'Technology Innovation in Tokyo',
                'year_semester': '2025 Fall',
                'faculty_leads': 'Dr. Sarah Chen, Prof. Hiroshi Tanaka',
                'description': 'Explore the intersection of traditional culture and cutting-edge technology in Japan\'s bustling capital. Work with leading tech companies and experience Japanese innovation firsthand.',
                'application_open_date': today - timedelta(days=10),
                'application_deadline': today + timedelta(days=80),
                'start_date': today + timedelta(days=180),
                'end_date': today + timedelta(days=270)
            },
            {
                'title': 'Sustainable Engineering in Stockholm',
                'year_semester': '2025 Fall',
                'faculty_leads': 'Dr. Erik Anderson, Dr. Maria Nilsson',
                'description': 'Study renewable energy solutions and sustainable urban planning in one of the world\'s greenest cities. Includes visits to leading clean tech companies and research facilities.',
                'application_open_date': today - timedelta(days=5),
                'application_deadline': today + timedelta(days=85),
                'start_date': today + timedelta(days=200),
                'end_date': today + timedelta(days=290)
            },
            {
                'title': 'Global Business in Singapore',
                'year_semester': '2025 Fall',
                'faculty_leads': 'Prof. Michael Chang, Dr. Lisa Tan',
                'description': 'Gain insights into Asian business practices and innovation ecosystems. Work directly with startups and established companies in Singapore\'s dynamic business environment.',
                'application_open_date': today - timedelta(days=15),
                'application_deadline': today + timedelta(days=75),
                'start_date': today + timedelta(days=190),
                'end_date': today + timedelta(days=280)
            },
            {
                'title': 'Psychology Research in Copenhagen',
                'year_semester': '2025 Fall',
                'faculty_leads': 'Dr. Mind Expert, Prof. Behavioral Science',
                'description': 'Study advanced psychological research methods in Denmark. Work with leading research institutions on cutting-edge studies.',
                'application_open_date': today - timedelta(days=8),
                'application_deadline': today + timedelta(days=82),
                'start_date': today + timedelta(days=185),
                'end_date': today + timedelta(days=275)
            },
            {
                'title': 'Urban Design in Barcelona',
                'year_semester': '2025 Fall',
                'faculty_leads': 'Prof. Architecture Master, Dr. Urban Planning',
                'description': 'Study urban design and architecture in one of Europe\'s most innovative cities. Work on real urban development projects.',
                'application_open_date': today - timedelta(days=12),
                'application_deadline': today + timedelta(days=78),
                'start_date': today + timedelta(days=188),
                'end_date': today + timedelta(days=278)
            },
            
            # Future Programs - Not Yet Open for Applications (Spring 2026)
            {
                'title': 'Antarctic Research Expedition',
                'year_semester': '2026 Spring',
                'faculty_leads': 'Dr. Ice Expert, Prof. Polar Science',
                'description': 'Conduct research in Antarctica studying climate change, marine biology, and glaciology. Work alongside international research teams in extreme conditions.',
                'application_open_date': today + timedelta(days=90),
                'application_deadline': today + timedelta(days=150),
                'start_date': today + timedelta(days=400),
                'end_date': today + timedelta(days=490)
            },
            {
                'title': 'Environmental Science in Costa Rica',
                'year_semester': '2026 Spring',
                'faculty_leads': 'Dr. Carlos Verde, Prof. Emma Nature',
                'description': 'Study tropical ecosystems and biodiversity conservation. Conduct field research in rainforests and participate in local conservation projects.',
                'application_open_date': today + timedelta(days=85),
                'application_deadline': today + timedelta(days=145),
                'start_date': today + timedelta(days=410),
                'end_date': today + timedelta(days=500)
            },
            {
                'title': 'Fashion Design in Milan',
                'year_semester': '2026 Spring',
                'faculty_leads': 'Prof. Giulia Fashion, Dr. Style Expert',
                'description': 'Study fashion design and industry practices in one of the world\'s fashion capitals. Work with leading designers and attend Milan Fashion Week.',
                'application_open_date': today + timedelta(days=88),
                'application_deadline': today + timedelta(days=148),
                'start_date': today + timedelta(days=415),
                'end_date': today + timedelta(days=505)
            },
            {
                'title': 'Space Science in Houston',
                'year_semester': '2026 Spring',
                'faculty_leads': 'Dr. Astronomy Expert, Prof. Space Science',
                'description': 'Study space science and astronomy at NASA\'s Johnson Space Center. Work with space scientists and learn about space exploration.',
                'application_open_date': today + timedelta(days=92),
                'application_deadline': today + timedelta(days=152),
                'start_date': today + timedelta(days=420),
                'end_date': today + timedelta(days=510)
            },
            {
                'title': 'Game Design in Montreal',
                'year_semester': '2026 Spring',
                'faculty_leads': 'Prof. Game Dev, Dr. Interactive Media',
                'description': 'Study game design and development in one of the world\'s leading gaming hubs. Work with major gaming studios on real projects.',
                'application_open_date': today + timedelta(days=95),
                'application_deadline': today + timedelta(days=155),
                'start_date': today + timedelta(days=425),
                'end_date': today + timedelta(days=515)
            }
        ]

        # Clear existing programs
        Program.objects.all().delete()
        self.stdout.write('Cleared existing programs')

        # Create new programs
        for program_data in programs_data:
            program = Program.objects.create(**program_data)
            self.stdout.write(f'Created program: {program.title} ({program.year_semester})')
