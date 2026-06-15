from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import RegisterSerializer, UserSerializer
from .services import UserService


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom Login View returning JWT Tokens and User profile info."""
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            from django.contrib.auth.models import User
            user = User.objects.get(username=request.data.get('username'))
            user_data = UserSerializer(user).data
            response.data['user'] = user_data
        return response


class RegisterView(APIView):
    """User registration API."""
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = UserService.get_tokens_for_user(user)
            user_data = UserSerializer(user).data
            return Response({
                'user': user_data,
                'tokens': tokens
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    """Retrieve and update current user info."""
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        user = UserService.update_profile(request.user, request.data)
        serializer = UserSerializer(user)
        return Response(serializer.data)
