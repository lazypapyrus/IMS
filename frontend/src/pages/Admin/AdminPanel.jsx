import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { UserCheck, Shield, Plus, X, Key, UserPlus, Lock, Mail, User, Fingerprint, ShieldAlert, ChevronRight } from 'lucide-react';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isPassModalOpen, setIsPassModalOpen] = useState(false);

    // Create User State
    const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'VIEWER' });
    const [creating, setCreating] = useState(false);

    // Change Password State
    const [passUser, setPassUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [changingPass, setChangingPass] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('users/');
            setUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch users");
        }
        setLoading(false);
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.patch(`users/${userId}/update_role/`, { role: newRole });
            fetchUsers();
        } catch (error) {
            alert("Security Protocol: Failed to update role elevation");
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await api.post('users/', newUser);
            setIsCreateModalOpen(false);
            setNewUser({ username: '', email: '', password: '', role: 'VIEWER' });
            fetchUsers();
        } catch (error) {
            alert("Error: Username identity already exists in system");
        } finally {
            setCreating(false);
        }
    };

    const openPassModal = (user) => {
        setPassUser(user);
        setNewPassword('');
        setIsPassModalOpen(true);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!passUser) return;
        setChangingPass(true);
        try {
            await api.post(`users/${passUser.id}/change_password/`, { password: newPassword });
            setIsPassModalOpen(false);
        } catch (error) {
            alert("Security Override: Failed to update credential");
        } finally {
            setChangingPass(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-64 text-teal-600 font-montserrat uppercase tracking-widest text-xs font-black">Scanning Identity Registry...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-nunito pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#004d40] font-montserrat tracking-tight flex items-center gap-3">
                        <ShieldAlert className="text-[#00a651]" size={28} />
                        Identity Management
                    </h1>
                    <p className="text-gray-500 text-sm">Control system access, roles and security credentials</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-[#00a651] hover:bg-[#008148] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-md active:scale-95"
                >
                    <UserPlus size={20} /> Provision New Identity
                </button>
            </div>

            {/* Registry Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#004d40] text-white">
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Authentication Profile</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Access Tier</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Elevate / Modify</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Credentials</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-green-50/20 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 font-black group-hover:text-[#00a651] group-hover:bg-white transition-all shadow-sm">
                                                {u.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-extrabold text-[#004d40] text-base">{u.username}</span>
                                                <span className="text-[10px] text-gray-400 font-bold lowercase flex items-center gap-1">
                                                    <Mail size={10} /> {u.email}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border
                                            ${u.role === 'ADMIN' ? 'bg-red-50 text-red-600 border-red-100' :
                                                u.role === 'EDITOR' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                    'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <select
                                            className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] transition-all"
                                            value={u.role}
                                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                            disabled={u.username === 'admin'}
                                        >
                                            <option value="ADMIN">System Administrator</option>
                                            <option value="EDITOR">Privileged Editor</option>
                                            <option value="VIEWER">Restricted Viewer</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button
                                            onClick={() => openPassModal(u)}
                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            title="Reset Security Credential"
                                        >
                                            <Fingerprint size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Identity Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white">
                        <div className="bg-[#004d40] p-8 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-black font-montserrat uppercase tracking-tight">Provision Identity</h3>
                                <p className="text-green-400 text-[10px] font-black uppercase tracking-widest opacity-80 mt-1">Direct System Enrollment</p>
                            </div>
                            <UserPlus size={32} className="opacity-20" />
                        </div>
                        <form onSubmit={handleCreateUser} className="p-10 space-y-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Identity Handle (Username)</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                    <input className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-transparent rounded-2xl outline-none font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[#00a651]/20 transition-all text-[#004d40]" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} required />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Encrypted Notification (Email)</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                    <input type="email" className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-transparent rounded-2xl outline-none font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[#00a651]/20 transition-all text-[#004d40]" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Master Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                    <input type="password" className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-transparent rounded-2xl outline-none font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[#00a651]/20 transition-all text-[#004d40]" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Access Protocol (Role)</label>
                                <select className="w-full px-5 py-3.5 bg-gray-50 border-transparent rounded-2xl outline-none font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[#00a651]/20 transition-all text-[#004d40] appearance-none" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                                    <option value="ADMIN">System Administrator</option>
                                    <option value="EDITOR">Privileged Editor</option>
                                    <option value="VIEWER">Restricted Viewer</option>
                                </select>
                            </div>
                            <div className="flex gap-4 pt-6">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-4 text-xs font-black uppercase text-gray-400 hover:text-gray-600 transition-colors">Discard</button>
                                <button type="submit" disabled={creating} className="flex-[1.5] py-4 bg-[#00a651] hover:bg-[#008148] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-900/20 active:scale-95 transition-all">Authorize User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {isPassModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white">
                        <div className="bg-red-600 p-8 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-black font-montserrat uppercase tracking-tight">Security Override</h3>
                                <p className="text-red-300 text-[10px] font-black uppercase tracking-widest opacity-80 mt-1">Identity Password Reset</p>
                            </div>
                            <Fingerprint size={32} className="opacity-20" />
                        </div>
                        <div className="p-8">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-tight mb-6">Updating credentials for: <span className="text-red-600 font-black">{passUser?.username}</span></p>
                            <form onSubmit={handleChangePassword} className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">New System Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                        <input type="password" className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-transparent rounded-2xl outline-none font-bold text-sm focus:bg-white focus:ring-2 focus:ring-red-500/20 transition-all text-[#004d40]" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setIsPassModalOpen(false)} className="flex-1 py-4 text-xs font-black uppercase text-gray-400 hover:text-gray-600">Cancel</button>
                                    <button type="submit" disabled={changingPass} className="flex-[1.5] py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-900/20 active:scale-95 transition-all">Force Reset</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
