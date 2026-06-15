from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .services import AnalyticsService
from apps.crime_data.permissions import IsOfficerOrAboveUser


class DashboardSummaryView(APIView):
    """API endpoint providing overview aggregate statistics (KPIs)."""
    permission_classes = (IsOfficerOrAboveUser,)

    def get(self, request):
        stats = AnalyticsService.get_summary_statistics()
        return Response(stats)


class CrimeByCategoryView(APIView):
    """API endpoint providing count of crimes grouped by category."""
    permission_classes = (IsOfficerOrAboveUser,)

    def get(self, request):
        data = AnalyticsService.get_crime_by_category()
        return Response(data)


class CrimeByAreaView(APIView):
    """API endpoint providing count of crimes grouped by geographic area."""
    permission_classes = (IsOfficerOrAboveUser,)

    def get(self, request):
        data = AnalyticsService.get_crime_by_area()
        return Response(data)


class CrimeByHourView(APIView):
    """API endpoint providing count of crimes grouped by hour of day."""
    permission_classes = (IsOfficerOrAboveUser,)

    def get(self, request):
        data = AnalyticsService.get_crime_by_hour()
        return Response(data)


class CrimeByDayView(APIView):
    """API endpoint providing count of crimes grouped by day of week."""
    permission_classes = (IsOfficerOrAboveUser,)

    def get(self, request):
        data = AnalyticsService.get_crime_by_day_of_week()
        return Response(data)
