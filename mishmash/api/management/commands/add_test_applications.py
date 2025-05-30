"""
Study Abroad Program - Test Applications Creation Command
=========================================================
To run this use:
    docker compose exec backend python manage.py add_test_applications

This Django management command creates test program applications to simulate
various application scenarios and statuses.

Features:
- Creates applications with different statuses (Enrolled, Applied, Withdrawn, Canceled)
- Simulates multiple applications per student
- Assigns random responses to application questions

Usage:
    python manage.py add_test_applications

Dependencies:
- Requires add_test_users and add_test_programs to be run first
"""

from django.core.management.base import BaseCommand
from api.models import User, Program, Application, ApplicationQuestion, ApplicationResponse, ConfidentialNote
from datetime import datetime
import random

DEFAULT_QUESTIONS = [
    "Why do you want to participate in this study abroad program?",
    "How does this program align with your academic or career goals?",
    "What challenges do you anticipate during this experience, and how will you address them?",
    "Describe a time you adapted to a new or unfamiliar environment.",
    "What unique perspective or contribution will you bring to the group?",
]

class Command(BaseCommand):
    help = 'Creates test applications with various statuses, matching the updated database schema.'

    def add_arguments(self, parser):
        parser.add_argument(
            '-prod',
            action='store_true',
            help='Run in production mode, populates db with production data'
        )

    def handle(self, *args, **options):
        prod_mode = options['prod']
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

        prod_applications_data = [
            ('tylerharris352', 'Science in Spain', 'Applied', '2004-09-01', 3.52, 'Biology',
             {
                DEFAULT_QUESTIONS[0]: "The opportunity to learn in a different environment is invaluable.",
                DEFAULT_QUESTIONS[1]: "I bring a collaborative spirit and a unique cultural perspective.",
                DEFAULT_QUESTIONS[2]: "This program supports my career aspirations in global business.",
                DEFAULT_QUESTIONS[3]: "I want to explore new cultures and enhance my academic knowledge.",
                DEFAULT_QUESTIONS[4]: "I adapted to a new job environment by quickly learning the workflows and collaborating effectively."
             },
             "Unpaid",
             ),

            ('tylerharris352', 'Medicine in Canada', 'Enrolled', '2004-09-01', 3.52, 'Biology',
             {
                "What's your opinion of this program?": "I think it's a quite great program.",
                "Have you ever did familiar project related to this program?": "I did one project related to this program before."
             },
             "Unpaid",
             ),

            ('davidclark074', 'Science in Spain', 'Canceled', '2004-06-15', 2.54, 'Psychology',
             {
                DEFAULT_QUESTIONS[0]: "This program provides hands-on experience crucial for my future career.",
                DEFAULT_QUESTIONS[1]: "This program provides hands-on experience crucial for my future career.",
                DEFAULT_QUESTIONS[2]: "This program aligns with my passion for international relations and global studies.",
                DEFAULT_QUESTIONS[3]: "I anticipate communication barriers but will overcome them through active learning and collaboration.",
                DEFAULT_QUESTIONS[4]: "I am excited to network with peers and professionals in this field."
            },
             "Fully",
             ),

            ('elizabethjohnson303', 'History in Canada', 'Enrolled', '2008-03-20', 3.95, 'Psychology',
             {
                DEFAULT_QUESTIONS[0]: "I am excited to network with peers and professionals in this field.",
                DEFAULT_QUESTIONS[1]: "This program provides hands-on experience crucial for my future career.",
                DEFAULT_QUESTIONS[2]: "I want to explore new cultures and enhance my academic knowledge.",
                DEFAULT_QUESTIONS[3]: "This program provides hands-on experience crucial for my future career.",
                DEFAULT_QUESTIONS[4]: "This program aligns with my passion for international relations and global studies."
            },
             "Partially",
             ),

            ('jamestaylor121', 'Science in Spain', 'Applied', '2000-02-29', 2.6, 'Psychology',
             {
                DEFAULT_QUESTIONS[0]: "I seek to improve my language skills and immerse myself in the local culture.",
                DEFAULT_QUESTIONS[1]: "I seek to improve my language skills and immerse myself in the local culture.",
                DEFAULT_QUESTIONS[2]: "I adapted to a new job environment by quickly learning the workflows and collaborating effectively.",
                DEFAULT_QUESTIONS[3]: "I anticipate communication barriers but will overcome them through active learning and collaboration.",
                DEFAULT_QUESTIONS[4]: "I bring a collaborative spirit and a unique cultural perspective."
            },
             "Unpaid",
             ),

            ('emilyharris658', 'Science in Spain', 'Withdrawn', '2001-04-12', 3.64, 'Biology',
             {
                DEFAULT_QUESTIONS[0]: "I bring a collaborative spirit and a unique cultural perspective.",
                DEFAULT_QUESTIONS[1]: "I seek to improve my language skills and immerse myself in the local culture.",
                DEFAULT_QUESTIONS[2]: "This program supports my career aspirations in global business.",
                DEFAULT_QUESTIONS[3]: "I anticipate communication barriers but will overcome them through active learning and collaboration.",
                DEFAULT_QUESTIONS[4]: "This program aligns with my passion for international relations and global studies."
             },
             "Partially",
             ),

            ('elizabethlewis588', 'Art in Italy', 'Enrolled', '2000-03-16', 3.1, 'Psychology',
             {
                DEFAULT_QUESTIONS[0]: "The opportunity to learn in a different environment is invaluable.",
                DEFAULT_QUESTIONS[1]: "I bring a collaborative spirit and a unique cultural perspective.",
                DEFAULT_QUESTIONS[2]: "This program aligns with my passion for international relations and global studies.",
                DEFAULT_QUESTIONS[3]: "The opportunity to learn in a different environment is invaluable.",
                DEFAULT_QUESTIONS[4]: "This program provides hands-on experience crucial for my future career."
            },
             "Unpaid",
             ),

            ('jessicasmith684', 'Art in Italy', 'Withdrawn', '2008-08-08', 3.0, 'Engineering',
             {
                DEFAULT_QUESTIONS[0]: "I adapted to a new job environment by quickly learning the workflows and collaborating effectively.",
                DEFAULT_QUESTIONS[1]: "I adapted to a new job environment by quickly learning the workflows and collaborating effectively.",
                DEFAULT_QUESTIONS[2]: "This program provides hands-on experience crucial for my future career.",
                DEFAULT_QUESTIONS[3]: "I adapted to a new job environment by quickly learning the workflows and collaborating effectively.",
                DEFAULT_QUESTIONS[4]: "This program provides hands-on experience crucial for my future career."
             },
             "Unpaid",
             ),

            ('jessicasmith684', 'History in Canada', 'Canceled', '2008-08-08', 3.0, 'Engineering',
             {
                DEFAULT_QUESTIONS[0]: "I want to explore new cultures and enhance my academic knowledge.",
                DEFAULT_QUESTIONS[1]: "The opportunity to learn in a different environment is invaluable.",
                DEFAULT_QUESTIONS[2]: "This program supports my career aspirations in global business.",
                DEFAULT_QUESTIONS[3]: "I bring a collaborative spirit and a unique cultural perspective.",
                DEFAULT_QUESTIONS[4]: "The opportunity to learn in a different environment is invaluable."
             },
             "Unpaid",
             ),
             
            ('jessicasmith610', 'History in Canada', 'Applied', '2001-07-07', 3.6, 'Computer Science',
             {
                DEFAULT_QUESTIONS[0]: "The opportunity to learn in a different environment is invaluable.",
                DEFAULT_QUESTIONS[1]: "The opportunity to learn in a different environment is invaluable.",
                DEFAULT_QUESTIONS[2]: "This program supports my career aspirations in global business.",
                DEFAULT_QUESTIONS[3]: "I want to explore new cultures and enhance my academic knowledge.",
                DEFAULT_QUESTIONS[4]: "I am excited to network with peers and professionals in this field."
             },
             "Unpaid",
             ),
        ]


        possible_responses = {
            "Why do you want to participate in this study abroad program?": [
                "I want to explore new cultures and broaden my horizons.",
                "This program aligns with my career aspirations in international relations.",
                "I have always wanted to study in this country and learn from experts in the field.",
                "It’s a great opportunity to gain hands-on experience in my field.",
                "I want to step out of my comfort zone and challenge myself academically."
            ],
            "How does this program align with your academic or career goals?": [
                "It provides specialized courses that fit my major.",
                "The internship opportunities will give me practical experience.",
                "Networking with professionals in this field is invaluable.",
                "The program's curriculum is exactly what I need to advance in my career.",
                "I will gain cultural and professional exposure relevant to my ambitions."
            ],
            "What challenges do you anticipate during this experience, and how will you address them?": [
                "Adapting to a new culture, but I plan to be open-minded and engage with locals.",
                "Managing finances abroad, which I will tackle with careful budgeting.",
                "Language barriers, but I will take preparatory language courses.",
                "Homesickness, but I will stay connected with family and make new friends.",
                "Academic rigor, but I am ready to work hard and seek help when needed."
            ],
            "Describe a time you adapted to a new or unfamiliar environment.": [
                "When I transferred to a new school, I quickly adjusted by joining clubs.",
                "During my first internship, I had to learn new skills on the job.",
                "Studying in a different state taught me independence and adaptability.",
                "Working in a multicultural team required me to embrace diverse perspectives.",
                "Moving to a new city for college forced me to become more self-reliant."
            ],
            "What unique perspective or contribution will you bring to the group?": [
                "My diverse background allows me to bring fresh perspectives.",
                "I have strong leadership skills and love working in a team setting.",
                "I am passionate about learning and sharing knowledge with peers.",
                "My problem-solving skills will help us overcome challenges together.",
                "I bring a creative approach to problem-solving and innovation."
            ]
        }

        Application.objects.all().delete()
        ApplicationResponse.objects.all().delete()
        self.stdout.write('Cleared existing applications and responses')

        if prod_mode:
            for username, program_title, status, dob, gpa, major, questionnaire, payment_status in prod_applications_data:
                try:
                    user = User.objects.get(username=username)
                    program = Program.objects.get(title=program_title)

                    application = Application.objects.create(
                        student=user,
                        program=program,
                        date_of_birth=datetime.strptime(dob, '%Y-%m-%d').date(),
                        gpa=gpa,
                        major=major,
                        status=status,
                        payment_status=payment_status,
                    )
                    
                    self.stdout.write(f'Created application: {username} -> {program_title} ({status})')

                    questions = ApplicationQuestion.objects.filter(program=program)

                    for question in questions:
                        ApplicationResponse.objects.create(
                            application=application,
                            question=question,
                            response=questionnaire[question.text],
                        )

                    if user.username == "jessicasmith610":
                        ConfidentialNote.objects.create(
                            author=User.objects.get(username="ashleybrown862"),
                            application=application,
                            content="Looks good!",
                        )

                    self.stdout.write(f'Added response to question: "{question.text}"')

                except (User.DoesNotExist, Program.DoesNotExist) as e:
                    self.stdout.write(self.style.ERROR(f'Error creating application: {str(e)}'))
        else:
            for username, program_title, status, dob, gpa, major in applications_data:
                try:
                    user = User.objects.get(username=username)
                    program = Program.objects.get(title=program_title)

                    application = Application.objects.create(
                        student=user,
                        program=program,
                        date_of_birth=datetime.strptime(dob, '%Y-%m-%d').date(),
                        gpa=gpa,
                        major=major,
                        status=status
                    )
                    
                    self.stdout.write(f'Created application: {username} -> {program_title} ({status})')

                    questions = ApplicationQuestion.objects.filter(program=program)

                    for question in questions:
                        response_text = random.choice(possible_responses.get(question.text, ["No response provided"]))
                        ApplicationResponse.objects.create(
                            application=application,
                            question=question,
                            response=response_text
                        )

                    self.stdout.write(f'Added response to question: "{question.text}"')

                except (User.DoesNotExist, Program.DoesNotExist) as e:
                    self.stdout.write(self.style.ERROR(f'Error creating application: {str(e)}'))
