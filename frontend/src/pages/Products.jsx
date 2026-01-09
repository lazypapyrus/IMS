import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Edit, Trash2, Search, Package, ArrowLeft, Filter, MoreVertical, Layers, ShoppingCart, Tag } from 'lucide-react';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState({
        name: '', sku: '', description: '', price: '', stock_quantity: 0, category: '', supplier: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadPageData = async () => {
            setLoading(true);
            await Promise.all([fetchProducts(), fetchMetadata()]);
            setLoading(false);
        };
        loadPageData();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get('products/');
            setProducts(res.data);
        } catch (error) {
            console.error("Failed to fetch products");
        }
    };

    const fetchMetadata = async () => {
        try {
            const [catRes, supRes] = await Promise.all([api.get('categories/'), api.get('suppliers/')]);
            setCategories(catRes.data);
            setSuppliers(supRes.data);
        } catch (error) {
            console.error("Failed to fetch metadata");
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await api.delete(`products/${id}/`);
                fetchProducts();
            } catch (err) {
                alert("Cannot delete product: It may be linked to invoices.");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`products/${currentProduct.id}/`, currentProduct);
            } else {
                await api.post('products/', currentProduct);
            }
            setIsModalOpen(false);
            fetchProducts();
            setCurrentProduct({ name: '', sku: '', description: '', price: '', stock_quantity: 0, category: '', supplier: '' });
        } catch (error) {
            alert("Error saving product: " + (error.response?.data?.sku?.[0] || "Check your input"));
        }
    };

    const openModal = (product = null) => {
        if (product) {
            setIsEditing(true);
            setCurrentProduct(product);
        } else {
            setIsEditing(false);
            setCurrentProduct({ name: '', sku: '', description: '', price: '', stock_quantity: 0, category: '', supplier: '' });
        }
        setIsModalOpen(true);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex items-center justify-center h-64 text-teal-600 font-montserrat">Loading Inventory...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-nunito">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#004d40] font-montserrat tracking-tight">Inventory Management</h1>
                    <p className="text-gray-500 text-sm">Monitor and manage your stock of products</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-[#00a651] hover:bg-[#008148] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-md active:scale-95"
                >
                    <Plus size={20} /> Add New Product
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-[#00a651]">
                        <Package size={24} />
                    </div>
                    <div>
                        <div className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Items</div>
                        <div className="text-2xl font-black text-[#004d40] font-montserrat">{products.length}</div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                        <ShoppingCart size={24} />
                    </div>
                    <div>
                        <div className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Low Stock</div>
                        <div className="text-2xl font-black text-[#004d40] font-montserrat">{products.filter(p => p.stock_quantity < 10).length}</div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <Layers size={24} />
                    </div>
                    <div>
                        <div className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Categories</div>
                        <div className="text-2xl font-black text-[#004d40] font-montserrat">{categories.length}</div>
                    </div>
                </div>
            </div>

            {/* Search and Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/30">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search code or product name..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-gray-100 bg-white">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#004d40] text-white">
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Product Info</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Pricing</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Available Stock</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredProducts.map(product => (
                                <tr key={product.id} className="hover:bg-green-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-extrabold text-[#004d40] group-hover:text-[#00a651] transition-colors">{product.name || 'Unnamed Product'}</span>
                                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">SKU: {product.sku}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-gray-200">
                                            {product.category_name || '-'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-gray-800">Rs. {parseFloat(product.price).toLocaleString()}</span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">Incl. Tax</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${product.stock_quantity < 10 ? 'bg-red-500' : 'bg-[#00a651]'}`}
                                                    style={{ width: `${Math.min((product.stock_quantity / 50) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                            <span className={`text-sm font-black ${product.stock_quantity < 10 ? 'text-red-500' : 'text-gray-700'}`}>
                                                {product.stock_quantity}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openModal(product)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
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
                    {filteredProducts.length === 0 && (
                        <div className="p-20 text-center flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                                <Search size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-700">No products found</h3>
                                <p className="text-gray-400 text-sm">Try adjusting your search or add a new item.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-[#004d40] p-6 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black font-montserrat uppercase tracking-tight">
                                    {isEditing ? 'Update Product' : 'Register Product'}
                                </h3>
                                <p className="text-teal-200 text-xs font-bold uppercase tracking-widest mt-1">Inventory Management</p>
                            </div>
                            <Package size={32} className="opacity-20" />
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Product Identification</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm transition-all"
                                        placeholder="Display Name"
                                        value={currentProduct.name}
                                        onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                                        required
                                    />
                                    <input
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm transition-all"
                                        placeholder="Product SKU / Code"
                                        value={currentProduct.sku}
                                        onChange={e => setCurrentProduct({ ...currentProduct, sku: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Selling Price (NPR)</label>
                                    <input
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm font-bold transition-all"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={currentProduct.price}
                                        onChange={e => setCurrentProduct({ ...currentProduct, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Stock Quantity</label>
                                    <input
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm font-bold transition-all"
                                        type="number"
                                        placeholder="0"
                                        value={currentProduct.stock_quantity}
                                        onChange={e => setCurrentProduct({ ...currentProduct, stock_quantity: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Classification</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm transition-all"
                                        value={currentProduct.category || ''}
                                        onChange={e => setCurrentProduct({ ...currentProduct, category: e.target.value })}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Default Supplier</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm transition-all"
                                        value={currentProduct.supplier || ''}
                                        onChange={e => setCurrentProduct({ ...currentProduct, supplier: e.target.value })}
                                    >
                                        <option value="">Select Supplier</option>
                                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Product Description</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm min-h-[80px] transition-all"
                                    placeholder="Add technical specs or details..."
                                    value={currentProduct.description}
                                    onChange={e => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-700 transition-all"
                                >
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2.5 rounded-xl bg-[#00a651] hover:bg-[#00c853] text-white font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-green-900/10"
                                >
                                    {isEditing ? 'Save Changes' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
