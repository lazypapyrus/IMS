import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Eye, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InvoiceList = () => {
    const [invoices, setInvoices] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const res = await api.get('invoices/');
            setInvoices(res.data);
        } catch (error) {
            console.error("Failed to fetch invoices");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Invoices (Transactions)</h2>
                <button onClick={() => navigate('/invoices/create')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2">
                    <Plus size={18} /> New Invoice
                </button>
            </div>

            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 block">
                <table className="w-full text-left">
                    <thead className="bg-gray-700 text-gray-300">
                        <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Party</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Net</th>
                            <th className="p-4">Tax (13%)</th>
                            <th className="p-4">Total</th>
                            <th className="p-4">Created By</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {invoices.map(inv => (
                            <tr key={inv.id} className="hover:bg-gray-750">
                                <td className="p-4 font-mono text-sm text-gray-500">#{inv.id}</td>
                                <td className="p-4">
                                    <span className={`flex items-center gap-2 px-2 py-1 rounded text-xs font-bold w-fit ${inv.invoice_type === 'PURCHASE' ? 'bg-orange-900 text-orange-200' : 'bg-green-900 text-green-200'}`}>
                                        {inv.invoice_type === 'PURCHASE' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                                        {inv.invoice_type}
                                    </span>
                                </td>
                                <td className="p-4 font-medium">
                                    {inv.invoice_type === 'PURCHASE' ? inv.supplier_name : inv.customer_name}
                                </td>
                                <td className="p-4 text-gray-400">
                                    {new Date(inv.transaction_date).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-gray-400">${inv.net_amount}</td>
                                <td className="p-4 text-gray-400">${inv.tax_amount}</td>
                                <td className="p-4 font-bold text-white">${inv.total_amount}</td>
                                <td className="p-4 text-sm text-gray-500">{inv.user_username}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {invoices.length === 0 && <div className="p-8 text-center text-gray-500">No transactions found.</div>}
            </div>
        </div>
    );
};

export default InvoiceList;
