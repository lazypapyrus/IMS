import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "inventory_system.settings")
django.setup()

from api.models import Invoice, Product, Customer, User, Voucher, VoucherEntry

def verify_autoposting():
    print("Verifying Auto-Posting...")
    user, _ = User.objects.get_or_create(username='admin', defaults={'email': 'admin@example.com', 'is_staff': True, 'is_superuser': True})
    
    # Ensure a customer exists
    customer, _ = Customer.objects.get_or_create(
        name="Test Customer",
        defaults={'email': 'test@example.com'}
    )
    if not customer.ledger:
        from api.models import AccountGroup, Ledger
        debtors_group = AccountGroup.objects.get(name='Sundry Debtors')
        ledger, _ = Ledger.objects.get_or_create(name=f"Customer: {customer.name}", defaults={'group': debtors_group})
        customer.ledger = ledger
        customer.save()

    # Ensure a product exists
    product, _ = Product.objects.get_or_create(
        sku="TEST-01",
        defaults={'name': 'Test Product', 'price': 100, 'stock_quantity': 10}
    )

    # Create Invoice
    invoice_data = {
        'invoice_type': 'SALE',
        'customer': customer,
        'user': user,
        'total_amount': 0, # Will be calculated by serializer if we used it, but here we do manual check
    }
    
    # We should use the serializer to test the logic actually
    from api.serializers import InvoiceSerializer
    from rest_framework.request import Request
    from rest_framework.test import APIRequestFactory

    factory = APIRequestFactory()
    request = factory.post('/api/invoices/')
    request.user = user

    data = {
        "invoice_type": "SALE",
        "customer": customer.id,
        "items": [
            {
                "product": product.id,
                "quantity": 1,
                "unit_price": 100
            }
        ],
        "include_tax": True
    }

    serializer = InvoiceSerializer(data=data, context={'request': request})
    if serializer.is_valid():
        invoice = serializer.save(user=user)
        print(f"Created Invoice #{invoice.id}")
        
        # Check if Voucher exists
        vouchers = Voucher.objects.filter(narration__contains=f"Invoice #{invoice.id}")
        if vouchers.exists():
            voucher = vouchers.first()
            print(f"Success: Voucher {voucher.number} created!")
            for entry in voucher.entries.all():
                print(f"  Entry: {entry.ledger.name} | Dr: {entry.debit} | Cr: {entry.credit}")
        else:
            print("Failure: No voucher found for invoice.")
    else:
        print(f"Serializer Errors: {serializer.errors}")

if __name__ == "__main__":
    verify_autoposting()
