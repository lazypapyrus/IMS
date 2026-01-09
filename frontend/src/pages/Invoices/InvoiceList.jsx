import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Eye, ArrowUpRight, ArrowDownLeft, FileStack, Calendar, User, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InvoiceList = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const res = await api.get('invoices/');
            setInvoices(res.data);
        } catch (error) {
            console.error("Failed to fetch invoices");
        }
        setLoading(false);
    };

    const filteredInvoices = invoices.filter(inv => {
        const party = inv.invoice_type === 'PURCHASE' ? inv.supplier_name : inv.customer_name;
        return (party && party.toLowerCase().includes(searchTerm.toLowerCase())) ||
            inv.id.toString().includes(searchTerm);
    });

    if (loading) return <div className="flex items-center justify-center h-64 text-teal-600 font-montserrat">Accessing Transaction Records...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-nunito pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#004d40] font-montserrat tracking-tight flex items-center gap-3">
                        <FileStack className="text-[#00a651]" size={28} />
                        Sales & Purchases
                    </h1>
                    <p className="text-gray-500 text-sm">Review your business transactions and invoice history</p>
                </div>
                <button
                    onClick={() => navigate('/invoices/create')}
                    className="bg-[#00a651] hover:bg-[#008148] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-md active:scale-95"
                >
                    <Plus size={20} /> New Transaction
                </button>
            </div>

            {/* Browser Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/30">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Find by ID or Party name..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#004d40] text-white">
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Transaction Info</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Associated Party</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Financials</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Ownership</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredInvoices.map(inv => (
                                <tr key={inv.id} className="hover:bg-green-50/30 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg ${inv.invoice_type === 'PURCHASE' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-[#00a651]'}`}>
                                                {inv.invoice_type === 'PURCHASE' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                            </div>
                                            <div>
                                                <div className="font-extrabold text-[#004d40]">#{inv.id}</div>
                                                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">
                                                    <Calendar size={10} />
                                                    {new Date(inv.transaction_date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-700">
                                                {inv.invoice_type === 'PURCHASE' ? inv.supplier_name : inv.customer_name}
                                            </span>
                                            <span className={`text-[10px] font-black uppercase tracking-tighter ${inv.invoice_type === 'PURCHASE' ? 'text-orange-500' : 'text-[#00a651]'}`}>
                                                {inv.invoice_type === 'PURCHASE' ? 'PAYABLE ACCOUNT' : 'RECEIVABLE ACCOUNT'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-[#004d40]">Rs. {parseFloat(inv.total_amount).toLocaleString()}</span>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                                                <span>Net: {inv.net_amount}</span>
                                                <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                                <span>VAT: {inv.tax_amount}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                                            <User size={14} className="text-gray-300" />
                                            {inv.user_username}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button
                                            onClick={() => navigate(`/invoices/view/${inv.id}`)}
                                            className="p-2 text-gray-400 hover:text-[#00a651] hover:bg-green-50 rounded-lg transition-all"
                                            title="View Details"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredInvoices.length === 0 && (
                        <div className="p-20 text-center flex flex-col items-center gap-4 text-gray-400">
                            <FileStack size={48} className="opacity-10" />
                            <p className="font-black uppercase tracking-widest text-xs">No transactions recorded</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InvoiceList;
