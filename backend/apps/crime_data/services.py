from .models import CrimeReport, AuditLog, CrimeCategory, Location


class CrimeReportService:
    @staticmethod
    def create_report(user, data):
        """Create a new crime report and record audit log."""
        from .serializers import CrimeReportWriteSerializer
        serializer = CrimeReportWriteSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        report = serializer.save(reporter=user)

        # Audit logging
        AuditLog.objects.create(
            user=user,
            action='CREATE',
            table_name='crime_reports',
            row_id=report.id,
            details=f"Crime report created: Category: {report.category.name}, Area: {report.location.area_name}"
        )
        return report

    @staticmethod
    def update_report(user, report_id, data):
        """Update an existing crime report and record audit log."""
        report = CrimeReport.objects.get(id=report_id)
        from .serializers import CrimeReportWriteSerializer
        serializer = CrimeReportWriteSerializer(report, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_report = serializer.save()

        # Audit logging
        AuditLog.objects.create(
            user=user,
            action='UPDATE',
            table_name='crime_reports',
            row_id=updated_report.id,
            details=f"Crime report updated: Status set to {updated_report.status}"
        )
        return updated_report

    @staticmethod
    def delete_report(user, report_id):
        """Delete a crime report and record audit log."""
        report = CrimeReport.objects.get(id=report_id)
        row_id = report.id
        category_name = report.category.name
        area_name = report.location.area_name
        report.delete()

        # Audit logging
        AuditLog.objects.create(
            user=user,
            action='DELETE',
            table_name='crime_reports',
            row_id=row_id,
            details=f"Crime report deleted: Category: {category_name}, Area: {area_name}"
        )
        return True


class CrimeCategoryService:
    @staticmethod
    def create_category(user, data):
        """Create a new crime category and record audit log."""
        category = CrimeCategory.objects.create(**data)
        AuditLog.objects.create(
            user=user,
            action='CREATE',
            table_name='crime_categories',
            row_id=category.id,
            details=f"Crime category created: {category.name}"
        )
        return category


class LocationService:
    @staticmethod
    def create_location(user, data):
        """Create a new location and record audit log."""
        location = Location.objects.create(**data)
        AuditLog.objects.create(
            user=user,
            action='CREATE',
            table_name='locations',
            row_id=location.id,
            details=f"Location created: {location.area_name} ({location.latitude}, {location.longitude})"
        )
        return location
