import os
import sys
from pathlib import Path

# Add the project directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

# Mock environment variables
os.environ['RENDER_EXTERNAL_HOSTNAME'] = 'e-commerce-fqmn.onrender.com'
os.environ['ALLOWED_HOSTS'] = '127.0.0.1,localhost'

# Import settings (but we need to set DJANGO_SETTINGS_MODULE)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')

import django
django.setup()

from django.conf import settings

print(f"ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")

# Test assertions
expected = ['127.0.0.1', 'localhost', 'e-commerce-fqmn.onrender.com', '.onrender.com']
for host in expected:
    if host in settings.ALLOWED_HOSTS:
        print(f"SUCCESS: {host} is in ALLOWED_HOSTS")
    else:
        print(f"FAILURE: {host} is NOT in ALLOWED_HOSTS")

if 'e-commerce-fqmn.onrender.com' in settings.ALLOWED_HOSTS and '.onrender.com' in settings.ALLOWED_HOSTS:
    print("\nVerification Passed: Render hostname and wildcard are correctly added.")
else:
    print("\nVerification Failed.")
