from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.contrib.auth import get_user_model

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        """
        This method is executed when the user logs in via a social account.
        """
        super().pre_social_login(request, sociallogin)

        # Create a user if they don't exist
        user = sociallogin.user
        if user.id is None:
            user.save()

        # Generate JWT Token
        refresh = RefreshToken.for_user(user)

        # Log the generated token
        print(f"Generated JWT Token: {refresh.access_token}")
        
        sociallogin.token = refresh.access_token

        return sociallogin