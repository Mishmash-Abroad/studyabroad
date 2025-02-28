import logging
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.account.utils import user_field
from django.core.exceptions import ValidationError

logger = logging.getLogger(__name__)

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    """
    Custom adapter to correctly map SSO data to user fields.
    """

    def populate_user(self, request, sociallogin, data):
        """
        Populates user fields based on the actual SSO response.
        """
        logger.info(f"SSO response data: {data}")
        
        user = super().populate_user(request, sociallogin, data)

        extra_data = sociallogin.account.extra_data

        logger.info(f"SSO extra_data: {extra_data}")
        
        duke_net_id = extra_data.get("dukeNetID")
        full_name = extra_data.get("name")

        if not duke_net_id:
            raise ValidationError("SSO response does not contain a valid 'dukeNetID' field.")

        user.username = duke_net_id
        user.display_name = full_name if full_name else "New User"

        return user
