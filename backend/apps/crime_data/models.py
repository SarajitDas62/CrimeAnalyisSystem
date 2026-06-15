from django.db import models
from django.contrib.auth.models import User


class CrimeCategory(models.Model):
    SEVERITY_CHOICES = (
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    )
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    severity_level = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='Medium')

    class Meta:
        db_table = 'crime_categories'
        verbose_name_plural = 'Crime Categories'

    def __str__(self):
        return self.name


class Location(models.Model):
    area_name = models.CharField(max_length=150)
    district = models.CharField(max_length=100, blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    class Meta:
        db_table = 'locations'

    def __str__(self):
        return f"{self.area_name} ({self.latitude}, {self.longitude})"


class CrimeReport(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Investigating', 'Investigating'),
        ('Resolved', 'Resolved'),
    )
    category = models.ForeignKey(CrimeCategory, on_delete=models.RESTRICT, related_name='reports')
    location = models.ForeignKey(Location, on_delete=models.RESTRICT, related_name='reports')
    reporter = models.ForeignKey(User, on_delete=models.RESTRICT, related_name='reports')
    date_occurred = models.DateTimeField()
    date_reported = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    description = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'crime_reports'

    def __str__(self):
        return f"Report #{self.id} - {self.category.name} in {self.location.area_name}"


class AuditLog(models.Model):
    ACTION_CHOICES = (
        ('CREATE', 'CREATE'),
        ('UPDATE', 'UPDATE'),
        ('DELETE', 'DELETE'),
    )
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    table_name = models.CharField(max_length=100)
    row_id = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'audit_logs'

    def __str__(self):
        return f"Audit {self.action} on {self.table_name} id {self.row_id}"
