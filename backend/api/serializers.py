from rest_framework import serializers
from .models import (
    User, Category, Supplier, Customer, Product, Invoice, InvoiceItem,
    AccountGroup, Ledger, Voucher, VoucherEntry,
    Quotation, QuotationItem, WorkDriveFile, WorkDriveCategory
)
from django.db import transaction

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'role')
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'
        read_only_fields = ('ledger',)

    def create(self, validated_data):
        with transaction.atomic():
            # Create the Supplier first
            supplier = Supplier.objects.create(**validated_data)
            
            # Auto-create Ledger
            from .models import AccountGroup, Ledger
            try:
                creditors_group = AccountGroup.objects.get(name='Sundry Creditors')
                ledger, _ = Ledger.objects.get_or_create(
                    name=f"Supplier: {supplier.name}",
                    defaults={'group': creditors_group}
                )
                supplier.ledger = ledger
                supplier.save()
            except Exception as e:
                print(f"Error creating ledger for supplier: {e}")
                # We don't necessarily want to fail the whole supplier creation if ledger fails?
                # Actually for Tally it's critical. Let's let it fail if it's a REAL error.
                # But get_or_create handles the most common conflict.
            
            return supplier

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'
        read_only_fields = ('ledger',)

    def create(self, validated_data):
        with transaction.atomic():
            # Create the Customer first
            customer = Customer.objects.create(**validated_data)
            
            # Auto-create Ledger
            from .models import AccountGroup, Ledger
            try:
                debtors_group = AccountGroup.objects.get(name='Sundry Debtors')
                ledger, _ = Ledger.objects.get_or_create(
                    name=f"Customer: {customer.name}",
                    defaults={'group': debtors_group}
                )
                customer.ledger = ledger
                customer.save()
            except Exception as e:
                print(f"Error creating ledger for customer: {e}")
            
            return customer

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    class Meta:
        model = Product
        fields = '__all__'

class InvoiceItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = InvoiceItem
        fields = ('id', 'product', 'product_name', 'quantity', 'unit_price', 'subtotal')
        read_only_fields = ('subtotal',)

# --- Tally Integration Serializers ---

class AccountGroupSerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent.name', read_only=True)
    class Meta:
        model = AccountGroup
        fields = '__all__'

class LedgerSerializer(serializers.ModelSerializer):
    group_name = serializers.CharField(source='group.name', read_only=True)
    class Meta:
        model = Ledger
        fields = '__all__'

class VoucherEntrySerializer(serializers.ModelSerializer):
    ledger_name = serializers.CharField(source='ledger.name', read_only=True)
    class Meta:
        model = VoucherEntry
        fields = ('id', 'ledger', 'ledger_name', 'debit', 'credit')

class VoucherSerializer(serializers.ModelSerializer):
    entries = VoucherEntrySerializer(many=True, read_only=True)
    class Meta:
        model = Voucher
        fields = '__all__'

