"""
Study Abroad Program - Test Programs Creation Command
===============================================
To run this use docker compose exec backend python manage.py add_test_programs

This Django management command creates a diverse set of test study abroad programs
with various scenarios to simulate real-world program offerings and timelines.
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
            # Currently Open Programs - Fall 2025
            {
                'title': 'Technology Innovation in Tokyo',
                'year_semester': '2025 Fall',
                'faculty_leads': 'Dr. Sarah Chen, Prof. Hiroshi Tanaka',
                'description': 'Explore the intersection of traditional culture and cutting-edge technology in Japan\'s bustling capital. Work with leading tech companies and experience Japanese innovation firsthand.',
                'application_open_date': today - timedelta(days=10),
                'application_deadline': today + timedelta(days=45),
                'start_date': today + timedelta(days=180),
                'end_date': today + timedelta(days=270)
            },
            {
                'title': 'Sustainable Engineering in Stockholm',
                'year_semester': '2025 Fall',
                'faculty_leads': 'Dr. Erik Anderson, Dr. Maria Nilsson',
                'description': 'Study renewable energy solutions and sustainable urban planning in one of the world\'s greenest cities. Includes visits to leading clean tech companies and research facilities.',
                'application_open_date': today - timedelta(days=5),
                'application_deadline': today + timedelta(days=60),
                'start_date': today + timedelta(days=200),
                'end_date': today + timedelta(days=290)
            },
            {
                'title': 'Business Innovation in Singapore',
                'year_semester': '2025 Fall',
                'faculty_leads': 'Prof. Michael Chang, Dr. Lisa Tan',
                'description': 'Gain insights into Asian business practices and innovation ecosystems. Work directly with startups and established companies in Singapore\'s dynamic business environment.',
                'application_open_date': today - timedelta(days=15),
                'application_deadline': today + timedelta(days=30),
                'start_date': today + timedelta(days=190),
                'end_date': today + timedelta(days=280)
            },
            {
                'title': 'Film and Media Studies in Mumbai',
                'year_semester': '2025 Fall',
                'faculty_leads': 'Prof. Priya Sharma, Dr. James Director',
                'description': 'Experience the vibrant world of Bollywood and Indian cinema. Learn about film production, storytelling techniques, and the impact of media on society.',
                'application_open_date': today - timedelta(days=12),
                'application_deadline': today + timedelta(days=40),
                'start_date': today + timedelta(days=185),
                'end_date': today + timedelta(days=275)
            },
            {
                'title': 'Urban Planning in Barcelona',
                'year_semester': '2025 Fall',
                'faculty_leads': 'Dr. Carlos Martinez, Prof. Anna Urban',
                'description': 'Study innovative urban design and architecture in one of Europe\'s most dynamic cities. Focus on sustainable city planning and historical preservation.',
                'application_open_date': today - timedelta(days=8),
                'application_deadline': today + timedelta(days=50),
                'start_date': today + timedelta(days=195),
                'end_date': today + timedelta(days=285)
            },
            
            # Summer 2025 Programs
            {
                'title': 'Marine Biology in Great Barrier Reef',
                'year_semester': '2025 Summer',
                'faculty_leads': 'Dr. Rachel Ocean, Prof. James Coral',
                'description': 'Study marine ecosystems and conservation efforts in the world\'s largest coral reef system. Includes diving certification and hands-on research projects.',
                'application_open_date': today - timedelta(days=25),
                'application_deadline': today + timedelta(days=5),
                'start_date': today + timedelta(days=120),
                'end_date': today + timedelta(days=150)
            },
            {
                'title': 'Art and Architecture in Florence',
                'year_semester': '2025 Summer',
                'faculty_leads': 'Prof. Isabella Romano, Dr. Robert Art',
                'description': 'Immerse yourself in Renaissance art and architecture. Study in historic studios and visit world-renowned museums and architectural sites.',
                'application_open_date': today - timedelta(days=20),
                'application_deadline': today + timedelta(days=10),
                'start_date': today + timedelta(days=130),
                'end_date': today + timedelta(days=160)
            },
            {
                'title': 'Global Health in Cape Town',
                'year_semester': '2025 Summer',
                'faculty_leads': 'Dr. Samuel Health, Prof. Nomvula Mbeki',
                'description': 'Study healthcare systems and public health challenges in South Africa. Work with local clinics and healthcare professionals.',
                'application_open_date': today - timedelta(days=30),
                'application_deadline': today + timedelta(days=15),
                'start_date': today + timedelta(days=140),
                'end_date': today + timedelta(days=170)
            },
            {
                'title': 'Archaeology in Petra',
                'year_semester': '2025 Summer',
                'faculty_leads': 'Dr. Ahmed Hassan, Prof. Lucy Stones',
                'description': 'Participate in active archaeological digs and study ancient civilizations in Jordan. Learn excavation techniques and artifact preservation.',
                'application_open_date': today - timedelta(days=22),
                'application_deadline': today + timedelta(days=8),
                'start_date': today + timedelta(days=135),
                'end_date': today + timedelta(days=165)
            },
            {
                'title': 'Culinary Arts in Paris',
                'year_semester': '2025 Summer',
                'faculty_leads': 'Chef Marie Laurent, Prof. John Taste',
                'description': 'Master French culinary techniques and food culture. Study at prestigious cooking schools and visit local markets and restaurants.',
                'application_open_date': today - timedelta(days=18),
                'application_deadline': today + timedelta(days=12),
                'start_date': today + timedelta(days=125),
                'end_date': today + timedelta(days=155)
            },
            
            # Spring 2026 Programs
            {
                'title': 'Ancient Philosophy in Athens',
                'year_semester': '2026 Spring',
                'faculty_leads': 'Prof. Elena Papadopoulos, Dr. Marcus Wisdom',
                'description': 'Study ancient Greek philosophy where it all began. Visit historical sites and engage with contemporary scholars in philosophical discussions.',
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
                'title': 'Digital Innovation in Berlin',
                'year_semester': '2026 Spring',
                'faculty_leads': 'Prof. Hans Schmidt, Dr. Tech Innovation',
                'description': 'Experience Berlin\'s thriving tech scene and startup ecosystem. Work on projects with local tech companies and attend industry events.',
                'application_open_date': today + timedelta(days=95),
                'application_deadline': today + timedelta(days=155),
                'start_date': today + timedelta(days=420),
                'end_date': today + timedelta(days=510)
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
                'title': 'Game Development in Seoul',
                'year_semester': '2026 Spring',
                'faculty_leads': 'Dr. Gaming Pro, Prof. Virtual Reality',
                'description': 'Learn game development and esports management in Korea\'s gaming hub. Collaborate with leading gaming companies and attend gaming conventions.',
                'application_open_date': today + timedelta(days=92),
                'application_deadline': today + timedelta(days=152),
                'start_date': today + timedelta(days=425),
                'end_date': today + timedelta(days=515)
            },
            
            # Past Programs (for testing history)
            {
                'title': 'Finance and Economics in London',
                'year_semester': '2024 Fall',
                'faculty_leads': 'Dr. William Money, Prof. Elizabeth Banks',
                'description': 'Study global finance in one of the world\'s leading financial centers. Includes visits to the London Stock Exchange and major financial institutions.',
                'application_open_date': today - timedelta(days=300),
                'application_deadline': today - timedelta(days=240),
                'start_date': today - timedelta(days=150),
                'end_date': today - timedelta(days=60)
            },
            {
                'title': 'Artificial Intelligence in Montreal',
                'year_semester': '2024 Fall',
                'faculty_leads': 'Dr. AI Expert, Prof. Machine Learning',
                'description': 'Study at one of the world\'s leading AI research hubs. Work on cutting-edge projects and attend industry conferences.',
                'application_open_date': today - timedelta(days=290),
                'application_deadline': today - timedelta(days=230),
                'start_date': today - timedelta(days=140),
                'end_date': today - timedelta(days=50)
            },
            {
                'title': 'Renewable Energy in Dubai',
                'year_semester': '2024 Fall',
                'faculty_leads': 'Dr. Solar Power, Prof. Green Energy',
                'description': 'Study sustainable energy solutions in a rapidly developing city. Visit solar farms and work on renewable energy projects.',
                'application_open_date': today - timedelta(days=295),
                'application_deadline': today - timedelta(days=235),
                'start_date': today - timedelta(days=145),
                'end_date': today - timedelta(days=55)
            }
        ]

        # Create each program in the database
        for program_data in programs_data:
            program = Program.objects.create(**program_data)
            self.stdout.write(f'Created program: {program.title} ({program.year_semester})')
