import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Edit, Trash2, Truck, Mail, Phone, MapPin, UserCheck, Search, Filter } from 'lucide-react';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSupplier, setCurrentSupplier] = useState({ name: '', email: '', phone: '', address: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { fetchSuppliers(); }, []);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const res = await api.get('suppliers/');
            setSuppliers(res.data);
        } catch (error) { console.error("Failed to fetch suppliers"); }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure? This will remove the supplier record.")) {
            await api.delete(`suppliers/${id}/`);
            fetchSuppliers();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`suppliers/${currentSupplier.id}/`, currentSupplier);
            } else {
                await api.post('suppliers/', currentSupplier);
            }
            setIsModalOpen(false);
            fetchSuppliers();
        } catch (error) {
            const msg = error.response?.data ? JSON.stringify(error.response.data) : "Error saving supplier";
            alert(msg);
        }
    };

    const openModal = (supplier = null) => {
        if (supplier) {
            setIsEditing(true);
            setCurrentSupplier(supplier);
        } else {
            setIsEditing(false);
            setCurrentSupplier({ name: '', email: '', phone: '', address: '' });
        }
        setIsModalOpen(true);
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="flex items-center justify-center h-64 text-teal-600 font-montserrat">Loading Suppliers...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-nunito pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#004d40] font-montserrat tracking-tight flex items-center gap-3">
                        <Truck className="text-[#00a651]" size={28} />
                        Suppliers
                    </h1>
                    <p className="text-gray-500 text-sm">Manage your supply chain and partner contacts</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-[#00a651] hover:bg-[#008148] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-md active:scale-95"
                >
                    <Plus size={20} /> Add Supplier
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/30">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Find a supplier..."
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
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Supplier Name</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Contact Information</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Mailing Address</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredSuppliers.map(sup => (
                                <tr key={sup.id} className="hover:bg-green-50/30 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:text-[#00a651] group-hover:bg-white transition-all font-bold">
                                                {sup.name.charAt(0)}
                                            </div>
                                            <span className="font-extrabold text-[#004d40] text-base">{sup.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Mail size={14} className="text-gray-400" />
                                                {sup.email || <span className="text-gray-300">No Email</span>}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone size={14} className="text-gray-400" />
                                                {sup.phone || <span className="text-gray-300">No Phone</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-start gap-2 text-sm text-gray-500 max-w-xs">
                                            <MapPin size={14} className="text-gray-400 mt-1 flex-shrink-0" />
                                            <span className="line-clamp-2">{sup.address || <span className="text-gray-300 italic">No address on file</span>}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openModal(sup)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(sup.id)}
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
                    {filteredSuppliers.length === 0 && (
                        <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs opacity-50">
                            No suppliers found
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-[#004d40] p-6 text-white flex justify-between items-center">
                            <h3 className="text-lg font-black font-montserrat uppercase tracking-tight">
                                {isEditing ? 'Update Supplier Profile' : 'New Supplier Profile'}
                            </h3>
                            <Truck size={24} className="opacity-30" />
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Company / Individual Name</label>
                                <input
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm font-bold transition-all"
                                    placeholder="Enter supplier name"
                                    value={currentSupplier.name}
                                    onChange={e => setCurrentSupplier({ ...currentSupplier, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Email Address</label>
                                    <input
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm transition-all"
                                        placeholder="email@example.com"
                                        type="email"
                                        value={currentSupplier.email}
                                        onChange={e => setCurrentSupplier({ ...currentSupplier, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Primary Phone</label>
                                    <input
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm transition-all"
                                        placeholder="+977-..."
                                        value={currentSupplier.phone}
                                        onChange={e => setCurrentSupplier({ ...currentSupplier, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Business Address</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm min-h-[80px] transition-all"
                                    placeholder="Street, City, District..."
                                    value={currentSupplier.address}
                                    onChange={e => setCurrentSupplier({ ...currentSupplier, address: e.target.value })}
                                    rows={2}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-700">Cancel</button>
                                <button type="submit" className="px-8 py-2.5 rounded-xl bg-[#00a651] hover:bg-[#008148] text-white font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-green-900/10">
                                    {isEditing ? 'Save Changes' : 'Register Supplier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Suppliers;
