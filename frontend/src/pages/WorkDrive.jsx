import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    HardDrive, Upload, FileText, Download, Trash2,
    Search, Filter, Plus, File, FolderOpen, MoreVertical,
    Clock, User, CheckCircle2, AlertCircle, X, Layers, Eye, Loader2
} from 'lucide-react';

const WorkDrive = () => {
    const [files, setFiles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showCatModal, setShowCatModal] = useState(false);

    // Preview States
    const [previewFile, setPreviewFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [previewLoading, setPreviewLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        file_type: '',
        details: '',
        file: null
    });

    const [newCatData, setNewCatData] = useState({ name: '' });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [fRes, cRes] = await Promise.all([
                api.get('workdrive/'),
                api.get('workdrive-categories/')
            ]);
            setFiles(fRes.data);
            setCategories(cRes.data);

            // Set default category if available
            if (cRes.data.length > 0) {
                const otherCat = cRes.data.find(c => c.slug === 'OTHER') || cRes.data[0];
                setFormData(prev => ({ ...prev, category: otherCat.id }));
            }
        } catch (error) {
            console.error("Error fetching WorkDrive data");
        } finally {
            setLoading(false);
        }
    };

    // Effect to handle file preview blob creation
    useEffect(() => {
        let objectUrl = '';
        if (previewFile) {
            setPreviewLoading(true);
            const fetchFile = async () => {
                try {
                    // Fetch the file as a blob to bypass "forced download" headers
                    const response = await fetch(previewFile.file);
                    const blob = await response.blob();
                    objectUrl = URL.createObjectURL(blob);
                    setPreviewUrl(objectUrl);
                } catch (err) {
                    console.error("Failed to load file for preview", err);
                } finally {
                    setPreviewLoading(false);
                }
            };
            fetchFile();
        } else {
            setPreviewUrl('');
            setPreviewLoading(false);
        }

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [previewFile]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, file, name: file.name });
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!formData.file || !formData.category) return;

        setUploading(true);
        const data = new FormData();
        data.append('file', formData.file);
        data.append('name', formData.name);
        data.append('category', formData.category);

        const selectedCat = categories.find(c => c.id === parseInt(formData.category));
        const fileTypeDisplay = selectedCat?.slug === 'OTHER' ? formData.file_type : selectedCat?.name;
        data.append('file_type', fileTypeDisplay || 'Document');

        data.append('details', formData.details);

        try {
            await api.post('workdrive/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const fRes = await api.get('workdrive/');
            setFiles(fRes.data);
            setShowUploadModal(false);
            const otherCat = categories.find(c => c.slug === 'OTHER') || categories[0];
            setFormData({ name: '', category: otherCat?.id || '', file_type: '', details: '', file: null });
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try {
            const slug = newCatData.name.toUpperCase().replace(/\s+/g, '_');
            const res = await api.post('workdrive-categories/', {
                name: newCatData.name,
                slug: slug,
                icon_name: 'Layers'
            });
            setCategories([...categories, res.data]);
            setFormData({ ...formData, category: res.data.id });
            setShowCatModal(false);
            setNewCatData({ name: '' });
        } catch (error) {
            alert("Failed to create category. It might already exist.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this archive?")) return;
        try {
            await api.delete(`workdrive/${id}/`);
            const fRes = await api.get('workdrive/');
            setFiles(fRes.data);
            if (previewFile?.id === id) setPreviewFile(null);
        } catch (error) {
            console.error("Delete failed");
        }
    };

    const filteredFiles = files.filter(f => {
        const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.details.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'ALL' || f.category === parseInt(filterCategory);
        return matchesSearch && matchesCategory;
    });

    const getFileIcon = (categorySlug) => {
        switch (categorySlug) {
            case 'QUOTATIONS': return <FileText className="text-blue-500" />;
            case 'LEDGERS': return <CheckCircle2 className="text-emerald-500" />;
            case 'BANK_DOCUMENTS': return <AlertCircle className="text-amber-500" />;
            default: return <File className="text-gray-400" />;
        }
    };

    const renderPreviewContent = () => {
        if (previewLoading) {
            return (
                <div className="flex flex-col items-center gap-4 py-20">
                    <Loader2 size={40} className="animate-spin text-[#00a651]" />
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading secured assets...</p>
                </div>
            );
        }

        if (!previewUrl) {
            return (
                <div className="py-20 text-center space-y-4">
                    <AlertCircle size={60} className="mx-auto text-amber-500" />
                    <p className="font-black text-[#004d40] uppercase tracking-widest text-xs">Failed to fetch asset for visualization</p>
                </div>
            );
        }

        const ext = previewFile.file.split('.').pop().toLowerCase();
        if (['pdf'].includes(ext)) {
            return <iframe src={previewUrl} className="w-full h-[70vh] rounded-2xl border-0 bg-white shadow-inner" />;
        }
        if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)) {
            return <img src={previewUrl} alt={previewFile.name} className="max-w-full max-h-[70vh] mx-auto rounded-2xl shadow-lg object-contain bg-white" />;
        }

        return (
            <div className="py-20 text-center space-y-4">
                <File size={60} className="mx-auto text-gray-200" />
                <p className="font-black text-[#004d40] uppercase tracking-widest text-xs">Direct Visualization Not Supported for this Format</p>
                <a href={previewFile.file} target="_blank" rel="noreferrer" className="inline-block bg-[#00a651] text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-green-900/20 active:scale-95 transition-all">Download Asset to View</a>
            </div>
        );
    };

    if (loading) return <div className="flex items-center justify-center h-64 text-teal-600 font-montserrat uppercase tracking-widest text-xs font-black">Decrypting WorkDrive Archives...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-nunito pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#004d40] font-montserrat tracking-tight flex items-center gap-3">
                        <HardDrive className="text-[#00a651]" size={28} />
                        WorkDrive Repositories
                    </h1>
                    <p className="text-gray-500 text-sm">Secure vault for all organizational documents and validated records</p>
                </div>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-[#00a651] hover:bg-[#008148] text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-green-900/10 active:scale-95"
                >
                    <Upload size={18} /> Deploy Archive
                </button>
            </div>

            {/* Stats/Quick View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <button
                    onClick={() => setFilterCategory('ALL')}
                    className={`p-5 rounded-[2rem] border transition-all text-left ${filterCategory === 'ALL'
                        ? 'bg-[#004d40] text-white border-transparent shadow-xl scale-[1.02]'
                        : 'bg-white text-gray-600 border-gray-100 hover:border-green-200'
                        }`}
                >
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Vault Index</div>
                    <div className="text-2xl font-black font-montserrat">{files.length}</div>
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setFilterCategory(cat.id.toString())}
                        className={`p-5 rounded-[2rem] border transition-all text-left group ${filterCategory === cat.id.toString()
                            ? 'bg-white text-[#00a651] border-[#00a651] shadow-xl scale-[1.02]'
                            : 'bg-white text-gray-500 border-gray-100 hover:border-green-100'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">{cat.name}</div>
                            <Layers size={12} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-2xl font-black font-montserrat">
                            {files.filter(f => f.category === cat.id).length}
                        </div>
                    </button>
                ))}
            </div>

            {/* Browser Section */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/20">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input
                            type="text"
                            placeholder="Identify a document in vault..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-5 py-3.5 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none text-sm font-bold transition-all text-[#004d40]"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#004d40] text-white">
                                <th className="px-8 py-5 font-bold text-xs uppercase tracking-wider">Archive Identifier</th>
                                <th className="px-8 py-5 font-bold text-xs uppercase tracking-wider">Classification</th>
                                <th className="px-8 py-5 font-bold text-xs uppercase tracking-wider">Upload Metadata</th>
                                <th className="px-8 py-5 font-bold text-xs uppercase tracking-wider text-right">Access</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredFiles.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20 grayscale">
                                            <FolderOpen size={64} />
                                            <p className="font-black uppercase tracking-widest text-sm">Registry is currently empty</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredFiles.map((f) => (
                                    <tr key={f.id} className="hover:bg-green-50/20 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-white transition-all shadow-sm">
                                                    {getFileIcon(f.category_slug)}
                                                </div>
                                                <div>
                                                    <div className="font-extrabold text-[#004d40] text-base">{f.name}</div>
                                                    <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">
                                                        EXT: {(f.file.split('.').pop() || 'dat').toUpperCase()}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-[#00a651] bg-[#00a651]/5 border border-[#00a651]/10 self-start px-3 py-1 rounded-full uppercase tracking-tighter">
                                                    {f.file_type}
                                                </span>
                                                <p className="text-xs text-gray-400 mt-2 line-clamp-1 font-medium italic">"{f.details}"</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-gray-400">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase">
                                                    <Clock size={12} className="text-[#00a651]" />
                                                    {new Date(f.uploaded_at).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-300">
                                                    <User size={12} />
                                                    UID: {f.uploaded_by_name}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setPreviewFile(f)}
                                                    className="p-3 text-gray-400 hover:text-blue-500 hover:bg-white hover:shadow-md rounded-2xl transition-all"
                                                    title="Visualize Asset"
                                                >
                                                    <Eye size={20} />
                                                </button>
                                                <a
                                                    href={f.file}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-3 text-gray-400 hover:text-[#00a651] hover:bg-white hover:shadow-md rounded-2xl transition-all"
                                                    title="Download Asset"
                                                >
                                                    <Download size={20} />
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(f.id)}
                                                    className="p-3 text-gray-300 hover:text-red-500 hover:bg-white hover:shadow-md rounded-2xl transition-all"
                                                    title="Permanently Delete"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white">
                        <div className="bg-[#004d40] p-10 text-white relative overflow-hidden">
                            <div className="z-10 relative">
                                <h1 className="text-2xl font-black font-montserrat tracking-tight">Vault Submission</h1>
                                <p className="text-green-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-80">Syncing External Asset to Drive</p>
                            </div>
                            <Upload size={80} className="absolute -right-5 -bottom-5 text-white/5 rotate-12" />
                        </div>

                        <form onSubmit={handleUpload} className="p-10 space-y-6">
                            <div
                                className="border-2 border-dashed border-gray-100 bg-gray-50/30 rounded-3xl p-8 text-center hover:border-[#00a651] hover:bg-green-50/10 transition-all cursor-pointer group"
                                onClick={() => document.getElementById('file-input').click()}
                            >
                                <input type="file" id="file-input" className="hidden" onChange={handleFileChange} required />
                                <div className="p-4 bg-white rounded-2xl shadow-sm inline-flex mb-4 group-hover:scale-110 transition-transform">
                                    <Upload className="text-[#00a651]" size={28} />
                                </div>
                                <p className="text-sm font-black text-[#004d40] line-clamp-1">
                                    {formData.file ? formData.file.name : "Select Asset for Upload"}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Supports all encrypted file formats</p>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400">Archive Classification</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowCatModal(true)}
                                        className="text-[10px] font-black uppercase text-[#00a651] hover:underline"
                                    >
                                        + Quick Add
                                    </button>
                                </div>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl outline-none font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] transition-all text-[#004d40] appearance-none"
                                >
                                    <option value="">Select Folder Category...</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {categories.find(c => c.id === parseInt(formData.category))?.slug === 'OTHER' && (
                                <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Custom Reference Tag</label>
                                    <input
                                        type="text"
                                        value={formData.file_type}
                                        onChange={(e) => setFormData({ ...formData, file_type: e.target.value })}
                                        placeholder="e.g. Tax Statement, Contract"
                                        className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl outline-none font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] transition-all text-[#004d40]"
                                        required
                                    />
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Encryption Memo / Details</label>
                                <textarea
                                    value={formData.details}
                                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                    placeholder="Annotate this file for future retrieval..."
                                    className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl outline-none font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] transition-all text-[#004d40] min-h-[100px] resize-none"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    className="flex-1 py-4 text-xs font-black uppercase text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-[2] bg-[#00a651] hover:bg-[#008148] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-green-900/20 disabled:opacity-50 active:scale-95"
                                >
                                    {uploading ? "Analyzing & Encrypting..." : "Transmit to Vault"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {previewFile && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-gray-900/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col h-full max-h-[90vh]">
                        <div className="bg-[#004d40] px-8 py-5 text-white flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-xl font-black font-montserrat tracking-tight leading-none">{previewFile.name}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-green-400 px-2 py-0.5 bg-green-900/40 rounded">{previewFile.file_type}</span>
                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">Vault Reference #{previewFile.id}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={previewFile.file}
                                    download
                                    className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                                    title="Download Locally"
                                >
                                    <Download size={20} />
                                </a>
                                <button
                                    onClick={() => setPreviewFile(null)}
                                    className="p-3 bg-red-500/10 text-red-100 hover:bg-red-500 rounded-2xl transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto p-1 bg-gray-50 flex items-center justify-center">
                            {renderPreviewContent()}
                        </div>
                        <div className="p-8 bg-white border-t border-gray-100 shrink-0">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Archive Details / Narration</p>
                                    <p className="text-sm font-bold text-[#004d40] max-w-2xl">{previewFile.details || "No secondary annotations provided for this asset."}</p>
                                </div>
                                <div className="flex items-center gap-4 text-right">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Custodian</p>
                                        <p className="text-xs font-extrabold text-[#004d40] mt-0.5">{previewFile.uploaded_by_name}</p>
                                    </div>
                                    <div className="w-px h-8 bg-gray-100"></div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Entry Date</p>
                                        <p className="text-xs font-extrabold text-[#004d40] mt-0.5">{new Date(previewFile.uploaded_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Category Modal */}
            {showCatModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white">
                        <div className="bg-[#004d40] p-8 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-black font-montserrat uppercase tracking-tight">Provision Folder</h3>
                                <p className="text-green-400 text-[10px] font-black uppercase tracking-widest opacity-80">Protocol Addendum</p>
                            </div>
                            <Layers size={32} className="opacity-20" />
                        </div>
                        <form onSubmit={handleCreateCategory} className="p-8 space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Category Identifier</label>
                                <input
                                    className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl outline-none font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[#00a651]/20 transition-all text-[#004d40]"
                                    placeholder="e.g. Legal Documents"
                                    value={newCatData.name}
                                    onChange={e => setNewCatData({ name: e.target.value })}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setShowCatModal(false)} className="flex-1 py-4 text-xs font-black uppercase text-gray-400 hover:text-gray-600">Close</button>
                                <button type="submit" className="flex-[2] py-4 bg-[#00a651] hover:bg-[#008148] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Enroll Category</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkDrive;
