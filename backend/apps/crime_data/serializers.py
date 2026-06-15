from rest_framework import serializers
from django.contrib.auth.models import User
from .models import CrimeCategory, Location, CrimeReport, AuditLog
from apps.authentication.serializers import UserSerializer


class CrimeCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CrimeCategory
        fields = '__all__'


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'


class CrimeReportReadSerializer(serializers.ModelSerializer):
    category = CrimeCategorySerializer(read_only=True)
    location = LocationSerializer(read_only=True)
    reporter = UserSerializer(read_only=True)

    class Meta:
        model = CrimeReport
        fields = '__all__'


class CrimeReportWriteSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=CrimeCategory.objects.all(), source='category', write_only=True
    )
    location_id = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(), source='location', write_only=True
    )

    class Meta:
        model = CrimeReport
        fields = ('id', 'category_id', 'location_id', 'date_occurred', 'status', 'description')

    def create(self, validated_data):
        # Reporter is set to request.user by the view/service
        return CrimeReport.objects.create(**validated_data)


class AuditLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = AuditLog
        fields = '__all__'
