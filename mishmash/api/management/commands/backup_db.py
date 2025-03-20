import os
import subprocess
from datetime import datetime
from pathlib import Path
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

class Command(BaseCommand):
    help = "Create a backup archive of the Django database and media files, keeping only the latest backup."

    def add_arguments(self, parser):
        parser.add_argument(
            "--no-compress",
            action="store_true",
            help="Disable compression of the backup file",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would be done without actually creating a backup",
        )
        parser.add_argument(
            "--database",
            type=str,
            help="Specify database to backup (default: all configured databases)",
        )
        parser.add_argument(
            "--aes-key",
            type=str,
            help="AES-256 encryption key in hex format (64 characters)",
        )

    def handle(self, *args, **options):
        # Define backup directory
        backup_path = os.path.join(settings.BASE_DIR, "backups")

        # Create backup directory if it does not exist
        Path(backup_path).mkdir(parents=True, exist_ok=True)

        # Construct filename with timestamp
        timestamp = datetime.now().strftime("%Y-%m-%d--%H-%M-%S")
        file_extension = "tar.bz2" if not options["no_compress"] else "tar"
        backup_filename = f"{timestamp}.{file_extension}"
        backup_filepath = os.path.join(backup_path, backup_filename)

        encrypt = bool(options["aes_key"])  # Enable encryption if AES key is provided
        encrypted_filepath = f"{backup_filepath}.enc" if encrypt else backup_filepath

        compress = not options["no_compress"]
        dry_run = options["dry_run"]
        database = options["database"]
        aes_key = options["aes_key"]

        # Dry run: Show what would happen
        if dry_run:
            self.stdout.write(
                self.style.WARNING(f"DRY RUN: Would create backup '{backup_filepath}'")
            )
            if encrypt:
                self.stdout.write(
                    self.style.WARNING(
                        f"DRY RUN: Would encrypt '{backup_filepath}' to '{encrypted_filepath}'"
                    )
                )
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
            if encrypt:
                self._encrypt_backup(backup_filepath, encrypted_filepath, aes_key)

            self.stdout.write(
                self.style.SUCCESS(
                    f"Successfully created latest backup: {backup_filepath}"
                )
            )
        except subprocess.CalledProcessError as e:
            raise CommandError(f"Backup failed: {str(e)}")

    def _clean_old_backups(self, backup_path):
        """Removes all old backups in the backup directory, keeping only the latest one."""
        backup_files = sorted(
            Path(backup_path).glob("*.tar.bz2"), key=lambda f: f.stat().st_mtime
        )

        for old_backup in backup_files:  # Keep only the latest
            try:
                old_backup.unlink()
                self.stdout.write(
                    self.style.WARNING(f"Deleted old backup: {old_backup}")
                )
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"Error deleting {old_backup}: {e}"))

    def _encrypt_backup(self, input_file, output_file, aes_key):
        """Encrypts the backup file using OpenSSL AES-256 encryption with a given key."""
        aes_key_bytes = bytes.fromhex(aes_key)
        iv = os.urandom(16)  # Generate a new random IV for each file

        cipher = Cipher(algorithms.AES(aes_key_bytes), modes.CBC(iv), backend=default_backend())
        encryptor = cipher.encryptor()

        with open(input_file, 'rb') as f_in, open(output_file, 'wb') as f_out:
            f_out.write(iv)  # Store IV at the beginning of the encrypted file
            while chunk := f_in.read(16):  # Read in 16-byte blocks
                if len(chunk) % 16 != 0:
                    chunk += b'\x00' * (16 - len(chunk))  # PKCS7 padding-like approach
                f_out.write(encryptor.update(chunk))
            f_out.write(encryptor.finalize())

        os.remove(input_file)  # Delete the original file after encryption
        print(f"Encrypted backup saved as: {output_file}")