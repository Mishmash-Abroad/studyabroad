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

from rest_framework import viewsets, filters, permissions, status, views
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate, logout as auth_logout
from rest_framework.authtoken.models import Token
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from django.utils.timezone import now
from django.db.models import Q
from .models import (
    Program,
    Application,
    ApplicationQuestion,
    ApplicationResponse,
    Announcement,
    Document,
    ConfidentialNote,
)
from .serializers import (
    ProgramSerializer,
    ApplicationSerializer,
    UserSerializer,
    ApplicationQuestionSerializer,
    ApplicationResponseSerializer,
    AnnouncementSerializer,
    DocumentSerializer,
    ConfidentialNoteSerializer,
)
from django.shortcuts import render, redirect
from api.models import User
from django.contrib.auth.hashers import make_password
from django.contrib.auth import update_session_auth_hash
from datetime import datetime, timedelta
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError, NotFound, PermissionDenied
from rest_framework.parsers import FileUploadParser
from .constants import ALL_ADMIN_EDITABLE_STATUSES, ALL_STATUSES
import re
from .constants import SEMESTERS
from django_otp.plugins.otp_totp.models import TOTPDevice
import qrcode
import io
from django.http import JsonResponse
from django_otp.plugins.otp_totp.models import TOTPDevice
from django_otp.util import random_hex
import base64
from allauth.socialaccount.models import SocialAccount

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

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_admin


