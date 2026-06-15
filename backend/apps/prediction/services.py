import logging
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from apps.crime_data.models import CrimeReport, Location, CrimeCategory, AuditLog
from .models import PredictionRecord

logger = logging.getLogger(__name__)


class PredictionService:
    _model_cache = None

    @classmethod
    def train_model(cls):
        """Train Random Forest model using historical reports from DB."""
        reports = CrimeReport.objects.all()
        
        # If DB is empty, try to populate mock data or skip training
        if reports.count() < 5:
            return None

        # Build training DataFrame
        data = []
        for r in reports:
            data.append({
                'hour': r.date_occurred.hour,
                'lat': float(r.location.latitude),
                'lon': float(r.location.longitude),
                'category_id': r.category_id
            })

        df = pd.DataFrame(data)
        X = df[['hour', 'lat', 'lon']]
        y = df['category_id']

        # Train Random Forest Classifier
        model = RandomForestClassifier(n_estimators=50, max_depth=8, random_state=42)
        model.fit(X, y)
        
        cls._model_cache = model
        return model

    @classmethod
    def predict_crime(cls, user, location_id, input_hour):
        """
        Predict crime category and compute risk score (0-10) for a given location and hour.
        """
        try:
            location = Location.objects.get(id=location_id)
        except Location.DoesNotExist:
            raise ValueError("Location does not exist")

        # Ensure model is trained
        model = cls._model_cache or cls.train_model()

        predicted_category = None
        
        if model is not None:
            # Predict category using ML
            X_input = [[input_hour, float(location.latitude), float(location.longitude)]]
            try:
                pred_category_id = int(model.predict(X_input)[0])
                predicted_category = CrimeCategory.objects.get(id=pred_category_id)
            except Exception as e:
                logger.error(f"Error during RandomForest inference: {e}", exc_info=True)

        # Fallback if model not trained or prediction fails
        if not predicted_category:
            # Fallback to the most common category globally, or first category
            most_common = CrimeReport.objects.values('category_id')\
                .annotate(count=models.Count('id'))\
                .order_by('-count').first()
            
            category_id = most_common['category_id'] if most_common else None
            if not category_id:
                category_id = CrimeCategory.objects.first().id if CrimeCategory.objects.exists() else None
            
            if category_id:
                predicted_category = CrimeCategory.objects.get(id=category_id)

        if not predicted_category:
            raise ValueError("No crime categories defined in system. Please seed categories first.")

        # Compute Explainable Risk Score (0.0 to 10.0 scale)
        # Factor 1: Local crime density (base score based on historical reports in this location)
        local_crime_count = CrimeReport.objects.filter(location=location).count()
        total_crime_count = CrimeReport.objects.count()
        density_ratio = local_crime_count / max(total_crime_count, 1)
        base_score = min(density_ratio * 15, 4.0)  # max 4.0 points

        # Factor 2: Predicted crime severity
        severity_points = {
            'High': 4.0,
            'Medium': 2.5,
            'Low': 1.0
        }
        severity_score = severity_points.get(predicted_category.severity_level, 2.0)

        # Factor 3: Time risk modifier (night hours are historically higher risk)
        time_score = 2.0 if (input_hour >= 18 or input_hour <= 5) else 0.5

        # Sum and clip risk score
        risk_score = round(min(base_score + severity_score + time_score, 10.0), 2)
        # Minimum baseline risk
        risk_score = max(risk_score, 1.0)

        # Log prediction to DB for analytics / auditability
        record = PredictionRecord.objects.create(
            user=user,
            location=location,
            predicted_category=predicted_category,
            input_hour=input_hour,
            risk_score=risk_score
        )

        return record
