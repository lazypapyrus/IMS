import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "inventory_system.settings")
django.setup()

from api.models import Supplier, Customer, Ledger, AccountGroup

def migrate_to_ledgers():
    # Get groups
    debtors_group = AccountGroup.objects.get(name='Sundry Debtors')
    creditors_group = AccountGroup.objects.get(name='Sundry Creditors')

    # Migrate Suppliers
    for supplier in Supplier.objects.filter(ledger__isnull=True):
        ledger, created = Ledger.objects.get_or_create(
            name=f"Supplier: {supplier.name}",
            defaults={'group': creditors_group}
        )
        supplier.ledger = ledger
        supplier.save()
        print(f"Linked Supplier {supplier.name} to ledger {ledger.name}")

    # Migrate Customers
    for customer in Customer.objects.filter(ledger__isnull=True):
        ledger, created = Ledger.objects.get_or_create(
            name=f"Customer: {customer.name}",
            defaults={'group': debtors_group}
        )
        customer.ledger = ledger
        customer.save()
        print(f"Linked Customer {customer.name} to ledger {ledger.name}")

if __name__ == "__main__":
    migrate_to_ledgers()
