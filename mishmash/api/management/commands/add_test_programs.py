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
from api.models import Program, ApplicationQuestion, User
from datetime import timedelta, datetime

DEFAULT_QUESTIONS = [
    "Why do you want to participate in this study abroad program?",
    "How does this program align with your academic or career goals?",
    "What challenges do you anticipate during this experience, and how will you address them?",
    "Describe a time you adapted to a new or unfamiliar environment.",
    "What unique perspective or contribution will you bring to the group?",
]

class Command(BaseCommand):
    help = 'Creates test programs with various scenarios'

    def add_arguments(self, parser):
        parser.add_argument(
            '-prod',
            action='store_true',
            help='Run in production mode, populates db with production data'
        )

    def handle(self, *args, **options):
        prod_mode = options['prod']
        today = timezone.now().date()
        
        # Get faculty users
        faculty_users = {user.display_name: user for user in User.objects.filter(is_admin=True).exclude(username='admin')}
        
        programs_data = [
            # Past Programs (Fall 2024)
            {
                'title': 'Ancient Philosophy in Athens',
                'year_semester': '2024 Fall',
                'description': 'Study ancient Greek philosophy where it all began. Visit historical sites and engage with contemporary scholars in philosophical discussions.',
                'application_open_date': today - timedelta(days=300),
                'application_deadline': today - timedelta(days=240),
                'start_date': today - timedelta(days=180),
                'end_date': today - timedelta(days=90)
            },
            {
                'title': 'Digital Innovation in Silicon Valley',
                'year_semester': '2024 Fall',
                'description': 'Experience Silicon Valley\'s thriving tech scene and startup ecosystem. Work on projects with local tech companies and attend industry events.',
                'application_open_date': today - timedelta(days=310),
                'application_deadline': today - timedelta(days=250),
                'start_date': today - timedelta(days=190),
                'end_date': today - timedelta(days=100)
            },
            {
                'title': 'Sustainable Agriculture in New Zealand',
                'year_semester': '2024 Fall',
                'description': 'Study sustainable farming practices and agricultural innovation in New Zealand. Work with local farmers and research sustainable methods.',
                'application_open_date': today - timedelta(days=305),
                'application_deadline': today - timedelta(days=245),
                'start_date': today - timedelta(days=185),
                'end_date': today - timedelta(days=95)
            },
            {
                'title': 'Journalism in New York City',
                'year_semester': '2024 Fall',
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
                'description': 'Travel through major European capitals studying political systems and international relations. Meet with government officials and policy makers.',
                'application_open_date': today - timedelta(days=150),
                'application_deadline': today - timedelta(days=90),
                'start_date': today - timedelta(days=30),
                'end_date': today + timedelta(days=60)
            },
            {
                'title': 'Wildlife Conservation in Kenya',
                'year_semester': '2025 Spring',
                'description': 'Study wildlife conservation and ecological preservation in Kenya\'s national parks. Work with local conservation experts and research teams.',
                'application_open_date': today - timedelta(days=160),
                'application_deadline': today - timedelta(days=100),
                'start_date': today - timedelta(days=40),
                'end_date': today + timedelta(days=50)
            },
            {
                'title': 'Film Production in Los Angeles',
                'year_semester': '2025 Spring',
                'description': 'Learn film production in Hollywood. Work on actual film sets and learn from industry professionals.',
                'application_open_date': today - timedelta(days=155),
                'application_deadline': today - timedelta(days=95),
                'start_date': today - timedelta(days=35),
                'end_date': today + timedelta(days=55)
            },
            {
                'title': 'Robotics Research in Seoul',
                'year_semester': '2025 Spring',
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
                'description': 'Study marine ecosystems and conservation efforts in the world\'s largest coral reef system. Includes diving certification and hands-on research projects.',
                'application_open_date': today - timedelta(days=25),
                'application_deadline': today + timedelta(days=35),
                'start_date': today + timedelta(days=120),
                'end_date': today + timedelta(days=150)
            },
            {
                'title': 'Art and Architecture in Florence',
                'year_semester': '2025 Summer',
                'description': 'Immerse yourself in Renaissance art and architecture. Study in historic studios and visit world-renowned museums and architectural sites.',
                'application_open_date': today - timedelta(days=20),
                'application_deadline': today + timedelta(days=40),
                'start_date': today + timedelta(days=130),
                'end_date': today + timedelta(days=160)
            },
            {
                'title': 'Global Health in Cape Town',
                'year_semester': '2025 Summer',
                'description': 'Study healthcare systems and public health challenges in South Africa. Work with local clinics and healthcare professionals.',
                'application_open_date': today - timedelta(days=30),
                'application_deadline': today + timedelta(days=30),
                'start_date': today + timedelta(days=140),
                'end_date': today + timedelta(days=170)
            },
            {
                'title': 'Culinary Arts in Paris',
                'year_semester': '2025 Summer',
                'description': 'Master French culinary techniques and food culture. Study at prestigious cooking schools and visit local markets.',
                'application_open_date': today - timedelta(days=15),
                'application_deadline': today + timedelta(days=45),
                'start_date': today + timedelta(days=125),
                'end_date': today + timedelta(days=155)
            },
            {
                'title': 'Music Performance in Vienna',
                'year_semester': '2025 Summer',
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
                'description': 'Explore the intersection of traditional culture and cutting-edge technology in Japan\'s bustling capital. Work with leading tech companies and experience Japanese innovation firsthand.',
                'application_open_date': today - timedelta(days=10),
                'application_deadline': today + timedelta(days=80),
                'start_date': today + timedelta(days=180),
                'end_date': today + timedelta(days=270)
            },
            {
                'title': 'Sustainable Engineering in Stockholm',
                'year_semester': '2025 Fall',
                'description': 'Study renewable energy solutions and sustainable urban planning in one of the world\'s greenest cities. Includes visits to leading clean tech companies and research facilities.',
                'application_open_date': today - timedelta(days=5),
                'application_deadline': today + timedelta(days=85),
                'start_date': today + timedelta(days=200),
                'end_date': today + timedelta(days=290)
            },
            {
                'title': 'Global Business in Singapore',
                'year_semester': '2025 Fall',
                'description': 'Gain insights into Asian business practices and innovation ecosystems. Work directly with startups and established companies in Singapore\'s dynamic business environment.',
                'application_open_date': today - timedelta(days=15),
                'application_deadline': today + timedelta(days=75),
                'start_date': today + timedelta(days=190),
                'end_date': today + timedelta(days=280)
            },
            {
                'title': 'Psychology Research in Copenhagen',
                'year_semester': '2025 Fall',
                'description': 'Study advanced psychological research methods in Denmark. Work with leading research institutions on cutting-edge studies.',
                'application_open_date': today - timedelta(days=8),
                'application_deadline': today + timedelta(days=82),
                'start_date': today + timedelta(days=185),
                'end_date': today + timedelta(days=275)
            },
            {
                'title': 'Urban Design in Barcelona',
                'year_semester': '2025 Fall',
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
                'description': 'Conduct research in Antarctica studying climate change, marine biology, and glaciology. Work alongside international research teams in extreme conditions.',
                'application_open_date': today + timedelta(days=90),
                'application_deadline': today + timedelta(days=150),
                'start_date': today + timedelta(days=400),
                'end_date': today + timedelta(days=490)
            },
            {
                'title': 'Environmental Science in Costa Rica',
                'year_semester': '2026 Spring',
                'description': 'Study tropical ecosystems and biodiversity conservation. Conduct field research in rainforests and participate in local conservation projects.',
                'application_open_date': today + timedelta(days=85),
                'application_deadline': today + timedelta(days=145),
                'start_date': today + timedelta(days=410),
                'end_date': today + timedelta(days=500)
            },
            {
                'title': 'Fashion Design in Milan',
                'year_semester': '2026 Spring',
                'description': 'Study fashion design and industry practices in one of the world\'s fashion capitals. Work with leading designers and attend Milan Fashion Week.',
                'application_open_date': today + timedelta(days=88),
                'application_deadline': today + timedelta(days=148),
                'start_date': today + timedelta(days=415),
                'end_date': today + timedelta(days=505)
            },
            {
                'title': 'Space Science in Houston',
                'year_semester': '2026 Spring',
                'description': 'Study space science and astronomy at NASA\'s Johnson Space Center. Work with space scientists and learn about space exploration.',
                'application_open_date': today + timedelta(days=92),
                'application_deadline': today + timedelta(days=152),
                'start_date': today + timedelta(days=420),
                'end_date': today + timedelta(days=510)
            },
            {
                'title': 'Game Design in Montreal',
                'year_semester': '2026 Spring',
                'description': 'Study game design and development in one of the world\'s leading gaming hubs. Work with major gaming studios on real projects.',
                'application_open_date': today + timedelta(days=95),
                'application_deadline': today + timedelta(days=155),
                'start_date': today + timedelta(days=425),
                'end_date': today + timedelta(days=515)
            }
        ]

        prod_programs_data = [
            {
                'title': 'Science in Spain',
                'year_semester': '2025 Fall',
                'description': 'Science in Spain: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.',
                'application_open_date': datetime(2024, 12, 1),
                'application_deadline': datetime(2025, 2, 28),
                'start_date': datetime(2025, 8, 18),
                'end_date': datetime(2025, 12, 28)
            },
            {
                'title': 'History in Canada',
                'year_semester': '2025 Fall',
                'description': 'History in Canada: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.',
                'application_open_date': datetime(2024, 12, 1),
                'application_deadline': datetime(2025, 2, 28),
                'start_date': datetime(2025, 8, 18),
                'end_date': datetime(2025, 12, 28)
            },
            {
                'title': 'Art in Italy',
                'year_semester': '2024 Fall',
                'description': 'Art in Italy: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.',
                'application_open_date': datetime(2023, 12, 1),
                'application_deadline': datetime(2024, 2, 28),
                'start_date': datetime(2024, 8, 19),
                'end_date': datetime(2024, 12, 29)
            },
            {
                'title': 'Medicine in India',
                'year_semester': '2028 Fall',
                'description': 'Medicine in India: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.',
                'application_open_date': datetime(2027, 12, 1),
                'application_deadline': datetime(2028, 2, 29),
                'start_date': datetime(2028, 8, 14),
                'end_date': datetime(2028, 12, 31)
            },
            {
                'title': 'Language in Japan',
                'year_semester': '2029 Fall',
                'description': 'Language in Japan: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.',
                'application_open_date': datetime(2028, 12, 1),
                'application_deadline': datetime(2029, 2, 28),
                'start_date': datetime(2029, 8, 20),
                'end_date': datetime(2029, 12, 30)
            },
            {
                'title': 'Technology in Japan',
                'year_semester': '2030 Fall',
                'description': 'Technology in Japan: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.',
                'application_open_date': datetime(2029, 12, 1),
                'application_deadline': datetime(2030, 2, 28),
                'start_date': datetime(2030, 8, 19),
                'end_date': datetime(2030, 12, 29)
            },
            {
                'title': 'Medicine in Canada',
                'year_semester': '2025 Spring',
                'description': 'Medicine in Canada: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.',
                'application_open_date': datetime(2024, 9, 1),
                'application_deadline': datetime(2024, 11, 30),
                'start_date': datetime(2025, 1, 6),
                'end_date': datetime(2025, 5, 4)
            },
            {
                'title': 'Technology in Australia',
                'year_semester': '2027 Spring',
                'description': 'Technology in Australia: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.',
                'application_open_date': datetime(2026, 9, 1),
                'application_deadline': datetime(2026, 11, 30),
                'start_date': datetime(2027, 1, 4),
                'end_date': datetime(2027, 5, 2)
            },
            {
                'title': 'Art in Australia',
                'year_semester': '2028 Spring',
                'description': 'Art in Australia: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.',
                'application_open_date': datetime(2027, 9, 1),
                'application_deadline': datetime(2027, 11, 30),
                'start_date': datetime(2028, 1, 3),
                'end_date': datetime(2028, 5, 7)
            },
            {
                'title': 'Art in Japan',
                'year_semester': '2029 Spring',
                'description': 'Art in Japan: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.',
                'application_open_date': datetime(2028, 9, 1),
                'application_deadline': datetime(2028, 11, 30),
                'start_date': datetime(2029, 1, 8),
                'end_date': datetime(2029, 5, 6)
            },
            {
                'title': 'Art in France',
                'year_semester': '2025 Summer',
                'description': 'Art in France: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.',
                'application_open_date': datetime(2024, 9, 1),
                'application_deadline': datetime(2024, 11, 30),
                'start_date': datetime(2025, 5, 19),
                'end_date': datetime(2025, 8, 17)
            },
        ]

        Program.objects.all().delete()
        ApplicationQuestion.objects.all().delete()
        self.stdout.write('Cleared existing programs and questions')

        # Faculty assignments for each program
        faculty_assignments = {
            'Ancient Philosophy in Athens': ['Elena Papadopoulos', 'Marcus Wisdom'],
            'Marine Biology in Great Barrier Reef': ['Rachel Ocean', 'James Coral'],
            'Art and Architecture in Florence': ['Isabella Romano', 'Robert Art'],
            'Global Health in Cape Town': ['Samuel Health', 'Nomvula Mbeki'],
            'Culinary Arts in Paris': ['Marie Laurent'],
            'Technology Innovation in Tokyo': ['Sarah Chen', 'Hiroshi Tanaka'],
            'Sustainable Engineering in Stockholm': ['Erik Anderson', 'Maria Nilsson'],
            'Global Business in Singapore': ['Michael Chang', 'Lisa Tan'],
            'Environmental Science in Costa Rica': ['Carlos Verde', 'Emma Nature'],
            'Fashion Design in Milan': ['Giulia Fashion'],
            # For other programs, we'll assign random faculty members
        }

        if prod_mode:
            for program_data in prod_programs_data:
                program = Program.objects.create(**program_data)
                
                # Assign faculty leads
                if program.title in faculty_assignments:
                    for faculty_name in faculty_assignments[program.title]:
                        if faculty_name in faculty_users:
                            program.faculty_leads.add(faculty_users[faculty_name])
                        else:
                            self.stdout.write(f'Warning: Faculty {faculty_name} not found')
                # else:
                    # # Assign random faculty if no specific assignment
                    # available_faculty = list(faculty_users.values())[:2]  # Get first two faculty members
                    # for faculty in available_faculty:
                    #     program.faculty_leads.add(faculty)
                
                # Add default questions
                for question_text in DEFAULT_QUESTIONS:
                    ApplicationQuestion.objects.create(
                        program=program,
                        text=question_text
                    )

                self.stdout.write(f'Created program: {program.title}')
        else:
            for program_data in programs_data:
                program = Program.objects.create(**program_data)
                
                # Assign faculty leads
                if program.title in faculty_assignments:
                    for faculty_name in faculty_assignments[program.title]:
                        if faculty_name in faculty_users:
                            program.faculty_leads.add(faculty_users[faculty_name])
                        else:
                            self.stdout.write(f'Warning: Faculty {faculty_name} not found')
                else:
                    # Assign random faculty if no specific assignment
                    available_faculty = list(faculty_users.values())[:2]  # Get first two faculty members
                    for faculty in available_faculty:
                        program.faculty_leads.add(faculty)
                
                # Add default questions
                for question_text in DEFAULT_QUESTIONS:
                    ApplicationQuestion.objects.create(
                        program=program,
                        text=question_text
                    )

                self.stdout.write(f'Created program: {program.title}')
