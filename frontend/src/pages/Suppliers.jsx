import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSupplier, setCurrentSupplier] = useState({ name: '', email: '', phone: '', address: '' });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => { fetchSuppliers(); }, []);

    const fetchSuppliers = async () => {
        try {
            const res = await api.get('suppliers/');
            setSuppliers(res.data);
        } catch (error) { console.error("Failed to fetch suppliers"); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure?")) {
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
        } catch (error) { alert("Error saving supplier"); }
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Suppliers</h2>
                <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2">
                    <Plus size={18} /> Add Supplier
                </button>
            </div>

            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 block">
                <table className="w-full text-left">
                    <thead className="bg-gray-700 text-gray-300">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Contact</th>
                            <th className="p-4">Address</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {suppliers.map(sup => (
                            <tr key={sup.id} className="hover:bg-gray-750">
                                <td className="p-4 font-medium">{sup.name}</td>
                                <td className="p-4 text-gray-400">
                                    <div>{sup.email}</div>
                                    <div className="text-xs">{sup.phone}</div>
                                </td>
                                <td className="p-4 text-gray-400">{sup.address}</td>
                                <td className="p-4 flex gap-3">
                                    <button onClick={() => openModal(sup)} className="text-blue-400 hover:text-blue-300"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(sup.id)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
                        <h3 className="text-2xl font-bold mb-4">{isEditing ? 'Edit Supplier' : 'Add Supplier'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input className="w-full p-2 rounded bg-gray-700 border border-gray-600" placeholder="Supplier Name" value={currentSupplier.name} onChange={e => setCurrentSupplier({ ...currentSupplier, name: e.target.value })} required />
                            <input className="w-full p-2 rounded bg-gray-700 border border-gray-600" placeholder="Email" type="email" value={currentSupplier.email} onChange={e => setCurrentSupplier({ ...currentSupplier, email: e.target.value })} />
                            <input className="w-full p-2 rounded bg-gray-700 border border-gray-600" placeholder="Phone" value={currentSupplier.phone} onChange={e => setCurrentSupplier({ ...currentSupplier, phone: e.target.value })} />
                            <textarea className="w-full p-2 rounded bg-gray-700 border border-gray-600" placeholder="Address" value={currentSupplier.address} onChange={e => setCurrentSupplier({ ...currentSupplier, address: e.target.value })} rows={2} />

                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500">Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Suppliers;
