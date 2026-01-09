import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
    FileText, ShoppingCart, Plus, Users, Tags, Truck,
    BookOpen, Scale, Landmark, FileStack, ClipboardList,
    CreditCard, PieChart, Quote, HelpCircle, ArrowUpRight, TrendingUp,
    Calendar, ChevronDown, Package, LayoutGrid, Clock, Target
} from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        today: { sales: 0, purchase: 0, receipt: 0, payment: 0 },
        bankBalances: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await api.get('dashboard-summary/');
                setStats(res.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const navigate = useNavigate();

    const QuickLink = ({ icon: Icon, title, subtitle, path, color = "text-[#00a651]" }) => (
        <div
            onClick={() => navigate(path)}
            className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-green-900/5 transition-all cursor-pointer flex items-center gap-4 group hover:border-green-200 active:scale-95"
        >
            <div className={`p-3.5 rounded-2xl bg-gray-50 group-hover:bg-green-50 transition-colors ${color}`}>
                <Icon size={22} />
            </div>
            <div>
                <div className="text-sm font-black text-[#004d40] font-montserrat uppercase tracking-tight leading-tight">{title}</div>
                <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1 opacity-60">{subtitle}</div>
            </div>
        </div>
    );

    const MetricCard = ({ title, value, growth, yesterday, icon: Icon, gradient }) => (
        <div className={`bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col gap-6 relative overflow-hidden group hover:shadow-lg transition-all`}>
            <div className="flex justify-between items-start z-10">
                <div className="p-3 bg-gray-50 rounded-2xl text-[#00a651] group-hover:bg-green-50 transition-colors">
                    <Icon size={24} />
                </div>
                <div className="flex items-center text-[10px] font-black text-green-600 px-2 py-1 rounded-full bg-green-50 border border-green-100">
                    <TrendingUp size={12} className="mr-1" />
                    +{growth}%
                </div>
            </div>
            <div className="z-10">
                <h3 className="text-[10px] font-black text-gray-400 font-montserrat uppercase tracking-[0.2em] mb-1">{title}</h3>
                <div className="text-3xl font-black tracking-tighter text-[#004d40] font-montserrat">
                    <span className="text-xs font-bold mr-1 opacity-40 uppercase">Rs.</span>
                    {value.toLocaleString()}
                </div>
            </div>
            <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-2 pt-4 border-t border-gray-50">
                <Clock size={12} /> Previous Entry: <span className="text-[#00a651]">{yesterday}</span>
            </div>
        </div>
    );

    if (loading) return <div className="flex items-center justify-center h-screen text-teal-600 font-montserrat uppercase font-black tracking-widest text-xs">Awaiting Datastream...</div>;

    return (
        <div className="w-full space-y-12 pb-20 font-nunito animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Greeting */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#004d40] font-montserrat tracking-tight leading-none">Operational Console</h1>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
                        <Target size={14} className="text-[#00a651]" /> Centralized Business Intelligence
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Server Status</div>
                        <div className="text-xs font-bold text-[#00a651] flex items-center justify-end gap-1.5">
                            <span className="w-1.5 h-1.5 bg-[#00a651] rounded-full animate-pulse"></span> Synchronized
                        </div>
                    </div>
                </div>
            </header>

            {/* Metrics */}
            <section>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard title="Gross Sales" value={stats.today.sales} growth={0} yesterday="0" icon={ShoppingCart} />
                    <MetricCard title="Procurements" value={stats.today.purchase} growth={0} yesterday="0" icon={Truck} />
                    <MetricCard title="Total Receipts" value={stats.today.receipt} growth={0} yesterday="0" icon={Landmark} />
                    <MetricCard title="Disbursements" value={stats.today.payment} growth={0} yesterday="0" icon={CreditCard} />
                </div>
            </section>

            {/* Quick Links */}
            <section>
                <div className="flex items-center gap-3 mb-6 text-[#004d40]">
                    <LayoutGrid size={20} className="opacity-40" />
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] font-montserrat">Direct Modules</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    <QuickLink icon={Plus} title="Issue Invoice" subtitle="Sales Force" path="/invoices/create" color="text-[#00a651]" />
                    <QuickLink icon={Quote} title="New Quote" subtitle="Pre-Sales" path="/quotations/create" color="text-teal-600" />
                    <QuickLink icon={Package} title="Inventory" subtitle="Warehousing" path="/products" color="text-emerald-700" />
                    <QuickLink icon={Users} title="CRM" subtitle="Client Relations" path="/customers" color="text-[#004d40]" />
                    <QuickLink icon={ClipboardList} title="Daily Book" subtitle="Journals" path="/day-book" color="text-[#00a651]" />
                    <QuickLink icon={Scale} title="Trial Balance" subtitle="Ledger Audit" path="/trial-balance" color="text-teal-900" />
                    <QuickLink icon={Landmark} title="Ledger Index" subtitle="Chart of Accounts" path="/ledgers" color="text-[#00a651]" />
                    <QuickLink icon={FileStack} title="Quotation Lab" subtitle="Document Archive" path="/quotations" color="text-emerald-900" />
                    <QuickLink icon={PieChart} title="BI Reports" subtitle="Analytics" path="/reports" color="text-teal-800" />
                    <QuickLink icon={HelpCircle} title="Support" subtitle="Helpdesk" path="/support" color="text-[#004d40]" />
                </div>
            </section>

            {/* Liquidity and Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 bg-[#004d40] text-white flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-black font-montserrat uppercase tracking-tight">Liquidity Overview</h3>
                            <p className="text-green-400 text-[10px] font-black uppercase tracking-widest mt-1 opacity-70">Bank & Cash Accounts</p>
                        </div>
                        <Landmark size={24} className="opacity-30" />
                    </div>
                    <div className="divide-y divide-gray-50">
                        {stats.bankBalances.length === 0 ? (
                            <div className="p-12 text-center text-gray-300 font-black uppercase tracking-widest text-[10px]">No linked accounts detected</div>
                        ) : stats.bankBalances.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-50 group-hover:bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-[#00a651] transition-all">
                                        <Landmark size={20} />
                                    </div>
                                    <span className="font-extrabold text-[#004d40]">{item.name}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Available Credit</div>
                                    <div className="text-base font-black text-gray-700 mt-0.5">
                                        <span className="text-[10px] opacity-40 mr-1">Rs.</span>
                                        <span className={item.balance < 0 ? 'text-red-500' : ''}>{item.balance.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-8 bg-gray-50/50 flex justify-between items-center border-t border-gray-100">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Aggregate Net Liquidity</span>
                        <span className="text-2xl font-black text-[#00a651] font-montserrat">
                            <span className="text-xs opacity-50 mr-1">Rs.</span>
                            {stats.bankBalances.reduce((acc, curr) => acc + curr.balance, 0).toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Secondary Info Area */}
                <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center group border-dashed border-2 hover:border-[#00a651]/20 transition-all">
                    <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300 group-hover:scale-110 transition-transform duration-500">
                        <TrendingUp size={40} />
                    </div>
                    <h3 className="mt-8 text-sm font-black text-[#004d40] uppercase tracking-[0.2em]">Forecasting Engine</h3>
                    <p className="mt-2 text-xs font-bold text-gray-400 max-w-xs mx-auto">
                        Historical data is being processed to generate future profitability trends and automated inventory insights.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
