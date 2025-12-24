"use client";

import { useState, useEffect, useMemo } from 'react';
import { Shield, Lock, Eye, EyeOff, CheckCircle, AlertTriangle, Check, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';

export default function ResetPasswordClient() {
    const router = useRouter();
    const { showToast } = useToast();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [success, setSuccess] = useState(false);

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

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setTokenValid(false);
                setVerifying(false);
                showToast('No reset token provided', 'error');
                return;
            }

            try {
                const res = await fetch(`/api/auth/verify-reset-token?token=${token}`);
                const data = await res.json();

                if (data.valid) {
                    setTokenValid(true);
                } else {
                    setTokenValid(false);
                    showToast(data.error || 'Invalid or expired token', 'error');
                }
            } catch (err) {
                setTokenValid(false);
                showToast('Failed to verify token', 'error');
            } finally {
                setVerifying(false);
            }
        };

        verifyToken();
    }, [token, showToast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (strength < 5) {
            showToast('Please meet all password requirements.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showToast('Passwords do not match.', 'error');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                showToast('Password reset successful! Redirecting to login...', 'success');
                setTimeout(() => {
                    router.push('/');
                }, 3000);
            } else {
                showToast(data.error || 'Failed to reset password', 'error');
            }
        } catch (err) {
            showToast('Network error. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#0a0e14] text-white font-sans">
            <header className="flex justify-between items-center p-4 md:p-6 px-6 md:px-10">
                <div className="flex items-center gap-2">
                    <div className="bg-[#2563eb] p-1.5 rounded-lg">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg md:text-xl font-bold tracking-tight">VaultApp</span>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center p-3 md:p-8">
                <div className="w-full max-w-[360px] md:max-w-[580px] bg-[#141b26] rounded-2xl border border-[#2d3748] shadow-2xl overflow-hidden">
                    <div className="p-6 md:p-12 pt-8 md:pt-10 flex flex-col items-center">
                        {verifying ? (
                            <>
                                <div className="w-12 h-12 bg-[#1b2431] rounded-full flex items-center justify-center mb-6 border border-[#2d3748]">
                                    <div className="w-6 h-6 border-2 border-[#2563eb]/30 border-t-[#2563eb] rounded-full animate-spin" />
                                </div>
                                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                                    Verifying Token...
                                </h1>
                                <p className="text-gray-400 text-center text-sm md:text-base">
                                    Please wait while we verify your reset token.
                                </p>
                            </>
                        ) : !tokenValid ? (
                            <>
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4 md:mb-6 border border-red-500/20">
                                    <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
                                </div>
                                <h1 className="text-xl md:text-3xl font-bold mb-1 md:mb-2">
                                    Invalid Token
                                </h1>
                                <p className="text-gray-400 text-center text-xs md:text-base mb-6 md:mb-8 max-w-[300px] md:max-w-none leading-relaxed">
                                    This password reset link is invalid or has expired.
                                </p>
                                <Link
                                    href="/forgot-password"
                                    className="w-full py-3 md:py-3.5 bg-[#2563eb] hover:bg-[#1d4ed8] rounded-xl text-sm md:text-base font-semibold text-white transition-all text-center"
                                >
                                    Request New Reset Link
                                </Link>
                                <Link
                                    href="/"
                                    className="mt-4 w-full py-3 md:py-3.5 border border-[#2d3748] rounded-xl text-sm md:text-base font-semibold text-gray-300 hover:bg-[#1b2431] transition-all text-center"
                                >
                                    Back to Login
                                </Link>
                            </>
                        ) : success ? (
                            <>
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 md:mb-6 border border-green-500/20">
                                    <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
                                </div>
                                <h1 className="text-xl md:text-3xl font-bold mb-1 md:mb-2">
                                    Password Reset Successful!
                                </h1>
                                <p className="text-gray-400 text-center text-xs md:text-base mb-4 md:mb-8 max-w-[300px] md:max-w-none leading-relaxed">
                                    Your password has been reset successfully. Redirecting to login...
                                </p>
                                <div className="w-full p-3 md:p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg md:rounded-xl">
                                    <p className="text-xs md:text-sm text-orange-200/80 leading-relaxed">
                                        <span className="font-bold text-orange-400">Note:</span> Your vault has been cleared due to encryption key change. You can now login with your new password.
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 bg-[#1b2431] rounded-full flex items-center justify-center mb-6 border border-[#2d3748]">
                                    <Lock className="w-6 h-6 text-[#2563eb]" />
                                </div>

                                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                                    Reset Password
                                </h1>
                                <p className="text-gray-400 text-center text-sm md:text-base mb-8 max-w-[320px] md:max-w-none">
                                    Choose a new strong master password for your vault.
                                </p>

                                <form onSubmit={handleSubmit} className="w-full space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            New Password
                                        </label>
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

                                        {password && (
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

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="••••••••••••"
                                                className="w-full bg-[#1b2431] border border-[#2d3748] rounded-xl py-2.5 md:py-3.5 pl-11 pr-12 text-sm md:text-base focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb] transition-all placeholder:text-gray-600"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || strength < 5}
                                        className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 md:py-4 rounded-xl text-sm md:text-base shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                Reset Password
                                            </>
                                        )}
                                    </button>
                                </form>

                                <Link
                                    href="/"
                                    className="mt-6 w-full py-2.5 md:py-3.5 border border-[#2d3748] rounded-xl text-sm md:text-base font-semibold text-gray-300 hover:bg-[#1b2431] transition-all text-center"
                                >
                                    Cancel
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
