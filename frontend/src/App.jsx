import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './pages/DashboardLayout';

import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import InvoiceList from './pages/Invoices/InvoiceList';
import CreateInvoice from './pages/Invoices/CreateInvoice';
import AdminPanel from './pages/Admin/AdminPanel';
import DayBook from './pages/Accounting/DayBook';
import TrialBalance from './pages/Accounting/TrialBalance';
import Ledgers from './pages/Accounting/Ledgers';
import QuotationList from './pages/Quotation/QuotationList';
import CreateQuotation from './pages/Quotation/CreateQuotation';
import PrintQuotation from './pages/Quotation/PrintQuotation';
import WorkDrive from './pages/WorkDrive';
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="customers" element={<Customers />} />
            <Route path="invoices" element={<InvoiceList />} />
            <Route path="invoices/create" element={<CreateInvoice />} />
            <Route path="categories" element={<Categories />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="ledgers" element={<Ledgers />} />
            <Route path="day-book" element={<DayBook />} />
            <Route path="trial-balance" element={<TrialBalance />} />
            <Route path="quotations" element={<QuotationList />} />
            <Route path="quotations/create" element={<CreateQuotation />} />
            <Route path="quotations/edit/:id" element={<CreateQuotation />} />
            <Route path="workdrive" element={<WorkDrive />} />
            <Route path="admin-panel" element={<AdminPanel />} />
          </Route>

          <Route path="/quotations/print/:id" element={
            <ProtectedRoute>
              <PrintQuotation />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
