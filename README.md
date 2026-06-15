# CAPS: Crime Analysis & Prediction System

A production-quality, multi-tiered full-stack system designed to log crime reports, extract aggregate spatial-temporal statistics, and predict future crime categories and risk scores using Machine Learning.

---

## 🏗️ Architecture Design

```mermaid
graph TD
    subgraph Client Tier (Frontend)
        UI[Bootstrap 5 + Vanilla JS UI]
        Chart[Chart.js Engine]
    end

    subgraph Service Tier (Backend Gateway)
        DRF[Django REST Framework]
        AuthService[Authentication Service]
        CrimeService[Crime CRUD Service]
        AnalyticsService[Analytics Engine]
        PredictionService[Random Forest ML Pipeline]
    end

    subgraph Storage Tier (Database)
        DB[(PostgreSQL DB)]
    end

    UI -->|HTTPS + JWT| DRF
    DRF --> AuthService
    DRF --> CrimeService
    DRF --> AnalyticsService
    DRF --> PredictionService
    
    AuthService --> DB
    CrimeService --> DB
    AnalyticsService --> DB
    PredictionService --> DB
```

---

## 📁 Project Structure

```
crime-analysis-system/
├── frontend/                # Presentation Layer
│   ├── templates/           # Server-rendered HTML Layouts
│   └── static/              # CSS Stylesheets, Javascript modules, and media assets
│
├── backend/                 # Business & Gateway Logic
│   ├── config/              # Main Django Settings & Routes
│   └── apps/                # Separate Django apps (auth, crime_data, analytics, prediction)
│
├── database/                # Storage Layer
│   └── schema/              # Raw PostgreSQL Schema definitions
│
├── docker/                  # Containment Configurations
├── tests/                   # Integration and Unit tests
└── requirements/            # Python Library dependency list
```

---

## 🚀 Features

- 🔐 **Secure Authentication:** User accounts managed via JWT Access/Refresh tokens with distinct clearance roles (`Officer`, `Analyst`, `Admin`).
- 🚓 **Incident Logging:** Full CRUD interface for logging coordinates, times, categories, and descriptions of incidents.
- 📈 **Dynamic Aggregations:** Interactive dashboards plotting hourly, daily, area, and category distributions using Chart.js.
- 🔮 **ML Risk Predictions:** Random Forest model predicting likely crime types and calculating a normalized risk score (1.0 - 10.0) based on spatial density and time.
- 📜 **Full System Audit:** Automatic audit logging (`CREATE`, `UPDATE`, `DELETE`) tracking user actions for accountability.

---

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.10+
- PostgreSQL
- Docker & Docker Compose (Optional)

### Running via Docker (Recommended)
1. **Copy example environment file:**
   ```bash
   cp .env.example .env
   ```
2. **Build and run containers:**
   ```bash
   docker-compose up --build -d
   ```
3. **Verify running containers:**
   ```bash
   docker-compose ps
   ```
The app will be running at `http://localhost:8000`.

### Running Locally (Without Docker)
1. **Navigate to backend and create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```
2. **Install dependencies:**
   ```bash
   pip install -r requirements/requirements.txt
   ```
3. **Configure local DB:** Set up a PostgreSQL database and fill details in a local `.env` file.
4. **Run DB migrations:**
   ```bash
   python backend/manage.py migrate
   ```
5. **Start server:**
   ```bash
   python backend/manage.py runserver
   ```
Access the application locally at `http://127.0.0.1:8000`.

---

## ⚙️ Environment Variables

Configure these values in your `.env` file:
- `DEBUG`: Toggle Django debug mode (`True` / `False`).
- `SECRET_KEY`: Django secret encryption key.
- `DB_NAME` / `DB_USER` / `DB_PASSWORD`: PostgreSQL connection settings.
- `JWT_ACCESS_TOKEN_LIFETIME_MINUTES`: Time in minutes before JWT access token expires.

---

## 🧪 Testing Guide

Verify the entire system using the integrated test suite:
```bash
pytest tests/
```
Or run Django's native test command:
```bash
python backend/manage.py test
```

---

## 🔮 Future Improvements

1. **GIS Mapping Integration:** Incorporate Leaflet or Folium map layers directly into the frontend templates.
2. **Real-time WebSockets:** Implement Django Channels for real-time notification broadcasts of new crime alerts to patrolling officers.
3. **Deep Learning:** Migrate the prediction system from scikit-learn to a PyTorch temporal-spatial model.

---

## 👥 Contributors
- **Lead Software Architect:** Antigravity (Advanced Agentic Coding Team, Google DeepMind)
