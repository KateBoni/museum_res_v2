from django.db import models
from django.contrib.auth.models import User
from django.db.models import Sum
# from django.utils.timezone import now
from django.utils import timezone

class Museum(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    opening_hours = models.CharField(max_length=255)
    capacity = models.PositiveIntegerField(default=200)
    photo = models.ImageField(upload_to="museum_photos/", blank=True, null=True)
    
    TYPE_CHOICES = [
        ('history', 'History Museum'),
        ('art', 'Art Museum'),
        ('science', 'Science Museum'),
        ('ancient', 'archaeological Site '),
        ('other', 'Other')
    ]
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='other')
    
    def available_spots(self, date):
        reserved_tickets = Reservation.objects.filter(museum=self, date=date).aggregate(Sum('num_tickets'))['num_tickets__sum'] or 0
        return self.capacity - reserved_tickets
    
    def __str__(self):
        return self.name

class Reservation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Ο χρήστης που έκανε την κράτηση
    museum = models.ForeignKey(Museum, on_delete=models.CASCADE)  # Το μουσείο που έκανε κράτηση
    date = models.DateField()  # Ημερομηνία κράτησης
    num_tickets = models.PositiveIntegerField()  # Αριθμός εισιτηρίων
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')  # Κατάσταση κράτησης
    checked_in = models.BooleanField(default=False)
    checkin_time = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.museum.available_spots(self.date) < self.num_tickets:
            raise ValueError("Not enough available spots for this reservation.")
        super().save(*args, **kwargs)

        
    def check_in(self):
        self.checked_in = True
        self.checkin_time = timezone.now()
        self.save()

    def __str__(self):
        return f"{self.user.username} - {self.museum.name} ({self.date})"
    


class ClosedDate(models.Model):
    museum = models.ForeignKey(Museum, on_delete=models.CASCADE, related_name="closed_dates")
    date_from = models.DateField()
    date_to = models.DateField()
    reason = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.museum.name} closed from {self.date_from} to {self.date_to}"
