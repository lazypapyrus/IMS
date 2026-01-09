import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Edit, Trash2, Users, Mail, Phone, MapPin, Search, Star } from 'lucide-react';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState({ name: '', email: '', phone: '', address: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { fetchCustomers(); }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await api.get('customers/');
            setCustomers(res.data);
        } catch (error) { console.error("Failed to fetch customers"); }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure? This will remove the customer profile.")) {
            await api.delete(`customers/${id}/`);
            fetchCustomers();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`customers/${currentCustomer.id}/`, currentCustomer);
            } else {
                await api.post('customers/', currentCustomer);
            }
            setIsModalOpen(false);
            fetchCustomers();
        } catch (error) {
            const msg = error.response?.data ? JSON.stringify(error.response.data) : "Error saving customer";
            alert(msg);
        }
    };

    const openModal = (customer = null) => {
        if (customer) {
            setIsEditing(true);
            setCurrentCustomer(customer);
        } else {
            setIsEditing(false);
            setCurrentCustomer({ name: '', email: '', phone: '', address: '' });
        }
        setIsModalOpen(true);
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone && c.phone.includes(searchTerm))
    );

    if (loading) return <div className="flex items-center justify-center h-64 text-teal-600 font-montserrat">Loading Customers...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-nunito pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#004d40] font-montserrat tracking-tight flex items-center gap-3">
                        <Users className="text-[#00a651]" size={28} />
                        Customers
                    </h1>
                    <p className="text-gray-500 text-sm">Manage your client relationships and contact data</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-[#00a651] hover:bg-[#008148] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-md active:scale-95"
                >
                    <Plus size={20} /> New Customer
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/30">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Find a customer by name or phone..."
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
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Customer Profile</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Contact Detail</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Billing Address</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredCustomers.map(cust => (
                                <tr key={cust.id} className="hover:bg-green-50/30 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-[#00a651] group-hover:bg-white transition-all font-bold">
                                                {cust.name.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-extrabold text-[#004d40] text-base leading-none mb-1">{cust.name}</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[#00a651] flex items-center gap-1">
                                                    <Star size={8} fill="currentColor" /> Active Client
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                                <Phone size={14} className="text-gray-400" />
                                                {cust.phone || <span className="text-gray-300">--</span>}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <Mail size={12} className="text-gray-400" />
                                                {cust.email || <span className="text-gray-200 italic">No email</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-start gap-2 text-sm text-gray-500 max-w-xs">
                                            <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                            <span className="line-clamp-2">{cust.address || <span className="text-gray-300">N/A</span>}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openModal(cust)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cust.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredCustomers.length === 0 && (
                        <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs opacity-50">
                            No customers found
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-[#004d40] p-6 text-white flex justify-between items-center">
                            <h3 className="text-lg font-black font-montserrat uppercase tracking-tight">
                                {isEditing ? 'Modify Customer' : 'Register Customer'}
                            </h3>
                            <Users size={24} className="opacity-30" />
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Full Name / Account Title</label>
                                <input
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm font-bold transition-all"
                                    placeholder="Enter customer name"
                                    value={currentCustomer.name}
                                    onChange={e => setCurrentCustomer({ ...currentCustomer, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Contact Phone</label>
                                    <input
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm transition-all"
                                        placeholder="Phone number"
                                        value={currentCustomer.phone}
                                        onChange={e => setCurrentCustomer({ ...currentCustomer, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Email (Optional)</label>
                                    <input
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm transition-all"
                                        placeholder="email@address.com"
                                        type="email"
                                        value={currentCustomer.email}
                                        onChange={e => setCurrentCustomer({ ...currentCustomer, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Primary Address</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm min-h-[80px] transition-all"
                                    placeholder="Billing / Delivery address..."
                                    value={currentCustomer.address}
                                    onChange={e => setCurrentCustomer({ ...currentCustomer, address: e.target.value })}
                                    rows={2}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-700">Discard</button>
                                <button type="submit" className="px-8 py-2.5 rounded-xl bg-[#00a651] hover:bg-[#008148] text-white font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-green-900/10">
                                    {isEditing ? 'Update Client' : 'Register Client'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
