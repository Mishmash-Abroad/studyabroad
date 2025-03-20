import os
import subprocess
from datetime import datetime
from pathlib import Path
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings

class Command(BaseCommand):
    help = 'Create a backup archive of the Django database and media files, keeping only the latest backup.'

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
        # Define backup directory
        backup_path = os.path.join(settings.BASE_DIR, 'backups')

        # Create backup directory if it does not exist
        Path(backup_path).mkdir(parents=True, exist_ok=True)

        # Construct filename with timestamp
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        file_extension = "tar.gz" if not options['no_compress'] else "tar"
        backup_filename = f"backup_{timestamp}.{file_extension}"
        backup_filepath = os.path.join(backup_path, backup_filename)

        compress = not options['no_compress']
        dry_run = options['dry_run']
        database = options['database']

        # Dry run: Show what would happen
        if dry_run:
            self.stdout.write(self.style.WARNING(f"DRY RUN: Would create '{backup_filepath}'"))
            return

        try:
            # Remove old backups before proceeding
            self._clean_old_backups(backup_path)

            # Construct the command for database backup
            command = ["python", "manage.py", "archive"]
            if database:
                command.extend(["--database", database])
            if not compress:
                command.append("--no-compress")

            # Execute the backup command
            subprocess.run(command, check=True)

            self.stdout.write(self.style.SUCCESS(f"Successfully created latest backup: {backup_filepath}"))
        except subprocess.CalledProcessError as e:
            raise CommandError(f"Backup failed: {str(e)}")

    def _clean_old_backups(self, backup_path):
        """Removes all old backups in the backup directory, keeping only the latest one."""
        backup_files = sorted(Path(backup_path).glob("*.tar.bz2"), key=lambda f: f.stat().st_mtime)

        for old_backup in backup_files:  # Keep only the latest
            try:
                old_backup.unlink()
                self.stdout.write(self.style.WARNING(f"Deleted old backup: {old_backup}"))
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"Error deleting {old_backup}: {e}"))
