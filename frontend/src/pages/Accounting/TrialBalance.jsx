import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Scale, Info, CheckCircle2, AlertTriangle, Landmark, TrendingUp } from 'lucide-react';

const TrialBalance = () => {
    const [ledgers, setLedgers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const vResponse = await api.get('vouchers/');
            const lResponse = await api.get('ledgers/');

            const ledgerMap = {};
            lResponse.data.forEach(l => {
                ledgerMap[l.id] = { ...l, balance: 0 };
            });

            vResponse.data.forEach(v => {
                v.entries.forEach(e => {
                    if (ledgerMap[e.ledger]) {
                        ledgerMap[e.ledger].balance += (parseFloat(e.debit) - parseFloat(e.credit));
                    }
                });
            });

            setLedgers(Object.values(ledgerMap).filter(l => l.balance !== 0 || l.opening_balance !== 0));
        } catch (error) {
            console.error("Error fetching trial balance:", error);
        } finally {
            setLoading(false);
        }
    };

    const totalDebit = ledgers.filter(l => l.balance > 0).reduce((sum, l) => sum + l.balance, 0);
    const totalCredit = ledgers.filter(l => l.balance < 0).reduce((sum, l) => sum + Math.abs(l.balance), 0);
    const difference = Math.abs(totalDebit - totalCredit);
    const isTally = difference < 0.01;

    if (loading) return <div className="flex items-center justify-center h-64 text-teal-600 font-montserrat uppercase tracking-widest text-xs font-black">Calculating Ledger Balances...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-nunito pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#004d40] font-montserrat tracking-tight flex items-center gap-3">
                        <Scale className="text-[#00a651]" size={28} />
                        Balance Sheet Check (Trial)
                    </h1>
                    <p className="text-gray-500 text-sm">Summary of all ledger balances to verify arithmetic accuracy</p>
                </div>

                <div className={`px-6 py-2 rounded-2xl flex items-center gap-3 border shadow-sm ${isTally ? 'bg-green-50 border-green-100 text-[#00a651]' : 'bg-red-50 border-red-100 text-red-600'}`}>
                    {isTally ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest">System Integrity</span>
                        <span className="text-xs font-bold leading-none">{isTally ? 'Balances Tally' : `Difference Rs. ${difference.toFixed(2)}`}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#004d40] text-white">
                                <th className="px-8 py-5 font-bold text-xs uppercase tracking-wider">Account Particulars</th>
                                <th className="px-8 py-5 font-bold text-xs uppercase tracking-wider text-right">Debit Balance (Dr)</th>
                                <th className="px-8 py-5 font-bold text-xs uppercase tracking-wider text-right">Credit Balance (Cr)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {ledgers.length === 0 ? (
                                <tr><td colSpan="3" className="px-8 py-20 text-center text-gray-400 font-black uppercase tracking-widest">No active ledgers to report</td></tr>
                            ) : (
                                <>
                                    {ledgers.map(ledger => (
                                        <tr key={ledger.id} className="hover:bg-green-50/20 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-gray-50 rounded-lg text-gray-300 group-hover:text-[#00a651] transition-colors">
                                                        <Landmark size={18} />
                                                    </div>
                                                    <div>
                                                        <div className="font-extrabold text-[#004d40] text-base">{ledger.name}</div>
                                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{ledger.group_name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                {ledger.balance > 0 ? (
                                                    <span className="font-black text-gray-700">
                                                        {ledger.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </span>
                                                ) : <span className="opacity-10">--</span>}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                {ledger.balance < 0 ? (
                                                    <span className="font-black text-[#00a651]">
                                                        {Math.abs(ledger.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </span>
                                                ) : <span className="opacity-10">--</span>}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-[#004d40] text-white font-montserrat">
                                        <td className="px-8 py-6 font-black text-sm uppercase tracking-widest">Statement Grand Total</td>
                                        <td className="px-8 py-6 text-right font-black text-lg">
                                            <span className="text-[10px] opacity-40 mr-2">Rs.</span>
                                            {totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-8 py-6 text-right font-black text-lg">
                                            <span className="text-[10px] opacity-40 mr-2">Rs.</span>
                                            {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {!isTally && (
                <div className="p-8 bg-red-50 rounded-[2rem] border-2 border-dashed border-red-100 flex items-center gap-6 animate-pulse">
                    <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-900/20">
                        <AlertTriangle size={32} />
                    </div>
                    <div>
                        <h4 className="text-red-700 font-black font-montserrat uppercase text-sm tracking-tight">Imbalance Detected</h4>
                        <p className="text-red-600/70 text-sm font-bold mt-1 max-w-2xl">
                            The Trial Balance does not equate. Audit your manual journal entries or check for missing ledger transactions.
                            Current Discrepancy: <span className="underline decoration-wavy underline-offset-4">Rs. {difference.toFixed(2)}</span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrialBalance;
