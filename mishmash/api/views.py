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

from rest_framework import viewsets, filters, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate, logout as auth_logout
from rest_framework.authtoken.models import Token
from django.utils import timezone
from django.db.models import Q
from .models import Program, Application, ApplicationQuestion, ApplicationResponse
from .serializers import ProgramSerializer, ApplicationSerializer, UserSerializer, ApplicationQuestionSerializer, ApplicationResponseSerializer

### Custom permission classes for API access ###

class IsAdminOrReadOnly(permissions.BasePermission):
    """Custom permission to allow only admins to edit, but allow read access to everyone."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.is_admin

class IsOwnerOrAdmin(permissions.BasePermission):
    """Custom permission to allow only the owner or an admin to edit/view."""

    def has_object_permission(self, request, view, obj):
        return obj.student == request.user or request.user.is_admin
    
class IsApplicationResponseOwnerOrAdmin(permissions.BasePermission):
    """Custom permission to allow only owners of the application responses or admins to access or modify them."""
    def has_object_permission(self, request, view, obj):
        return obj.application.student == request.user or request.user.is_admin

### ViewSet classes for the API interface ### 

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
    permission_classes = [IsAdminOrReadOnly]
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
    - Listing and retrieving applications for the current user
    - Submitting new applications
    - Updating application details (e.g., canceling an application)

    Permissions:
    - List/Retrieve: Authenticated users (only their own applications) and admins
    - Create: Authenticated users
    - Update/Delete: Authenticated users (only their own applications) and admins
    - Admin-only actions:
        - Change application status to 'Enrolled' or 'Withdrawn'
    """
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        """Allow users to view only their own applications, unless they are an admin."""
        if self.request.user.is_admin:
            return Application.objects.all()
        return Application.objects.filter(student=self.request.user)

    def partial_update(self, request, *args, **kwargs):
        """Restrict status updates based on user role."""
        application = self.get_object()
        if 'status' in request.data:
            if not request.user.is_admin:
                # Users can only cancel their applications
                if request.data['status'] != 'Canceled':
                    return Response(
                        {"detail": "Only admins can change the status to 'Enrolled' or 'Withdrawn'."},
                        status=status.HTTP_403_FORBIDDEN
                    )
        return super().partial_update(request, *args, **kwargs)

class ApplicationQuestionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing application questions.

    Provides CRUD operations for application questions associated with study abroad programs.

    Permissions:
    - List/Retrieve: Admin or authenticated users only
    - Create/Update/Delete: Admin only
    """
    queryset = ApplicationQuestion.objects.all()
    serializer_class = ApplicationQuestionSerializer
    permission_classes = [IsAdminOrReadOnly]

class ApplicationResponseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing responses to application questions.

    Provides:
    - Viewing and editing responses to application questions

    Permissions:
    - List/Retrieve: Authenticated users (only their own responses) and admins
    - Create/Update/Delete: Authenticated users (only their own responses) and admins
    """
    queryset = ApplicationResponse.objects.all()
    serializer_class = ApplicationResponseSerializer
    permission_classes = [permissions.IsAuthenticated, IsApplicationResponseOwnerOrAdmin]

    def get_queryset(self):
        """Allow users to view only their own responses, unless they are an admin."""
        if self.request.user.is_admin:
            return ApplicationResponse.objects.all()
        return ApplicationResponse.objects.filter(application__student=self.request.user)

class UserViewSet(viewsets.ViewSet):
    """
    ViewSet for managing user authentication and account details.

    Provides:
    - Viewing the current authenticated user's details
    - Logging in to obtain an authentication token
    - Logging out to invalidate the authentication token

    Permissions:
    - Login: Anyone
    - Logout: Authenticated users
    - Current user details: Authenticated users
    """
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def current_user(self, request):
        """Get details of the currently authenticated user."""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def login(self, request):
        """Custom login endpoint."""
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(request, username=username, password=password)

        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({"token": token.key, "user": UserSerializer(user).data})
        return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def logout(self, request):
        """Custom logout endpoint."""
        try:
            request.auth.delete()  # Deletes the token
            return Response({"detail": "Successfully logged out."})
        except AttributeError:
            return Response({"detail": "Not logged in."}, status=status.HTTP_400_BAD_REQUEST)
    

### Frontend Views ###

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
