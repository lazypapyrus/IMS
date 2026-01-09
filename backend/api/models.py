from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLES = (
        ('ADMIN', 'Admin'),
        ('EDITOR', 'Editor'),
        ('VIEWER', 'Viewer'),
    )
    role = models.CharField(max_length=10, choices=ROLES, default='VIEWER')

class Category(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    class Meta:
        verbose_name_plural = "Categories"

class Supplier(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    ledger = models.OneToOneField('Ledger', on_delete=models.SET_NULL, null=True, blank=True, related_name='supplier_profile')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Customer(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    ledger = models.OneToOneField('Ledger', on_delete=models.SET_NULL, null=True, blank=True, related_name='customer_profile')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2) # Selling Price
    stock_quantity = models.IntegerField(default=0)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, related_name='products')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Invoice(models.Model):
    INVOICE_TYPES = (
        ('PURCHASE', 'Purchase (Stock In)'),
        ('SALE', 'Sale (Stock Out)'),
    )
    invoice_type = models.CharField(max_length=10, choices=INVOICE_TYPES)
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoices')
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoices')
    transaction_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateField(null=True, blank=True)
    
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0) # 13% VAT
    net_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0) # Total - Tax? Or Total + Tax? Usually Total includes Tax. Let's say Total = Net + Tax.
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    note = models.TextField(blank=True)

    def __str__(self):
        return f"{self.invoice_type} - {self.id}"

class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2) # Price at moment of transaction
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    def save(self, *args, **kwargs):
        self.subtotal = self.unit_price * self.quantity
        super().save(*args, **kwargs)

class Quotation(models.Model):
    customer_name = models.CharField(max_length=255) # Can be free text or link to Customer
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='quotations')
    date = models.DateField(auto_now_add=True)
    valid_until = models.DateField(null=True, blank=True)
    ref_no = models.CharField(max_length=50, unique=True, blank=True)
    prepared_by = models.CharField(max_length=255, blank=True)
    
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    taxable_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    non_taxable_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    vat_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    note = models.TextField(blank=True)
    terms_conditions = models.TextField(blank=True, default="1. VAT is incurred if applicable.\n2. Civil, Plumbing, Ducting, Gas Line and Electrical expenses is to be incurred by client.\n3. Advance Payment: 70% of total payment before delivery and 30% after the delivery of goods.")

    def __str__(self):
        return f"Quote {self.ref_no} - {self.customer_name}"

class QuotationItem(models.Model):
    quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE, related_name='items')
    description = models.CharField(max_length=512)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    rate = models.DecimalField(max_digits=12, decimal_places=2)
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    def save(self, *args, **kwargs):
        self.amount = self.rate * self.quantity
        super().save(*args, **kwargs)

# --- Tally Integration Models ---

class AccountGroup(models.Model):
    NATURE_CHOICES = (
        ('ASSETS', 'Assets'),
        ('LIABILITIES', 'Liabilities'),
        ('INCOME', 'Income'),
        ('EXPENSES', 'Expenses'),
    )
    name = models.CharField(max_length=255, unique=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subgroups')
    nature = models.CharField(max_length=20, choices=NATURE_CHOICES)

    def __str__(self):
        return self.name

class Ledger(models.Model):
    name = models.CharField(max_length=255, unique=True)
    group = models.ForeignKey(AccountGroup, on_delete=models.CASCADE, related_name='ledgers')
    opening_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Voucher(models.Model):
    VOUCHER_TYPES = (
        ('SALES', 'Sales'),
        ('PURCHASE', 'Purchase'),
        ('PAYMENT', 'Payment'),
        ('RECEIPT', 'Receipt'),
        ('CONTRA', 'Contra'),
        ('JOURNAL', 'Journal'),
    )
    voucher_type = models.CharField(max_length=10, choices=VOUCHER_TYPES)
    number = models.CharField(max_length=50, unique=True)
    date = models.DateField()
    narration = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.voucher_type} - {self.number}"

class VoucherEntry(models.Model):
    voucher = models.ForeignKey(Voucher, on_delete=models.CASCADE, related_name='entries')
    ledger = models.ForeignKey(Ledger, on_delete=models.CASCADE, related_name='voucher_entries')
    debit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    credit = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.voucher} - {self.ledger.name}"

class WorkDriveCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    icon_name = models.CharField(max_length=50, default='File')

    def __str__(self):
        return self.name

class WorkDriveFile(models.Model):
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='workdrive/%Y/%m/%d/')
    file_type = models.CharField(max_length=50) # Flexible string to allow custom types
    category = models.ForeignKey(WorkDriveCategory, on_delete=models.SET_NULL, null=True, related_name='files')
    details = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.name
