import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BookText, Search, Calendar, FileText, ChevronRight, Hash } from 'lucide-react';

const DayBook = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVouchers();
    }, []);

    const fetchVouchers = async () => {
        try {
            const response = await api.get('vouchers/');
            setVouchers(response.data);
        } catch (error) {
            console.error("Error fetching vouchers:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-64 text-teal-600 font-montserrat uppercase tracking-widest text-xs font-black">Scanning Daily Ledger...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-nunito pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#004d40] font-montserrat tracking-tight flex items-center gap-3">
                        <BookText className="text-[#00a651]" size={28} />
                        Daily Transaction Book
                    </h1>
                    <p className="text-gray-500 text-sm">Chronological record of all validated journal entries and vouchers</p>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#004d40] text-white">
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Date / Time</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Type / No.</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Particulars (Ledger)</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Debit Balance</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Credit Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {vouchers.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-20 text-center text-gray-400 font-black uppercase text-xs tracking-widest opacity-50">Zero transactions recorded today</td></tr>
                            ) : vouchers.map((voucher) => (
                                <React.Fragment key={voucher.id}>
                                    {voucher.entries.map((entry, idx) => (
                                        <tr key={`${voucher.id}-${idx}`} className="hover:bg-green-50/20 transition-colors">
                                            <td className="px-6 py-4 text-xs font-bold text-gray-400">
                                                {idx === 0 ? (
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={12} className="text-[#00a651]" />
                                                        {new Date(voucher.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                ) : ''}
                                            </td>
                                            <td className="px-6 py-4">
                                                {idx === 0 ? (
                                                    <div className="flex flex-col">
                                                        <span className="bg-green-100 text-[#004d40] px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter w-fit">
                                                            {voucher.voucher_type}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-gray-400 mt-1 flex items-center gap-0.5">
                                                            <Hash size={10} /> {voucher.number}
                                                        </span>
                                                    </div>
                                                ) : ''}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-extrabold text-[#004d40] text-sm">{entry.ledger_name}</span>
                                                    {idx === 0 && (
                                                        <span className="text-[9px] text-gray-400 font-medium line-clamp-1 italic mt-0.5">
                                                            {voucher.narration}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {entry.debit > 0 ? (
                                                    <span className="font-black text-gray-700 text-sm">
                                                        {parseFloat(entry.debit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </span>
                                                ) : <span className="text-gray-200">--</span>}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {entry.credit > 0 ? (
                                                    <span className="font-black text-[#00a651] text-sm">
                                                        {parseFloat(entry.credit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </span>
                                                ) : <span className="text-gray-200">--</span>}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-50/30">
                                        <td colSpan="5" className="h-2"></td>
                                    </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DayBook;
