import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState({
        name: '', sku: '', description: '', price: '', stock_quantity: 0, category: '', supplier: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProducts();
        fetchMetadata();
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
        if (window.confirm("Are you sure?")) {
            await api.delete(`products/${id}/`);
            fetchProducts();
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
            alert("Error saving product");
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

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Products</h2>
                <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2">
                    <Plus size={18} /> Add Product
                </button>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg flex items-center gap-3">
                <Search className="text-gray-400" />
                <input
                    type="text"
                    placeholder="Search products..."
                    className="bg-transparent border-none focus:outline-none text-white w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 block"> {/* Added block to ensure visibility */}
                <table className="w-full text-left">
                    <thead className="bg-gray-700 text-gray-300">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">SKU</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Stock</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {filteredProducts.map(product => (
                            <tr key={product.id} className="hover:bg-gray-750">
                                <td className="p-4 font-medium">{product.name}</td>
                                <td className="p-4 text-gray-400">{product.sku}</td>
                                <td className="p-4">
                                    <span className="bg-blue-900 text-blue-300 px-2 py-1 rounded text-xs">
                                        {product.category_name || '-'}
                                    </span>
                                </td>
                                <td className="p-4">${product.price}</td>
                                <td className={`p-4 font-bold ${product.stock_quantity < 10 ? 'text-red-400' : 'text-green-400'}`}>
                                    {product.stock_quantity}
                                </td>
                                <td className="p-4 flex gap-3">
                                    <button onClick={() => openModal(product)} className="text-blue-400 hover:text-blue-300"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(product.id)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredProducts.length === 0 && <div className="p-8 text-center text-gray-500">No products found.</div>}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg border border-gray-700">
                        <h3 className="text-2xl font-bold mb-4">{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input className="w-full p-2 rounded bg-gray-700 border border-gray-600" placeholder="Product Name" value={currentProduct.name} onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })} required />
                            <input className="w-full p-2 rounded bg-gray-700 border border-gray-600" placeholder="SKU" value={currentProduct.sku} onChange={e => setCurrentProduct({ ...currentProduct, sku: e.target.value })} required />
                            <div className="grid grid-cols-2 gap-4">
                                <input className="w-full p-2 rounded bg-gray-700 border border-gray-600" type="number" placeholder="Price" value={currentProduct.price} onChange={e => setCurrentProduct({ ...currentProduct, price: e.target.value })} required />
                                <input className="w-full p-2 rounded bg-gray-700 border border-gray-600" type="number" placeholder="Stock" value={currentProduct.stock_quantity} onChange={e => setCurrentProduct({ ...currentProduct, stock_quantity: e.target.value })} required />
                            </div>
                            <select className="w-full p-2 rounded bg-gray-700 border border-gray-600" value={currentProduct.category || ''} onChange={e => setCurrentProduct({ ...currentProduct, category: e.target.value })}>
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <select className="w-full p-2 rounded bg-gray-700 border border-gray-600" value={currentProduct.supplier || ''} onChange={e => setCurrentProduct({ ...currentProduct, supplier: e.target.value })}>
                                <option value="">Select Supplier</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <textarea className="w-full p-2 rounded bg-gray-700 border border-gray-600" placeholder="Description" value={currentProduct.description} onChange={e => setCurrentProduct({ ...currentProduct, description: e.target.value })} rows={3} />

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

export default Products;
