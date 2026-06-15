-- SQL Database Schema Initialization
-- For Crime Analysis and Prediction System

-- 1. Create Crime Categories Table
CREATE TABLE IF NOT EXISTS crime_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    severity_level VARCHAR(20) NOT NULL CHECK (severity_level IN ('Low', 'Medium', 'High'))
);

-- Create index on name for quick lookups
CREATE INDEX IF NOT EXISTS idx_crime_categories_name ON crime_categories(name);

-- 2. Create Locations Table
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    area_name VARCHAR(150) NOT NULL,
    district VARCHAR(100),
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL
);

-- Index for spatial range searches
CREATE INDEX IF NOT EXISTS idx_locations_coordinates ON locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_locations_area_name ON locations(area_name);

-- 3. Create Crime Reports Table
CREATE TABLE IF NOT EXISTS crime_reports (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES crime_categories(id) ON DELETE RESTRICT,
    location_id INTEGER REFERENCES locations(id) ON DELETE RESTRICT,
    reporter_id INTEGER NOT NULL, -- References auth_user(id)
    date_occurred TIMESTAMP NOT NULL,
    date_reported TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Investigating', 'Resolved')),
    description TEXT
);

-- Indexes for filters (date range, location range, severity/category)
CREATE INDEX IF NOT EXISTS idx_crime_reports_date_occurred ON crime_reports(date_occurred);
CREATE INDEX IF NOT EXISTS idx_crime_reports_status ON crime_reports(status);
CREATE INDEX IF NOT EXISTS idx_crime_reports_category_id ON crime_reports(category_id);
CREATE INDEX IF NOT EXISTS idx_crime_reports_location_id ON crime_reports(location_id);

-- 4. Create Predictions Table
CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL, -- References auth_user(id)
    location_id INTEGER REFERENCES locations(id) ON DELETE CASCADE,
    predicted_category_id INTEGER REFERENCES crime_categories(id) ON DELETE CASCADE,
    prediction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    input_hour INTEGER NOT NULL CHECK (input_hour BETWEEN 0 AND 23),
    risk_score NUMERIC(4, 2) NOT NULL CHECK (risk_score BETWEEN 0.00 AND 10.00)
);

CREATE INDEX IF NOT EXISTS idx_predictions_location ON predictions(location_id);

-- 5. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER, -- References auth_user(id) (NULL if system action)
    action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
    table_name VARCHAR(100) NOT NULL,
    row_id INTEGER NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    details TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
