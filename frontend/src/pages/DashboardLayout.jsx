import React, { useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    LayoutDashboard, Package, Truck, LogOut, Tags, Users,
    FileText, Shield, BookOpen, Scale, Landmark,
    Plus, Search, Headset, Calendar, Bell, ChevronDown,
    History, Briefcase, Workflow, Settings, Activity, FileStack, Quote, HardDrive
} from 'lucide-react';
import logo from '../assets/logo.png';

const DashboardLayout = () => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Home', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'WorkDrive', path: '/workdrive', icon: <HardDrive size={20} /> },
        { name: 'Quotations', path: '/quotations', icon: <Quote size={20} /> },
        { name: 'Sales', path: '/invoices', icon: <FileStack size={20} /> },
        { name: 'Purchase', path: '/suppliers', icon: <Truck size={20} /> },
        { name: 'Accounting', path: '/accounting', icon: <Activity size={20} /> },
        { name: 'Inventory', path: '/products', icon: <Package size={20} /> },
        { name: 'Reports', path: '/reports', icon: <BookOpen size={20} /> },
        { name: 'Configurations', path: '/settings', icon: <Settings size={20} /> },
    ];

    const getActiveIcon = (path) => {
        if (location.pathname === path) return true;
        if (path === '/invoices' && location.pathname.startsWith('/invoices')) return true;
        return false;
    };

    if (user?.role === 'ADMIN') {
        navItems.push({ name: 'Admin Panel', path: '/admin-panel', icon: <Shield size={20} /> });
    }

    return (
        <div className="flex h-screen bg-[#f1f5f9] text-gray-800 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-[#004d40] text-white flex flex-col shadow-xl z-20 font-montserrat print:hidden">
                {/* Logo Section - Clean implementation using official asset */}
                <div className="py-10 flex items-center justify-center border-b border-white/5 bg-transparent shrink-0 px-6">
                    <img
                        src={logo}
                        alt="Novo Era Official Logo"
                        className="h-24 w-auto object-contain block select-none pointer-events-none"
                    />
                </div>

                <div className="px-4 py-3">
                    <button
                        onClick={() => navigate('/quotations/create')}
                        className="w-full bg-[#00a651] hover:bg-[#008148] text-white py-2.5 rounded-lg flex items-center justify-center gap-2 font-bold transition-all shadow-md uppercase text-xs tracking-wider"
                    >
                        <Plus size={18} /> New Quotation
                    </button>
                </div>

                <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => (
                        <div key={item.path}>
                            <Link
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${getActiveIcon(item.path)
                                    ? 'bg-white/10 text-white border-l-4 border-green-400'
                                    : 'text-teal-100 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <span className={getActiveIcon(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-white'}>
                                    {item.icon}
                                </span>
                                <span className="font-medium text-sm flex-1">{item.name}</span>
                            </Link>
                        </div>
                    ))}
                </nav>

                <div className="p-4 bg-[#003d33] border-t border-white/5 font-nunito">
                    <div className="flex items-center gap-3 px-2 mb-2">
                        <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white shadow-inner">
                            {user?.username ? user.username[0].toUpperCase() : 'A'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="text-sm font-semibold truncate leading-tight">{user?.username || 'Admin'}</div>
                            <div className="text-[11px] text-blue-400 hover:underline cursor-pointer">Change Company</div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full mt-2 text-xs text-gray-500 hover:text-red-400 transition-colors py-1 flex items-center justify-center gap-1"
                    >
                        <LogOut size={14} /> Logout
                    </button>
                </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Navbar */}
                <header className="h-16 bg-[#004d40] border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-10 text-white font-montserrat print:hidden">
                    <div className="flex-1 max-w-xl">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search for operations, documents, or reports..."
                                className="w-full bg-white/10 border border-white/20 focus:border-green-400 focus:bg-white/20 rounded-lg py-2 pl-10 pr-4 text-sm transition-all outline-none text-white placeholder-white/50"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 cursor-pointer hover:text-blue-400 transition-colors">
                            <Headset size={20} />
                            <span className="text-sm font-medium">Support</span>
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        </div>

                        <div className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors border border-white/10">
                            <Calendar size={18} className="text-teal-200" />
                            <span className="text-xs font-bold uppercase tracking-wider">Fiscal Year 2025/26</span>
                            <ChevronDown size={14} className="text-teal-300" />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto bg-[#f8fafc] font-nunito">
                    <div className="p-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
