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
    help = "Creates test programs with various scenarios"

    def add_arguments(self, parser):
        parser.add_argument(
            "-prod",
            action="store_true",
            help="Run in production mode, populates db with production data",
        )

    def handle(self, *args, **options):
        prod_mode = options["prod"]
        today = timezone.now().date()

        # Get faculty users
        faculty_users = {
            user.display_name: user
            for user in User.objects.filter(is_faculty=True).exclude(username="admin")
        }

        programs_data = [
            # Past Programs (Fall 2024)
            {
                "title": "Ancient Philosophy in Athens",
                "year": "2024",
                "semester": "Fall",
                "description": "Study ancient Greek philosophy where it all began. Visit historical sites and engage with contemporary scholars in philosophical discussions.",
                "application_open_date": today - timedelta(days=300),
                "application_deadline": today - timedelta(days=240),
                "essential_document_deadline": today - timedelta(days=270),
                "start_date": today - timedelta(days=180),
                "end_date": today - timedelta(days=90),
                "faculty": ["Emily Garcia", "Daniel Garcia"],
                "questions":DEFAULT_QUESTIONS,
            },
            {
                "title": "Digital Innovation in Silicon Valley",
                "year": "2024",
                "semester": "Fall",
                "description": "Experience Silicon Valley's thriving tech scene and startup ecosystem. Work on projects with local tech companies and attend industry events.",
                "application_open_date": today - timedelta(days=310),
                "application_deadline": today - timedelta(days=250),
                "essential_document_deadline": today - timedelta(days=280),
                "start_date": today - timedelta(days=190),
                "end_date": today - timedelta(days=100),
                "faculty": ["Anna Digital"],
                "questions":DEFAULT_QUESTIONS,
            },
            {
                "title": "Sustainable Agriculture in New Zealand",
                "year": "2024",
                "semester": "Fall",
                "description": "Study sustainable farming practices and agricultural innovation in New Zealand. Work with local farmers and research sustainable methods.",
                "application_open_date": today - timedelta(days=305),
                "application_deadline": today - timedelta(days=245),
                "essential_document_deadline": today - timedelta(days=275),
                "start_date": today - timedelta(days=185),
                "end_date": today - timedelta(days=95),
                "faculty": ["Thomas Farm", "Linda Sustainable"],
                "questions":DEFAULT_QUESTIONS,
            },
            {
                "title": "Journalism in New York City",
                "year": "2024",
                "semester": "Fall",
                "description": "Experience journalism in the media capital of the world. Work with leading news organizations and learn modern digital journalism.",
                "application_open_date": today - timedelta(days=315),
                "application_deadline": today - timedelta(days=255),
                "essential_document_deadline": today - timedelta(days=285),
                "start_date": today - timedelta(days=195),
                "end_date": today - timedelta(days=105),
                "faculty": ["James Journalism", "Maria Media"],
                "questions":DEFAULT_QUESTIONS,
            },
            # Currently Running Programs (Spring 2025)
            {
                "title": "European Politics Tour",
                "year": "2025",
                "semester": "Spring",
                "description": "Travel through major European capitals studying political systems and international relations. Meet with government officials and policy makers.",
                "application_open_date": today - timedelta(days=150),
                "application_deadline": today - timedelta(days=90),
                "essential_document_deadline": today - timedelta(days=120),
                "start_date": today - timedelta(days=30),
                "end_date": today + timedelta(days=60),
                "faculty": ["Marco Urban", "Alice Brown"],
                "questions":DEFAULT_QUESTIONS,
            },
            {
                "title": "Wildlife Conservation in Kenya",
                "year": "2025",
                "semester": "Spring",
                "description": "Study wildlife conservation and ecological preservation in Kenya's national parks. Work with local conservation experts and research teams.",
                "application_open_date": today - timedelta(days=160),
                "application_deadline": today - timedelta(days=100),
                "essential_document_deadline": today - timedelta(days=130),
                "start_date": today - timedelta(days=40),
                "end_date": today + timedelta(days=50),
                "faculty": ["Emma Nature"],
                "questions":DEFAULT_QUESTIONS,
            },
            {
                "title": "Film Production in Los Angeles",
                "year": "2025",
                "semester": "Spring",
                "description": "Learn film production in Hollywood. Work on actual film sets and learn from industry professionals.",
                "application_open_date": today - timedelta(days=155),
                "application_deadline": today - timedelta(days=95),
                "essential_document_deadline": today - timedelta(days=125),
                "start_date": today - timedelta(days=35),
                "end_date": today + timedelta(days=55),
                "faculty": ["Claire Design"],
                "questions":DEFAULT_QUESTIONS,
            },
            {
                "title": "Robotics Research in Seoul",
                "year": "2025",
                "semester": "Spring",
                "description": "Study advanced robotics in South Korea's tech hub. Work with leading robotics companies and research labs.",
                "application_open_date": today - timedelta(days=165),
                "application_deadline": today - timedelta(days=105),
                "essential_document_deadline": today - timedelta(days=135),
                "start_date": today - timedelta(days=45),
                "end_date": today + timedelta(days=45),
                "faculty": ["Catherine Taylor"],
                "questions":DEFAULT_QUESTIONS,
            },
            # Currently Open for Applications (Summer 2025)
            {
                "title": "Marine Biology in Great Barrier Reef",
                "year": "2025",
                "semester": "Summer",
                "description": "Study marine ecosystems and conservation efforts in the world's largest coral reef system. Includes diving certification and hands-on research projects.",
                "application_open_date": today - timedelta(days=25),
                "application_deadline": today + timedelta(days=35),
                "essential_document_deadline": today + timedelta(days=5),
                "start_date": today + timedelta(days=120),
                "end_date": today + timedelta(days=150),
                "faculty": ["Emily Smith", "Alice Smith"],
                "questions":DEFAULT_QUESTIONS,
            },
            {
                "title": "AAAAAAAAAAAAAAAAAAAAAA",
                "year": "2025",
                "semester": "Summer",
                "description": "Study marine ecosystems and conservation efforts in the world's largest coral reef system. Includes diving certification and hands-on research projects.",
                "application_open_date": today - timedelta(days=25),
                "application_deadline": today + timedelta(days=35),
                "essential_document_deadline": today + timedelta(days=5),
                "start_date": today + timedelta(days=120),
                "end_date": today + timedelta(days=150),
                "faculty": ["System Administrator"],
                "questions":DEFAULT_QUESTIONS,
            },
            {
                "title": "Art and Architecture in Florence",
                "year": "2025",
                "semester": "Summer",
                "description": "Immerse yourself in Renaissance art and architecture. Study in historic studios and visit world-renowned museums and architectural sites.",
                "application_open_date": today - timedelta(days=20),
                "application_deadline": today + timedelta(days=40),
                "essential_document_deadline": today + timedelta(days=10),
                "start_date": today + timedelta(days=130),
                "end_date": today + timedelta(days=160),
                "faculty": ["David Space", "Frank Taylor"],
                "questions":DEFAULT_QUESTIONS,
            },
            {
                "title": "Global Health in Cape Town",
                "year": "2025",
                "semester": "Summer",
                "description": "Study healthcare systems and public health challenges in South Africa. Work with local clinics and healthcare professionals.",
                "application_open_date": today - timedelta(days=30),
                "application_deadline": today + timedelta(days=30),
                "essential_document_deadline": today,
                "start_date": today + timedelta(days=140),
                "end_date": today + timedelta(days=170),
                "faculty": ["John Astronomy"],
                "questions":DEFAULT_QUESTIONS,
            },
            {
                "title": "Culinary Arts in Paris",
                "year": "2025",
                "semester": "Summer",
                "description": "Master French culinary techniques and food culture. Study at prestigious cooking schools and visit local markets.",
                "application_open_date": today - timedelta(days=15),
                "application_deadline": today + timedelta(days=45),
                "essential_document_deadline": today + timedelta(days=15),
                "start_date": today + timedelta(days=125),
                "end_date": today + timedelta(days=155),
                "faculty": ["Sophie Polar", "Frank Taylor"],
                "questions":DEFAULT_QUESTIONS,
            },
            {
                "title": "Music Performance in Vienna",
                "year": "2025",
                "semester": "Summer",
                "description": "Study classical music in the heart of Europe. Perform in historic venues and learn from world-class musicians.",
                "application_open_date": today - timedelta(days=18),
                "application_deadline": today + timedelta(days=42),
                "essential_document_deadline": today + timedelta(days=12),
                "start_date": today + timedelta(days=128),
                "end_date": today + timedelta(days=158),
                "faculty": ["Alice Smith", "Emily Smith"],
                "questions":DEFAULT_QUESTIONS,
            },
            # Currently Open for Applications (Fall 2025)
            {
                "title": "Technology Innovation in Tokyo",
                "year": "2025",
                "semester": "Fall",
                "description": "Explore the intersection of traditional culture and cutting-edge technology in Japan's bustling capital. Work with leading tech companies and experience Japanese innovation firsthand.",
                "application_open_date": today - timedelta(days=10),
                "application_deadline": today + timedelta(days=80),
                "essential_document_deadline": today + timedelta(days=50),
                "start_date": today + timedelta(days=180),
                "end_date": today + timedelta(days=270),
                "faculty": ["Marco Urban"],
                "questions":DEFAULT_QUESTIONS,
            },
            {
                "title": "Sustainable Engineering in Stockholm",
                "year": "2025",
                "semester": "Fall",
                "description": "Study renewable energy solutions and sustainable urban planning in one of the world's greenest cities. Includes visits to leading clean tech companies and research facilities.",
                "application_open_date": today - timedelta(days=5),
                "application_deadline": today + timedelta(days=85),
                "essential_document_deadline": today + timedelta(days=55),
                "start_date": today + timedelta(days=200),
                "end_date": today + timedelta(days=290),
                "faculty": ["Claire Design"],
                "questions":DEFAULT_QUESTIONS,
            },
            {
                "title": "Global Business in Singapore",
                "year": "2025",
                "semester": "Fall",
                "description": "Gain insights into Asian business practices and innovation ecosystems. Work directly with startups and established companies in Singapore's dynamic business environment.",
                "application_open_date": today - timedelta(days=15),
                "application_deadline": today + timedelta(days=75),
                "essential_document_deadline": today + timedelta(days=45),
                "start_date": today + timedelta(days=190),
                "end_date": today + timedelta(days=280),
                "faculty": ["Paul Game"],
                "questions":DEFAULT_QUESTIONS,
            },
            {
                "title": "Psychology Research in Copenhagen",
                "year": "2025",
                "semester": "Fall",
                "description": "Study advanced psychological research methods in Denmark. Work with leading research institutions on cutting-edge studies.",
                "application_open_date": today - timedelta(days=8),
                "application_deadline": today + timedelta(days=82),
                "essential_document_deadline": today + timedelta(days=52),
                "start_date": today + timedelta(days=185),
                "end_date": today + timedelta(days=275),
                "faculty": ["Alice Brown"],
                "questions":DEFAULT_QUESTIONS,
            },
            {
                "title": "Urban Design in Barcelona",
                "year": "2025",
                "semester": "Fall",
                "description": "Study urban design and architecture in one of Europe's most innovative cities. Work on real urban development projects.",
                "application_open_date": today - timedelta(days=12),
                "application_deadline": today + timedelta(days=78),
                "essential_document_deadline": today + timedelta(days=48),
                "start_date": today + timedelta(days=188),
                "end_date": today + timedelta(days=278),
                "faculty": ["Marco Urban", "Claire Design"],
                "questions":DEFAULT_QUESTIONS,
            },
            # Future Programs - Not Yet Open for Applications (Spring 2026)
            {
                "title": "Antarctic Research Expedition",
                "year": "2026",
                "semester": "Spring",
                "description": "Conduct research in Antarctica studying climate change, marine biology, and glaciology. Work alongside international research teams in extreme conditions.",
                "application_open_date": today + timedelta(days=90),
                "application_deadline": today + timedelta(days=150),
                "essential_document_deadline": today + timedelta(days=120),
                "start_date": today + timedelta(days=400),
                "end_date": today + timedelta(days=490),
                "faculty": ["Sophie Polar", "John Astronomy"],
                "questions":DEFAULT_QUESTIONS,
            },
            {
                "title": "Environmental Science in Costa Rica",
                "year": "2026",
                "semester": "Spring",
                "description": "Study tropical ecosystems and biodiversity conservation. Conduct field research in rainforests and participate in local conservation projects.",
                "application_open_date": today + timedelta(days=85),
                "application_deadline": today + timedelta(days=145),
                "essential_document_deadline": today + timedelta(days=115),
                "start_date": today + timedelta(days=410),
                "end_date": today + timedelta(days=500),
                "faculty": ["Emma Nature"],
                "questions":DEFAULT_QUESTIONS,
            },
            {
                "title": "Fashion Design in Milan",
                "year": "2026",
                "semester": "Spring",
                "description": "Study fashion design and industry practices in one of the world's fashion capitals. Work with leading designers and attend Milan Fashion Week.",
                "application_open_date": today + timedelta(days=88),
                "application_deadline": today + timedelta(days=148),
                "essential_document_deadline": today + timedelta(days=118),
                "start_date": today + timedelta(days=415),
                "end_date": today + timedelta(days=505),
                "faculty": ["Giulia Fashion"],
                "questions":DEFAULT_QUESTIONS,
            },
            {
                "title": "Space Science in Houston",
                "year": "2026",
                "semester": "Spring",
                "description": "Study space science and astronomy at NASA's Johnson Space Center. Work with space scientists and learn about space exploration.",
                "application_open_date": today + timedelta(days=92),
                "application_deadline": today + timedelta(days=152),
                "essential_document_deadline": today + timedelta(days=122),
                "start_date": today + timedelta(days=420),
                "end_date": today + timedelta(days=510),
                "faculty": ["David Space", "John Astronomy"],
                "questions":DEFAULT_QUESTIONS,
            },
            {
                "title": "Game Design in Montreal",
                "year": "2026",
                "semester": "Spring",
                "description": "Study game design and development in one of the world's leading gaming hubs. Work with major gaming studios on real projects.",
                "application_open_date": today + timedelta(days=95),
                "application_deadline": today + timedelta(days=155),
                "essential_document_deadline": today + timedelta(days=125),
                "start_date": today + timedelta(days=425),
                "end_date": today + timedelta(days=515),
                "faculty": ["Paul Game", "Anna Digital"],
                "questions":DEFAULT_QUESTIONS,
            },
        ]

        prod_programs_data = [
            {
                "title": "Science in Spain",
                "year": "2025",
                "semester": "Fall",
                "description": "Science in Spain: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.",
                "application_open_date": datetime(2024, 12, 1),
                "application_deadline": datetime(2025, 2, 28),
                "essential_document_deadline": datetime(2025, 2, 28),
                "start_date": datetime(2025, 8, 18),
                "end_date": datetime(2025, 12, 28),
                "faculty": ["Jessica Anderson"],
                "questions":DEFAULT_QUESTIONS,
            },
            {
                "title": "History in Canada",
                "year": "2025",
                "semester": "Fall",
                "description": "History in Canada: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.",
                "application_open_date": datetime(2024, 12, 1),
                "application_deadline": datetime(2025, 2, 28),
                "essential_document_deadline": datetime(2025, 2, 28),
                "start_date": datetime(2025, 8, 18),
                "end_date": datetime(2025, 12, 28),
                "faculty": ["Emily Bletsch"],
                "questions":DEFAULT_QUESTIONS,
            },
            {
                "title": "Art in Italy",
                "year": "2024",
                "semester": "Fall",
                "description": "Art in Italy: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.",
                "application_open_date": datetime(2023, 12, 1),
                "application_deadline": datetime(2024, 2, 29),
                "essential_document_deadline": datetime(2024, 2, 29),
                "start_date": datetime(2024, 8, 19),
                "end_date": datetime(2024, 12, 29),
                "faculty": ["Emily Walker"],
                "questions":DEFAULT_QUESTIONS,
            },
            {
                "title": "Medicine in India",
                "year": "2028",
                "semester": "Fall",
                "description": "Medicine in India: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.",
                "application_open_date": datetime(2027, 12, 1),
                "application_deadline": datetime(2028, 2, 29),
                "essential_document_deadline": datetime(2028, 2, 29),
                "start_date": datetime(2028, 8, 14),
                "end_date": datetime(2028, 12, 31),
                "faculty": ["Emily Bletsch"],
                "questions":DEFAULT_QUESTIONS,
            },
            {
                "title": "Language in Japan",
                "year": "2029",
                "semester": "Fall",
                "description": "Language in Japan: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.",
                "application_open_date": datetime(2028, 12, 1),
                "application_deadline": datetime(2029, 2, 28),
                "essential_document_deadline": datetime(2029, 2, 28),
                "start_date": datetime(2029, 8, 20),
                "end_date": datetime(2029, 12, 30),
                "faculty": ["Jessica Anderson"],
                "questions":DEFAULT_QUESTIONS,
            },
            {
                "title": "Technology in Japan",
                "year": "2030",
                "semester": "Fall",
                "description": "Technology in Japan: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.",
                "application_open_date": datetime(2029, 12, 1),
                "application_deadline": datetime(2030, 2, 28),
                "essential_document_deadline": datetime(2030, 2, 28),
                "start_date": datetime(2030, 8, 19),
                "end_date": datetime(2030, 12, 29),
                "faculty": ["Sarah Smith"],
                "questions":DEFAULT_QUESTIONS,
            },
            {
                "title": "Medicine in Canada",
                "year": "2025",
                "semester": "Spring",
                "description": "Medicine in Canada: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.",
                "application_open_date": datetime(2024, 9, 1),
                "application_deadline": datetime(2024, 11, 30),
                "essential_document_deadline": datetime(2024, 11, 30),
                "start_date": datetime(2025, 1, 6),
                "end_date": datetime(2025, 5, 4),
                "faculty": ["Emily Bletsch"],
                "questions":["What's your opinion of this program?",
                             "Have you ever did familiar project related to this program?",
                            ],
            },
            {
                "title": "Technology in Australia",
                "year": "2027",
                "semester": "Spring",
                "description": "Technology in Australia: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.",
                "application_open_date": datetime(2026, 9, 1),
                "application_deadline": datetime(2026, 11, 30),
                "essential_document_deadline": datetime(2026, 11, 30),
                "start_date": datetime(2027, 1, 4),
                "end_date": datetime(2027, 5, 2),
                "faculty": ["Emily Bletsch"],
                "questions":DEFAULT_QUESTIONS,
            },
            {
                "title": "Art in Australia",
                "year": "2028",
                "semester": "Spring",
                "description": "Art in Australia: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.",
                "application_open_date": datetime(2027, 9, 1),
                "application_deadline": datetime(2027, 11, 30),
                "essential_document_deadline": datetime(2027, 11, 30),
                "start_date": datetime(2028, 1, 3),
                "end_date": datetime(2028, 5, 7),
                "faculty": ["Sarah Smith"],
                "questions":DEFAULT_QUESTIONS,
            },
            {
                "title": "Art in Japan",
                "year": "2029",
                "semester": "Spring",
                "description": "Art in Japan: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.",
                "application_open_date": datetime(2028, 9, 1),
                "application_deadline": datetime(2028, 11, 30),
                "essential_document_deadline": datetime(2028, 11, 30),
                "start_date": datetime(2029, 1, 8),
                "end_date": datetime(2029, 5, 6),
                "faculty": ["Emily Bletsch"],
                "questions":DEFAULT_QUESTIONS,
            },
            {
                "title": "Art in France",
                "year": "2025",
                "semester": "Summer",
                "description": "Art in France: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.",
                "application_open_date": datetime(2024, 9, 1),
                "application_deadline": datetime(2024, 11, 30),
                "essential_document_deadline": datetime(2024, 11, 30),
                "start_date": datetime(2025, 5, 19),
                "end_date": datetime(2025, 8, 17),
                "faculty": ["Jessica Anderson"],
                "questions":DEFAULT_QUESTIONS,
            },
        ]


        Program.objects.all().delete()
        ApplicationQuestion.objects.all().delete()
        self.stdout.write("Cleared existing programs and questions")

        if prod_mode:
            for program_data in prod_programs_data:
                program = Program.objects.create(
                    title = program_data["title"],
                    year = program_data["year"],
                    semester = program_data["semester"],
                    description = program_data["description"],
                    application_open_date = program_data["application_open_date"],
                    application_deadline = program_data["application_deadline"],
                    essential_document_deadline = program_data["essential_document_deadline"],
                    start_date = program_data["start_date"],
                    end_date = program_data["end_date"],
                )
                faculty_users = [User.objects.get(display_name=x) for x in program_data["faculty"]]
                program.faculty_leads.set(faculty_users)

                for question_text in program_data["questions"]:
                    ApplicationQuestion.objects.create(
                        program=program, text=question_text
                    )

                self.stdout.write(f"Created program: {program.title}")
        else:
            for program_data in programs_data:
                program = Program.objects.create(
                    title = program_data["title"],
                    year = program_data["year"],
                    semester = program_data["semester"],
                    description = program_data["description"],
                    application_open_date = program_data["application_open_date"],
                    application_deadline = program_data["application_deadline"],
                    essential_document_deadline = program_data["essential_document_deadline"],
                    start_date = program_data["start_date"],
                    end_date = program_data["end_date"],
                )
                faculty_users = [User.objects.get(display_name=x) for x in program_data["faculty"]]
                program.faculty_leads.set(faculty_users)

                for question_text in program_data["questions"]:
                    ApplicationQuestion.objects.create(
                        program=program, text=question_text
                    )

                self.stdout.write(f"Created program: {program.title}")
