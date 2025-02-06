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
   - Application status checking for authenticated users

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
from .models import Program, Application, ApplicationQuestion, ApplicationResponse, Announcement
from .serializers import (
    ProgramSerializer,
    ApplicationSerializer,
    UserSerializer,
    ApplicationQuestionSerializer,
    ApplicationResponseSerializer,
    AnnouncementSerializer,
)
from api.models import User
from django.contrib.auth.hashers import make_password
from django.contrib.auth import update_session_auth_hash
from datetime import datetime
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404

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

    
class IsAdminOrSelf(permissions.BasePermission):
    """Custom permission to allow users to access their own data, while admins can access any user's data."""

    def has_object_permission(self, request, view, obj):
        return request.user.is_admin or obj.id == request.user.id

    
class IsApplicationResponseOwnerOrAdmin(permissions.BasePermission):
    """Custom permission to allow only owners of the application responses or admins to access or modify them."""

    def has_object_permission(self, request, view, obj):
        return obj.application.student == request.user or request.user.is_admin
    
class IsAdmin(permissions.BasePermission):
    """Custom permission to allow only admin to view or edit views"""
    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and request.user.is_admin


### ViewSet classes for the API interface ###


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Logout the current user
    """
    auth_logout(request)
    return Response({"detail": "Successfully logged out"})


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
    ordering = ['application_deadline']

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
        search = self.request.query_params.get("search", None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(faculty_leads__icontains=search)
            )

        return queryset
    
    def create(self, request, *args, **kwargs):
        """
        When an admin creates a new program, automatically add default questions.
        """
        response = super().create(request, *args, **kwargs)
        program_id = response.data.get("id")
        program_instance = Program.objects.get(id=program_id)

        # Default application questions
        default_questions = [
            "Why do you want to participate in this study abroad program?",
            "How does this program align with your academic or career goals?",
            "What challenges do you anticipate during this experience, and how will you address them?",
            "Describe a time you adapted to a new or unfamiliar environment.",
            "What unique perspective or contribution will you bring to the group?",
        ]

        for question_text in default_questions:
            ApplicationQuestion.objects.create(program=program_instance, text=question_text)

        return response

    @action(detail=True, methods=["get"])
    def application_status(self, request, pk=None):
        """
        Check the current user's application status for a specific program.

        Returns:
        - Application status and ID if an application exists
        - None if no application found or user not authenticated
        """
        program = self.get_object()
        if not request.user.is_authenticated:
            return Response({"status": None})

        try:
            application = Application.objects.get(student=request.user, program=program)
            return Response(
                {"status": application.status, "application_id": application.id}
            )
        except Application.DoesNotExist:
            return Response({'status': None})
    
    @action(detail=True, methods=['get'])
    def applicant_counts(self, request, pk=None):
        """
        Returns counts of applicants in different statuses for a given program.
        """
        program = self.get_object()

        applicant_counts = Application.objects.filter(program=program).aggregate(
            applied=Count('id', filter=Q(status='Applied')),
            enrolled=Count('id', filter=Q(status='Enrolled')),
            withdrawn=Count('id', filter=Q(status='Withdrawn')),
            canceled=Count('id', filter=Q(status='Canceled'))
        )

        applicant_counts['total_active'] = applicant_counts['applied'] + applicant_counts['enrolled']

        return Response(applicant_counts)
    
    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        """
        Returns all application questions for a program.
        """
        program = self.get_object()
        questions = ApplicationQuestion.objects.filter(program=program)
        serializer = ApplicationQuestionSerializer(questions, many=True)
        return Response(serializer.data)

class ApplicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing study abroad applications.

    Features:
    - List all applications (admin-only)
    - Retrieve specific application
    - Filter applications by applicant (GET `/api/applications/?student=<user_id>`)
    - Filter applications by program (GET `/api/applications/?program=<program_id>`)
    """

    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        """
        Admins can view all applications. 
        Students can only view their own applications.
        Supports filtering by student ID and program ID.
        """
        queryset = Application.objects.all()

        student_id = self.request.query_params.get('student', None)
        if student_id:
            queryset = queryset.filter(student_id=student_id)

        program_id = self.request.query_params.get('program', None)
        if program_id:
            queryset = queryset.filter(program_id=program_id)

        return queryset

    def partial_update(self, request, *args, **kwargs):
        """Restrict status updates based on user role."""
        application = self.get_object()
        if "status" in request.data:
            if not request.user.is_admin:
                # Users can only withdraw or apply their applications
                if request.data["status"] != "Withdrawn" and request.data["status"] != "Applied":
                    return Response(
                        {
                            "detail": "Only admins can change the status to 'Enrolled' or 'Cancelled'."
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )
        return super().partial_update(request, *args, **kwargs)


    @action(detail=False, methods=["post"])
    def create_or_edit(self, request):
        """
        Create or edit the current user's application for a specific program.

        Returns:
        - Application ID if an application exists or creates a new one
        """
        # Get the authenticated user (student)
        student = request.user  # Ensure request.user is authenticated

        # Get the program instance from the database
        program_id = request.data.get("program")
        program = Program.objects.get(id=program_id)

        students_application = Application.objects.filter(
            student=student, program=program
        ).first()

        if not students_application:
            new_application = Application.objects.create(
                student=student,
                program=program,
                date_of_birth=request.data.get("date_of_birth"),
                gpa=request.data.get("gpa"),
                major=request.data.get("major"),
                status="Applied",
                applied_on=datetime.now(),
            )
            return Response(
                {"message": "Application created", "id": new_application.id},
                status=status.HTTP_201_CREATED,
            )

        students_application.date_of_birth = request.data.get("date_of_birth")
        students_application.gpa = request.data.get("gpa")
        students_application.major = request.data.get("major")
        students_application.status = "Applied"
        students_application.applied_on = datetime.now()
        students_application.save()

        return Response(
            {"message": "Application updated", "id": students_application.id},
            status=status.HTTP_200_OK,
        )


class ApplicationQuestionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for managing application questions.

    Provides CRUD operations for application questions associated with study abroad programs.

    Permissions:
    - List/Retrieve: Admin or authenticated users only
    - Create/Update/Delete: Admin only
    """

    queryset = ApplicationQuestion.objects.all()

    serializer_class = ApplicationQuestionSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = ApplicationQuestion.objects.all()
        program_id = self.request.query_params.get('program', None)
        
        if program_id is not None:
            queryset = queryset.filter(program_id=program_id)
        
        return queryset


class ApplicationResponseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing responses to application questions.

    Provides:
    - Viewing and editing responses to application questions
    - Filtering by question ID and student ID

    Permissions:
    - List/Retrieve: Authenticated users (only their own responses) and admins
    - Create/Update/Delete: Authenticated users (only their own responses) and admins
    """

    queryset = ApplicationResponse.objects.all()
    serializer_class = ApplicationResponseSerializer
    permission_classes = [
        permissions.IsAuthenticated,
        IsApplicationResponseOwnerOrAdmin,
    ]

    def get_queryset(self):
        """
        Admins can view all responses and filter by question or student.
        Students can only view their own responses.
        """
        queryset = ApplicationResponse.objects.all()

        question_id = self.request.query_params.get("question", None)
        application_id = self.request.query_params.get("application", None)

        if question_id:
            queryset = queryset.filter(question_id=question_id)

        if application_id:
            queryset = queryset.filter(application_id=application_id)

        if not self.request.user.is_admin:
            queryset = queryset.filter(application__student=self.request.user)

        return queryset

    @action(detail=False, methods=["post"])
    def create_or_edit(self, request):
        """
        Create or edit the current user's responses for a specific program.
        """

        application = Application.objects.get(
            id=request.data.get("application")
        )
        
        question = ApplicationQuestion.objects.get(
            id=request.data.get("question_id")
        )

        questionResponse = ApplicationResponse.objects.filter(
            application=application,
            question=question,
        ).first()

        if not questionResponse:
            newQuestionResponse = ApplicationResponse.objects.create(
                application=application,
                question=question,
                response=request.data.get("response_text"),
            )
            return Response(
                {"message": "Responses created", "id": newQuestionResponse.id},
                status=status.HTTP_200_OK,
            )

        questionResponse.response = request.data.get("response_text")
        questionResponse.save()

        return Response(
            {"message": "Responses updated", "id": questionResponse.id},
            status=status.HTTP_200_OK,
        )


class AnnouncementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing announcements.
    
    Provides:
    - List all announcements (GET, public access)
    - Create new announcement (POST, admin only)
    - Retrieve specific announcement (GET, public access)
    - Update announcement (PUT/PATCH, admin only)
    - Delete announcement (DELETE, admin only)
    """
    serializer_class = AnnouncementSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'importance']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Instantiate and return the list of permissions that this view requires.
        - GET methods are publicly accessible
        - All other methods require admin permissions
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated, IsAdmin]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """
        Get the list of announcements.
        Non-admin users and anonymous users only see active announcements.
        """
        queryset = Announcement.objects.all()
        
        # Check if user is authenticated and admin
        if not self.request.user.is_authenticated or not self.request.user.is_admin:
            queryset = queryset.filter(is_active=True)
            
        return queryset


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing users. Admins can view all users, while regular users can only view their own data.

    Provides:
    - Viewing the current authenticated user's details
    - Logging in to obtain an authentication token
    - Logging out to invalidate the authentication token

    Permissions:
    - Login: Anyone
    - Logout: Authenticated users
    - Current user details: Authenticated users
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminOrSelf]

    @action(
        detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated]
    )
    def current_user(self, request):
        """Get details of the currently authenticated user."""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=["post"], permission_classes=[permissions.AllowAny])
    def login(self, request):
        """Custom login endpoint."""
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(request, username=username, password=password)

        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({"token": token.key, "user": UserSerializer(user).data})
        return Response(
            {"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED
        )

    @action(detail=False, methods=["post"], permission_classes=[permissions.AllowAny])
    def logout(self, request):
        """Custom logout endpoint."""
        try:
            request.auth.delete()
            return Response({"detail": "Successfully logged out."})
        except AttributeError:
            return Response(
                {"detail": "Not logged in."}, status=status.HTTP_400_BAD_REQUEST
            )


### Frontend Views ###


@api_view(["GET"])
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
    return Response(
        {
            "user_id": user.id,
            "username": user.username,
            "display_name": user.display_name,
            "is_admin": user.is_admin,
        }
    )


@api_view(["POST"])
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
    username = request.data.get("username")
    password = request.data.get("password")

    # Validate input
    if not username or not password:
        return Response(
            {"error": "Please provide both username and password"}, status=400
        )

    # Authenticate user
    user = authenticate(username=username, password=password)
    if not user:
        return Response({"error": "Invalid credentials"}, status=401)

    # Get or create authentication token
    token, _ = Token.objects.get_or_create(user=user)

    return Response(
        {
            "token": token.key,
            "user_id": user.id,
            "username": user.username,
            "display_name": user.display_name,
            "is_admin": user.is_admin,
        }
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def signup_view(request):
    """
    Sign up a user and provide an access token.

    Accepts:
        - username: User's login name
        - password: User's password

    Returns:
        - Authentication token and user details on success
        - 400 if missing credentials
        - 401 if invalid credentials
    """
    username = request.data.get("username")
    password = request.data.get("password")
    display_name = request.data.get("displayName")
    email = request.data.get("email")

    # Validate input
    if not username or not password:
        return Response(
            {"error": "Please provide both username and password"}, status=400
        )

    # Authenticate user
    # Create base user account with authentication fields
    user = User.objects.create(
        username=username,
        password=make_password(password),  # All test users have password 'guest'
        display_name=display_name,
        email=email,
        is_admin=False,
        is_staff=False,
        is_superuser=False,
        is_active=True,  # Account is active and can log in
    )

    if not user:
        return Response({"error": "Invalid credentials"}, status=401)

    # Get or create authentication token
    token, _ = Token.objects.get_or_create(user=user)

    return Response(
        {
            "token": token.key,
            "user_id": user.id,
            "username": user.username,
            "display_name": user.display_name,
            "is_admin": user.is_admin,
        }
    )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change the current user's password.
    """
    confirmPassword = request.data.get("confirmPassword")
    password = request.data.get("password")

    # Validate input
    if password != confirmPassword:
        return Response({"error": "Please provide both fields"}, status=400)

    user = request.user
    user.set_password(password)
    user.save()

    # Update the session auth hash to keep the user logged in
    update_session_auth_hash(request, user)

    # Generate a new token (optional)
    token, _ = Token.objects.get_or_create(user=user)

    return Response(
        {
            "token": token.key,
            "user_id": user.id,
            "username": user.username,
            "display_name": user.display_name,
            "is_admin": user.is_admin,
        }
    )
