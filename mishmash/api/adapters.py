from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.account.utils import user_field
from django.core.exceptions import ValidationError

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    """
    Custom adapter to properly map SSO data to user fields.
    - Sets `username` to `dukeNetID`
    - Sets `display_name` to `name`
    """

    def populate_user(self, request, sociallogin, data):
        """
        Populates user fields based on the SSO response.
        """
        user = super().populate_user(request, sociallogin, data)

        duke_net_id = data.get("dukeNetID")
        full_name = data.get("name")

        if not duke_net_id:
            raise ValidationError("SSO response does not contain a valid 'dukeNetID' field.")

        # Set fields
        user.username = duke_net_id  # Set username to dukeNetID
        user.display_name = full_name if full_name else "New User"  # Set display_name to 'name'

        return user
