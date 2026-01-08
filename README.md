# Inventory Management System (IMS)

A robust, full-stack Inventory and Accounting Management System built with **Django** (Backend) and **React** (Frontend). This application helps businesses track products, manage suppliers and customers, process invoices with VAT calculation, and handle user permissions via Role-Based Access Control (RBAC).

## 🚀 Features

### 📦 Inventory & Product Management
- **Dashboard**: Real-time overview of total inventory value, low stock alerts, and category distribution.
- **Product CRUD**: Create, Read, Update, and Delete products.
- **Organization**: Categorize products and link them to specific suppliers.

### 💰 Accounting & Invoicing
- **Purchase Invoices**: Record stock purchases from suppliers (Creditors). Automatically increases stock.
- **Sales Invoices**: Record sales to customers (Debtors). Automatically decreases stock.
- **VAT Calculation**: Optional 13% VAT toggle for specific transactions.
- **Quick Create**: Add new Parties (Suppliers/Customers) or Products directly from the invoice creation form.

### 👥 Party Management
- **Suppliers**: Manage creditor details.
- **Customers**: Manage debtor details.

### 🛡️ User Management & Security (RBAC)
- **Roles**:
  - **Admin**: Full access. Can manage users and reset passwords via the Admin Panel.
  - **Editor**: Can create/update data but cannot delete critical entries.
  - **Viewer**: Read-only access to the system.
- **Admin Panel**: Dedicated interface for Admins to manage user roles and create new users.

## 🛠️ Tech Stack

- **Backend**: Django, Django REST Framework, SQLite, SimpleJWT
- **Frontend**: React, Vite, Tailwind CSS v4, Axios, Recharts, Lucide React

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.x
- Node.js & npm

### 1. Backend Setup (Django)

```bash
cd backend
# Create virtual environment (optional but recommended)
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run Migrations
python manage.py migrate

# Create Admin User (Optional, if starting fresh)
python manage.py createsuperuser

# Start Server
python manage.py runserver
```

The Backend API will run at `http://localhost:8000`.

### 2. Frontend Setup (React)

```bash
cd frontend
# Install dependencies
npm install

# Start Development Server
npm run dev
```

The Frontend App will run at `http://localhost:5174` (or similar port).

## 🔑 Default Credentials

If using the pre-configured database:
- **Username**: `admin`
- **Password**: `adminpassword`

## 📸 Screenshots

*(Add screenshots here)*
