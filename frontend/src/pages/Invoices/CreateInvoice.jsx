import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Trash2, Save, X, ShoppingCart, Truck, Users, Package, Calendar, FileText, ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateInvoice = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        invoice_type: 'SALE', // Default to Sale for better UX
        supplier: '',
        customer: '',
        due_date: '',
        note: ''
    });
    const [includeTax, setIncludeTax] = useState(true); // Default to VAT on

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
            navigate('/invoices');
        } catch (error) {
            console.error(error);
            alert("Error creating record: " + JSON.stringify(error.response?.data || "Check your details"));
        } finally {
            setLoading(false);
        }
    };

    // Quick Create Handlers
    const createSupplier = async () => {
        try {
            const res = await api.post('suppliers/', newSupplier);
            setMetadata({ ...metadata, suppliers: [...metadata.suppliers, res.data] });
            setFormData({ ...formData, supplier: res.data.id });
            setModals({ ...modals, supplier: false });
            setNewSupplier({ name: '', email: '' });
        } catch (e) { alert("Failed to create supplier"); }
    };

    const createCustomer = async () => {
        try {
            const res = await api.post('customers/', newCustomer);
            setMetadata({ ...metadata, customers: [...metadata.customers, res.data] });
            setFormData({ ...formData, customer: res.data.id });
            setModals({ ...modals, customer: false });
            setNewCustomer({ name: '', email: '' });
        } catch (e) { alert("Failed to create customer"); }
    };

    const createProduct = async () => {
        try {
            const res = await api.post('products/', { ...newProduct, stock_quantity: 0 });
            setMetadata({ ...metadata, products: [...metadata.products, res.data] });
            const newItems = [...items];
            const lastIdx = newItems.length - 1;
            if (!newItems[lastIdx].product) {
                handleProductChange(lastIdx, res.data.id);
            }
            setModals({ ...modals, product: false });
            setNewProduct({ name: '', sku: '', price: '', category: '' });
        } catch (e) { alert("Failed to create product"); }
    };

    const Modal = ({ title, isOpen, onClose, icon: Icon, children }) => {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="bg-[#004d40] px-6 py-4 flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                            {Icon && <Icon size={20} className="opacity-50" />}
                            <h3 className="font-black font-montserrat uppercase tracking-tight text-sm">{title}</h3>
                        </div>
                        <button onClick={onClose} className="hover:rotate-90 transition-transform"><X size={20} /></button>
                    </div>
                    <div className="p-6">
                        {children}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-5xl mx-auto pb-20 font-nunito animate-in slide-in-from-bottom-4 duration-500">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/invoices')}
                        className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-[#00a651] hover:shadow-md transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-[#004d40] font-montserrat tracking-tight leading-none">Record Transaction</h1>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-1">
                            Accounting <ChevronRight size={10} /> New Invoice
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section 1: Transaction Details */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex items-center gap-3 text-[#004d40]">
                        <FileText size={20} />
                        <h2 className="font-extrabold font-montserrat uppercase tracking-tight text-sm">Header Information</h2>
                    </div>
                    <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Account Nature</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, invoice_type: 'SALE', customer: '' })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 transition-all font-black text-xs ${formData.invoice_type === 'SALE' ? 'bg-[#004d40] text-white border-transparent shadow-lg' : 'bg-white text-gray-400 border-gray-100'}`}
                                >
                                    <ShoppingCart size={16} /> SALES
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, invoice_type: 'PURCHASE', supplier: '' })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 transition-all font-black text-xs ${formData.invoice_type === 'PURCHASE' ? 'bg-orange-600 text-white border-transparent shadow-lg' : 'bg-white text-gray-400 border-gray-100'}`}
                                >
                                    <Truck size={16} /> PURCHASE
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-1 flex justify-between">
                                {formData.invoice_type === 'PURCHASE' ? 'Vendor / Source' : 'Recipient / Client'}
                                <button
                                    type="button"
                                    onClick={() => setModals({ ...modals, [formData.invoice_type === 'PURCHASE' ? 'supplier' : 'customer']: true })}
                                    className="text-[#00a651] hover:underline"
                                >
                                    + Add New
                                </button>
                            </label>
                            <select
                                className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none font-bold text-[#004d40] transition-all appearance-none"
                                value={formData.invoice_type === 'PURCHASE' ? formData.supplier : formData.customer}
                                onChange={e => {
                                    const key = formData.invoice_type === 'PURCHASE' ? 'supplier' : 'customer';
                                    setFormData({ ...formData, [key]: e.target.value });
                                }}
                                required
                            >
                                <option value="">Lookup Account...</option>
                                {formData.invoice_type === 'PURCHASE'
                                    ? metadata.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                                    : metadata.customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                                }
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Maturity / Due Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="date"
                                    className="w-full pl-14 pr-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none font-bold text-[#004d40] transition-all"
                                    value={formData.due_date}
                                    onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Items Table */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between text-[#004d40]">
                        <div className="flex items-center gap-3">
                            <Package size={20} />
                            <h2 className="font-extrabold font-montserrat uppercase tracking-tight text-sm">Unit Line Items</h2>
                        </div>
                        <button type="button" onClick={() => setModals({ ...modals, product: true })} className="text-[10px] font-black uppercase text-[#00a651] hover:underline bg-green-50 px-3 py-1.5 rounded-full">
                            + Quick Register Product
                        </button>
                    </div>
                    <div className="p-4 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                    <th className="px-6 py-4">Article / Product</th>
                                    <th className="px-6 py-4 w-28 text-center">In-Stock</th>
                                    <th className="px-6 py-4 w-32">Qty</th>
                                    <th className="px-6 py-4 w-40">Unit Rate (NPR)</th>
                                    <th className="px-6 py-4 w-40 text-right">Line Total</th>
                                    <th className="px-4 py-4 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {items.map((item, index) => (
                                    <tr key={index} className="group">
                                        <td className="px-4 py-3">
                                            <select
                                                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none font-bold text-sm transition-all shadow-sm"
                                                value={item.product}
                                                onChange={e => handleProductChange(index, e.target.value)}
                                                required
                                            >
                                                <option value="">Select an Item...</option>
                                                {metadata.products.map(p => <option key={p.id} value={p.id}>{p.name} [{p.sku}]</option>)}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`text-xs font-black p-2 rounded-lg ${item.stock < 5 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}`}>
                                                {item.stock}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none font-black text-sm transition-all shadow-sm text-center"
                                                value={item.quantity}
                                                onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                                required
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none font-black text-sm transition-all shadow-sm"
                                                value={item.unit_price}
                                                onChange={e => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                required
                                            />
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <span className="font-black text-[#004d40]">
                                                {(item.quantity * item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-6">
                            <button
                                type="button"
                                onClick={addItem}
                                className="px-6 py-2.5 bg-gray-50 hover:bg-green-50 text-gray-400 hover:text-[#00a651] rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all border border-dashed border-gray-200 hover:border-[#00a651]"
                            >
                                <Plus size={16} /> Add Next Row
                            </button>
                        </div>
                    </div>
                </div>

                {/* Section 3: Totals & Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-4">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Additional Memo / Notes</label>
                        <textarea
                            className="w-full p-6 bg-gray-50 border border-transparent rounded-3xl focus:bg-white focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none font-medium text-sm transition-all min-h-[120px]"
                            placeholder="Type internal notes or details for this record..."
                            value={formData.note}
                            onChange={e => setFormData({ ...formData, note: e.target.value })}
                        />
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-10 shadow-lg border border-gray-100 space-y-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 text-gray-400">
                            <Tag size={120} />
                        </div>

                        <div className="space-y-4 relative">
                            <label className="flex items-center justify-between p-4 bg-green-50/50 rounded-2xl cursor-pointer hover:bg-green-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${includeTax ? 'bg-[#00a651]' : 'border-2 border-gray-200'}`}>
                                        {includeTax && <Save size={12} className="text-white" />}
                                    </div>
                                    <span className="text-sm font-bold text-[#004d40]">Apply VAT (13%)</span>
                                </div>
                                <input type="checkbox" checked={includeTax} onChange={e => setIncludeTax(e.target.checked)} className="hidden" />
                            </label>

                            <div className="pt-4 space-y-3 px-2 text-sm font-bold text-gray-500">
                                <div className="flex justify-between">
                                    <span>SUBTOTAL EXCL. TAX</span>
                                    <span className="text-gray-800">Rs. {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                {includeTax && (
                                    <div className="flex justify-between text-green-600">
                                        <span>VALUE ADDED TAX (13%)</span>
                                        <span>Rs. {vat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                                <div className="h-px bg-gray-100 my-4"></div>
                                <div className="flex justify-between items-center bg-[#004d40] px-6 py-5 rounded-2xl text-white shadow-xl shadow-green-900/20">
                                    <span className="text-xs font-black uppercase tracking-widest opacity-60">Grand Total NPR</span>
                                    <span className="text-2xl font-black font-montserrat">
                                        {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Final Actions */}
                <div className="flex justify-between items-center p-8 bg-white/50 backdrop-blur-md sticky bottom-10 rounded-[3rem] border border-white shadow-2xl z-40 animate-in slide-in-from-bottom-8 duration-700">
                    <button
                        type="button"
                        onClick={() => navigate('/invoices')}
                        className="px-10 py-4 rounded-2xl text-sm font-black uppercase text-gray-400 hover:text-gray-600 transition-all"
                    >
                        Discard Record
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-12 py-4 rounded-2xl bg-[#00a651] hover:bg-[#008148] text-white flex items-center gap-3 font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-green-900/30 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : <><Save size={18} /> Validate & Commit</>}
                    </button>
                </div>
            </form>

            {/* Quick Create Modals */}
            <Modal title="Quick Register Vendor" isOpen={modals.supplier} icon={Truck} onClose={() => setModals({ ...modals, supplier: false })}>
                <div className="space-y-4">
                    <input className="w-full px-5 py-3.5 bg-gray-50 border-transparent rounded-2xl outline-none font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[#00a651]/20 transition-all" placeholder="Legal Entity Name" value={newSupplier.name} onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })} />
                    <input className="w-full px-5 py-3.5 bg-gray-50 border-transparent rounded-2xl outline-none font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[#00a651]/20 transition-all" placeholder="Corporate Email" value={newSupplier.email} onChange={e => setNewSupplier({ ...newSupplier, email: e.target.value })} />
                    <button onClick={createSupplier} className="w-full py-4 bg-[#00a651] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-900/20 active:scale-95 transition-all">Setup Vendor</button>
                </div>
            </Modal>

            <Modal title="Quick Register Customer" isOpen={modals.customer} icon={Users} onClose={() => setModals({ ...modals, customer: false })}>
                <div className="space-y-4">
                    <input className="w-full px-5 py-3.5 bg-gray-50 border-transparent rounded-2xl outline-none font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[#00a651]/20 transition-all" placeholder="Full Billing Name" value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} />
                    <input className="w-full px-5 py-3.5 bg-gray-50 border-transparent rounded-2xl outline-none font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[#00a651]/20 transition-all" placeholder="Client Email" value={newCustomer.email} onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} />
                    <button onClick={createCustomer} className="w-full py-4 bg-[#00a651] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-900/20 active:scale-95 transition-all">Submit Profile</button>
                </div>
            </Modal>

            <Modal title="New Article Entry" isOpen={modals.product} icon={Package} onClose={() => setModals({ ...modals, product: false })}>
                <div className="space-y-4">
                    <input className="w-full px-5 py-3.5 bg-gray-50 border-transparent rounded-2xl outline-none font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[#00a651]/20 transition-all" placeholder="Product Identification Name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                    <input className="w-full px-5 py-3.5 bg-gray-50 border-transparent rounded-2xl outline-none font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[#00a651]/20 transition-all" placeholder="SKU / Internal Code" value={newProduct.sku} onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })} />
                    <input className="w-full px-5 py-3.5 bg-gray-50 border-transparent rounded-2xl outline-none font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[#00a651]/20 transition-all" placeholder="Standard Unit Price" type="number" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                    <select className="w-full px-5 py-3.5 bg-gray-50 border-transparent rounded-2xl outline-none font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[#00a651]/20 transition-all" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
                        <option value="">Choose Category...</option>
                        {metadata.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button onClick={createProduct} className="w-full py-4 bg-[#00a651] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-900/20 active:scale-95 transition-all">Confirm Product</button>
                </div>
            </Modal>

        </div>
    );
};

export default CreateInvoice;
