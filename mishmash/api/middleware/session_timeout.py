"""
Study Abroad Program - Session Timeout Middleware
==============================================

This middleware implements session timeout functionality:
- 30 seconds of inactivity timeout (testing value)
- 1 minute absolute timeout from login (testing value)

The middleware checks both conditions and returns appropriate
401 responses when sessions have expired.
"""

from django.utils import timezone
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import datetime

class SessionTimeoutMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            # Skip session checks for certain paths (e.g., login, logout)
            if request.path in ['/api/users/login/', '/api/users/logout/']:
                return self.get_response(request)

            # Get session timestamps
            last_activity = request.session.get('last_activity')
            session_start = request.session.get('session_start')
            now = timezone.now()

            # Check for absolute timeout (1 minute for testing)
            if session_start:
                session_start = datetime.datetime.fromisoformat(session_start)
                if (now - session_start).total_seconds() > 60:  # 1 minute
                    request.session.flush()
                    return Response(
                        {'detail': 'Session expired (1-minute limit reached)'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )

            # Check for inactivity timeout (30 seconds for testing)
            if last_activity:
                last_activity = datetime.datetime.fromisoformat(last_activity)
                if (now - last_activity).total_seconds() > 30:  # 30 seconds
                    request.session.flush()
                    return Response(
                        {'detail': 'Session expired (30 seconds of inactivity)'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )

            # Update last activity timestamp
            request.session['last_activity'] = now.isoformat()
            
            # Set session start if not exists
            if not session_start:
                request.session['session_start'] = now.isoformat()

        return self.get_response(request)
