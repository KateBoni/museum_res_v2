from django.shortcuts import render
from django.contrib.auth.models import User
from .models import Museum, Reservation, ClosedDate
from .serializers import UserSerializer, MuseumSerializer, ReservationSerializer, MyTokenObtainPairSerializer,  ClosedDateSerializer
from rest_framework import generics, parsers, viewsets, permissions
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework_simplejwt.tokens import RefreshToken
import requests
from rest_framework_simplejwt.authentication import JWTAuthentication
import qrcode
import base64
from io import BytesIO
from django.core.mail import EmailMultiAlternatives
from rest_framework.response import Response
from django.http import JsonResponse
from django.core.files.base import ContentFile
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.utils import timezone



class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def perform_update(self, serializer):
        serializer.save()


class ClosedDateViewSet(viewsets.ModelViewSet):
    queryset = ClosedDate.objects.all()
    serializer_class = ClosedDateSerializer
    permission_classes = [AllowAny]

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def send_qr_email(request):
    user = request.user
    user_email = user.email

    reservation = Reservation.objects.filter(user=user).order_by('-id').first()
    if not reservation:
        return Response({"error": "No reservation found for user"}, status=404)
    
    # qr_data = f"https://yourwebsite.com/ticket/{user.id}-{user.username}"
    qr_data = f"RESERVATION:{reservation.id}"
    qr = qrcode.make(qr_data)

    buffer = BytesIO()
    qr.save(buffer, format='PNG')
    qr_content = buffer.getvalue()
    qr_base64 = base64.b64encode(qr_content).decode()

    email = EmailMultiAlternatives(
        subject="Reservation Confirmation",
        body="Hello,\n\nThank you for your reservation!\nPlease present the QR code below at the museum entrance to check in.\nWe look forward to welcoming you!\n\nBest regards,\n\nMyMuseum Team",
        from_email="katerinacb99@gmail.com",
        to=[user_email]
    )
    email.attach("qr_code.png", qr_content, "image/png")

    email.send()

    return Response({
        'message': 'Email sent to your address successfully!',
        'qr_base64': qr_base64 
    })


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("access_token")

        if not token:
            return Response({"error": "No token provided"}, status=400)

        google_verify_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
        google_response = requests.get(google_verify_url)

        if google_response.status_code != 200:
            return Response({"error": "Invalid Google token"}, status=400)

        google_data = google_response.json()

        email = google_data.get("email")
        first_name = google_data.get("given_name", "")
        last_name = google_data.get("family_name", "")

        if not email:
            return Response({"error": "Google did not provide an email"}, status=400)

        user, created = User.objects.get_or_create(email=email, defaults={
            "username": email.split("@")[0],
            "first_name": first_name,
            "last_name": last_name,
        })

        if created:
            user.set_unusable_password()
            user.save()

        user.backend = 'django.contrib.auth.backends.ModelBackend'
        # login(request, user)

        refresh = RefreshToken.for_user(user)
        refresh['is_staff'] = user.is_staff

        return Response({
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
            "message": "Google login successful!",
        })

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
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        is_admin_view = self.request.query_params.get("admin") == "true"

        if user.is_staff and is_admin_view:
            queryset = Reservation.objects.all()
        else:
            queryset = Reservation.objects.filter(user=user)

        museum_id = self.request.query_params.get("museum")
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")

        if museum_id:
            queryset = queryset.filter(museum_id=museum_id)
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)

        return queryset


    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        if obj.user != user and not user.is_staff:
            raise PermissionDenied("You do not have permission to view this reservation.")
        return obj

    def perform_create(self, serializer):
        museum = serializer.validated_data['museum']
        date = serializer.validated_data['date']
        num_tickets = serializer.validated_data['num_tickets']

        if museum.available_spots(date) < num_tickets:
            raise ValidationError("Not enough available spots for this date.")

        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"], url_path="checkin")
    def checkin(self, request, pk=None):
        reservation = self.get_object()

        if reservation.checked_in:
            return Response({"message": "Reservation is already checked in."}, status=status.HTTP_400_BAD_REQUEST)

        reservation.checked_in = True
        reservation.checkin_time = timezone.now()
        reservation.save()

        return Response({
            "message": "Check-in successful!",
            "checked_in": True,
            "checkin_time": reservation.checkin_time
        })


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer