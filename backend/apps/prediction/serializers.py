from rest_framework import serializers
from .models import PredictionRecord
from apps.crime_data.serializers import LocationSerializer, CrimeCategorySerializer
from apps.authentication.serializers import UserSerializer


class PredictionRecordSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)
    predicted_category = CrimeCategorySerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = PredictionRecord
        fields = '__all__'
