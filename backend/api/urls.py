from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MuseumViewSet, ReservationViewSet

router = DefaultRouter()
router.register(r'museums', MuseumViewSet)
router.register(r'reservations', ReservationViewSet)

urlpatterns = [
    path('', include(router.urls)),  # Αυτό δημιουργεί τα REST API endpoints
]