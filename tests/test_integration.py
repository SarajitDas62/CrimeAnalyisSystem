import pytest
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APIClient
from apps.crime_data.models import CrimeCategory, Location, CrimeReport


@pytest.mark.django_db
class TestCrimeSystemIntegration:
    @pytest.fixture(autouse=True)
    def setup(self):
        self.client = APIClient()
        
        # Create/Get categories
        self.category, _ = CrimeCategory.objects.get_or_create(
            name="Theft",
            defaults={"description": "Stealing assets", "severity_level": "Medium"}
        )
        
        # Create/Get locations
        self.location, _ = Location.objects.get_or_create(
            area_name="Downtown",
            defaults={"district": "Central", "latitude": 34.0522, "longitude": -118.2437}
        )

        # Create/Get user
        self.user = User.objects.filter(username="test_officer").first()
        if not self.user:
            self.user = User.objects.create_user(username="test_officer", password="securepassword123")
            self.user.profile.role = "Officer"
            self.user.profile.save()

    def get_jwt_headers(self, user):
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        return {
            'HTTP_AUTHORIZATION': f'Bearer {refresh.access_token}'
        }

    def test_user_registration(self):
        """Test authentication registration endpoint."""
        # Clean up user if already exists from a previous run
        User.objects.filter(username="new_analyst").delete()
        
        url = '/api/v1/auth/register/'
        payload = {
            "username": "new_analyst",
            "email": "analyst@precinct.gov",
            "password": "strongpassword123",
            "role": "Analyst",
            "department": "precinct-02"
        }
        response = self.client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert 'tokens' in response.data
        assert response.data['user']['username'] == "new_analyst"
        assert response.data['user']['profile']['role'] == "Analyst"

    def test_user_login(self):
        """Test token creation on login."""
        url = '/api/v1/auth/login/'
        payload = {
            "username": "test_officer",
            "password": "securepassword123"
        }
        response = self.client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert response.data['user']['username'] == "test_officer"

    def test_crime_reporting(self):
        """Test logging a crime report (requires auth)."""
        headers = self.get_jwt_headers(self.user)
        url = '/api/v1/crime/reports/'
        desc = "Bicycle theft outside store"
        
        # Clean up any existing report with this description
        CrimeReport.objects.filter(description=desc).delete()
        
        payload = {
            "category_id": self.category.id,
            "location_id": self.location.id,
            "date_occurred": "2024-01-01T12:00:00Z",
            "status": "Pending",
            "description": desc
        }
        response = self.client.post(url, payload, format='json', **headers)
        assert response.status_code == status.HTTP_201_CREATED
        
        report = CrimeReport.objects.filter(description=desc).first()
        assert report is not None
        assert report.reporter == self.user

    def test_crime_prediction(self):
        """Test crime prediction endpoint (requires auth)."""
        # Create historical reports first so that models have features to train (at least 5 required)
        current_count = CrimeReport.objects.count()
        if current_count < 10:
            for i in range(10 - current_count):
                CrimeReport.objects.create(
                    category=self.category,
                    location=self.location,
                    reporter=self.user,
                    date_occurred="2024-01-01T12:00:00Z",
                    status="Pending"
                )

        headers = self.get_jwt_headers(self.user)
        url = '/api/v1/prediction/predict/'
        payload = {
            "location_id": self.location.id,
            "hour": 22
        }
        response = self.client.post(url, payload, format='json', **headers)
        assert response.status_code == status.HTTP_201_CREATED
        assert 'predicted_category' in response.data
        assert 'risk_score' in response.data
        assert float(response.data['risk_score']) > 0.0