class AdminCreateAndView(permissions.BasePermission):
    """
    Custom permission to allow only admin users to create and view confidential notes.
    Updates and deletions are always forbidden.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in ["GET", "POST"]:
            return request.user.is_admin
        return False

    def has_object_permission(self, request, view, obj):
        return request.method in permissions.SAFE_METHODS


class IsDocumentOwnerOrAdmin(permissions.BasePermission):
    """
    Allows access only to the owner of the document.
    Admins are allowed read-only access (safe methods).
    """

    def has_object_permission(self, request, view, obj):
        # Admins are allowed to read, but not modify documents.
        if request.user.is_admin:
            return request.method in permissions.SAFE_METHODS
        # Otherwise, only the document's owner can modify it.
        return obj.application.student == request.user


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
    search_fields = ["title"]
    ordering_fields = ["application_deadline"]
    ordering = ["application_deadline"]

    def get_queryset(self):
        """
        Retrieve the list of study abroad programs.

        ## Filters:
        - Filters programs where `end_date >= today` (only current and future programs are shown)
        - Optional search filter for `title` or `faculty_leads`
        - Optional faculty_ids filter for specific faculty members

        ## Returns:
        - 200 OK: List of programs (filtered)

        ## Example:
        - `GET /api/programs/?search=engineering&faculty_ids=1,2,3`
        """

        today = timezone.now().date()
        queryset = Program.objects.filter(end_date__gte=today)

        search = self.request.query_params.get("search", None)
        faculty_ids = self.request.query_params.get("faculty_ids", None)

        if search:
            queryset = queryset.filter(Q(title__icontains=search))

        if faculty_ids:
            faculty_id_list = [int(id) for id in faculty_ids.split(",") if id.isdigit()]
            if faculty_id_list:
                queryset = queryset.filter(faculty_leads__id__in=faculty_id_list)

        return queryset.distinct()

    def create(self, request, *args, **kwargs):
        """
        Create a new study abroad program.

        ## Expected Input (JSON):
        ```json
        {
            "title": "Engineering in Germany",
            "year": "2025", "semester": Fall
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
        essential_document_deadline = request.data.get("essential_document_deadline")
        start_date = request.data.get("start_date")
        end_date = request.data.get("end_date")

        try:
            application_open_date = datetime.strptime(
                application_open_date, "%Y-%m-%d"
            ).date()
            application_deadline = datetime.strptime(
                application_deadline, "%Y-%m-%d"
            ).date()
            essential_document_deadline = datetime.strptime(
                essential_document_deadline, "%Y-%m-%d"
            ).date()
            start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
            end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
        except (TypeError, ValueError):
            raise ValidationError({"detail": "Invalid date format. Use YYYY-MM-DD."})

        if application_deadline > application_open_date:
            raise ValidationError(
                {
                    "detail": "Application open date cannot be after the application deadline."
                }
            )
        elif start_date > end_date:
            raise ValidationError(
                {"detail": "Start date cannot be after the end date."}
            )

        if not (
            application_open_date
            <= application_deadline
            <= essential_document_deadline
            <= start_date
            <= end_date
        ):
            raise ValidationError(
                {
                    "detail": "Dates should be monotonically increasing in the order listed:  application_open_date, application_deadline, essential_document_deadline, start_date, end_date (e.g., start date cannot be after end date, but they may potentially be equal)."
                }
            )

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
            ApplicationQuestion.objects.create(
                program=program_instance, text=question_text
            )

        return response

    def update(self, request, *args, **kwargs):
        """
        Update an existing study abroad program.

        ## Expected Input (JSON):
        ```json
        {
            "title": "Updated Program Name",
            "year": "2025", "semester": Fall
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

        year = request.data.get("year", program_instance.year)
        semester = request.data.get("semester", program_instance.semester)

        # Define regex for year (must be a 4-digit number)
        year_pattern = r"^\d{4}$"
        # Validate year format
        if not re.match(year_pattern, str(year)) or int(year) < 1000:
            raise ValidationError(
                {"detail": "Invalid year. Must be a four-digit number (e.g., 2025)."}
            )

        # Validate semester format
        if semester not in SEMESTERS:
            raise ValidationError(
                {"detail": f"Invalid semester. Must be one of {', '.join(SEMESTERS)}."}
            )

        application_open_date = request.data.get(
            "application_open_date", program_instance.application_open_date
        )
        application_deadline = request.data.get(
            "application_deadline", program_instance.application_deadline
        )
        essential_document_deadline = request.data.get(
            "essential_document_deadline", program_instance.essential_document_deadline
        )
        start_date = request.data.get("start_date", program_instance.start_date)
        end_date = request.data.get("end_date", program_instance.end_date)

        try:
            application_open_date = (
                datetime.strptime(application_open_date, "%Y-%m-%d").date()
                if isinstance(application_open_date, str)
                else application_open_date
            )
            application_deadline = (
                datetime.strptime(application_deadline, "%Y-%m-%d").date()
                if isinstance(application_deadline, str)
                else application_deadline
            )
            essential_document_deadline = (
                datetime.strptime(essential_document_deadline, "%Y-%m-%d").date()
                if isinstance(essential_document_deadline, str)
                else essential_document_deadline
            )
            start_date = (
                datetime.strptime(start_date, "%Y-%m-%d").date()
                if isinstance(start_date, str)
                else start_date
            )
            end_date = (
                datetime.strptime(end_date, "%Y-%m-%d").date()
                if isinstance(end_date, str)
                else end_date
            )
        except (TypeError, ValueError):
            raise ValidationError({"detail": "Invalid date format. Use YYYY-MM-DD."})

        if application_open_date > application_deadline:
            raise ValidationError(
                {
                    "detail": "Application open date cannot be after the application deadline."
                }
            )

        if start_date > end_date:
            raise ValidationError(
                {"detail": "Start date cannot be after the end date."}
            )

        if not (
            application_open_date
            <= application_deadline
            <= essential_document_deadline
            <= start_date
            <= end_date
        ):
            raise ValidationError(
                {
                    "detail": "Dates should be monotonically increasing in the order listed:  application_open_date, application_deadline, essential_document_deadline, start_date, end_date (e.g., start date cannot be after end date, but they may potentially be equal)."
                }
            )

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
            return Response({"status": None})

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
            applied=Count("id", filter=Q(status="Applied")),
            enrolled=Count("id", filter=Q(status="Enrolled")),
            withdrawn=Count("id", filter=Q(status="Withdrawn")),
            canceled=Count("id", filter=Q(status="Canceled")),
        )

        applicant_counts["total_active"] = (
            applicant_counts["applied"] + applicant_counts["enrolled"]
        )

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

        student_id = self.request.query_params.get("student", None)
        if student_id:
            queryset = queryset.filter(student_id=student_id)

        program_id = self.request.query_params.get("program", None)
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
            return Response(
                {"detail": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        min_birth_date = datetime.today().date() - timedelta(days=10 * 365)
        if date_of_birth > min_birth_date:
            return Response(
                {"detail": "Applicants must be at least 10 years old."},
                status=status.HTTP_400_BAD_REQUEST,
            )

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
                return Response(
                    {"detail": "Invalid date format. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            min_birth_date = datetime.today().date() - timedelta(days=10 * 365)
            if new_dob > min_birth_date:
                return Response(
                    {"detail": "Applicants must be at least 10 years old."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if "status" in data:
            new_status = data["status"]

            if not user.is_admin:
                if new_status not in ["Applied", "Withdrawn"]:
                    return Response(
                        {
                            "detail": "Students can only change their application status to 'Applied' or 'Withdrawn'."
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )

            else:
                if new_status not in ALL_ADMIN_EDITABLE_STATUSES:
                    return Response(
                        {
                            "detail": "Invalid status update. Admins can set status to 'Enrolled' or 'Canceled'."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

        if "program" in data and data["program"] != application.program.id:
            return Response(
                {"detail": "You cannot change the program after applying."},
                status=status.HTTP_403_FORBIDDEN,
            )

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
                    {"detail": "Program not found."}, status=status.HTTP_404_NOT_FOUND
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

            if (
                not self.request.user.is_admin
                and application.student != self.request.user
            ):
                raise PermissionDenied(
                    detail="You do not have permission to access this application's responses."
                )

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

        if (
            not self.request.user.is_admin
            and obj.application.student != self.request.user
        ):
            raise PermissionDenied(
                detail="You do not have permission to access this response."
            )

        return obj

    def destroy(self, request, *args, **kwargs):
        """
        ## Deleting responses is **not allowed**.
        """
        return Response(
            {"detail": "Deleting responses is not allowed."},
            status=status.HTTP_403_FORBIDDEN,
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
                status=status.HTTP_403_FORBIDDEN,
            )

        if response.application.student != request.user:
            return Response(
                {"detail": "You do not have permission to modify this response."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if "response" not in request.data:
            return Response(
                {"detail": "Response text is required."},
                status=status.HTTP_400_BAD_REQUEST,
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
    ordering_fields = ["created_at", "importance"]
    ordering = ["-created_at"]

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
      - Change their password (local users only).
    - **Admins**:
      - View all users.
      - Manage user accounts.
    - **Public**:
      - Login, signup, and obtain authentication tokens.
      - View list of faculty members

    ## Served Endpoints:
    - `GET /api/users/` → List all users (Admins only)
    - `GET /api/users/?is_faculty=true` → List all faculty members (Public)
    - `POST /api/users/signup/` → Create a new user account
    - `POST /api/users/login/` → Authenticate user and provide token
    - `POST /api/users/logout/` → Log out current user
    - `GET /api/users/current_user/` → Retrieve current user details
    - `PATCH /api/users/change_password/` → Change current user's password

    ## Permissions:
    - **Public:** Can sign up, log in, log out, and view faculty list.
    - **Authenticated Users:** Can view their own data and change their password.
    - **Admins:** Can manage all users.
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminOrSelf]
    filter_backends = [filters.SearchFilter]
    search_fields = ["username", "display_name", "email"]

    def get_permissions(self):
        """
        Override to allow public access to faculty list
        """
        if self.action == "list" and self.request.query_params.get("is_faculty"):
            return [permissions.AllowAny()]
        return super().get_permissions()

    def get_queryset(self):
        """
        Return all users for admins, but only faculty for public faculty list
        """
        queryset = User.objects.all()

        # If requesting faculty list, filter to only show faculty
        if self.action == "list" and self.request.query_params.get("is_faculty"):
            return queryset.filter(is_admin=True).order_by("display_name")

        # For other list requests, maintain admin-only access
        if self.action == "list" and not self.request.user.is_admin:
            return queryset.none()

        return queryset
    
    def update(self, request, *args, **kwargs):
        """
        Override the default update method to handle special cases:
        - If a user is promoted to admin, delete their applications.
        - If a user is demoted from admin, remove them as faculty lead.
        """
        user = self.get_object()
        new_is_admin = request.data.get("is_admin", user.is_admin)

        if not user.is_admin and new_is_admin:
            # User is being promoted to admin, delete applications
            applications_deleted = Application.objects.filter(student=user).delete()
            print(f"Deleted {applications_deleted[0]} applications for {user.username}")

        if user.is_admin and not new_is_admin:
            # User is being demoted from admin, remove them from faculty lead roles
            programs = Program.objects.filter(faculty_leads=user)
            for program in programs:
                program.faculty_leads.remove(user)
                if program.faculty_leads.count() == 0:
                    admin_user = User.objects.get(username="admin")
                    program.faculty_leads.add(admin_user)
                program.save()
            print(f"Removed {user.username} from faculty leads of {programs.count()} programs")

        return super().update(request, *args, **kwargs)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def current_user(self, request):
        """
        ## Retrieve Current User's Details
        **URL:** `GET /api/users/current_user/`
        **Permissions:** Authenticated users only.
        **Response:** User details.
        """
        serializer = UserSerializer(request.user).data
        return Response(serializer)

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
            return Response(
                {"detail": "Please provide both username and password"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.create(
            username=username,
            password=make_password(password),
            display_name=display_name,
            email=email,
            is_active=True,
        )

        if not user:
            return Response(
                {"detail": "Something went wrong when creating user"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token, _ = Token.objects.get_or_create(user=user)

        serializer = UserSerializer(user).data
        serializer["token"] = token.key
        return Response(serializer, status=status.HTTP_201_CREATED)

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
            if user.is_sso:
                return Response(
                    {"detail": "Please log in via SSO."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            token, _ = Token.objects.get_or_create(user=user)
            serializer = UserSerializer(user).data
            serializer["token"] = token.key
            return Response(serializer)

        return Response(
            {"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED
        )

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
            return Response(
                {"detail": "Successfully logged out."}, status=status.HTTP_200_OK
            )
        except AttributeError:
            return Response(
                {"detail": "Not logged in."}, status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=["patch"], permission_classes=[permissions.IsAuthenticated],)
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
        user = request.user

        if user.is_admin and "user_id" in request.data:
            try:
                user = User.objects.get(id=request.data["user_id"])
            except User.DoesNotExist:
                return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)


        if user.is_sso:
            return Response(
                {"detail": "SSO users cannot change their password."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        password = request.data.get("password")
        confirm_password = request.data.get("confirm_password")

        if password != confirm_password:
            return Response(
                {"detail": "Passwords do not match."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(password)
        user.save()

        if user == request.user:
            update_session_auth_hash(request, user)
            token, _ = Token.objects.get_or_create(user=user)
            serializer = UserSerializer(user).data
            serializer["token"] = token.key
            return Response(serializer, status=status.HTTP_200_OK)

        return Response({"detail": f"Password updated successfully for {user.username}."}, status=status.HTTP_200_OK)

    @action(detail=False, permission_classes=[AllowAny])
    def faculty(self, request):
        """
        Retrieve a list of all faculty members (admin users).

        ## Returns:
        - List of faculty members with their display names and IDs
        - Faculty are sorted by display name

        ## Permissions:
        - Public access (any user can view faculty list)
        """
        faculty = User.objects.filter(is_admin=True).order_by("display_name")
        serializer = UserSerializer(faculty, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=["get"], permission_classes=[permissions.IsAdminUser])
    def user_warnings(self, request, pk=None):
        """
        Get warnings related to promoting, demoting, or deleting a user.
        """
        user = self.get_object()
        applications_count = Application.objects.filter(student=user).count()
        faculty_programs = Program.objects.filter(faculty_leads=user)

        warnings = {
            "applications_count": applications_count,
            "faculty_programs": [p.title for p in faculty_programs],
        }

        return Response(warnings, status=status.HTTP_200_OK)


class ConfidentialNoteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing confidential notes on applications.

    ## Features:
    - **Admins can**:
      - Create new confidential notes on applications.
      - View all confidential notes.
    - **Admins cannot**:
      - Modify or delete any existing notes.
    - **Students cannot**:
      - View, create, update, or delete any notes.

    ## Served Endpoints:
    - `GET /api/notes/` → List all confidential notes (Admins only)
    - `GET /api/notes/?application=<id>` → Filter notes by application (Admins only)
    - `POST /api/notes/` → Create a new confidential note (Admins only)

    ## Permissions:
    - **Admins:** Full access to create and view confidential notes.
    - **Students:** No access to any notes.
    - **No modifications or deletions are allowed.**
    """

    queryset = ConfidentialNote.objects.all().order_by("-timestamp")
    serializer_class = ConfidentialNoteSerializer
    permission_classes = [permissions.IsAuthenticated, AdminCreateAndView]

    def get_queryset(self):
        """
        ## Retrieve Notes:
        - **Admins:** Can see all confidential notes.
        - **Students:** Cannot see any notes.
        - **Filtering:** Admins can filter by application ID using `?application=<id>`.

        ## Errors:
        - **404 Not Found** if an invalid `application_id` is provided.
        """
        application_id = self.request.query_params.get("application", None)
        queryset = ConfidentialNote.objects.all()

        if application_id:
            if not Application.objects.filter(id=application_id).exists():
                return Response(
                    {"detail": "Application not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            queryset = queryset.filter(application_id=application_id)

        return queryset

    def perform_create(self, serializer):
        """
        ## Create a Confidential Note:
        - **Auto-assigns the current user as the author.**
        - **Records the creation timestamp automatically.**

        **Expected Input:**
        ```json
        {
            "application": 5,
            "content": "This is an admin-only note."
        }
        ```

        **Returns:**
        - `201 Created` with the new note data.
        - `400 Bad Request` if invalid application ID.

        **Errors:**
        - **403 Forbidden** if a non-admin tries to create a note.
        """
        print(self.request.user)
        serializer.save(author=self.request.user, timestamp=now())

    def update(self, request, *args, **kwargs):
        """
        ## Updating Confidential Notes is **Not Allowed**.
        **Returns:**
        - `403 Forbidden` if a user tries to edit a note.
        """
        return Response(
            {"detail": "Editing confidential notes is not allowed."},
            status=status.HTTP_403_FORBIDDEN,
        )

    def partial_update(self, request, *args, **kwargs):
        """
        ## Partially Updating Confidential Notes is **Not Allowed**.
        **Returns:**
        - `403 Forbidden` if a user tries to edit a note.
        """
        return Response(
            {"detail": "Editing confidential notes is not allowed."},
            status=status.HTTP_403_FORBIDDEN,
        )

    def destroy(self, request, *args, **kwargs):
        """
        ## Deleting Confidential Notes is **Not Allowed**.
        **Returns:**
        - `403 Forbidden` if a user tries to delete a note.
        """
        return Response(
            {"detail": "Deleting confidential notes is not allowed."},
            status=status.HTTP_403_FORBIDDEN,
        )


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated, IsDocumentOwnerOrAdmin]

    def create(self, request, *args, **kwargs):
        """
        Handle file upload via POST request.
        """
        if "pdf" not in request.data:
            return Response(
                {"error": "No file provided."}, status=status.HTTP_400_BAD_REQUEST
            )

        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """
        Handle updating an existing document via PUT or PATCH.
        """
        partial = kwargs.pop("partial", False)  # Check if it's a PATCH request
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def get_queryset(self):
        """
        ## Retrieves documents
        - If a `program_id` query parameter is provided, filters the questions for that specific program.
        - If the provided `program_id` does not exist, returns a 404 error.
        """
        queryset = Document.objects.all()
        application_id = self.request.query_params.get("application", None)

        if application_id is not None:
            if not Application.objects.filter(id=application_id).exists():
                return Response(
                    {"detail": "Application not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            queryset = queryset.filter(application=application_id)

        return queryset


class MFAViewSet(viewsets.ViewSet):
    permission_classes = [
        IsAuthenticated
    ]  # Ensure only authenticated users can access this

    @action(detail=False, methods=["get"])
    def status(self, request):
        # Fetch MFA status for the authenticated user
        user = request.user
        status = {
            "is_mfa_enabled": user.is_mfa_enabled,  # Check if TOTP is enabled
        }
        return Response(status)

    @action(detail=False, methods=["get"])
    def generate_totp_secret(self, request):
        user = request.user
        # Delete any existing TOTP device for the user
        TOTPDevice.objects.filter(user=user).delete()

        # Create a new TOTP device
        device = TOTPDevice.objects.create(user=user, name="default")

        # Create the QR Code URL for the TOTP secret
        config_url = device.config_url
        qr_image = qrcode.make(config_url)

        # Convert the QR code image to a Base64 string
        img_byte_arr = io.BytesIO()
        qr_image.save(img_byte_arr, format="PNG")
        img_byte_arr.seek(0)
        img_base64 = base64.b64encode(img_byte_arr.read()).decode("utf-8")

        bytes_key = bytes.fromhex(device.key)  # Convert hex to bytes
        base32_key = base64.b32encode(
            bytes_key
        ).decode()  # Convert bytes to Base32 and decode to string

        return JsonResponse(
            {
                "qr_code": img_base64,
                "secret": base32_key,  # Return the secret key for manual entry
                "message": "QR code generated successfully.",
            }
        )

    @action(detail=False, methods=["post"])
    def deactivate_totp_device(self, request):
        user = request.user

        # Find and delete the TOTP device for the user
        deleted_count, _ = TOTPDevice.objects.filter(user=user).delete()
        user.is_mfa_enabled = False  # Disable MFA flag
        user.save()
        if deleted_count > 0:
            return Response(
                {
                    "message": "TOTP device deactivated successfully.",
                },
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {
                    "message": "No TOTP device found for the user.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

    @action(detail=False, methods=["post"])
    def verify_totp(self, request):
        """
        Verifies the TOTP code provided by the user.
        If successful, enables MFA for the user.
        """
        user = request.user
        code = request.data.get("code")

        if not code:
            return Response(
                {"error": "No TOTP code provided."}, status=status.HTTP_400_BAD_REQUEST
            )

        # Fetch the user's TOTP device
        try:
            device = TOTPDevice.objects.get(user=user)
        except TOTPDevice.DoesNotExist:
            return Response(
                {"error": "TOTP device not found."}, status=status.HTTP_404_NOT_FOUND
            )

        # Verify the code
        if device.verify_token(code):
            user.is_mfa_enabled = True  # Enable MFA flag
            user.save()
            return Response({"success": "TOTP verified successfully."})

        return Response(
            {"error": "Invalid TOTP code."}, status=status.HTTP_400_BAD_REQUEST
        )
