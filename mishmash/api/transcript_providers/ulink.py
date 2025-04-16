from .base import TranscriptProvider
from .ulink_scraper import get_ulink_pin, refresh_ulink_transcript
from django.core.exceptions import ValidationError
from ..models import User

class UlinkProvider(TranscriptProvider):
    def is_account_required(self):
        return True

    def validate_account(self, credentials):
        username = credentials.get("ulink_username")
        pin = credentials.get("ulink_pin")
        if not username or not pin:
            raise ValidationError("Ulink username and PIN are required.")

        real_pin = get_ulink_pin(username)
        if str(real_pin) != str(pin):
            return False
        return True

    def fetch_transcript(self, user):
        print("test")
        if not user.ulink_username:
            raise ValidationError("User does not have a linked Ulink account.")
        return refresh_ulink_transcript(user.ulink_username)

    def connect_account(self, user, credentials):
        if user.is_sso:
            raise ValidationError("SSO users cannot manually connect Ulink accounts.")

        if user.ulink_username:
            raise ValidationError("This account is already linked to Ulink.")

        username = credentials.get("ulink_username")

        if User.objects.filter(ulink_username=username).exclude(pk=user.pk).exists():
            raise ValidationError("Ulink account is already linked to another user.")

        if not self.validate_account(credentials):
            raise ValidationError("Incorrect credentials for Ulink account.")

        user.ulink_username = username
        user.save()
