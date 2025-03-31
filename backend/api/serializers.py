from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Museum, Reservation
from django.utils import timezone


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwards = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
class MuseumSerializer(serializers.ModelSerializer):
    available_spots = serializers.SerializerMethodField()

    class Meta:
        model = Museum
        fields = '__all__'  # Περιλαμβάνει όλα τα πεδία του μοντέλου
        extra_kwargs = {"capacity": {"write_only": True}}

    def get_available_spots(self, obj):
        request = self.context.get('request')
        date = request.query_params.get('date')  # Get date from request query
        if date:
            return obj.available_spots(date)
        return None  # If no date is provided, don't show available spots

class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = '__all__'
        extra_kwargs = {
            "user": {"read_only": True}  # Prevents user from being required in the request
        }

    def validate_date(self, value):
        current_date = timezone.now().date()
        if value < current_date:
            raise serializers.ValidationError("The reservation date cannot be in the past.")
        return value
