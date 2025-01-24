from rest_framework import viewsets, filters
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.utils import timezone
from django.db.models import Q
from .models import Program, Application
from .serializers import ProgramSerializer, ApplicationSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    Get the current user's data based on their authentication token
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
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({'error': 'Please provide both username and password'}, status=400)
    
    user = authenticate(username=username, password=password)
    
    if not user:
        return Response({'error': 'Invalid credentials'}, status=401)
    
    token, _ = Token.objects.get_or_create(user=user)
    
    return Response({
        'token': token.key,
        'user_id': user.id,
        'username': user.username,
        'display_name': user.display_name,
        'is_admin': user.is_admin
    })

class ProgramViewSet(viewsets.ModelViewSet):
    serializer_class = ProgramSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'faculty_leads']
    ordering_fields = ['application_deadline']
    ordering = ['application_deadline']  # Default ordering

    def get_queryset(self):
        today = timezone.now().date()
        queryset = Program.objects.filter(end_date__gte=today)
        
        # Get search query
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(faculty_leads__icontains=search)
            )
        
        return queryset

    @action(detail=True, methods=['get'])
    def application_status(self, request, pk=None):
        program = self.get_object()
        if not request.user.is_authenticated:
            return Response({'status': None})
            
        try:
            application = Application.objects.get(
                student__user=request.user,
                program=program
            )
            return Response({
                'status': application.status,
                'application_id': application.id
            })
        except Application.DoesNotExist:
            return Response({'status': None})

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
