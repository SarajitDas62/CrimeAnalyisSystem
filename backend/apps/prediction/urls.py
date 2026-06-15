from django.urls import path
from .views import CrimePredictionView, PredictionHistoryView

urlpatterns = [
    path('predict/', CrimePredictionView.as_view(), name='crime_predict'),
    path('history/', PredictionHistoryView.as_view(), name='prediction_history'),
]
