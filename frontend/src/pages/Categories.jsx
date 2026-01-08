import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({ name: '', description: '' });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => { fetchCategories(); }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get('categories/');
            setCategories(res.data);
        } catch (error) { console.error("Failed to fetch categories"); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure?")) {
            await api.delete(`categories/${id}/`);
            fetchCategories();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`categories/${currentCategory.id}/`, currentCategory);
            } else {
                await api.post('categories/', currentCategory);
            }
            setIsModalOpen(false);
            fetchCategories();
        } catch (error) { alert("Error saving category"); }
    };

    const openModal = (category = null) => {
        if (category) {
            setIsEditing(true);
            setCurrentCategory(category);
        } else {
            setIsEditing(false);
            setCurrentCategory({ name: '', description: '' });
        }
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Categories</h2>
                <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2">
                    <Plus size={18} /> Add Category
                </button>
            </div>

            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 block">
                <table className="w-full text-left">
                    <thead className="bg-gray-700 text-gray-300">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Description</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {categories.map(cat => (
                            <tr key={cat.id} className="hover:bg-gray-750">
                                <td className="p-4 font-medium">{cat.name}</td>
                                <td className="p-4 text-gray-400">{cat.description}</td>
                                <td className="p-4 flex gap-3">
                                    <button onClick={() => openModal(cat)} className="text-blue-400 hover:text-blue-300"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(cat.id)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
                        <h3 className="text-2xl font-bold mb-4">{isEditing ? 'Edit Category' : 'Add Category'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input className="w-full p-2 rounded bg-gray-700 border border-gray-600" placeholder="Category Name" value={currentCategory.name} onChange={e => setCurrentCategory({ ...currentCategory, name: e.target.value })} required />
                            <textarea className="w-full p-2 rounded bg-gray-700 border border-gray-600" placeholder="Description" value={currentCategory.description} onChange={e => setCurrentCategory({ ...currentCategory, description: e.target.value })} rows={3} />

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

export default Categories;
