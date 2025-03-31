from django.shortcuts import render
from django.contrib.auth.models import User
from .models import Museum, Reservation
from .serializers import UserSerializer, MuseumSerializer, ReservationSerializer
from rest_framework import generics, parsers, viewsets, permissions
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
import requests
from rest_framework_simplejwt.authentication import JWTAuthentication

@api_view(["POST"])
@permission_classes([AllowAny])
def google_login(request):
    from django.contrib.auth import login
    from pprint import pprint

    token = request.data.get("access_token")
    print("Received token:", token)

    if not token:
        return Response({"error": "No token provided"}, status=400)

    google_verify_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
    google_response = requests.get(google_verify_url)
    print("Google response status:", google_response.status_code)

    if google_response.status_code != 200:
        print("Google token verification failed.")
        return Response({"error": "Invalid Google token"}, status=400)

    google_data = google_response.json()
    pprint(google_data)

    email = google_data.get("email")
    first_name = google_data.get("given_name", "")
    last_name = google_data.get("family_name", "")

    if not email:
        return Response({"error": "Google did not provide an email"}, status=400)

    user = User.objects.filter(email=email).first()

    if not user:
        username = email.split("@")[0]
        user = User.objects.create(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=""  # Could use set_unusable_password() too
        )

    user.backend = 'django.contrib.auth.backends.ModelBackend'
    login(request, user)

    refresh = RefreshToken.for_user(user)

    return Response({
        "access_token": str(refresh.access_token),
        "refresh_token": str(refresh),
        "message": "Google login successful!",
    })


# Create your views here.
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class IsAdminUserOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        # Allow GET (read-only) for everyone
        if request.method in permissions.SAFE_METHODS:
            return True
        # Allow POST, PUT, DELETE only for admins
        return request.user.is_staff

class MuseumViewSet(viewsets.ModelViewSet):
    queryset = Museum.objects.all()
    serializer_class = MuseumSerializer
    permission_classes = [IsAdminUserOrReadOnly]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]  # Μόνο authenticated χρήστες μπορούν να κάνουν κρατήσεις

    def perform_create(self, serializer):
        museum = serializer.validated_data['museum']
        date = serializer.validated_data['date']
        num_tickets = serializer.validated_data['num_tickets']
        
        if museum.available_spots(date) < num_tickets:
            raise ValidationError("Not enough available spots for this date.")
        
        serializer.save(user=self.request.user)  # Αυτόματη συσχέτιση κράτησης με τον authenticated χρήστη

    def get_queryset(self):
        from datetime import date
        jwt_authenticator = JWTAuthentication()
        response = jwt_authenticator.authenticate(self.request)

        if response:
            user, _ = response
            self.request.user = user

        reservations = Reservation.objects.filter(user=self.request.user).distinct()
        return reservations