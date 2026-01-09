import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Edit, Trash2, FolderTree, Tag, Info } from 'lucide-react';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({ name: '', description: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchCategories(); }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await api.get('categories/');
            setCategories(res.data);
        } catch (error) { console.error("Failed to fetch categories"); }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure? Products in this category will become uncategorized.")) {
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

    if (loading) return <div className="flex items-center justify-center h-64 text-teal-600 font-montserrat">Loading Categories...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-nunito pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#004d40] font-montserrat tracking-tight flex items-center gap-3">
                        <FolderTree className="text-[#00a651]" size={28} />
                        Categories
                    </h1>
                    <p className="text-gray-500 text-sm">Organize your products into logical groups</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-[#00a651] hover:bg-[#008148] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-md active:scale-95"
                >
                    <Plus size={20} /> New Category
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#004d40] text-white">
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Hierarchy / Name</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {categories.map(cat => (
                                <tr key={cat.id} className="hover:bg-green-50/30 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-50 rounded-lg text-gray-400 group-hover:text-[#00a651] group-hover:bg-white transition-all">
                                                <Tag size={18} />
                                            </div>
                                            <span className="font-extrabold text-[#004d40] uppercase tracking-tight">{cat.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-gray-500 italic max-w-md truncate">
                                        {cat.description || <span className="text-gray-300">No description provided</span>}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openModal(cat)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat.id)}
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
                    {categories.length === 0 && (
                        <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs opacity-50">
                            No categories registered yet
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-[#004d40] p-6 text-white flex justify-between items-center">
                            <h3 className="text-lg font-black font-montserrat uppercase tracking-tight">
                                {isEditing ? 'Update Category' : 'New Category'}
                            </h3>
                            <FolderTree size={24} className="opacity-30" />
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Category Label</label>
                                <input
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm font-bold transition-all"
                                    placeholder="e.g. Refrigerators, Cookware"
                                    value={currentCategory.name}
                                    onChange={e => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Context / Details</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm min-h-[100px] transition-all"
                                    placeholder="Optional description..."
                                    value={currentCategory.description}
                                    onChange={e => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-700">Cancel</button>
                                <button type="submit" className="px-8 py-2.5 rounded-xl bg-[#00a651] hover:bg-[#008148] text-white font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-green-900/10">
                                    {isEditing ? 'Save Changes' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
