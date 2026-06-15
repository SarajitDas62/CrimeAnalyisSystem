# Crime Analysis & Prediction System - API Specifications

Version: 1.0.0  
Base URL: `/api/v1`

---

## 1. Authentication Endpoints

### Register Account
* **Route:** `/auth/register/`
* **Method:** `POST`
* **Request Body:**
```json
{
  "username": "officer_doe",
  "email": "doe@precinct.gov",
  "password": "strongpassword123",
  "role": "Officer",
  "department": "precinct-12"
}
```
* **Response Body (201 Created):**
```json
{
  "user": {
    "id": 1,
    "username": "officer_doe",
    "email": "doe@precinct.gov",
    "first_name": "",
    "last_name": "",
    "profile": {
      "role": "Officer",
      "department": "precinct-12"
    }
  },
  "tokens": {
    "refresh": "eyJhbGciOi...",
    "access": "eyJhbGciOi..."
  }
}
```

### Log In
* **Route:** `/auth/login/`
* **Method:** `POST`
* **Request Body:**
```json
{
  "username": "officer_doe",
  "password": "strongpassword123"
}
```
* **Response Body (200 OK):**
```json
{
  "refresh": "eyJhbGciOi...",
  "access": "eyJhbGciOi...",
  "user": {
    "id": 1,
    "username": "officer_doe",
    "email": "doe@precinct.gov",
    "first_name": "",
    "last_name": "",
    "profile": {
      "role": "Officer",
      "department": "precinct-12"
    }
  }
}
```

---

## 2. Crime Management Endpoints

### List Crime Reports
* **Route:** `/crime/reports/`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <access_token>`
* **Parameters (Optional):** `category_id`, `location_id`, `status`
* **Response Body (200 OK):**
```json
[
  {
    "id": 12,
    "category": {
      "id": 2,
      "name": "Robbery",
      "description": "Theft with force",
      "severity_level": "High"
    },
    "location": {
      "id": 4,
      "area_name": "Downtown",
      "district": "District 1",
      "latitude": "34.052200",
      "longitude": "-118.243700"
    },
    "reporter": {
      "id": 1,
      "username": "officer_doe",
      "email": "doe@precinct.gov"
    },
    "date_occurred": "2024-01-01T22:15:00Z",
    "date_reported": "2024-01-01T22:20:00Z",
    "status": "Pending",
    "description": "Armed robbery at convenience store"
  }
]
```

### Create Crime Report
* **Route:** `/crime/reports/`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <access_token>`
* **Request Body:**
```json
{
  "category_id": 2,
  "location_id": 4,
  "date_occurred": "2024-01-01T22:15:00Z",
  "status": "Pending",
  "description": "Armed robbery at convenience store"
}
```
* **Response Body (201 Created):** Same structure as a single item in List Reports response.

---

## 3. Analytics Endpoints

### Dashboard Summary (KPIs)
* **Route:** `/analytics/summary/`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <access_token>`
* **Response Body (200 OK):**
```json
{
  "total_reports": 150,
  "resolved_reports": 120,
  "pending_reports": 20,
  "investigating_reports": 10,
  "total_categories": 6,
  "total_locations": 8
}
```

---

## 4. ML Prediction Endpoints

### Predict Crime Risk
* **Route:** `/prediction/predict/`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <access_token>`
* **Request Body:**
```json
{
  "location_id": 4,
  "hour": 22
}
```
* **Response Body (201 Created):**
```json
{
  "id": 45,
  "user": {
    "id": 1,
    "username": "officer_doe"
  },
  "location": {
    "id": 4,
    "area_name": "Downtown",
    "latitude": "34.052200",
    "longitude": "-118.243700"
  },
  "predicted_category": {
    "id": 2,
    "name": "Robbery",
    "severity_level": "High"
  },
  "prediction_date": "2026-06-15T16:55:00Z",
  "input_hour": 22,
  "risk_score": "8.50"
}
```
