from django.urls import path
from .views import (
    CrimeCategoryListCreateView,
    LocationListCreateView,
    CrimeReportListCreateView,
    CrimeReportDetailView,
    AuditLogListView
)

urlpatterns = [
    path('categories/', CrimeCategoryListCreateView.as_view(), name='crime_categories_list_create'),
    path('locations/', LocationListCreateView.as_view(), name='locations_list_create'),
    path('reports/', CrimeReportListCreateView.as_view(), name='crime_reports_list_create'),
    path('reports/<int:pk>/', CrimeReportDetailView.as_view(), name='crime_report_detail'),
    path('audit-logs/', AuditLogListView.as_view(), name='audit_logs_list'),
]
