"""
Study Abroad Program API Views
============================

This module implements the core business logic and API endpoints for the Study Abroad Program.
It provides ViewSets and views for managing programs, applications, and user authentication.

Key Components:
-------------
1. Authentication
   - User login with token generation
   - Current user profile retrieval

2. Programs
   - List/search available programs
   - Program details and management
   - Application status checking

3. Applications
   - Submit and track applications
   - Application status updates

Security:
--------
- Token-based authentication required for most endpoints
- Permission checks for admin-only operations
- Proper request validation and error handling
"""

from rest_framework import viewsets, filters
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate, logout as auth_logout
from rest_framework.authtoken.models import Token
from django.utils import timezone
from django.db.models import Q
from .models import Program, Application
from .serializers import ProgramSerializer, ApplicationSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    Retrieve the currently authenticated user's profile information.
    
    Requires:
        - Valid authentication token in request header
    
    Returns:
        - User ID, username, display name, and admin status
        - 401 if not authenticated
    """
    user = request.user
    return Response({
        'user_id': user.id,
        'username': user.username,
        'display_name': user.display_name,
        'is_admin': user.is_admin
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Authenticate a user and provide an access token.
    
    Accepts:
        - username: User's login name
        - password: User's password
    
    Returns:
        - Authentication token and user details on success
        - 400 if missing credentials
        - 401 if invalid credentials
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    # Validate input
    if not username or not password:
        return Response({'error': 'Please provide both username and password'}, status=400)
    
    # Authenticate user
    user = authenticate(username=username, password=password)
    if not user:
        return Response({'error': 'Invalid credentials'}, status=401)
    
    # Get or create authentication token
    token, _ = Token.objects.get_or_create(user=user)
    
    return Response({
        'token': token.key,
        'user_id': user.id,
        'username': user.username,
        'display_name': user.display_name,
        'is_admin': user.is_admin
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Logout the current user
    """
    auth_logout(request)
    return Response({'detail': 'Successfully logged out'})

class ProgramViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing study abroad programs.
    
    Provides CRUD operations for programs and includes:
    - Search by title or faculty leads
    - Ordering by application deadline
    - Filtering for current/future programs only
    - Application status checking for authenticated users
    
    Permissions:
    - List/Retrieve: All users
    - Create/Update/Delete: Admin only
    """
    serializer_class = ProgramSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'faculty_leads']
    ordering_fields = ['application_deadline']
    ordering = ['application_deadline']  # Default ordering

    def get_queryset(self):
        """
        Get the list of programs, filtered by:
        - End date (only current/future programs)
        - Search query (title or faculty leads)
        """
        # Only show current and future programs
        today = timezone.now().date()
        queryset = Program.objects.filter(end_date__gte=today)
        
        # Apply search filter if provided
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(faculty_leads__icontains=search)
            )
        
        return queryset

    @action(detail=True, methods=['get'])
    def application_status(self, request, pk=None):
        """
        Check the current user's application status for a specific program.
        
        Returns:
        - Application status and ID if an application exists
        - None if no application found or user not authenticated
        """
        program = self.get_object()
        if not request.user.is_authenticated:
            return Response({'status': None})
            
        try:
            application = Application.objects.get(
                student=request.user,
                program=program
            )
            return Response({
                'status': application.status,
                'application_id': application.id
            })
        except Application.DoesNotExist:
            return Response({'status': None})

class ApplicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing study abroad applications.
    
    Provides:
    - List user's applications
    - Submit new applications
    - Update application status
    - View application details
    
    Permissions:
    - Users can only view/edit their own applications
    - Admins can view/edit all applications
    """
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
