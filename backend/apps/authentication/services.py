from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken


class UserService:
    @staticmethod
    def get_tokens_for_user(user):
        """Generate Access and Refresh JWT Tokens for a user."""
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

    @staticmethod
    def update_profile(user, data):
        """Update User and UserProfile fields."""
        profile_data = data.get('profile', {})
        
        # Update User fields
        user.email = data.get('email', user.email)
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.save()

        # Update UserProfile fields
        profile = user.profile
        profile.department = profile_data.get('department', profile.department)
        profile.save()

        return user
