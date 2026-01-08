from rest_framework import serializers
from .models import User, Category, Supplier, Customer, Product, Invoice, InvoiceItem
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

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

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

        return invoice
