import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Printer, ArrowLeft, Download } from 'lucide-react';
import logo from '../../assets/logo.png';

const PrintQuotation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuote = async () => {
            try {
                const res = await api.get(`quotations/${id}/`);
                setQuote(res.data);
            } catch (error) {
                console.error("Error fetching quotation");
            } finally {
                setLoading(false);
            }
        };
        fetchQuote();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="p-10 text-center font-montserrat text-teal-700">Loading Print Preview...</div>;
    if (!quote) return <div className="p-10 text-center text-red-500">Quotation not found.</div>;

    return (
        <div className="font-nunito min-h-screen bg-gray-100 py-10 px-4 print:bg-white print:p-0">
            {/* Action Bar - Hidden on Print */}
            <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-green-600 font-bold transition-colors">
                    <ArrowLeft size={20} /> Back to List
                </button>
                <div className="flex gap-4">
                    <button onClick={handlePrint} className="bg-[#00a651] text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-900/10 hover:bg-[#008148] transition-all">
                        <Printer size={20} /> Print Quotation
                    </button>
                </div>
            </div>

            {/* The Actual Quote Sheet */}
            <div className="max-w-[800px] mx-auto bg-white shadow-2xl print:shadow-none min-h-[1100px] p-12 relative border border-gray-100 print:border-0 rounded-sm">

                {/* Header Section */}
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-6">
                                <img src={logo} alt="Novo Era Logo" className="h-28 object-contain" />
                                <div className="h-20 w-px bg-gray-200 mx-2"></div>
                                <div className="flex flex-col">
                                    <span className="text-3xl font-black text-[#00a651] font-montserrat uppercase tracking-tighter leading-none">Novo Era Pvt Ltd</span>
                                    <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-2">Total Kitchen & Refrigeration Solutions</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Company Details Line */}
                <div className="text-center space-y-1 mb-6">
                    <p className="text-[#c62828] font-bold text-sm font-montserrat">Itahari-06, Sunsari, Nepal</p>
                    <p className="text-[#c62828] font-bold text-sm font-montserrat">VAT: 609981649</p>
                </div>

                <div className="w-full h-1 bg-[#c62828] mb-4"></div>

                {/* Quotation Title */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-[#00a651] font-montserrat uppercase tracking-[0.2em]">Quotation</h1>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 justify-between mb-8">
                    <div className="space-y-1">
                        <h3 className="text-[#00a651] font-black text-lg font-montserrat">Quote To:</h3>
                        <p className="text-[#c62828] font-black text-lg underline decoration-2">{quote.customer_name}</p>
                    </div>
                    <div className="text-right space-y-1">
                        <h3 className="text-[#00a651] font-black text-lg font-montserrat">Quotation Details:</h3>
                        <div className="flex justify-end gap-2 text-sm">
                            <span className="font-bold text-gray-500 uppercase tracking-wider">Ref no:</span>
                            <span className="font-black text-gray-800">#{quote.ref_no}</span>
                        </div>
                        <div className="flex justify-end gap-2 text-sm">
                            <span className="font-bold text-gray-500 uppercase tracking-wider">Valid Date From:</span>
                            <span className="font-black text-gray-800">{quote.date}</span>
                        </div>
                        <div className="flex justify-end gap-2 text-sm">
                            <span className="font-bold text-gray-500 uppercase tracking-wider">TO:</span>
                            <span className="font-black text-gray-800">{quote.valid_until || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div className="mb-6 italic text-sm text-gray-600 font-bold">
                    This quotation is prepared by <span className="text-[#c62828] underline">{quote.prepared_by || 'Admin'}</span>
                </div>

                {/* Table */}
                <table className="w-full border-collapse border-b-2 border-green-800 mb-8 overflow-hidden rounded-t-lg">
                    <thead>
                        <tr className="bg-[#004d40] text-white">
                            <th className="border border-green-900/30 px-3 py-3 text-sm font-black uppercase text-center w-16">S. no.</th>
                            <th className="border border-green-900/30 px-4 py-3 text-sm font-black uppercase text-left">Description</th>
                            <th className="border border-green-900/30 px-3 py-3 text-sm font-black uppercase text-center w-20">Qty</th>
                            <th className="border border-green-900/30 px-4 py-3 text-sm font-black uppercase text-right w-32">Rate</th>
                            <th className="border border-green-900/30 px-4 py-3 text-sm font-black uppercase text-right w-32">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quote.items.map((item, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-green-50/30'}>
                                <td className="border border-gray-200 px-3 py-3 text-center font-bold text-gray-700">{index + 1}</td>
                                <td className="border border-gray-200 px-4 py-3 font-bold text-gray-800 text-sm">{item.description}</td>
                                <td className="border border-gray-200 px-3 py-3 text-center font-black text-gray-700 bg-green-50/50">{item.quantity}</td>
                                <td className="border border-gray-200 px-4 py-3 text-right bg-green-50/50">
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">NPR</div>
                                    <div className="font-black text-gray-700">{parseFloat(item.rate).toLocaleString()}</div>
                                </td>
                                <td className="border border-gray-200 px-4 py-3 text-right font-black text-gray-800">
                                    <div className="flex items-center justify-end gap-1">
                                        <span className="text-[10px] text-gray-400 font-bold">Rs.</span>
                                        {parseFloat(item.amount).toLocaleString()}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {/* Summary Block */}
                        <tr>
                            <td colSpan="3" rowSpan="5" className="border border-gray-200 bg-gray-50/20 p-4 align-top">
                                {quote.note && (
                                    <div className="text-xs">
                                        <span className="font-black text-gray-400 uppercase tracking-widest block mb-1">Notes:</span>
                                        <p className="text-gray-600 italic">{quote.note}</p>
                                    </div>
                                )}
                            </td>
                            <td className="bg-gray-800 text-white border border-gray-600 px-4 py-1.5 text-xs font-black uppercase tracking-wider">Sub total</td>
                            <td className="bg-gray-800 text-white border border-gray-600 px-4 py-1.5 text-right font-black text-sm">
                                Rs. {parseFloat(quote.taxable_amount).toLocaleString()}
                            </td>
                        </tr>
                        <tr>
                            <td className="bg-white text-gray-600 border border-gray-200 px-4 py-1.5 text-xs font-black uppercase tracking-wider">Non- Taxable</td>
                            <td className="bg-white text-gray-600 border border-gray-200 px-4 py-1.5 text-right font-black text-sm">
                                Rs. 0.00
                            </td>
                        </tr>
                        <tr>
                            <td className="bg-[#004d40] text-emerald-100 border border-green-900 px-4 py-1.5 text-xs font-black uppercase tracking-wider">Taxable</td>
                            <td className="bg-[#004d40] text-white border border-green-900 px-4 py-1.5 text-right font-black text-sm">
                                Rs. {parseFloat(quote.taxable_amount).toLocaleString()}
                            </td>
                        </tr>
                        <tr>
                            <td className="bg-white text-gray-600 border border-gray-200 px-4 py-1.5 text-xs font-black uppercase tracking-wider">VAT (13%)</td>
                            <td className="bg-white text-gray-600 border border-gray-200 px-4 py-1.5 text-right font-black text-sm text-[#c62828]">
                                Rs. {parseFloat(quote.vat_amount).toLocaleString()}
                            </td>
                        </tr>
                        <tr className="bg-[#004d40] text-white">
                            <td className="border border-green-900 px-4 py-2.5 text-sm font-black uppercase tracking-wider">Total Amount</td>
                            <td className="border border-green-900 px-4 py-2.5 text-right font-black text-lg">
                                Rs. {parseFloat(quote.total_amount).toLocaleString()}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Terms and Conditions */}
                <div className="bg-[#c8e6c9]/40 p-4 rounded-lg border-l-4 border-[#00a651] mb-12">
                    <ol className="text-[#c62828] text-[11px] font-black space-y-1 list-decimal ml-4">
                        <li>VAT is incurred if applicable.</li>
                        <li>Civil, Plumbing, Ducting, Gas Line and Electrical expenses is to be incurred by client.</li>
                        <li>Advance Payment: 70% of total payment before delivery and 30% after the delivery of goods.</li>
                    </ol>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 mt-20 px-4">
                    <div className="space-y-4">
                        <div className="h-px w-48 bg-gray-300 mb-2"></div>
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-400 text-xs uppercase tracking-widest">For:</span>
                            <span className="font-black text-[#004d40] text-sm font-montserrat tracking-tight underline">Novo Era Pvt Ltd</span>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end space-y-4">
                        <div className="h-px w-48 bg-gray-300 mb-2"></div>
                        <div className="flex flex-col items-end">
                            <span className="font-bold text-gray-400 text-xs uppercase tracking-widest text-right">For:</span>
                            <span className="font-black text-[#004d40] text-sm font-montserrat tracking-tight underline">{quote.customer_name}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="absolute bottom-4 left-0 right-0 px-12">
                    <div className="bg-[#004d40] text-white flex justify-between items-center px-8 py-2 rounded-lg font-black text-[11px] font-montserrat">
                        <div className="flex items-center gap-2">
                            (+977) 25-590238
                        </div>
                        <div className="flex items-center gap-2">
                            novoeranepal@gmail.com
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    body { background: white !important; }
                    .print\\:hidden { display: none !important; }
                    .print\\:shadow-none { shadow: none !important; }
                    .print\\:p-0 { padding: 0 !important; }
                    .print\\:border-0 { border: 0 !important; }
                }
            `}</style>
        </div>
    );
};

export default PrintQuotation;
