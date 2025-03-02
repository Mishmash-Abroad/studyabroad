from django.core.management.base import BaseCommand
from api.models import User, Announcement
from django.utils import timezone
from datetime import timedelta
import os
from django.core.files.base import ContentFile

class Command(BaseCommand):
    help = 'Adds test announcements to the database with rich formatting, including image resizing/alignment.'

    def handle(self, *args, **options):
        # -- Fetch an admin user --
        admin_user = User.objects.filter(is_admin=True).first()
        if not admin_user:
            self.stdout.write(self.style.ERROR(
                'No admin user found. Please create an admin user first.'))
            return

        # -- Path to local "logo.png" for cover images --
        logo_path = os.path.join('/app', 'frontend', 'public', 'images', 'logo.png')
        with open(logo_path, 'rb') as f:
            logo_content = f.read()
            logo_file = ContentFile(logo_content, name='logo.png')

        # -- Helper: Tiptap table snippet --
        def example_table():
            return {
                "type": "table",
                "content": [
                    {
                        "type": "tableRow",
                        "content": [
                            {
                                "type": "tableHeader",
                                "attrs": {"colspan": 1, "rowspan": 1},
                                "content": [{"type": "text", "text": "Program"}]
                            },
                            {
                                "type": "tableHeader",
                                "attrs": {"colspan": 1, "rowspan": 1},
                                "content": [{"type": "text", "text": "Deadline"}]
                            }
                        ]
                    },
                    {
                        "type": "tableRow",
                        "content": [
                            {
                                "type": "tableCell",
                                "attrs": {"colspan": 1, "rowspan": 1},
                                "content": [{"type": "text", "text": "HCC in Berlin"}]
                            },
                            {
                                "type": "tableCell",
                                "attrs": {"colspan": 1, "rowspan": 1},
                                "content": [{"type": "text", "text": "March 10"}]
                            }
                        ]
                    },
                    {
                        "type": "tableRow",
                        "content": [
                            {
                                "type": "tableCell",
                                "attrs": {"colspan": 1, "rowspan": 1},
                                "content": [{"type": "text", "text": "HCC in Madrid"}]
                            },
                            {
                                "type": "tableCell",
                                "attrs": {"colspan": 1, "rowspan": 1},
                                "content": [{"type": "text", "text": "April 1"}]
                            }
                        ]
                    }
                ]
            }

        # -- The announcements list --
        announcements = [
            {
                'title': 'Welcome to Spring 2025 Study Abroad Programs!',
                'content': {
                    "type": "doc",
                    "content": [
                        {
                            "type": "heading",
                            "attrs": {"level": 1},
                            "content": [{"type": "text", "text": "A Warm Welcome"}]
                        },
                        {
                            "type": "paragraph",
                            "content": [
                                {
                                    "type": "text",
                                    "text": "We're thrilled to introduce our new Spring 2025 lineup! Click on a program to learn more about costs, housing, and cultural excursions."
                                }
                            ]
                        },
                        {
                            "type": "image",
                            "attrs": {
                                "src": "https://pngimg.com/uploads/world_map/world_map_PNG30.png",
                                "alt": "World Map",
                                "style": "width: 400px; height: auto; margin: 0 auto; display: block;"
                            }
                        }
                    ]
                },
                'importance': 'high',
                'created_at': timezone.now() - timedelta(days=2),
                'pinned': True,
                'cover_image': logo_file,
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
                                    "text": "Great news! Due to high demand, we've extended several application deadlines for Spring 2025."
                                },
                                {
                                    "type": "text",
                                    "marks": [{"type": "bold"}],
                                    "text": " Check individual program pages for specifics!"
                                }
                            ]
                        },
                        {
                            "type": "image",
                            "attrs": {
                                "src": "https://cdn-icons-png.flaticon.com/512/1454/1454801.png",
                                "alt": "Extended Deadline",
                                "style": "width: 320px; height: auto; margin: 0 auto; display: block; cursor: pointer;"
                            }
                        }
                    ]
                },
                'importance': 'urgent',
                'created_at': timezone.now() - timedelta(days=1),
                'pinned': True,
                'cover_image': None,
            },
            {
                'title': 'New Partnership with University of Madrid',
                'content': {
                    "type": "doc",
                    "content": [
                        {
                            "type": "paragraph",
                            "content": [{"type": "text", "text": "We're excited about our new partnership with the University of Madrid! Here’s what you can expect:"}]
                        },
                        {
                            "type": "bulletList",
                            "content": [
                                {
                                    "type": "listItem",
                                    "content": [
                                        {"type": "paragraph", "content": [{"type": "text", "text": "Intensive Spanish language courses"}]}
                                    ]
                                },
                                {
                                    "type": "listItem",
                                    "content": [
                                        {"type": "paragraph", "content": [{"type": "text", "text": "Cultural immersion opportunities"}]}
                                    ]
                                },
                                {
                                    "type": "listItem",
                                    "content": [
                                        {"type": "paragraph", "content": [{"type": "text", "text": "Joint research projects"}]}
                                    ]
                                }
                            ]
                        },
                        example_table(),  # Insert sample deadlines table
                        example_table(),
                        example_table(),
                        example_table(),
                        example_table()
                    ]
                },
                'importance': 'medium',
                'created_at': timezone.now(),
                'pinned': False,
                'cover_image': logo_file,
            },
            {
                'title': 'Information Session: Study Abroad in Asia',
                'content': {
                    "type": "doc",
                    "content": [
                        {
                            "type": "heading",
                            "attrs": {"level": 1},
                            "content": [{"type": "text", "text": "Upcoming Info Session"}]
                        },
                        {
                            "type": "paragraph",
                            "content": [
                                {"type": "text", "marks": [{"type": "bold"}], "text": "Date: "},
                                {"type": "text", "text": "March 15, 2025"}
                            ]
                        },
                        {
                            "type": "paragraph",
                            "content": [
                                {"type": "text", "marks": [{"type": "bold"}], "text": "Time: "},
                                {"type": "text", "text": "3:00 PM - 4:30 PM"}
                            ]
                        },
                        {
                            "type": "paragraph",
                            "content": [
                                {"type": "text", "marks": [{"type": "bold"}], "text": "Location: "},
                                {"type": "text", "text": "Global Education Center, Room 201"}
                            ]
                        },
                        {
                            "type": "paragraph",
                            "content": [
                                {
                                    "type": "text",
                                    "text": "Join us to learn about our expanding options in Japan, South Korea, China, and Singapore!"
                                }
                            ]
                        }
                    ]
                },
                'importance': 'medium',
                'created_at': timezone.now() - timedelta(days=3),
                'pinned': False,
                'cover_image': None,
            },
            {
                'title': 'Mega Feature Article: Global Education Revolution',
                'content': {
                    "type": "doc",
                    "content": [
                        {
                            "type": "heading",
                            "attrs": {"level": 1},
                            "content": [{"type": "text", "text": "Why Global Education Matters"}]
                        },
                        {
                            "type": "paragraph",
                            "content": [
                                {
                                    "type": "text",
                                    "marks": [{"type": "italic"}],
                                    "text": "Education abroad is more than just traveling—it's about cultural exchange, academic growth, and personal discovery. "
                                },
                                {
                                    "type": "text",
                                    "text": "Find out how we're revolutionizing global learning..."
                                }
                            ]
                        },
                        {
                            "type": "image",
                            "attrs": {
                                "src": "https://th.bing.com/th/id/R.d4f23bb346e5976edff53f5589421b83?rik=jdNlbY%2bZeEOBpg&riu=http%3a%2f%2fclipart-library.com%2fimg1%2f1071218.png&ehk=4HqM9747rhhJ4sQxjAmWamUupjWLsOSoN08NhFdTq1U%3d&risl=&pid=ImgRaw&r=0",
                                "alt": "Student in library",
                                "style": "width: 400px; height: auto; margin: 0 auto; display: block;"
                            }
                        },
                        {
                            "type": "heading",
                            "attrs": {"level": 2},
                            "content": [{"type": "text", "text": "Key Highlights"}]
                        },
                        {
                            "type": "bulletList",
                            "content": [
                                {
                                    "type": "listItem",
                                    "content": [
                                        {"type": "paragraph", "content": [{"type": "text", "text": "Cutting-edge digital tools"}]}
                                    ]
                                },
                                {
                                    "type": "listItem",
                                    "content": [
                                        {"type": "paragraph", "content": [{"type": "text", "text": "Virtual cultural exchanges"}]}
                                    ]
                                },
                                {
                                    "type": "listItem",
                                    "content": [
                                        {"type": "paragraph", "content": [{"type": "text", "text": "Worldwide campus networks"}]}
                                    ]
                                }
                            ]
                        }
                    ]
                },
                'importance': 'urgent',
                'created_at': timezone.now() - timedelta(days=4),
                'pinned': True,
                'cover_image': logo_file,
            },
            {
                'title': 'In-Depth Analysis: Socioeconomic Effects of International Study',
                'content': {
                    "type": "doc",
                    "content": [
                        {
                            "type": "heading",
                            "attrs": {"level": 1},
                            "content": [{"type": "text", "text": "Overview"}]
                        },
                        {
                            "type": "paragraph",
                            "content": [{
                                "type": "text",
                                "text": "Study abroad programs can boost local economies, create cultural ties, and encourage sustainable development. Yet challenges exist—let's explore them."
                            }]
                        },
                        {
                            "type": "paragraph",
                            "content": [
                                {"type": "text", "marks": [{"type": "bold"}], "text": "Key question: "},
                                {"type": "text", "text": "How do we balance growth and cultural preservation?"}
                            ]
                        },
                        example_table()
                    ]
                },
                'importance': 'high',
                'created_at': timezone.now() - timedelta(days=5),
                'pinned': False,
                'cover_image': None,
            },
            {
                'title': 'Student Voices: Real Experiences from Abroad',
                'content': {
                    "type": "doc",
                    "content": [
                        {
                            "type": "paragraph",
                            "content": [
                                {
                                    "type": "text",
                                    "marks": [{"type": "bold"}],
                                    "text": "“Studying in France changed my life,” "
                                },
                                {
                                    "type": "text",
                                    "text": "says Mia, a sophomore majoring in Art History. She discovered new perspectives and found mentors from around the world."
                                }
                            ]
                        },
                        {
                            "type": "paragraph",
                            "content": [
                                {
                                    "type": "text",
                                    "text": "Meanwhile, Raj, a senior in Computer Science, explored robotics labs in Japan and built lasting professional contacts."
                                }
                            ]
                        },
                        {
                            "type": "paragraph",
                            "content": [
                                {
                                    "type": "text",
                                    "marks": [{"type": "italic"}],
                                    "text": "Discover your own story abroad!"
                                }
                            ]
                        }
                    ]
                },
                'importance': 'medium',
                'created_at': timezone.now() - timedelta(days=6),
                'pinned': False,
                'cover_image': logo_file,
            },
            {
                'title': 'Breaking News: New Scholarship Opportunities',
                'content': {
                    "type": "doc",
                    "content": [
                        {
                            "type": "paragraph",
                            "content": [
                                {
                                    "type": "text",
                                    "text": "We have secured additional scholarships for next year, dramatically lowering the financial barriers to global education."
                                }
                            ]
                        },
                        {
                            "type": "paragraph",
                            "content": [
                                {
                                    "type": "text",
                                    "text": "Apply early to take advantage of these funds, which are available on a first-come, first-served basis!"
                                }
                            ]
                        },
                        {
                            "type": "image",
                            "attrs": {
                                "src": "https://www.seekpng.com/png/full/810-8108349_stacks-racks-hundreds-cash-money-stacks-of-money.png",
                                "alt": "Scholarship Funding",
                                "style": "width: 319px; height: auto; cursor: pointer; margin: 0px auto; display: block;"
                            }
                        }
                    ]
                },
                'importance': 'high',
                'created_at': timezone.now() - timedelta(days=7),
                'pinned': False,
                'cover_image': None,
            }
        ]

        # -- Clear existing announcements to avoid duplication --
        Announcement.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Cleared existing announcements'))

        # -- Create announcements --
        created_count = 0
        for ann_data in announcements:
            cover_img = ann_data.pop('cover_image')
            announcement = Announcement.objects.create(
                title=ann_data['title'],
                content=ann_data['content'],
                importance=ann_data['importance'],
                created_by=admin_user,
                created_at=ann_data['created_at'],
                is_active=True,  # Force announcements active
                pinned=ann_data['pinned']
            )
            if cover_img:
                announcement.cover_image.save(f'cover_{announcement.id}.png', cover_img, save=True)
                self.stdout.write(f'Added cover image for announcement: {announcement.title}')

            created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} test announcements')
        )
