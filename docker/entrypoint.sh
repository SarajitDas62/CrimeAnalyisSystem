#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "Waiting for postgres..."
while ! pg_isready -h db -U postgres > /dev/null 2> /dev/null; do
  sleep 1
done
echo "PostgreSQL started"

# Apply database migrations
echo "Applying database migrations..."
python backend/manage.py migrate --noinput

# Start development server
echo "Starting development server..."
python backend/manage.py runserver 0.0.0.0:8000
