from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import PredictionRecordSerializer
from .models import PredictionRecord
from .services import PredictionService
from apps.crime_data.permissions import IsOfficerOrAboveUser


class CrimePredictionView(APIView):
    """API endpoint to run crime type prediction and calculate risk score."""
    permission_classes = (IsOfficerOrAboveUser,)

    def post(self, request):
        location_id = request.data.get('location_id')
        input_hour = request.data.get('hour')

        if location_id is None or input_hour is None:
            return Response(
                {"error": "Please provide location_id and hour (0-23)"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            input_hour = int(input_hour)
            if not (0 <= input_hour <= 23):
                raise ValueError()
        except ValueError:
            return Response(
                {"error": "Hour must be an integer between 0 and 23"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            record = PredictionService.predict_crime(
                user=request.user,
                location_id=location_id,
                input_hour=input_hour
            )
            serializer = PredictionRecordSerializer(record)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Prediction error: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PredictionHistoryView(APIView):
    """API endpoint to list historical prediction records."""
    permission_classes = (IsOfficerOrAboveUser,)

    def get(self, request):
        records = PredictionRecord.objects.all()[:50]  # Limit to 50 logs
        serializer = PredictionRecordSerializer(records, many=True)
        return Response(serializer.data)
