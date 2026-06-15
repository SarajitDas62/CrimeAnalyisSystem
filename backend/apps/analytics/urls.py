from django.urls import path
from .views import (
    DashboardSummaryView,
    CrimeByCategoryView,
    CrimeByAreaView,
    CrimeByHourView,
    CrimeByDayView
)

urlpatterns = [
    path('summary/', DashboardSummaryView.as_view(), name='analytics_summary'),
    path('by-category/', CrimeByCategoryView.as_view(), name='analytics_by_category'),
    path('by-area/', CrimeByAreaView.as_view(), name='analytics_by_area'),
    path('by-hour/', CrimeByHourView.as_view(), name='analytics_by_hour'),
    path('by-day/', CrimeByDayView.as_view(), name='analytics_by_day'),
]
