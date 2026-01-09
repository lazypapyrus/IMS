from rest_framework import viewsets, permissions, status, views
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Q
import datetime
from .models import (
    User, Category, Supplier, Customer, Product, Invoice,
    AccountGroup, Ledger, Voucher, Quotation, VoucherEntry, WorkDriveFile, WorkDriveCategory
)
from .serializers import (
    UserSerializer, CategorySerializer, SupplierSerializer, CustomerSerializer,
    ProductSerializer, InvoiceSerializer,
    AccountGroupSerializer, LedgerSerializer, VoucherSerializer,
    QuotationSerializer, WorkDriveFileSerializer, WorkDriveCategorySerializer
)
from .permissions import IsAdmin, IsEditor, IsViewer

class BaseRBACViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if self.action in ['destroy']:
            permission_classes = [IsAdmin]
        elif self.action in ['create', 'update', 'partial_update']:
            permission_classes = [IsEditor]
        else:
            permission_classes = [IsViewer]
        return [permission() for permission in permission_classes]

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin] # Only Admin can manage users

    @action(detail=True, methods=['patch'])
    def update_role(self, request, pk=None):
        user = self.get_object()
        role = request.data.get('role')
        if role in dict(User.ROLES):
            user.role = role
            user.save()
            return Response({'status': 'role updated', 'role': role})
        return Response({'error': 'invalid role'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def change_password(self, request, pk=None):
        user = self.get_object()
        password = request.data.get('password')
        if not password:
            return Response({'error': 'Password required'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(password)
        user.save()
        return Response({'status': 'Password updated successfully'})

class CategoryViewSet(BaseRBACViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class SupplierViewSet(BaseRBACViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

class CustomerViewSet(BaseRBACViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

class ProductViewSet(BaseRBACViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class InvoiceViewSet(BaseRBACViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# --- Accounting ViewSets ---

class AccountGroupViewSet(BaseRBACViewSet):
    queryset = AccountGroup.objects.all()
    serializer_class = AccountGroupSerializer

class LedgerViewSet(BaseRBACViewSet):
    queryset = Ledger.objects.all()
    serializer_class = LedgerSerializer

class VoucherViewSet(BaseRBACViewSet):
    queryset = Voucher.objects.all()
    serializer_class = VoucherSerializer

class QuotationViewSet(BaseRBACViewSet):
    queryset = Quotation.objects.all()
    serializer_class = QuotationSerializer

class WorkDriveCategoryViewSet(BaseRBACViewSet):
    queryset = WorkDriveCategory.objects.all()
    serializer_class = WorkDriveCategorySerializer

class WorkDriveFileViewSet(BaseRBACViewSet):
    queryset = WorkDriveFile.objects.all().order_by('-uploaded_at')
    serializer_class = WorkDriveFileSerializer

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

class DashboardSummaryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = datetime.date.today()
        
        # Today's Metrics
        # Logic: We sum the "main" entry for each voucher type
        # Sales: Sum of entries for Sales ledgers (Credit) or Customer ledgers (Debit)
        # To keep it simple, we'll sum the Voucher.entries where ledger is in the relevant group.
        
        # This is a bit complex without more specific indexing, so let's simplify for the dashboard:
        # Sum total_amount from Vouchers for today
        sales_today = Voucher.objects.filter(voucher_type='SALES', date=today).aggregate(total=Sum('entries__debit'))['total'] or 0
        purchase_today = Voucher.objects.filter(voucher_type='PURCHASE', date=today).aggregate(total=Sum('entries__credit'))['total'] or 0
        receipt_today = Voucher.objects.filter(voucher_type='RECEIPT', date=today).aggregate(total=Sum('entries__debit'))['total'] or 0
        payment_today = Voucher.objects.filter(voucher_type='PAYMENT', date=today).aggregate(total=Sum('entries__credit'))['total'] or 0

        # Bank and Cash Balances
        from .models import VoucherEntry, Ledger
        bank_cash_groups = ['Bank Accounts', 'Cash-in-Hand']
        bank_cash_ledgers = Ledger.objects.filter(group__name__in=bank_cash_groups)
        
        balances = []
        for ledger in bank_cash_ledgers:
            entries = VoucherEntry.objects.filter(ledger=ledger)
            total_debit = entries.aggregate(Sum('debit'))['debit__sum'] or 0
            total_credit = entries.aggregate(Sum('credit'))['credit__sum'] or 0
            balance = ledger.opening_balance + total_debit - total_credit
            
            balances.append({
                'name': ledger.name,
                'balance': float(balance),
                'color': 'text-green-500' if 'Cash' in ledger.name else 'text-blue-500'
            })

        return Response({
            'today': {
                'sales': float(sales_today),
                'purchase': float(purchase_today),
                'receipt': float(receipt_today),
                'payment': float(payment_today),
            },
            'bankBalances': balances
        })
