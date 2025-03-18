import os
import subprocess
from datetime import datetime
from pathlib import Path
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings

class Command(BaseCommand):
    help = 'Create a backup archive of the Django database and media files'

    def add_arguments(self, parser):
        parser.add_argument(
            '--no-compress',
            action='store_true',
            help='Disable compression of the backup file',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without actually creating a backup',
        )
        parser.add_argument(
            '--database',
            type=str,
            help='Specify database to backup (default: all configured databases)',
        )

    def handle(self, *args, **options):
        # Ensure that backups are stored in '/app/backups' by default, or use the user-specified path
        backup_path = os.path.join(settings.BASE_DIR, 'backups')

        compress = not options['no_compress']
        dry_run = options['dry_run']
        database = options['database']

        # Ensure backup directory exists
        Path(backup_path).mkdir(parents=True, exist_ok=True)

        if dry_run:
            self.stdout.write(self.style.WARNING(f"DRY RUN: Would create archive backup in '{backup_path}'"))
            return

        try:
            # Construct the command to run django-archive's archive command
            command = ["python", "manage.py", "archive"]
            if database:
                command.extend(["--database", database])
            if not compress:
                command.append("--no-compress")

            # Run the command
            subprocess.run(command, check=True)
            self.stdout.write(self.style.SUCCESS(f"Successfully created backup in: {backup_path}"))
        except subprocess.CalledProcessError as e:
            raise CommandError(f"Backup failed: {str(e)}")
