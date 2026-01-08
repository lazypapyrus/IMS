import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { UserCheck, Shield, Plus, X, Key } from 'lucide-react';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isPassModalOpen, setIsPassModalOpen] = useState(false);

    // Create User State
    const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'VIEWER' });
    const [creating, setCreating] = useState(false);

    // Change Password State
    const [passUser, setPassUser] = useState(null); // The user being edited
    const [newPassword, setNewPassword] = useState('');
    const [changingPass, setChangingPass] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('users/');
            setUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch users");
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.patch(`users/${userId}/update_role/`, { role: newRole });
            fetchUsers();
        } catch (error) {
            alert("Failed to update role");
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await api.post('users/', newUser);
            alert("User created successfully");
            setIsCreateModalOpen(false);
            setNewUser({ username: '', email: '', password: '', role: 'VIEWER' });
            fetchUsers();
        } catch (error) {
            console.error("Failed to create user", error);
            alert("Failed to create user. Username might be taken.");
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
            alert(`Password for ${passUser.username} updated successfully`);
            setIsPassModalOpen(false);
        } catch (error) {
            alert("Failed to update password");
        } finally {
            setChangingPass(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                    <Shield size={32} className="text-yellow-500" /> Admin Panel
                </h2>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                    <Plus size={18} /> Create User
                </button>
            </div>

            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 block">
                <table className="w-full text-left">
                    <thead className="bg-gray-700 text-gray-300">
                        <tr>
                            <th className="p-4">Username</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Current Role</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-gray-750">
                                <td className="p-4 font-bold">{u.username}</td>
                                <td className="p-4 text-gray-400">{u.email}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold 
                                        ${u.role === 'ADMIN' ? 'bg-red-900 text-red-200' :
                                            u.role === 'EDITOR' ? 'bg-blue-900 text-blue-200' : 'bg-gray-600 text-gray-200'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="p-4 flex items-center gap-3">
                                    <select
                                        className="bg-gray-900 border border-gray-600 rounded p-1 text-sm h-8"
                                        value={u.role}
                                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                        disabled={u.username === 'admin'}
                                    >
                                        <option value="ADMIN">Admin</option>
                                        <option value="EDITOR">Editor</option>
                                        <option value="VIEWER">Viewer</option>
                                    </select>

                                    <button
                                        onClick={() => openPassModal(u)}
                                        className="text-gray-400 hover:text-white p-1 rounded border border-gray-600 hover:bg-gray-700"
                                        title="Change Password"
                                    >
                                        <Key size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create User Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700 relative">
                        <button onClick={() => setIsCreateModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-bold mb-4">Create New User</h3>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Username</label>
                                <input
                                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                                    value={newUser.username}
                                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                                    value={newUser.email}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Password</label>
                                <input
                                    type="password"
                                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Role</label>
                                <select
                                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="ADMIN">Admin</option>
                                    <option value="EDITOR">Editor</option>
                                    <option value="VIEWER">Viewer</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={creating}
                                className="w-full p-2 bg-blue-600 rounded hover:bg-blue-500 font-bold disabled:opacity-50"
                            >
                                {creating ? 'Creating...' : 'Create User'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {isPassModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-sm border border-gray-700 relative">
                        <button onClick={() => setIsPassModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-bold mb-4">Reset Password</h3>
                        <p className="text-sm text-gray-400 mb-4">Changing password for <b>{passUser?.username}</b>.</p>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">New Password</label>
                                <input
                                    type="password"
                                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={changingPass}
                                className="w-full p-2 bg-red-600 rounded hover:bg-red-500 font-bold disabled:opacity-50"
                            >
                                {changingPass ? 'Updating...' : 'Set New Password'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
