from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MuseumViewSet, ReservationViewSet,  ClosedDateViewSet

router = DefaultRouter()
router.register(r'museums', MuseumViewSet)
router.register(r'reservations', ReservationViewSet)
router.register(r'closed-dates', ClosedDateViewSet, basename="closed-dates")

urlpatterns = [
    path('', include(router.urls)),  # Αυτό δημιουργεί τα REST API endpoints
]