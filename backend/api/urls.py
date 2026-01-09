from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, CategoryViewSet, SupplierViewSet, 
    CustomerViewSet, ProductViewSet, InvoiceViewSet,
    AccountGroupViewSet, LedgerViewSet, VoucherViewSet,
    DashboardSummaryView, QuotationViewSet, WorkDriveFileViewSet, WorkDriveCategoryViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'suppliers', SupplierViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'products', ProductViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'account-groups', AccountGroupViewSet)
router.register(r'ledgers', LedgerViewSet)
router.register(r'vouchers', VoucherViewSet)
router.register(r'quotations', QuotationViewSet)
router.register(r'workdrive', WorkDriveFileViewSet)
router.register(r'workdrive-categories', WorkDriveCategoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard-summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
]
