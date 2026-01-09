import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Landmark, Plus, Search, Filter, History, ChevronRight } from 'lucide-react';

const Ledgers = () => {
    const [ledgers, setLedgers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newLedger, setNewLedger] = useState({ name: '', group: '', opening_balance: 0 });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [lRes, gRes] = await Promise.all([
                api.get('ledgers/'),
                api.get('account-groups/')
            ]);
            setLedgers(lRes.data);
            setGroups(gRes.data);
        } catch (error) {
            console.error("Error fetching ledger data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('ledgers/', newLedger);
            setShowModal(false);
            setNewLedger({ name: '', group: '', opening_balance: 0 });
            fetchData();
        } catch (error) {
            alert("Error creating ledger: " + JSON.stringify(error.response?.data));
        }
    };

    const filteredLedgers = ledgers.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.group_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex items-center justify-center h-64 text-teal-600 font-montserrat uppercase tracking-widest text-xs font-black">Syncing Chart of Accounts...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-nunito pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#004d40] font-montserrat tracking-tight flex items-center gap-3">
                        <Landmark className="text-[#00a651]" size={28} />
                        Chart of Ledgers
                    </h1>
                    <p className="text-gray-500 text-sm">Manage your financial accounts and opening balances</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-[#00a651] hover:bg-[#008148] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-md active:scale-95"
                >
                    <Plus size={20} /> Create New Ledger
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/30">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Find ledger or group..."
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
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Account Title / Ledger</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Financial Group</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Opening Balance</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Establishment</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredLedgers.map(ledger => (
                                <tr key={ledger.id} className="hover:bg-green-50/30 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-8 bg-[#00a651] rounded-full opacity-20 group-hover:opacity-100 transition-opacity"></div>
                                            <span className="font-extrabold text-[#004d40] text-base">{ledger.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-200">
                                            {ledger.group_name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right font-black text-gray-700">
                                        <span className="text-xs text-gray-400 mr-1">Rs.</span>
                                        {parseFloat(ledger.opening_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-xs text-gray-400 font-bold">
                                            <History size={14} className="text-gray-300" />
                                            {new Date(ledger.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredLedgers.length === 0 && (
                        <div className="p-20 text-center flex flex-col items-center gap-4 text-gray-300">
                            <Landmark size={48} className="opacity-10" />
                            <p className="font-black uppercase tracking-widest text-xs">No ledger accounts found</p>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white">
                        <div className="bg-[#004d40] p-8 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-black font-montserrat uppercase tracking-tight">Create Ledger</h3>
                                <p className="text-green-400 text-[10px] font-black uppercase tracking-widest opacity-80">General Ledger Entry</p>
                            </div>
                            <Landmark size={32} className="opacity-20" />
                        </div>
                        <form onSubmit={handleCreate} className="p-10 space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Account Title</label>
                                <input
                                    className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl outline-none font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] transition-all"
                                    placeholder="e.g. NIBL Bank Account"
                                    value={newLedger.name}
                                    onChange={e => setNewLedger({ ...newLedger, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Account Classification</label>
                                <select
                                    className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl outline-none font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] transition-all appearance-none"
                                    value={newLedger.group}
                                    onChange={e => setNewLedger({ ...newLedger, group: e.target.value })}
                                    required
                                >
                                    <option value="">Select Group...</option>
                                    {groups.map(g => (
                                        <option key={g.id} value={g.id}>{g.name} [{g.nature}]</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Opening Balance (Equity/Liability/Asset)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl outline-none font-black text-sm focus:bg-white focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] transition-all"
                                    value={newLedger.opening_balance}
                                    onChange={e => setNewLedger({ ...newLedger, opening_balance: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-xs font-black uppercase text-gray-400 hover:text-gray-600">Cancel</button>
                                <button type="submit" className="flex-[2] py-4 bg-[#00a651] hover:bg-[#008148] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-green-900/20 active:scale-95">Set Up Ledger</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Ledgers;
