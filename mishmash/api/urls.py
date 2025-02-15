"""
Study Abroad Program API URL Configuration
==========================================

This module defines the URL routing for the Study Abroad Program's REST API.
It maps URL patterns to their corresponding views and uses Django REST Framework's
DefaultRouter for automatic URL generation for ViewSets.

Available Endpoints:
--------------------
- /programs/:
    - GET: List all programs (available to all users)
    - POST: Create a new program (admin only)
    - /<id>/:
        - GET: Retrieve a specific program
        - PUT/PATCH: Update a specific program (admin only)
        - DELETE: Delete a specific program (admin only)

- /applications/:
    - GET: List the current user's applications
    - POST: Submit a new application
    - /<id>/:
        - GET: Retrieve a specific application
        - PATCH: Update an application (e.g., cancel it)
        - DELETE: Delete an application (admin only)

- /questions/:
    - GET: List all application questions (admin only)
    - POST: Create a new question (admin only)
    - /<id>/:
        - GET: Retrieve a specific question
        - PUT/PATCH: Update a specific question (admin only)
        - DELETE: Delete a specific question (admin only)

- /responses/:
    - GET: List all responses for the current user's applications
    - POST: Submit a response to a question
    - /<id>/:
        - GET: Retrieve a specific response
        - PUT/PATCH: Update a response
        - DELETE: Delete a response (admin only)

- /users/:
    - GET: List all users (admin only)
    - POST: Create a new user (optional feature, if implemented)
    - /<id>/:
        - GET: Retrieve a specific user (admin only)
        - PUT/PATCH: Update a user's information (admin only)
        - DELETE: Delete a user (admin only)

- /login/:
    - POST: Authenticate a user and provide an access token

- /users/me/:
    - GET: Get the current authenticated user's profile

- /announcements/:
    - GET: List all announcements (available to all users)
    - POST: Create a new announcement (admin only)
    - /<id>/:
        - GET: Retrieve a specific announcement
        - PUT/PATCH: Update a specific announcement (admin only)
        - DELETE: Delete a specific announcement (admin only)

Used by:
--------
- Frontend React components for API communication
- Mobile apps (future) for data access
- Admin interface for program and user management
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

# Initialize the DefaultRouter for automatic URL generation
router = DefaultRouter()

# Register ViewSets with the router
# This automatically creates URLs for list, create, retrieve, update, delete
router.register(r'programs', ProgramViewSet, basename='program')
router.register(r'applications', ApplicationViewSet, basename='application')
router.register(r'users', UserViewSet, basename='user')
router.register(r'questions', ApplicationQuestionViewSet, basename='question')
router.register(r'responses', ApplicationResponseViewSet, basename='response')
router.register(r'announcements', AnnouncementViewSet, basename='announcement')
router.register(r'documents', DocumentViewSet, basename='document')

# Define URL patterns, including both router-generated and custom endpoints
urlpatterns = [
    # Include all URLs generated by the router
    path('', include(router.urls)),
]
