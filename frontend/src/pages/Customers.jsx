import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState({ name: '', email: '', phone: '', address: '' });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => { fetchCustomers(); }, []);

    const fetchCustomers = async () => {
        try {
            const res = await api.get('customers/');
            setCustomers(res.data);
        } catch (error) { console.error("Failed to fetch customers"); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure?")) {
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
        } catch (error) { alert("Error saving customer"); }
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Customers (Debtors)</h2>
                <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2">
                    <Plus size={18} /> Add Customer
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
                        {customers.map(cust => (
                            <tr key={cust.id} className="hover:bg-gray-750">
                                <td className="p-4 font-medium">{cust.name}</td>
                                <td className="p-4 text-gray-400">
                                    <div>{cust.email}</div>
                                    <div className="text-xs">{cust.phone}</div>
                                </td>
                                <td className="p-4 text-gray-400">{cust.address}</td>
                                <td className="p-4 flex gap-3">
                                    <button onClick={() => openModal(cust)} className="text-blue-400 hover:text-blue-300"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(cust.id)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
                        <h3 className="text-2xl font-bold mb-4">{isEditing ? 'Edit Customer' : 'Add Customer'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input className="w-full p-2 rounded bg-gray-700 border border-gray-600" placeholder="Customer Name" value={currentCustomer.name} onChange={e => setCurrentCustomer({ ...currentCustomer, name: e.target.value })} required />
                            <input className="w-full p-2 rounded bg-gray-700 border border-gray-600" placeholder="Email" type="email" value={currentCustomer.email} onChange={e => setCurrentCustomer({ ...currentCustomer, email: e.target.value })} />
                            <input className="w-full p-2 rounded bg-gray-700 border border-gray-600" placeholder="Phone" value={currentCustomer.phone} onChange={e => setCurrentCustomer({ ...currentCustomer, phone: e.target.value })} />
                            <textarea className="w-full p-2 rounded bg-gray-700 border border-gray-600" placeholder="Address" value={currentCustomer.address} onChange={e => setCurrentCustomer({ ...currentCustomer, address: e.target.value })} rows={2} />

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

export default Customers;
