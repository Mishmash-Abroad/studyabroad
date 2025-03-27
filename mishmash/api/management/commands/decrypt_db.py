import os
from django.core.management.base import BaseCommand, CommandError
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

class Command(BaseCommand):
    help = "Decrypt a backup file encrypted with AES-256"

    def add_arguments(self, parser):
        parser.add_argument('input_file', type=str, help='Path to the encrypted backup file')
        parser.add_argument('output_file', type=str, help='Path to save the decrypted file')
        parser.add_argument('--aes-key', type=str, required=True, help='AES-256 encryption key in hex format (64 characters)')

    def handle(self, *args, **options):
        input_file = options['input_file']
        output_file = options['output_file']
        aes_key_hex = options['aes_key']
        
        try:
            # Convert hex key to bytes
            aes_key = bytes.fromhex(aes_key_hex)
            
            with open(input_file, 'rb') as f_in:
                # Read the IV from the beginning of the file (first 16 bytes)
                iv = f_in.read(16)
                
                # Create the cipher
                cipher = Cipher(algorithms.AES(aes_key), modes.CBC(iv), backend=default_backend())
                decryptor = cipher.decryptor()
                
                # Open output file for writing
                with open(output_file, 'wb') as f_out:
                    while True:
                        chunk = f_in.read(16)
                        if not chunk:
                            break
                        # Write decrypted chunk to output file
                        f_out.write(decryptor.update(chunk))
                    
                    # Finalize decryption
                    f_out.write(decryptor.finalize())
            
            self.stdout.write(self.style.SUCCESS(f"File decrypted successfully: {output_file}"))
        
        except Exception as e:
            raise CommandError(f"Decryption failed: {str(e)}")