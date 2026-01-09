import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo.png';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError('Access Denied: Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#f8fafc] font-nunito p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-green-50 rounded-full blur-3xl -mr-48 -mt-48 opacity-60"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#004d40]/5 rounded-full blur-3xl -ml-48 -mb-48 opacity-60"></div>

            <div className="w-full max-w-md z-10">
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-green-900/10 overflow-hidden border border-gray-100">
                    <div className="bg-[#004d40] p-12 text-center relative overflow-hidden flex flex-col items-center">
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <div className="absolute top-0 left-0 w-20 h-20 bg-white rounded-full -ml-10 -mt-10"></div>
                            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mb-20"></div>
                        </div>
                        {/* Logo - Large and centered */}
                        <div className="mb-10 transition-transform hover:scale-105 duration-500 bg-transparent flex items-center justify-center min-h-[120px]">
                            <img
                                src={logo}
                                alt="Novo Era Official Logo"
                                className="h-40 w-auto object-contain block"
                            />
                        </div>
                        <h1 className="text-2xl font-black text-white font-montserrat tracking-tight uppercase">Portal Access</h1>
                        <p className="text-green-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-80 underline decoration-green-500/30">Secure Authentication Protocol</p>
                    </div>

                    <div className="p-10">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-black uppercase tracking-tight animate-in shake duration-300 shadow-sm">
                                <div className="p-1.5 bg-red-100 rounded-lg"><Lock size={14} /></div>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1 group">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1 group-focus-within:text-[#00a651] transition-colors">Identification</label>
                                <div className="relative">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#00a651] transition-colors" size={18} />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none font-bold text-sm text-[#004d40] transition-all"
                                        placeholder="Username"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1 group">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1 group-focus-within:text-[#00a651] transition-colors">Security Token</label>
                                <div className="relative">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#00a651] transition-colors" size={18} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-14 pr-14 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none font-bold text-sm text-[#004d40] transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#00a651]"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-[#00a651] hover:bg-[#008148] text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl transition-all shadow-xl shadow-green-900/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 group"
                                >
                                    {isLoading ? 'Decrypting Access...' : (
                                        <>
                                            Explore Dashboard <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="p-8 bg-gray-50/50 border-t border-gray-50 text-center">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.1em]">Internal Systems © 2025 Novo Era Pvt Ltd</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
