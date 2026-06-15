from django.db import models
from django.contrib.auth.models import User
from apps.crime_data.models import Location, CrimeCategory


class PredictionRecord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='predictions')
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='predictions')
    predicted_category = models.ForeignKey(CrimeCategory, on_delete=models.CASCADE, related_name='predictions')
    prediction_date = models.DateTimeField(auto_now_add=True)
    input_hour = models.IntegerField()
    risk_score = models.DecimalField(max_digits=4, decimal_places=2)

    class Meta:
        db_table = 'predictions'
        ordering = ['-prediction_date']

    def __str__(self):
        return f"Prediction for {self.location.area_name} at hour {self.input_hour}: {self.predicted_category.name} (Risk: {self.risk_score})"
