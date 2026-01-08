import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateInvoice = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        invoice_type: 'PURCHASE', // Default
        supplier: '',
        customer: '',
        due_date: '',
        note: ''
    });
    const [includeTax, setIncludeTax] = useState(false);

    const [items, setItems] = useState([
        { product: '', quantity: 1, unit_price: 0, stock: 0 }
    ]);

    const [metadata, setMetadata] = useState({ suppliers: [], customers: [], products: [], categories: [] });
    const [modals, setModals] = useState({ supplier: false, customer: false, product: false });
    // Quick Create States
    const [newSupplier, setNewSupplier] = useState({ name: '', email: '' });
    const [newCustomer, setNewCustomer] = useState({ name: '', email: '' });
    const [newProduct, setNewProduct] = useState({ name: '', sku: '', price: '', category: '' });

    useEffect(() => {
        fetchMetadata();
    }, []);

    const fetchMetadata = async () => {
        try {
            const [supRes, custRes, prodRes, catRes] = await Promise.all([
                api.get('suppliers/'),
                api.get('customers/'),
                api.get('products/'),
                api.get('categories/')
            ]);
            setMetadata({
                suppliers: supRes.data,
                customers: custRes.data,
                products: prodRes.data,
                categories: catRes.data
            });
        } catch (error) {
            console.error("Error fetching metadata");
        }
    };

    const handleProductChange = (index, productId) => {
        const product = metadata.products.find(p => p.id === parseInt(productId));
        const newItems = [...items];
        newItems[index].product = productId;

        if (product) {
            newItems[index].unit_price = product.price;
            newItems[index].stock = product.stock_quantity;
        }
        setItems(newItems);
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const addItem = () => setItems([...items, { product: '', quantity: 1, unit_price: 0, stock: 0 }]);
    const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

    const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
    const vat = includeTax ? subtotal * 0.13 : 0;
    const total = subtotal + vat;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (formData.invoice_type === 'PURCHASE' && !formData.supplier) {
            alert("Please select a Supplier for Purchase"); setLoading(false); return;
        }
        if (formData.invoice_type === 'SALE' && !formData.customer) {
            alert("Please select a Customer for Sale"); setLoading(false); return;
        }

        try {
            const payload = {
                ...formData,
                include_tax: includeTax,
                items: items.map(item => ({
                    product: item.product,
                    quantity: item.quantity,
                    unit_price: item.unit_price
                }))
            };

            await api.post('invoices/', payload);
            alert("Invoice Created Successfully!");
            navigate('/invoices');
        } catch (error) {
            console.error(error);
            alert(JSON.stringify(error.response?.data || "Error creating invoice"));
        } finally {
            setLoading(false);
        }
    };

    // Quick Create Handlers
    const createSupplier = async () => {
        try {
            const res = await api.post('suppliers/', newSupplier);
            setMetadata({ ...metadata, suppliers: [...metadata.suppliers, res.data] });
            setFormData({ ...formData, supplier: res.data.id }); // Auto select
            setModals({ ...modals, supplier: false });
            setNewSupplier({ name: '', email: '' });
        } catch (e) { alert("Failed to create supplier"); }
    };

    const createCustomer = async () => {
        try {
            const res = await api.post('customers/', newCustomer);
            setMetadata({ ...metadata, customers: [...metadata.customers, res.data] });
            setFormData({ ...formData, customer: res.data.id }); // Auto select
            setModals({ ...modals, customer: false });
            setNewCustomer({ name: '', email: '' });
        } catch (e) { alert("Failed to create customer"); }
    };

    const createProduct = async () => {
        try {
            const payload = { ...newProduct, stock_quantity: 0 }; // Initial stock 0
            const res = await api.post('products/', payload);
            setMetadata({ ...metadata, products: [...metadata.products, res.data] });

            // Auto select in the last item row if empty
            const newItems = [...items];
            const lastIdx = newItems.length - 1;
            if (!newItems[lastIdx].product) {
                handleProductChange(lastIdx, res.data.id);
            }

            setModals({ ...modals, product: false });
            setNewProduct({ name: '', sku: '', price: '', category: '' });
        } catch (e) { alert("Failed to create product"); }
    };

    const Modal = ({ title, isOpen, onClose, children }) => {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
                <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700 relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
                    <h3 className="text-xl font-bold mb-4">{title}</h3>
                    {children}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">Create Invoice</h2>
            <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Type</label>
                        <select
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600"
                            value={formData.invoice_type}
                            onChange={e => setFormData({ ...formData, invoice_type: e.target.value, supplier: '', customer: '' })}
                        >
                            <option value="PURCHASE">Purchase (Stock In)</option>
                            <option value="SALE">Sale (Stock Out)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1 flex justify-between">
                            {formData.invoice_type === 'PURCHASE' ? 'Supplier' : 'Customer'}
                            <button type="button" onClick={() => setModals({ ...modals, [formData.invoice_type === 'PURCHASE' ? 'supplier' : 'customer']: true })} className="text-blue-400 text-xs hover:underline">+ New</button>
                        </label>
                        <select
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600"
                            value={formData.invoice_type === 'PURCHASE' ? formData.supplier : formData.customer}
                            onChange={e => {
                                const key = formData.invoice_type === 'PURCHASE' ? 'supplier' : 'customer';
                                setFormData({ ...formData, [key]: e.target.value });
                            }}
                            required
                        >
                            <option value="">Select Party</option>
                            {formData.invoice_type === 'PURCHASE'
                                ? metadata.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                                : metadata.customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                            }
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Due Date</label>
                        <input type="date" className="w-full p-2 rounded bg-gray-700 border border-gray-600"
                            value={formData.due_date} onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                        />
                    </div>
                </div>

                <div className="border-t border-gray-700 pt-6">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-medium">Items</h3>
                        <button type="button" onClick={() => setModals({ ...modals, product: true })} className="text-blue-400 text-sm hover:underline">+ Create Product</button>
                    </div>
                    <table className="w-full text-left mb-4">
                        <thead className="text-gray-400 text-sm">
                            <tr>
                                <th className="p-2">Product</th>
                                <th className="p-2 w-24">Stock</th>
                                <th className="p-2 w-24">Qty</th>
                                <th className="p-2 w-32">Price</th>
                                <th className="p-2 w-32 text-right">Total</th>
                                <th className="p-2 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {items.map((item, index) => (
                                <tr key={index}>
                                    <td className="p-2">
                                        <select
                                            className="w-full p-2 rounded bg-gray-900 border border-gray-600"
                                            value={item.product}
                                            onChange={e => handleProductChange(index, e.target.value)}
                                            required
                                        >
                                            <option value="">Select Product</option>
                                            {metadata.products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                                        </select>
                                    </td>
                                    <td className="p-2 text-gray-500">{item.stock}</td>
                                    <td className="p-2">
                                        <input type="number" min="1" className="w-full p-2 rounded bg-gray-900 border border-gray-600"
                                            value={item.quantity} onChange={e => updateItem(index, 'quantity', parseInt(e.target.value))} required
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input type="number" step="0.01" className="w-full p-2 rounded bg-gray-900 border border-gray-600"
                                            value={item.unit_price} onChange={e => updateItem(index, 'unit_price', parseFloat(e.target.value))} required
                                        />
                                    </td>
                                    <td className="p-2 text-right font-medium">
                                        {(item.quantity * item.unit_price).toFixed(2)}
                                    </td>
                                    <td className="p-2 text-center">
                                        {items.length > 1 && (
                                            <button type="button" onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button type="button" onClick={addItem} className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm">
                        <Plus size={16} /> Add Item
                    </button>
                </div>

                <div className="flex justify-end border-t border-gray-700 pt-6">
                    <div className="w-64 space-y-2">
                        <div className="flex justify-between items-center text-gray-400">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={includeTax} onChange={e => setIncludeTax(e.target.checked)} className="rounded bg-gray-700 border-gray-600" />
                                Apply VAT (13%)
                            </label>
                        </div>
                        <div className="flex justify-between text-gray-400">
                            <span>Subtotal:</span>
                            <span>{subtotal.toFixed(2)}</span>
                        </div>
                        {includeTax && (
                            <div className="flex justify-between text-gray-400">
                                <span>VAT (13%):</span>
                                <span>{vat.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-xl font-bold border-t border-gray-600 pt-2">
                            <span>Total:</span>
                            <span>{total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 border-t border-gray-700 pt-6">
                    <button type="button" onClick={() => navigate('/invoices')} className="px-6 py-2 rounded bg-gray-600 hover:bg-gray-500">Cancel</button>
                    <button type="submit" disabled={loading} className="px-6 py-2 rounded bg-green-600 hover:bg-green-500 flex items-center gap-2 font-bold disabled:opacity-50">
                        <Save size={18} /> {loading ? 'Saving...' : 'Save Invoice'}
                    </button>
                </div>
            </form>

            {/* Quick Create Modals */}
            <Modal title="New Supplier" isOpen={modals.supplier} onClose={() => setModals({ ...modals, supplier: false })}>
                <div className="space-y-4">
                    <input className="w-full p-2 bg-gray-700 border border-gray-600 rounded" placeholder="Name" value={newSupplier.name} onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })} />
                    <input className="w-full p-2 bg-gray-700 border border-gray-600 rounded" placeholder="Email" value={newSupplier.email} onChange={e => setNewSupplier({ ...newSupplier, email: e.target.value })} />
                    <button onClick={createSupplier} className="w-full p-2 bg-blue-600 rounded hover:bg-blue-500">Create Supplier</button>
                </div>
            </Modal>

            <Modal title="New Customer" isOpen={modals.customer} onClose={() => setModals({ ...modals, customer: false })}>
                <div className="space-y-4">
                    <input className="w-full p-2 bg-gray-700 border border-gray-600 rounded" placeholder="Name" value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} />
                    <input className="w-full p-2 bg-gray-700 border border-gray-600 rounded" placeholder="Email" value={newCustomer.email} onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} />
                    <button onClick={createCustomer} className="w-full p-2 bg-blue-600 rounded hover:bg-blue-500">Create Customer</button>
                </div>
            </Modal>

            <Modal title="New Product" isOpen={modals.product} onClose={() => setModals({ ...modals, product: false })}>
                <div className="space-y-4">
                    <input className="w-full p-2 bg-gray-700 border border-gray-600 rounded" placeholder="Product Name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                    <input className="w-full p-2 bg-gray-700 border border-gray-600 rounded" placeholder="SKU" value={newProduct.sku} onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })} />
                    <input className="w-full p-2 bg-gray-700 border border-gray-600 rounded" placeholder="Price" type="number" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                    <select className="w-full p-2 bg-gray-700 border border-gray-600 rounded" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
                        <option value="">Select Category</option>
                        {metadata.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button onClick={createProduct} className="w-full p-2 bg-blue-600 rounded hover:bg-blue-500">Create Product</button>
                </div>
            </Modal>

        </div>
    );
};

export default CreateInvoice;
