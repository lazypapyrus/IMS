from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User, Category, Supplier, Customer, Product, Invoice
from .serializers import (
    UserSerializer, CategorySerializer, SupplierSerializer, CustomerSerializer,
    ProductSerializer, InvoiceSerializer
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