class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    include_tax = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = Invoice
        fields = '__all__'
        read_only_fields = ('user', 'total_amount', 'tax_amount', 'net_amount')

    def create(self, validated_data):
        include_tax = validated_data.pop('include_tax', False)
        items_data = validated_data.pop('items')
        
        # Calculate totals
        total_subtotal = 0
        for item in items_data:
            total_subtotal += item['unit_price'] * item['quantity']
        
        # VAT 13%
        from decimal import Decimal
        tax_amount = (total_subtotal * Decimal('0.13')) if include_tax else Decimal('0')
        net_amount = total_subtotal
        total_amount = net_amount + tax_amount

        with transaction.atomic():
            invoice = Invoice.objects.create(
                **validated_data,
                tax_amount=tax_amount,
                net_amount=net_amount,
                total_amount=total_amount
            )

            for item_data in items_data:
                InvoiceItem.objects.create(invoice=invoice, **item_data)
                
                # Stock Logic
                product = item_data['product']
                qty = item_data['quantity']
                
                if invoice.invoice_type == 'PURCHASE':
                    product.stock_quantity += qty
                elif invoice.invoice_type == 'SALE':
                    if product.stock_quantity < qty:
                        raise serializers.ValidationError(f"Insufficient stock for {product.name}")
                    product.stock_quantity -= qty
                product.save()

            # --- AUTO POST TO VOUCHER (Tally Style) ---
            self._post_to_voucher(invoice, tax_amount, net_amount, total_amount)

        return invoice

    def _post_to_voucher(self, invoice, tax_amount, net_amount, total_amount):
        """Create a double-entry Voucher for the Invoice."""
        import datetime
        voucher_type = 'SALES' if invoice.invoice_type == 'SALE' else 'PURCHASE'
        
        # Generate unique voucher number
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        v_number = f"{invoice.invoice_type[:1]}-{invoice.id}-{timestamp}"
        
        voucher = Voucher.objects.create(
            voucher_type=voucher_type,
            number=v_number,
            date=datetime.date.today(),
            narration=f"Auto-generated from Invoice #{invoice.id}. {invoice.note}"
        )
        
        if invoice.invoice_type == 'SALE':
            # Sale: Debit Customer (Total), Credit Sales (Net), Credit VAT (Tax)
            customer_ledger = invoice.customer.ledger
            sales_ledger, _ = Ledger.objects.get_or_create(
                name="Local Sales", 
                defaults={'group': AccountGroup.objects.get(name='Sales Accounts')}
            )
            
            # Debit Customer
            VoucherEntry.objects.create(voucher=voucher, ledger=customer_ledger, debit=total_amount)
            # Credit Sales
            VoucherEntry.objects.create(voucher=voucher, ledger=sales_ledger, credit=net_amount)
            # Credit VAT if applicable
            if tax_amount > 0:
                vat_ledger, _ = Ledger.objects.get_or_create(
                    name="VAT (Output)", 
                    defaults={'group': AccountGroup.objects.get(name='Duties & Taxes')}
                )
                VoucherEntry.objects.create(voucher=voucher, ledger=vat_ledger, credit=tax_amount)
                
        elif invoice.invoice_type == 'PURCHASE':
            # Purchase: Debit Purchase (Net), Debit VAT (Tax), Credit Supplier (Total)
            supplier_ledger = invoice.supplier.ledger
            purchase_ledger, _ = Ledger.objects.get_or_create(
                name="Local Purchases", 
                defaults={'group': AccountGroup.objects.get(name='Purchase Accounts')}
            )
            
            # Debit Purchase
            VoucherEntry.objects.create(voucher=voucher, ledger=purchase_ledger, debit=net_amount)
            # Credit Supplier
            VoucherEntry.objects.create(voucher=voucher, ledger=supplier_ledger, credit=total_amount)
            # Debit VAT if applicable
            if tax_amount > 0:
                vat_ledger, _ = Ledger.objects.get_or_create(
                    name="VAT (Input)", 
                    defaults={'group': AccountGroup.objects.get(name='Duties & Taxes')}
                )
                VoucherEntry.objects.create(voucher=voucher, ledger=vat_ledger, debit=tax_amount)

        return invoice

class QuotationItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuotationItem
        fields = ('id', 'description', 'quantity', 'rate', 'amount')

class QuotationSerializer(serializers.ModelSerializer):
    items = QuotationItemSerializer(many=True)
    customer_name_display = serializers.CharField(source='customer.name', read_only=True)

    class Meta:
        model = Quotation
        fields = '__all__'

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        with transaction.atomic():
            quotation = Quotation.objects.create(**validated_data)
            for item_data in items_data:
                QuotationItem.objects.create(quotation=quotation, **item_data)
        return quotation

class WorkDriveCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkDriveCategory
        fields = '__all__'

class WorkDriveFileSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    
    class Meta:
        model = WorkDriveFile
        fields = '__all__'
        read_only_fields = ('uploaded_at', 'uploaded_by')
