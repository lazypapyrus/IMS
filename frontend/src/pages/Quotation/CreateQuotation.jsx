import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { Plus, Trash2, Save, ArrowLeft, User, Calendar, FileText, ShoppingBag } from 'lucide-react';

const CreateQuotation = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(isEdit);
    const [formData, setFormData] = useState({
        customer_name: '',
        customer: '',
        valid_until: '',
        ref_no: '',
        prepared_by: 'Apsara Karki',
        note: '',
        items: [{ description: '', quantity: 1, rate: 0, amount: 0 }]
    });

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await api.get('customers/');
                setCustomers(res.data);
            } catch (error) {
                console.error("Error fetching customers");
            }
        };

        const fetchQuotationData = async () => {
            try {
                const res = await api.get(`quotations/${id}/`);
                setFormData(res.data);
            } catch (error) {
                console.error("Error fetching quotation data");
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
        if (isEdit) {
            fetchQuotationData();
        } else {
            // Generate a random Ref No for new ones
            const randomRef = '0' + Math.floor(Math.random() * 1000);
            setFormData(prev => ({ ...prev, ref_no: randomRef }));
        }
    }, [id, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'customer' && value) {
            const selected = customers.find(c => c.id === parseInt(value));
            if (selected) {
                setFormData(prev => ({ ...prev, customer_name: selected.name }));
            }
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        if (field === 'quantity' || field === 'rate') {
            newItems[index].amount = parseFloat(newItems[index].quantity || 0) * parseFloat(newItems[index].rate || 0);
        }
        setFormData({ ...formData, items: newItems });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
        });
    };

    const removeItem = (index) => {
        if (formData.items.length > 1) {
            const newItems = formData.items.filter((_, i) => i !== index);
            setFormData({ ...formData, items: newItems });
        }
    };

    const calculateTotals = () => {
        const subtotal = formData.items.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);
        const vat = subtotal * 0.13;
        const total = subtotal + vat;
        return { subtotal, vat, total };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { subtotal, vat, total } = calculateTotals();

        const payload = {
            ...formData,
            total_amount: total,
            taxable_amount: subtotal,
            vat_amount: vat,
            customer: formData.customer || null
        };

        try {
            if (isEdit) {
                await api.put(`quotations/${id}/`, payload);
            } else {
                await api.post('quotations/', payload);
            }
            navigate('/quotations');
        } catch (error) {
            console.error("Error saving quotation:", error.response?.data);
            alert("Failed to save quotation. Please check the data.");
        }
    };

    const { subtotal, vat, total } = calculateTotals();

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 font-nunito pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-all text-teal-600 border border-transparent hover:border-teal-100 shadow-sm bg-white/50">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-[#004d40] font-montserrat">{isEdit ? 'Modify Quotation' : 'New Quotation'}</h1>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{isEdit ? `Editing #${formData.ref_no}` : 'Novo Era Pvt Ltd'}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Details */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                        <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
                            <ShoppingBag className="text-[#00a651]" size={20} />
                            <h2 className="text-lg font-bold text-gray-700 font-montserrat">Items & Pricing</h2>
                        </div>

                        <div className="space-y-4">
                            {formData.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-4 items-end bg-gray-50/50 p-4 rounded-2xl border border-gray-50 group hover:border-green-100 transition-all">
                                    <div className="col-span-12 md:col-span-5 space-y-1">
                                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-wider">Description</label>
                                        <input
                                            type="text"
                                            value={item.description}
                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                            placeholder="Item name/description"
                                            required
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm transition-all"
                                        />
                                    </div>
                                    <div className="col-span-4 md:col-span-2 space-y-1">
                                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-wider">Qty</label>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm transition-all"
                                        />
                                    </div>
                                    <div className="col-span-4 md:col-span-2 space-y-1">
                                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-wider">Rate</label>
                                        <input
                                            type="number"
                                            value={item.rate}
                                            onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm transition-all"
                                        />
                                    </div>
                                    <div className="col-span-4 md:col-span-2 space-y-1">
                                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-wider">Amount</label>
                                        <div className="px-4 py-2 bg-gray-100 border border-transparent rounded-xl text-sm font-bold text-gray-600">
                                            {parseFloat(item.amount).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="col-span-12 md:col-span-1 pb-1">
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="p-2 text-red-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addItem}
                                className="flex items-center gap-2 text-sm font-bold text-[#00a651] hover:text-[#008148] transition-colors pl-2"
                            >
                                <Plus size={18} /> Add Another Item
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
                            <FileText className="text-[#00a651]" size={20} />
                            <h2 className="text-lg font-bold text-gray-700 font-montserrat">Notes & Terms</h2>
                        </div>
                        <textarea
                            name="note"
                            value={formData.note}
                            onChange={handleChange}
                            placeholder="Add internal notes or special instructions..."
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm min-h-[100px] transition-all"
                        />
                    </div>
                </div>

                {/* Right Side: Customer & Summary */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                        <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
                            <User className="text-[#00a651]" size={20} />
                            <h2 className="text-lg font-bold text-gray-700 font-montserrat">Customer</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-wider">Select Customer</label>
                                <select
                                    name="customer"
                                    value={formData.customer}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm transition-all"
                                >
                                    <option value="">-- Choose Profile --</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-wider">Display Name</label>
                                <input
                                    type="text"
                                    name="customer_name"
                                    value={formData.customer_name}
                                    onChange={handleChange}
                                    placeholder="Or type customer name"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-wider">Ref No</label>
                                    <input
                                        type="text"
                                        name="ref_no"
                                        value={formData.ref_no}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold bg-gray-50"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-wider">Valid Until</label>
                                    <input
                                        type="date"
                                        name="valid_until"
                                        value={formData.valid_until}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#004d40] p-8 rounded-3xl shadow-xl shadow-green-900/10 text-white space-y-6">
                        <h2 className="text-xl font-black font-montserrat tracking-tight">Summary</h2>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-teal-200">Subtotal</span>
                                <span className="font-bold">Rs. {subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-teal-200">VAT (13%)</span>
                                <span className="font-bold font-montserrat">Rs. {vat.toLocaleString()}</span>
                            </div>
                            <div className="h-px bg-white/10 my-2"></div>
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-black uppercase tracking-widest text-teal-200">Total</span>
                                <span className="text-2xl font-black font-montserrat">Rs. {total.toLocaleString()}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#00a651] hover:bg-[#00c853] text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-black transition-all shadow-lg active:scale-95 shadow-green-950/20 mt-4 uppercase tracking-widest text-sm"
                        >
                            <Save size={20} /> {isEdit ? 'Update Changes' : 'Save Quotation'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateQuotation;
