"use client";

import { useState, useMemo } from 'react';
import { Shield, Lock, Mail, Eye, EyeOff, AlertTriangle, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const passwordRequirements = useMemo(() => [
        { label: 'At least 8 characters', met: password.length >= 8 },
        { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
        { label: 'One lowercase letter', met: /[a-z]/.test(password) },
        { label: 'One number', met: /[0-9]/.test(password) },
        { label: 'One special character', met: /[^A-Za-z0-9]/.test(password) },
    ], [password]);

    const strength = useMemo(() => {
        if (!password) return 0;
        return passwordRequirements.filter(req => req.met).length;
    }, [passwordRequirements, password]);

    const strengthColor = strength <= 2 ? 'bg-red-500' : strength <= 4 ? 'bg-orange-500' : 'bg-green-500';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isLogin && strength < 5) {
            setMessage({ type: 'error', text: 'Please meet all password requirements.' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: isLogin ? 'Logged in successfully!' : 'Account created! You can now login.' });
                if (isLogin) {
                    localStorage.setItem('token', data.token);
                    sessionStorage.setItem('vaultKey', password);
                    router.push('/dashboard');
                } else {
                    setIsLogin(true);
                    setPassword('');
                }
            } else {
                setMessage({ type: 'error', text: data.error || 'Something went wrong' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#0a0e14] text-white font-sans">
            {/* Header */}
            <header className="flex justify-between items-center p-4 md:p-6 px-6 md:px-10">
                <div className="flex items-center gap-2">
                    <div className="bg-[#2563eb] p-1.5 rounded-lg">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg md:text-xl font-bold tracking-tight">VaultApp</span>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center p-3 md:p-8">
                <div className="w-full max-w-[360px] md:max-w-[580px] bg-[#141b26] rounded-2xl border border-[#2d3748] shadow-2xl overflow-hidden transition-all duration-300">
                    {/* Tabs */}
                    <div className="flex p-1 gap-1.5 bg-[#1b2431]">
                        <button
                            onClick={() => {
                                setIsLogin(true);
                                setMessage({ type: '', text: '' });
                            }}
                            className={`flex-1 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${isLogin ? 'bg-[#141b26] text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => {
                                setIsLogin(false);
                                setMessage({ type: '', text: '' });
                            }}
                            className={`flex-1 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${!isLogin ? 'bg-[#141b26] text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                        >
                            Sign Up
                        </button>
                    </div>

                    <div className="p-6 md:p-12 pt-8 md:pt-10 flex flex-col items-center">
                        {/* Icon */}
                        <div className="w-12 h-12 bg-[#1b2431] rounded-full flex items-center justify-center mb-6 border border-[#2d3748]">
                            <Shield className="w-6 h-6 text-[#2563eb]" />
                        </div>

                        <h1 className="text-2xl md:text-3xl font-bold mb-2">
                            {isLogin ? 'Welcome back' : 'Create Account'}
                        </h1>
                        <p className="text-gray-400 text-center text-sm md:text-base mb-8 max-w-[320px] md:max-w-none">
                            {isLogin
                                ? 'Enter your master password to decrypt your vault.'
                                : 'Choose a strong master password for your vault.'}
                        </p>

                        {message.text && (
                            <div className={`w-full p-3 rounded-lg mb-6 text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="w-full space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full bg-[#1b2431] border border-[#2d3748] rounded-xl py-2.5 md:py-3.5 pl-11 pr-4 text-sm md:text-base focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb] transition-all placeholder:text-gray-600"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Master Password
                                    </label>
                                    {isLogin && (
                                        <button type="button" className="text-xs font-semibold text-[#2563eb] hover:underline">
                                            Forgot Password?
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        className="w-full bg-[#1b2431] border border-[#2d3748] rounded-xl py-2.5 md:py-3.5 pl-11 pr-12 text-sm md:text-base focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb] transition-all placeholder:text-gray-600"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Password Strength Indicator for Signup */}
                                {!isLogin && password && (
                                    <div className="space-y-3 pt-2">
                                        <div className="flex gap-1 h-1.5 w-full">
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`flex-1 rounded-full transition-all duration-300 ${level <= strength ? strengthColor : 'bg-gray-800'}`}
                                                />
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                            {passwordRequirements.map((req, i) => (
                                                <div key={i} className="flex items-center gap-2 text-[11px] md:text-xs">
                                                    {req.met ? (
                                                        <Check className="w-3.5 h-3.5 text-green-500" />
                                                    ) : (
                                                        <X className="w-3.5 h-3.5 text-gray-500" />
                                                    )}
                                                    <span className={req.met ? 'text-green-500' : 'text-gray-500'}>
                                                        {req.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 md:py-4 rounded-xl text-sm md:text-base shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 group"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        {isLogin ? 'Access Vault' : 'Create Account'}
                                    </>
                                )}
                            </button>
                        </form>

                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setMessage({ type: '', text: '' });
                                setPassword('');
                            }}
                            className="mt-4 md:mt-6 w-full py-2.5 md:py-3.5 border border-[#2d3748] rounded-xl text-sm md:text-base font-semibold text-gray-300 hover:bg-[#1b2431] transition-all"
                        >
                            {isLogin ? 'Create New Account' : 'Existing User Login'}
                        </button>

                        {/* Warning Box */}
                        <div className="mt-6 md:mt-8 p-3 md:p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl flex gap-3">
                            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                            <p className="text-[12px] md:text-[13px] text-orange-200/80 leading-relaxed">
                                <span className="font-bold text-orange-400">Client-side Encryption:</span> We never see your password. If you lose your master password, your data cannot be recovered.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
