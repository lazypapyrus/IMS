import React, { useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Package, Truck, LogOut, Tags, Users, FileText, Shield } from 'lucide-react';

const DashboardLayout = () => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'Invoices', path: '/invoices', icon: <FileText size={20} /> },
        { name: 'Products', path: '/products', icon: <Package size={20} /> },
        { name: 'Customers', path: '/customers', icon: <Users size={20} /> },
        { name: 'Categories', path: '/categories', icon: <Tags size={20} /> },
        { name: 'Suppliers', path: '/suppliers', icon: <Truck size={20} /> },
    ];

    if (user?.role === 'ADMIN') {
        navItems.push({ name: 'Admin Panel', path: '/admin-panel', icon: <Shield size={20} /> });
    }

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
                <div className="p-6 border-b border-gray-700">
                    <h1 className="text-2xl font-bold text-blue-500 tracking-wider">INVENTORY.</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${location.pathname === item.path
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-700">
                    <div className="flex items-center gap-3 mb-4 px-4">
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center font-bold">
                            {user?.username?.[0]?.toUpperCase()}
                        </div>
                        <div className="text-sm font-medium">{user?.username}</div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-gray-900">
                <div className="max-w-7xl mx-auto p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
