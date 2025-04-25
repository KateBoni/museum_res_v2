from django.contrib.auth.models import User
from django.utils import timezone
from django.core.mail import EmailMultiAlternatives
from rest_framework import viewsets, generics, parsers, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

import qrcode
import base64
import requests
from io import BytesIO

from .models import Museum, Reservation, ClosedDate
from .serializers import (
    UserSerializer, MuseumSerializer, ReservationSerializer,
    ClosedDateSerializer, MyTokenObtainPairSerializer
)


# ------------------------- USER MANAGEMENT -------------------------

# Προβολή/Διαχείριση χρηστών (μόνο για admins)
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]


# Εγγραφή νέου χρήστη
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


# ------------------------ ΜΟΥΣΕΙΑ -------------------------

# Δικαίωμα επεξεργασίας μόνο σε admin, προβολή για όλους
class IsAdminUserOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_staff


class MuseumViewSet(viewsets.ModelViewSet):
    queryset = Museum.objects.all()
    serializer_class = MuseumSerializer
    permission_classes = [IsAdminUserOrReadOnly]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]


# ------------------------- ΚΡΑΤΗΣΕΙΣ -----------------------

class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    # Περιορίζει τις κρατήσεις σε αυτές του χρήστη (ή όλες αν είναι admin)
    def get_queryset(self):
        user = self.request.user
        queryset = Reservation.objects.all() if user.is_staff else Reservation.objects.filter(user=user)

        # Φίλτρα αναζήτησης στο admin panel
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

    # Ελέγχει αν ο χρήστης έχει δικαίωμα πρόσβασης στην κράτηση
    def get_object(self):
        obj = super().get_object()
        if obj.user != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied("Δεν έχετε πρόσβαση σε αυτή την κράτηση.")
        return obj

    # Δημιουργία κράτησης με έλεγχο διαθεσιμότητας
    def perform_create(self, serializer):
        museum = serializer.validated_data['museum']
        date = serializer.validated_data['date']
        num_tickets = serializer.validated_data['num_tickets']

        if museum.available_spots(date) < num_tickets:
            raise ValidationError("Δεν υπάρχουν αρκετές διαθέσιμες θέσεις για την επιλεγμένη ημέρα.")

        serializer.save(user=self.request.user)

    # Check-in μέσω QR
    @action(detail=True, methods=["post"], url_path="checkin")
    def checkin(self, request, pk=None):
        reservation = self.get_object()

        if reservation.checked_in:
            return Response({"message": "Η κράτηση έχει ήδη γίνει check-in."}, status=status.HTTP_400_BAD_REQUEST)

        reservation.checked_in = True
        reservation.checkin_time = timezone.now()
        reservation.save()

        return Response({
            "message": "Check-in επιτυχές!",
            "checked_in": True,
            "checkin_time": reservation.checkin_time
        })


# ------------------------ ΚΛΕΙΣΤΕΣ ΗΜΕΡΕΣ -------------------------

class ClosedDateViewSet(viewsets.ModelViewSet):
    queryset = ClosedDate.objects.all() 
    serializer_class = ClosedDateSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        museum_id = self.request.query_params.get("museum")
        if museum_id:
            return ClosedDate.objects.filter(museum_id=museum_id)
        return ClosedDate.objects.all()

    def perform_create(self, serializer):
        closed_date = serializer.save()
        notify_affected_users(closed_date)

    def perform_update(self, serializer):
        closed_date = serializer.save()
        notify_affected_users(closed_date)


# Αποστολή email στους χρήστες που άλλαξαν οι κρατήσεις τους
def notify_affected_users(closed_date):
    affected_reservations = Reservation.objects.filter(
        museum=closed_date.museum,
        date__range=[closed_date.date_from, closed_date.date_to],
    )

    for reservation in affected_reservations:
        reservation.status = "cancelled"
        reservation.save()
        user = reservation.user

        subject = f"⚠️ Your Reservation at {closed_date.museum.name} has been cancelled"
        from_email = "katerinacb99@gmail.com"

        html_content = f"""
            <p>Dear {user.username},</p>
            <p>The museum <strong>{closed_date.museum.name}</strong> will be <span style='color:red;'>closed</span>
            from <strong>{closed_date.date_from}</strong> to <strong>{closed_date.date_to}</strong>.</p>
            <p>Your reservation on <strong>{reservation.date}</strong> has been <strong>cancelled</strong>.</p>
            <p>Contact us for further support.</p>
            <p><strong>MyMuseum Team</strong></p>
        """

        email = EmailMultiAlternatives(
            subject=subject,
            body=html_content,
            from_email=from_email,
            to=[user.email]
            )
        email.content_subtype = "html"
        email.send()



# ------------------------- QR Code Email (Μετά την Κράτηση) -------------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def send_qr_email(request):
    user = request.user
    user_email = user.email
    latest_reservation = Reservation.objects.filter(user=user).order_by('-id').first()

    if not latest_reservation:
        return Response({"error": "No reservation found to generate QR."}, status=400)

    qr_data = f"http://localhost:5173/admin/check-in/{latest_reservation.id}"
    qr = qrcode.make(qr_data)

    buffer = BytesIO()
    qr.save(buffer, format='PNG')
    qr_content = buffer.getvalue()
    qr_base64 = base64.b64encode(qr_content).decode()

    email = EmailMultiAlternatives(
        subject="Reservation Confirmation",
        body="Thank you for your reservation! Please show the attached QR code at the museum entrance.",
        from_email="katerinacb99@gmail.com",
        to=[user_email]
    )
    email.attach("qr_code.png", qr_content, "image/png")
    email.send()

    return Response({
        'message': 'QR email sent successfully.',
        'qr_base64': qr_base64
    })


# ------------------------- Google Login -------------------------

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

        refresh = RefreshToken.for_user(user)
        refresh['is_staff'] = user.is_staff

        return Response({
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
            "message": "Google login successful!",
        })


# ------------------------- JWT Custom Serializer -------------------------

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
