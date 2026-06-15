# CAPS - Project Folder Structure & Module Explanation 📁

This document provides a comprehensive overview of the **Crime Analysis & Prediction System (CAPS)** directory layout, explaining the purpose of each file and folder. This structure implements **Clean Architecture** principles and keeps a clear **Separation of Concerns**.

---

## 📂 Root Directory Map

```
crime-analysis-system/
├── .github/                 # CI/CD Workflows
│   └── workflows/
│       └── ci.yml           # GitHub Actions test runner pipeline
│
├── backend/                 # Backend Application Tier
│   ├── config/              # Central configuration, routing, and settings
│   │   ├── asgi.py          # ASGI application entrypoint
│   │   ├── settings.py      # Master project settings & environment loading
│   │   ├── urls.py          # Central routing URL dispatcher
│   │   └── wsgi.py          # WSGI application entrypoint
│   │
│   ├── manage.py            # Local command line manager utility
│   ├── db.sqlite3           # Local SQLite database (used for dev/testing)
│   └── apps/                # Component Modules (Django Apps)
│       ├── analytics/       # Data aggregations and KPIs calculations
│       ├── authentication/  # JWT Token authorization & profiles management
│       ├── crime_data/      # Core incident CRUD, locations, categories, and audit logs
│       └── prediction/      # ML RF Classifier training and risk prediction
│
├── database/                # Database Scripts
│   └── schema/
│       └── init_db.sql      # Raw DDL SQL definitions for PostgreSQL setup
│
├── docker/                  # Isolated deployment setups
│   ├── backend/
│   │   └── Dockerfile       # Django Python web environment recipe
│   └── db/
│       └── init.sql         # Hook to initialize tables inside Docker PG
│
├── docs/                    # Documentation & Visuals
│   ├── api/
│   │   └── specs.md         # API endpoints specifications & payloads
│   └── screenshots/         # UI Screen placeholders & diagrams
│
├── frontend/                # Frontend Web Interface
│   ├── templates/           # Server-rendered HTML Layout templates
│   └── static/              # Static Assets
│       ├── css/             # Custom custom styling sheets (style.css)
│       └── js/              # ES6 client JavaScript controllers & API helpers
│
├── tests/                   # Verification Tier
│   ├── conftest.py          # Pytest setup and test database mocks
│   └── test_integration.py  # Automation tests asserting system stability
│
├── requirements/            # Application Dependencies folder
│   └── requirements.txt     # Python target environment package list
│
├── requirements.txt         # Root requirements file (redirection link)
├── render.yaml              # Infrastructure-as-Code recipe for Render
├── docker-compose.yml       # Docker container orchestration recipe
├── .env.example             # Boilerplate template for environment variables
└── .gitignore               # git exclude instructions
```

---

## 🏛️ Details of Core Components

### 1. Presentation Layer (`frontend/`)
Exposes the visual templates and manages user interactions:
* `static/js/api.js`: Standard client for fetch requests. Handles authentication state, JWT refreshes, and updates navbar items based on localStorage values.
* `static/js/dashboard.js`: Pulls KPI summary statistics and plots custom severity pins with information popups using Leaflet.js.
* `static/js/prediction.js`: Pulls ML forecasts, draws target risk locations with score-dependent circle overlays, and renders feature weights charts using Chart.js.
* `static/js/crime_management.js`: Handles incident registrations, deletions, and updates (with status change dropdown selectors).
* `static/js/audit_logs.js`: Pulls table rows tracking log actions.

### 2. Application Layer (`backend/`)
Contains business logic operations:
* `config/settings.py`: Resolves settings dynamically. Determines if the database should bind locally via SQLite or target PostgreSQL.
* `apps/authentication/`: Leverages standard django authentication models and maps profiles (Officer, Analyst, Admin, Public).
* `apps/crime_data/`: Maintains core records. Incorporates services (`services.py`) to manage DB queries separated from views. Employs database audit logs triggered by reports modification actions.
* `apps/analytics/`: Runs aggregation functions computing summaries and timelines for dashboards.
* `apps/prediction/`: Exposes prediction endpoints. Utilizes a cached `RandomForestClassifier` to forecast crime categories and risk scores based on coordinates and temporal coordinates.

### 3. Persistence Layer (`database/`)
* Contains database schemas and SQL specifications. Maps custom table constraints, keys, indexes, and custom table relationships.

### 4. Quality Assurance (`tests/`)
* Integration testing verifies endpoint registration responses, authentication validation status, log creations, and machine learning pipeline predictions under isolated test runs.
