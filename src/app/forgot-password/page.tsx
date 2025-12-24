"use client";

import { useState } from 'react';
import { Shield, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';import { useToast } from '@/context/ToastContext';
export default function ForgotPasswordPage() {
    const { showToast } = useToast();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setSubmitted(true);
                showToast('Reset link sent! Check your email.', 'success');
            } else {
                showToast(data.error || 'Something went wrong', 'error');
            }
        } catch (err) {
            showToast('Network error. Please try again.', 'error');
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
                <div className="w-full max-w-[360px] md:max-w-[520px] bg-[#141b26] rounded-2xl border border-[#2d3748] shadow-2xl overflow-hidden">
                    <div className="p-6 md:p-12 pt-8 md:pt-10 flex flex-col items-center">
                        {/* Icon */}
                        <div className="w-12 h-12 bg-[#1b2431] rounded-full flex items-center justify-center mb-6 border border-[#2d3748]">
                            <Shield className="w-6 h-6 text-[#2563eb]" />
                        </div>

                        {!submitted ? (
                            <>
                                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                                    Forgot Password?
                                </h1>
                                <p className="text-gray-400 text-center text-sm md:text-base mb-8 max-w-[320px] md:max-w-none">
                                    Enter your email address and we'll send you a link to reset your password.
                                </p>

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

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 md:py-4 rounded-xl text-sm md:text-base shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            'Send Reset Link'
                                        )}
                                    </button>
                                </form>

                                <Link
                                    href="/"
                                    className="mt-6 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Login
                                </Link>
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 md:mb-6 border border-green-500/20">
                                    <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
                                </div>

                                <h1 className="text-xl md:text-3xl font-bold mb-1 md:mb-2">
                                    Check Your Email
                                </h1>
                                <p className="text-gray-400 text-center text-xs md:text-base mb-4 md:mb-8 max-w-[300px] md:max-w-none leading-relaxed">
                                    If an account exists for <span className="text-white font-semibold">{email}</span>, you will receive a password reset link shortly.
                                </p>

                                <div className="w-full p-3 md:p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg md:rounded-xl mb-4 md:mb-6">
                                    <p className="text-xs md:text-sm text-blue-200/80 leading-relaxed">
                                        <span className="font-bold text-blue-400">Note:</span> The reset link will expire in 1 hour for security reasons. If you don't see the email, check your spam folder.
                                    </p>
                                </div>

                                <Link
                                    href="/"
                                    className="w-full py-3 md:py-3.5 border border-[#2d3748] rounded-xl text-sm md:text-base font-semibold text-gray-300 hover:bg-[#1b2431] transition-all text-center"
                                >
                                    Return to Login
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
