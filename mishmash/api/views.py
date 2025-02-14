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
from datetime import datetime, timedelta
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError, NotFound, PermissionDenied

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
        if request.user.is_admin:
            return request.method in permissions.SAFE_METHODS

        return obj.application.student == request.user

    
class IsAdmin(permissions.BasePermission):
    """Custom permission to allow only admin to view or edit views"""
    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and request.user.is_admin


### ViewSet classes for the API interface ###

class ProgramViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing study abroad programs.

    This API provides CRUD operations for programs, along with additional endpoints for 
    retrieving application status, applicant statistics, and application questions.

    ## Permissions:
    - List/Retrieve: All users
    - Create/Update/Delete: Admin only

    ## Endpoints:
    - `GET /api/programs/` → List all programs (public)
    - `POST /api/programs/` → Create a new program (admin only)
    - `GET /api/programs/{id}/` → Retrieve specific program details (public)
    - `PUT/PATCH /api/programs/{id}/` → Update an existing program (admin only)
    - `DELETE /api/programs/{id}/` → Delete a program (admin only)
    - `GET /api/programs/{id}/application_status/` → Get current user's application status (authenticated users)
    - `GET /api/programs/{id}/applicant_counts/` → Get applicant counts for a program (admin only)
    - `GET /api/programs/{id}/questions/` → Get application questions for a program (public)
    """

    serializer_class = ProgramSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'faculty_leads']
    ordering_fields = ['application_deadline']
    ordering = ['application_deadline']

    def get_queryset(self):
        """
        Retrieve the list of study abroad programs.

        ## Filters:
        - Filters programs where `end_date >= today` (only current and future programs are shown)
        - Optional search filter for `title` or `faculty_leads`

        ## Returns:
        - 200 OK: List of programs (filtered)

        ## Example:
        - `GET /api/programs/?search=engineering`

        ## Permissions:
        - Public access (any user)
        """

        today = timezone.now().date()
        queryset = Program.objects.filter(end_date__gte=today)

        search = self.request.query_params.get("search", None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(faculty_leads__icontains=search)
            )

        return queryset
    
    def create(self, request, *args, **kwargs):
        """
        Create a new study abroad program.

        ## Expected Input (JSON):
        ```json
        {
            "title": "Engineering in Germany",
            "year_semester": "Fall 2025",
            "faculty_leads": "Dr. Smith",
            "application_open_date": "2025-01-01",
            "application_deadline": "2025-03-15",
            "start_date": "2025-05-01",
            "end_date": "2025-07-31",
            "description": "An amazing program in Germany."
        }
        ```

        ## Validation:
        - `application_open_date` cannot be after `application_deadline`
        - `start_date` cannot be after `end_date`
        - Dates must be formatted as `YYYY-MM-DD`

        ## Returns:
        - 201 Created: Program created successfully
        - 400 Bad Request: Invalid input or date validation failed

        ## Permissions:
        - Admin only
        """

        application_open_date = request.data.get("application_open_date")
        application_deadline = request.data.get("application_deadline")
        start_date = request.data.get("start_date")
        end_date = request.data.get("end_date")

        try:
            application_open_date = datetime.strptime(application_open_date, "%Y-%m-%d").date()
            application_deadline = datetime.strptime(application_deadline, "%Y-%m-%d").date()
            start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
            end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
        except (TypeError, ValueError):
            raise ValidationError({"detail": "Invalid date format. Use YYYY-MM-DD."})

        if application_open_date > application_deadline:
            raise ValidationError({"detail": "Application open date cannot be after the application deadline."})

        if start_date > end_date:
            raise ValidationError({"detail": "Start date cannot be after the end date."})

        response = super().create(request, *args, **kwargs)
        program_instance = Program.objects.get(id=response.data.get("id"))

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
    
    def update(self, request, *args, **kwargs):
        """
        Update an existing study abroad program.

        ## Expected Input (JSON):
        ```json
        {
            "title": "Updated Program Name",
            "year_semester": "Fall 2026",
            "faculty_leads": "Dr. New Lead",
            "application_open_date": "2026-02-01",
            "application_deadline": "2026-04-15",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
            "description": "Updated program details."
        }
        ```

        ## Validation:
        - `application_open_date` cannot be after `application_deadline`
        - `start_date` cannot be after `end_date`
        - Dates must be formatted as `YYYY-MM-DD`

        ## Returns:
        - 200 OK: Program updated successfully
        - 400 Bad Request: Invalid input or failed validation

        ## Permissions:
        - Admin only
        """
        program_instance = self.get_object()

        application_open_date = request.data.get("application_open_date", program_instance.application_open_date)
        application_deadline = request.data.get("application_deadline", program_instance.application_deadline)
        start_date = request.data.get("start_date", program_instance.start_date)
        end_date = request.data.get("end_date", program_instance.end_date)

        try:
            application_open_date = datetime.strptime(application_open_date, "%Y-%m-%d").date() if isinstance(application_open_date, str) else application_open_date
            application_deadline = datetime.strptime(application_deadline, "%Y-%m-%d").date() if isinstance(application_deadline, str) else application_deadline
            start_date = datetime.strptime(start_date, "%Y-%m-%d").date() if isinstance(start_date, str) else start_date
            end_date = datetime.strptime(end_date, "%Y-%m-%d").date() if isinstance(end_date, str) else end_date
        except (TypeError, ValueError):
            raise ValidationError({"detail": "Invalid date format. Use YYYY-MM-DD."})

        if application_open_date > application_deadline:
            raise ValidationError({"detail": "Application open date cannot be after the application deadline."})

        if start_date > end_date:
            raise ValidationError({"detail": "Start date cannot be after the end date."})

        return super().update(request, *args, **kwargs)


    @action(detail=True, methods=["get"], permission_classes=[IsAdminOrReadOnly])
    def application_status(self, request, pk=None):
        """
        Get the current user's application status for a specific program.

        ## Returns:
        - 200 OK: `{"status": "Applied", "application_id": 12}`
        - 401 Unauthorized: If user is not authenticated
        - 404 Not Found: If application does not exist

        ## Example:
        - `GET /api/programs/5/application_status/`

        ## Permissions:
        - Authenticated users only
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
    
    @action(detail=True, methods=["get"], permission_classes=[IsAdminOrReadOnly])
    def applicant_counts(self, request, pk=None):
        """
        Retrieve the number of applicants in different statuses for a program.

        ## Returns:
        - 200 OK: `{ "applied": 10, "enrolled": 5, "withdrawn": 2, "canceled": 1, "total_active": 15 }`

        ## Example:
        - `GET /api/programs/3/applicant_counts/`

        ## Permissions:
        - Admin only
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
    
    @action(detail=True, methods=["get"], permission_classes=[IsAdminOrReadOnly])
    def questions(self, request, pk=None):
        """
        Retrieve all application questions for a specific program.

        ## Returns:
        - 200 OK: List of questions
        - 404 Not Found: If program does not exist

        ## Example:
        - `GET /api/programs/2/questions/`

        ## Permissions:
        - Public access
        """
        program = self.get_object()
        questions = ApplicationQuestion.objects.filter(program=program)
        serializer = ApplicationQuestionSerializer(questions, many=True)
        return Response(serializer.data)

class ApplicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing study abroad applications.

    ## Features:
    - Admins can view all applications.
    - Students can only view their own applications.
    - Supports filtering by student ID (`GET /api/applications/?student=<id>`)
    - Supports filtering by program ID (`GET /api/applications/?program=<id>`).
    - Ensures applicants must be at least 10 years old.

    ## Permissions:
    - **Admin:** Can view, create, update, and delete any application.
    - **Students:** Can only create, update, and view their own applications.

    ## Routes:
    - `GET /api/applications/` → List applications (filtered by student/program)
    - `GET /api/applications/{id}/` → Retrieve application details
    - `POST /api/applications/` → Submit a new application (age validation enforced)
    - `PATCH /api/applications/{id}/` → Modify an application (restricted updates)
    - `DELETE /api/applications/{id}/` → Delete an application (admin-only)
    """

    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        """
        Retrieve applications, filtered by student or program.

        ## Permissions:
        - **Admin:** Can view all applications.
        - **Students:** Can only view their own applications.

        ## Query Parameters:
        - `student=<id>` → Filters by student ID (admin only).
        - `program=<id>` → Filters by program ID.

        ## Returns:
        - List of applications matching the filters.
        """
        queryset = Application.objects.all()

        student_id = self.request.query_params.get('student', None)
        if student_id:
            queryset = queryset.filter(student_id=student_id)

        program_id = self.request.query_params.get('program', None)
        if program_id:
            queryset = queryset.filter(program_id=program_id)

        return queryset
    
    def perform_create(self, serializer):
        """
        Automatically assign the authenticated user as the applicant.
        """
        serializer.save(student=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """
        Submit a new application.

        ## Permissions:
        - **Students:** Can apply for a program.
        - **Admin:** Can create applications on behalf of students.

        ## Expected Input (JSON):
        ```json
        {
            "program": 1,
            "date_of_birth": "2008-05-20",
            "gpa": 3.8,
            "major": "Computer Science"
        }
        ```

        ## Validation:
        - `date_of_birth` must be at least 10 years ago.
        - `program` must exist.

        ## Returns:
        - `201 Created` with `{"message": "Application created", "id": <id>}`
        - `400 Bad Request` if invalid data is provided.
        """
        date_of_birth_str = request.data.get("date_of_birth")

        try:
            date_of_birth = datetime.strptime(date_of_birth_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({"detail": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        min_birth_date = datetime.today().date() - timedelta(days=10 * 365)
        if date_of_birth > min_birth_date:
            return Response({"detail": "Applicants must be at least 10 years old."}, status=status.HTTP_400_BAD_REQUEST)

        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """
        Update an existing application.

        ## Permissions:
        - **Students:** Can update their own applications.
        - **Admin:** Can update any application.

        ## Expected Input (JSON):
        ```json
        {
            "gpa": 3.9,
            "major": "Data Science",
            "status": "Withdrawn"
        }
        ```

        ## Restrictions:
        - If `date_of_birth` is updated, the applicant must still be at least 10 years old.
        - **Students** may only change `status` to **"Applied" or "Withdrawn"**.
        - **Admins** may change `status` to **"Enrolled" or "Cancelled"**.
        - Students **cannot** change the program they applied to.

        ## Returns:
        - `200 OK` if the update succeeds.
        - `400 Bad Request` if validation fails.
        - `403 Forbidden` if unauthorized changes are attempted.
        """

        application = self.get_object()
        user = request.user
        data = request.data.copy()

        if "date_of_birth" in data:
            try:
                new_dob = datetime.strptime(data["date_of_birth"], "%Y-%m-%d").date()
            except ValueError:
                return Response({"detail": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

            min_birth_date = datetime.today().date() - timedelta(days=10 * 365)
            if new_dob > min_birth_date:
                return Response({"detail": "Applicants must be at least 10 years old."}, status=status.HTTP_400_BAD_REQUEST)

        if "status" in data:
            new_status = data["status"]

            if not user.is_admin:
                if new_status not in ["Applied", "Withdrawn"]:
                    return Response(
                        {"detail": "Students can only change their application status to 'Applied' or 'Withdrawn'."},
                        status=status.HTTP_403_FORBIDDEN,
                    )

            else:
                if new_status not in ["Applied", "Enrolled", "Canceled"]:
                    return Response(
                        {"detail": "Invalid status update. Admins can set status to 'Enrolled' or 'Canceled'."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

        if "program" in data and data["program"] != application.program.id:
            return Response({"detail": "You cannot change the program after applying."}, status=status.HTTP_403_FORBIDDEN)

        return super().update(request, *args, **kwargs)



class ApplicationQuestionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for retrieving application questions associated with study abroad programs.

    ## Features:
    - **Retrieve all application questions** (`GET /api/questions/`)
    - **Retrieve questions for a specific program** (`GET /api/questions/?program=<id>`)
    - **Retrieve a single question** (`GET /api/questions/{id}/`)

    ## Permissions:
    - **All users (authenticated or not)** can list and retrieve application questions.
    - **No one (not even admins)** can create, update, or delete questions, as they are auto-generated when a program is created.

    ## Expected Inputs:
    - **Query Parameter** (Optional): `?program=<id>` → Filter questions by a specific program.

    ## Expected Outputs:
    - **200 OK** → Returns a list of application questions or a single question.
    - **404 Not Found** → If a requested question or program ID does not exist.
    """

    queryset = ApplicationQuestion.objects.all()

    serializer_class = ApplicationQuestionSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        """
        ## Retrieves application questions.
        - If a `program_id` query parameter is provided, filters the questions for that specific program.
        - If the provided `program_id` does not exist, returns a 404 error.
        """
        queryset = ApplicationQuestion.objects.all()
        program_id = self.request.query_params.get("program", None)

        if program_id is not None:
            if not Program.objects.filter(id=program_id).exists():
                return Response(
                    {"detail": "Program not found."}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            queryset = queryset.filter(program_id=program_id)

        return queryset


class ApplicationResponseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing responses to application questions.

    ## Features:
    - **Students can**:
      - View and edit their own responses.
      - Filter responses by question ID or application ID.
    - **Admins can**:
      - View all responses.
      - **Cannot edit or delete** any responses.

    ## Served Endpoints:
    - `GET /api/responses/` → View responses (Students: their own, Admins: all)
    - `GET /api/responses/{id}/` → Retrieve a response (Students: own, Admins: any)
    - `POST /api/responses/` → Create a response (Students only)
    - `PATCH /api/responses/{id}/` → Update a response (Students only)
    - `DELETE /api/responses/{id}/` → **Disabled** (Responses cannot be deleted)

    ## Permissions:
    - **Students** can view and edit **their own responses**.
    - **Admins** can view **all responses** but **cannot edit or delete** responses.
    """

    queryset = ApplicationResponse.objects.all()
    serializer_class = ApplicationResponseSerializer
    permission_classes = [
        permissions.IsAuthenticated,
        IsApplicationResponseOwnerOrAdmin,
    ]

    def get_queryset(self):
        """
        ## Retrieves responses based on filters:
        - **Admins see all responses**.
        - **Students see only their own responses**.
        - Filters available for `?question=<id>` and `?application=<id>`.

        ## Errors:
        - **404 Not Found** if an invalid `application_id` or `question_id` is provided.
        """
        queryset = ApplicationResponse.objects.all()
        question_id = self.request.query_params.get("question", None)
        application_id = self.request.query_params.get("application", None)

        if question_id:
            if not ApplicationQuestion.objects.filter(id=question_id).exists():
                raise NotFound(detail="Question not found.")
            queryset = queryset.filter(question_id=question_id)

        if application_id:
            try:
                application = Application.objects.get(id=application_id)
            except Application.DoesNotExist:
                raise NotFound(detail="Application not found.")

            if not self.request.user.is_admin and application.student != self.request.user:
                raise PermissionDenied(detail="You do not have permission to access this application's responses.")

            queryset = queryset.filter(application=application)

        if not self.request.user.is_admin:
            queryset = queryset.filter(application__student=self.request.user)

        return queryset
    
    def get_object(self):
        """
        ## Ensures object-level permission checks:
        - **Students can only access responses tied to their applications**.
        - **Admins can access any response**.
        - Raises **403 Forbidden** for unauthorized access.
        """
        obj = super().get_object()

        if not self.request.user.is_admin and obj.application.student != self.request.user:
            raise PermissionDenied(detail="You do not have permission to access this response.")

        return obj
    
    def destroy(self, request, *args, **kwargs):
        """
        ## Deleting responses is **not allowed**.
        """
        return Response(
            {"detail": "Deleting responses is not allowed."},
            status=status.HTTP_403_FORBIDDEN
        )

    def update(self, request, *args, **kwargs):
        """
        ## Updates a response (Students only).

        **Permissions:**
        - **Students** can update responses tied to their applications.
        - **Admins cannot update responses.**

        **Expected Input:**
        ```json
        {
          "response": "Updated response text"
        }
        ```

        **Errors:**
        - **403 Forbidden** if a student tries to update another student's response.
        - **403 Forbidden** if an admin attempts to update a response.
        - **400 Bad Request** if `response` text is missing.
        """
        response = self.get_object()

        if request.user.is_admin:
            return Response(
                {"detail": "Admins cannot modify responses."},
                status=status.HTTP_403_FORBIDDEN
            )

        if response.application.student != request.user:
            return Response(
                {"detail": "You do not have permission to modify this response."},
                status=status.HTTP_403_FORBIDDEN
            )

        if "response" not in request.data:
            return Response(
                {"detail": "Response text is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().update(request, *args, **kwargs)

class AnnouncementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing announcements.

    ## Features:
    - **Public users & students** can:
      - View active announcements.
    - **Admins** can:
      - Create, update, and delete announcements.
      - View all announcements (including inactive ones).

    ## Served Endpoints:
    - `GET /api/announcements/` → List active announcements (Public & Students)
    - `POST /api/announcements/` → Create an announcement (Admins only)
    - `GET /api/announcements/{id}/` → Retrieve a specific announcement (Public & Students)
    - `PATCH /api/announcements/{id}/` → Update an announcement (Admins only)
    - `DELETE /api/announcements/{id}/` → Delete an announcement (Admins only)

    ## Permissions:
    - **Public & Students:** Can only view active announcements.
    - **Admins:** Can view, create, edit, and delete announcements.
    """
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'importance']
    ordering = ['-created_at']

    def get_queryset(self):
        """
        Returns the list of announcements:
        - **Admins see all announcements**.
        - **Public users & students see only active announcements**.
        """
        queryset = Announcement.objects.all()
        
        if not self.request.user.is_authenticated or not self.request.user.is_admin:
            queryset = queryset.filter(is_active=True)
            
        return queryset


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing users.

    ## Features:
    - **Regular users**:
      - Retrieve their own details.
      - Change their password.
    - **Admins**:
      - View all users.
      - Manage user accounts.
    - **Public**:
      - Login, signup, and obtain authentication tokens.

    ## Served Endpoints:
    - `GET /api/users/` → List all users (Admins only)
    - `POST /api/users/signup/` → Create a new user account
    - `POST /api/users/login/` → Authenticate user and provide token
    - `POST /api/users/logout/` → Log out current user
    - `GET /api/users/current_user/` → Retrieve current user details
    - `PATCH /api/users/change_password/` → Change current user's password

    ## Permissions:
    - **Public:** Can sign up, log in, and log out.
    - **Authenticated Users:** Can view their own data and change their password.
    - **Admins:** Can manage all users.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminOrSelf]

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def current_user(self, request):
        """
        ## Retrieve Current User's Details
        **URL:** `GET /api/users/current_user/`
        **Permissions:** Authenticated users only.
        **Response:** User details.
        """
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=["post"], permission_classes=[permissions.AllowAny])
    def signup(self, request):
        """
        ## Sign Up a New User
        **URL:** `POST /api/users/signup/`
        **Permissions:** Public access.
        **Request:** 
        ```json
        {
            "username": "user123",
            "password": "securepassword",
            "display_name": "John Doe",
            "email": "user@example.com"
        }
        ```
        **Response:** Authentication token and user details on success.
        **Errors:** 400 if missing credentials.
        """
        username = request.data.get("username")
        password = request.data.get("password")
        display_name = request.data.get("display_name")
        email = request.data.get("email")

        if not username or not password:
            return Response({"detail": "Please provide both username and password"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create(
            username=username,
            password=make_password(password),
            display_name=display_name,
            email=email,
            is_active=True,
        )

        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                "token": token.key,
                "user_id": user.id,
                "username": user.username,
                "display_name": user.display_name,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["post"], permission_classes=[permissions.AllowAny])
    def login(self, request):
        """
        ## User Login
        **URL:** `POST /api/users/login/`
        **Permissions:** Public access.
        **Request:** 
        ```json
        {
            "username": "user123",
            "password": "securepassword"
        }
        ```
        **Response:** Authentication token and user details on success.
        **Errors:** 401 if invalid credentials.
        """
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(request, username=username, password=password)

        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({"token": token.key, "user": UserSerializer(user).data})

        return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)


    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def logout(self, request):
        """
        ## User Logout
        **URL:** `POST /api/users/logout/`
        **Permissions:** Authenticated users only.
        **Response:** Success message.
        """
        try:
            request.auth.delete()
            return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
        except AttributeError:
            return Response({"detail": "Not logged in."}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["patch"], permission_classes=[permissions.IsAuthenticated])
    def change_password(self, request):
        """
        ## Change Password
        **URL:** `PATCH /api/users/change_password/`
        **Permissions:** Authenticated users only.
        **Request:** 
        ```json
        {
            "password": "newpassword",
            "confirm_password": "newpassword"
        }
        ```
        **Response:** Updated authentication token.
        **Errors:** 400 if passwords do not match.
        """
        password = request.data.get("password")
        confirm_password = request.data.get("confirm_password")

        if password != confirm_password:
            return Response({"detail": "Passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        user.set_password(password)
        user.save()

        update_session_auth_hash(request, user)

        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                "token": token.key,
                "user_id": user.id,
                "username": user.username,
                "display_name": user.display_name,
            },
            status=status.HTTP_200_OK,
        )
