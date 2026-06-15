from rest_framework import status, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import CrimeCategory, Location, CrimeReport, AuditLog
from .serializers import (
    CrimeCategorySerializer,
    LocationSerializer,
    CrimeReportReadSerializer,
    CrimeReportWriteSerializer,
    AuditLogSerializer
)
from .services import CrimeReportService, CrimeCategoryService, LocationService
from .permissions import IsAdminUser, IsAnalystOrAdminUser, IsOfficerOrAboveUser


# ==================== CRIME CATEGORIES VIEWS ====================
class CrimeCategoryListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAnalystOrAdminUser()]
        return [IsOfficerOrAboveUser()]

    def get(self, request):
        categories = CrimeCategory.objects.all().order_by('name')
        serializer = CrimeCategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        category = CrimeCategoryService.create_category(request.user, request.data)
        serializer = CrimeCategorySerializer(category)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ==================== LOCATIONS VIEWS ====================
class LocationListCreateView(APIView):
    permission_classes = (IsOfficerOrAboveUser,)

    def get(self, request):
        locations = Location.objects.all().order_by('area_name')
        serializer = LocationSerializer(locations, many=True)
        return Response(serializer.data)

    def post(self, request):
        location = LocationService.create_location(request.user, request.data)
        serializer = LocationSerializer(location)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ==================== CRIME REPORTS VIEWS ====================
class CrimeReportListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsOfficerOrAboveUser()]
        return [IsOfficerOrAboveUser()]

    def get(self, request):
        # Allow filtering by status, category, location
        reports = CrimeReport.objects.all().order_by('-date_occurred')
        
        category_id = request.query_params.get('category_id')
        location_id = request.query_params.get('location_id')
        status_filter = request.query_params.get('status')

        if category_id:
            reports = reports.filter(category_id=category_id)
        if location_id:
            reports = reports.filter(location_id=location_id)
        if status_filter:
            reports = reports.filter(status=status_filter)

        serializer = CrimeReportReadSerializer(reports, many=True)
        return Response(serializer.data)

    def post(self, request):
        report = CrimeReportService.create_report(request.user, request.data)
        serializer = CrimeReportReadSerializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CrimeReportDetailView(APIView):
    def get_permissions(self):
        if self.request.method in ['PUT', 'DELETE']:
            return [IsAnalystOrAdminUser()]
        return [IsOfficerOrAboveUser()]

    def get(self, request, pk):
        try:
            report = CrimeReport.objects.get(pk=pk)
            serializer = CrimeReportReadSerializer(report)
            return Response(serializer.data)
        except CrimeReport.DoesNotExist:
            return Response({"error": "Report not found"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            report = CrimeReportService.update_report(request.user, pk, request.data)
            serializer = CrimeReportReadSerializer(report)
            return Response(serializer.data)
        except CrimeReport.DoesNotExist:
            return Response({"error": "Report not found"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            CrimeReportService.delete_report(request.user, pk)
            return Response({"success": "Report deleted successfully"}, status=status.HTTP_200_OK)
        except CrimeReport.DoesNotExist:
            return Response({"error": "Report not found"}, status=status.HTTP_404_NOT_FOUND)


# ==================== AUDIT LOGS VIEWS ====================
class AuditLogListView(generics.ListAPIView):
    queryset = AuditLog.objects.all().order_by('-timestamp')
    serializer_class = AuditLogSerializer
    permission_classes = (IsAnalystOrAdminUser,)
