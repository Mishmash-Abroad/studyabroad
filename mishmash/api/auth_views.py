# auth_views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .serializers import UserSerializer

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def auth_token_view(request):
    """
    Returns the DRF token for the authenticated user.
    If the token does not exist, it is created.
    """
    token, created = Token.objects.get_or_create(user=request.user)
    return Response({"token": token.key})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """
    Returns the current user's details.
    This is similar to the `current_user` action in your UserViewSet.
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)
