import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "inventory_system.settings")
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()

try:
    admin = User.objects.get(username='admin')
    admin.role = 'ADMIN'
    admin.save()
    print("Admin role updated")
except User.DoesNotExist:
    print("Admin user not found")
