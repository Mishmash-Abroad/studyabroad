from django.core.management.base import BaseCommand
from api.models import User, Announcement
from django.utils import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = 'Adds test announcements to the database'

    def handle(self, *args, **options):
        # Get the first admin user for creating announcements
        admin_user = User.objects.filter(is_admin=True).first()
        if not admin_user:
            self.stdout.write(self.style.ERROR('No admin user found. Please create an admin user first.'))
            return

        announcements = [
            {
                'title': 'Welcome to Spring 2025 Study Abroad Programs!',
                'content': {
                    "type": "doc",
                    "content": [
                        {
                            "type": "paragraph",
                            "content": [
                                {
                                    "type": "text",
                                    "text": "We're excited to announce our new lineup of study abroad programs for Spring 2025! Check out the programs tab for more information."
                                }
                            ]
                        }
                    ]
                },
                'importance': 'high',
                'created_at': timezone.now() - timedelta(days=2),
            },
            {
                'title': 'Application Deadline Extended',
                'content': {
                    "type": "doc",
                    "content": [
                        {
                            "type": "paragraph",
                            "content": [
                                {
                                    "type": "text",
                                    "text": "Due to high demand, we've extended the application deadline for several programs. ",
                                },
                                {
                                    "type": "text",
                                    "marks": [{"type": "bold"}],
                                    "text": "Check individual program pages for updated deadlines."
                                }
                            ]
                        }
                    ]
                },
                'importance': 'urgent',
                'created_at': timezone.now() - timedelta(days=1),
            },
            {
                'title': 'New Partnership with University of Madrid',
                'content': {
                    "type": "doc",
                    "content": [
                        {
                            "type": "paragraph",
                            "content": [
                                {
                                    "type": "text",
                                    "text": "We're pleased to announce our new partnership with the University of Madrid! This partnership will provide exciting new opportunities for:"
                                }
                            ]
                        },
                        {
                            "type": "bulletList",
                            "content": [
                                {
                                    "type": "listItem",
                                    "content": [
                                        {
                                            "type": "paragraph",
                                            "content": [
                                                {
                                                    "type": "text",
                                                    "text": "Language immersion programs"
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "type": "listItem",
                                    "content": [
                                        {
                                            "type": "paragraph",
                                            "content": [
                                                {
                                                    "type": "text",
                                                    "text": "Cultural exchange initiatives"
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "type": "listItem",
                                    "content": [
                                        {
                                            "type": "paragraph",
                                            "content": [
                                                {
                                                    "type": "text",
                                                    "text": "Research collaborations"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                'importance': 'medium',
                'created_at': timezone.now(),
            },
        ]

        for announcement_data in announcements:
            Announcement.objects.create(
                title=announcement_data['title'],
                content=announcement_data['content'],
                importance=announcement_data['importance'],
                created_by=admin_user,
                created_at=announcement_data['created_at'],
                is_active=True
            )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {len(announcements)} test announcements')
        )
