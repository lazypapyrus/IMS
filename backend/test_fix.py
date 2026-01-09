import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "inventory_system.settings")
django.setup()

from api.serializers import SupplierSerializer
from api.models import Supplier, Ledger

def test_supplier_creation():
    print("Testing Supplier Creation with Auto-Ledger...")
    data = {
        "name": "New Test Supplier",
        "email": "newtest@example.com",
        "phone": "9876543210",
        "address": "Test Address"
    }
    
    serializer = SupplierSerializer(data=data)
    if serializer.is_valid():
        supplier = serializer.save()
        print(f"Success: Supplier {supplier.name} created.")
        if supplier.ledger:
            print(f"Success: Ledger {supplier.ledger.name} auto-created.")
        else:
            print("Failure: Ledger not created.")
    else:
        print(f"Errors: {serializer.errors}")

if __name__ == "__main__":
    test_supplier_creation()
