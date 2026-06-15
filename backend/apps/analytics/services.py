from django.db.models import Count
from django.db.models.functions import ExtractHour, ExtractWeekDay
from apps.crime_data.models import CrimeReport, CrimeCategory, Location


class AnalyticsService:
    @staticmethod
    def get_summary_statistics():
        """Retrieve total and filtered counts for KPIs."""
        total_reports = CrimeReport.objects.count()
        resolved_reports = CrimeReport.objects.filter(status='Resolved').count()
        pending_reports = CrimeReport.objects.filter(status='Pending').count()
        investigating_reports = CrimeReport.objects.filter(status='Investigating').count()
        total_categories = CrimeCategory.objects.count()
        total_locations = Location.objects.count()

        return {
            'total_reports': total_reports,
            'resolved_reports': resolved_reports,
            'pending_reports': pending_reports,
            'investigating_reports': investigating_reports,
            'total_categories': total_categories,
            'total_locations': total_locations
        }

    @staticmethod
    def get_crime_by_category():
        """Retrieve count of crimes grouped by category name."""
        category_counts = CrimeReport.objects.values('category__name')\
            .annotate(count=Count('id'))\
            .order_by('-count')
        
        return [
            {'category': item['category__name'], 'count': item['count']}
            for item in category_counts
        ]

    @staticmethod
    def get_crime_by_area():
        """Retrieve count of crimes grouped by location area name."""
        area_counts = CrimeReport.objects.values('location__area_name')\
            .annotate(count=Count('id'))\
            .order_by('-count')[:10]  # Top 10 areas

        return [
            {'area': item['location__area_name'], 'count': item['count']}
            for item in area_counts
        ]

    @staticmethod
    def get_crime_by_hour():
        """Retrieve count of crimes grouped by hour of occurrence (0-23)."""
        hour_counts = CrimeReport.objects.annotate(hour=ExtractHour('date_occurred'))\
            .values('hour')\
            .annotate(count=Count('id'))\
            .order_by('hour')

        # Format output to ensure all hours 0-23 are present
        hourly_dict = {i: 0 for i in range(24)}
        for item in hour_counts:
            if item['hour'] is not None:
                hourly_dict[int(item['hour'])] = item['count']

        return [
            {'hour': hour, 'count': count}
            for hour, count in hourly_dict.items()
        ]

    @staticmethod
    def get_crime_by_day_of_week():
        """Retrieve count of crimes grouped by day of week (Monday-Sunday)."""
        day_counts = CrimeReport.objects.annotate(day=ExtractWeekDay('date_occurred'))\
            .values('day')\
            .annotate(count=Count('id'))\
            .order_by('day')

        # WeekDay maps: 1=Sunday, 2=Monday, ..., 7=Saturday in Django
        day_mapping = {
            1: 'Sunday', 2: 'Monday', 3: 'Tuesday', 4: 'Wednesday',
            5: 'Thursday', 6: 'Friday', 7: 'Saturday'
        }
        
        day_dict = {name: 0 for name in day_mapping.values()}
        for item in day_counts:
            if item['day'] is not None:
                day_name = day_mapping[item['day']]
                day_dict[day_name] = item['count']

        # Order output logically starting with Monday
        ordered_days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        return [
            {'day': day, 'count': day_dict[day]}
            for day in ordered_days
        ]
