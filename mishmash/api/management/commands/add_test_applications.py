from django.core.management.base import BaseCommand
from api.models import User, Program, Application
from django.utils import timezone

class Command(BaseCommand):
    help = 'Creates test applications with various statuses'

    def handle(self, *args, **options):
        # Create applications with different scenarios
        applications_data = [
            # Emma has multiple applications
            ('EmmaW', 'Technology Innovation in Tokyo', 'Enrolled'),
            ('EmmaW', 'Digital Innovation in Silicon Valley', 'Applied'),
            
            # James applied to multiple programs
            ('JamesC', 'European Politics Tour', 'Enrolled'),
            ('JamesC', 'Global Business in Singapore', 'Withdrawn'),
            
            # Maria's applications
            ('MariaG', 'Wildlife Conservation in Kenya', 'Enrolled'),
            ('MariaG', 'Sustainable Engineering in Stockholm', 'Applied'),
            
            # David's applications
            ('DavidK', 'Global Business in Singapore', 'Enrolled'),
            ('DavidK', 'European Politics Tour', 'Canceled'),
            
            # Sarah's applications
            ('SarahJ', 'Marine Biology in Great Barrier Reef', 'Applied'),
            
            # Mohammed's applications
            ('MohammedA', 'Sustainable Engineering in Stockholm', 'Applied'),
            ('MohammedA', 'Digital Innovation in Silicon Valley', 'Withdrawn'),
            
            # Priya's applications
            ('PriyaP', 'Marine Biology in Great Barrier Reef', 'Enrolled'),
            
            # Lucas's applications
            ('LucasS', 'Global Business in Singapore', 'Applied'),
            
            # Nina's applications
            ('NinaW', 'Art and Architecture in Florence', 'Enrolled'),
            
            # Tom's applications
            ('TomA', 'Antarctic Research Expedition', 'Applied')
        ]

        for username, program_title, status in applications_data:
            try:
                student = User.objects.get(username=username).student
                program = Program.objects.get(title=program_title)
                
                application = Application.objects.create(
                    student=student,
                    program=program,
                    status=status
                )
                self.stdout.write(
                    f'Created application: {username} -> {program_title} ({status})'
                )
            except (User.DoesNotExist, Program.DoesNotExist) as e:
                self.stdout.write(
                    self.style.ERROR(f'Error creating application: {str(e)}')
                )
