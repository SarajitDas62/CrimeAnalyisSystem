import os
import sys
import pytest
from django.core.management import call_command

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), 'backend'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()


@pytest.fixture(scope='session')
def django_db_setup(django_db_blocker):
    """Fixture to configure DB and run migrations."""
    with django_db_blocker.unblock():
        call_command('migrate', '--noinput')
