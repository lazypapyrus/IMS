import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Plus, FileText, Printer, Search, ArrowRight, Calendar, Filter, Edit2, Trash2 } from 'lucide-react';

const QuotationList = () => {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuotations();
    }, []);

    const fetchQuotations = async () => {
        try {
            const res = await api.get('quotations/');
            setQuotations(res.data);
        } catch (error) {
            console.error("Error fetching quotations");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this quotation? This action cannot be undone.")) {
            try {
                await api.delete(`quotations/${id}/`);
                setQuotations(quotations.filter(q => q.id !== id));
            } catch (error) {
                console.error("Error deleting quotation");
                alert("Failed to delete quotation. It might be linked to other records.");
            }
        }
    };

    if (loading) return <div className="flex items-center justify-center h-64 text-teal-600 font-montserrat">Loading Quotations...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-nunito">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#004d40] font-montserrat tracking-tight">Quotations</h1>
                    <p className="text-gray-500 text-sm">Manage and track your customer quotations</p>
                </div>
                <Link
                    to="/quotations/create"
                    className="bg-[#00a651] hover:bg-[#008148] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-md active:scale-95"
                >
                    <Plus size={20} /> New Quotation
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/30">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by customer or ref no..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-gray-100 bg-white shadow-xs">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#004d40] text-white">
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Ref No</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {quotations.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400 italic">
                                        No quotations found. Start by creating a new one.
                                    </td>
                                </tr>
                            ) : (
                                quotations.map((q) => (
                                    <tr key={q.id} className="hover:bg-green-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-[#004d40]">#{q.ref_no || q.id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-700">{q.customer_name}</div>
                                            <div className="text-[10px] text-gray-400 uppercase tracking-tighter">Prepared by: {q.prepared_by || 'Admin'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-gray-300" />
                                                {q.date}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-black text-gray-800">
                                                Rs. {parseFloat(q.total_amount).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-100 text-green-700">
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/quotations/print/${q.id}`)}
                                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                    title="Print"
                                                >
                                                    <Printer size={18} />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/quotations/edit/${q.id}`)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(q.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default QuotationList;
