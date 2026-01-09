import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "inventory_system.settings")
django.setup()

from api.models import AccountGroup

def seed_groups():
    groups = [
        # Primary Groups
        ('Assets', 'ASSETS', None),
        ('Liabilities', 'LIABILITIES', None),
        ('Income', 'INCOME', None),
        ('Expenses', 'EXPENSES', None),
        
        # Subgroups
        ('Current Assets', 'ASSETS', 'Assets'),
        ('Current Liabilities', 'LIABILITIES', 'Liabilities'),
        ('Fixed Assets', 'ASSETS', 'Assets'),
        ('Direct Income', 'INCOME', 'Income'),
        ('Indirect Income', 'INCOME', 'Income'),
        ('Direct Expenses', 'EXPENSES', 'Expenses'),
        ('Indirect Expenses', 'EXPENSES', 'Expenses'),
        
        # Tally specific subgroups
        ('Sundry Debtors', 'ASSETS', 'Current Assets'),
        ('Sundry Creditors', 'LIABILITIES', 'Current Liabilities'),
        ('Bank Accounts', 'ASSETS', 'Current Assets'),
        ('Cash-in-Hand', 'ASSETS', 'Current Assets'),
        ('Sales Accounts', 'INCOME', 'Income'),
        ('Purchase Accounts', 'EXPENSES', 'Expenses'),
        ('Duties & Taxes', 'LIABILITIES', 'Current Liabilities'),
    ]

    for name, nature, parent_name in groups:
        parent = AccountGroup.objects.get(name=parent_name) if parent_name else None
        group, created = AccountGroup.objects.get_or_create(
            name=name,
            defaults={'nature': nature, 'parent': parent}
        )
        if created:
            print(f"Created group: {name}")
        else:
            print(f"Group already exists: {name}")

if __name__ == "__main__":
    seed_groups()
