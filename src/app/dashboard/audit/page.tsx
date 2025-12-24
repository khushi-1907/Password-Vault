'use client';

import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { decryptData } from '@/lib/encryption';
import { generateAuditReport, AuditIssue } from '@/lib/audit';
import { useToast } from '@/context/ToastContext';

export default function AuditPage() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [issues, setIssues] = useState<AuditIssue[]>([]);
    const [masterPassword, setMasterPassword] = useState('');
    const [checkBreaches, setCheckBreaches] = useState(false);

    useEffect(() => {
        const storedKey = sessionStorage.getItem('vaultKey');
        if (storedKey) {
            setMasterPassword(storedKey);
        }
    }, []);

    const runAudit = async () => {
        if (!masterPassword) {
            showToast('Master password required', 'error');
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            const res = await fetch('/api/vault', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok) {
                // Decrypt passwords for analysis
                const decryptedItems = data.items.map((item: any) => ({
                    _id: item._id,
                    name: item.name,
                    password: decryptData(item.password, masterPassword),
                }));

                const auditResults = await generateAuditReport(decryptedItems, checkBreaches);
                setIssues(auditResults);
                showToast(`Audit complete: ${auditResults.length} issues found`, auditResults.length > 0 ? 'warning' : 'success');
            }
        } catch (error) {
            showToast('Audit failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const weakCount = issues.filter(i => i.type === 'weak').length;
    const reusedCount = issues.filter(i => i.type === 'reused').length;
    const breachedCount = issues.filter(i => i.type === 'breached').length;

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-0">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 md:gap-3">
                        <Shield className="w-7 h-7 md:w-8 md:h-8 text-blue-500" />
                        Security Audit
                    </h1>
                    <p className="text-xs md:text-base text-gray-400 mt-1 md:mt-2">Analyze your vault for security risks</p>
                </div>
                <button
                    onClick={runAudit}
                    disabled={loading}
                    className="flex items-center justify-center sm:justify-start gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-gray-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold shadow-lg transition-all text-sm md:text-base"
                >
                    <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Scanning...' : 'Run Audit'}
                </button>
            </div>

            {/* Options */}
            <div className="bg-[#141b26] border border-[#2d3748] rounded-xl p-4 md:p-6">
                <label className="flex items-start sm:items-center gap-2 md:gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={checkBreaches}
                        onChange={(e) => setCheckBreaches(e.target.checked)}
                        className="w-4 h-4 md:w-5 md:h-5 rounded bg-[#1b2431] border-[#2d3748] text-blue-600 focus:ring-blue-500 mt-0.5 sm:mt-0"
                    />
                    <div>
                        <div className="font-semibold text-sm md:text-base">Check for breached passwords</div>
                        <div className="text-xs md:text-sm text-gray-500">Uses Have I Been Pwned API (k-Anonymity, privacy-safe)</div>
                    </div>
                </label>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
                <div className="bg-[#141b26] border border-red-500/30 rounded-xl p-4 md:p-6">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <h3 className="text-xs md:text-sm font-bold text-gray-400 uppercase">Weak Passwords</h3>
                        <XCircle className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-red-500">{weakCount}</div>
                    <p className="text-xs text-gray-500 mt-1 md:mt-2">Less than 10 characters or no symbols</p>
                </div>

                <div className="bg-[#141b26] border border-orange-500/30 rounded-xl p-4 md:p-6">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <h3 className="text-xs md:text-sm font-bold text-gray-400 uppercase">Reused Passwords</h3>
                        <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-orange-500">{reusedCount}</div>
                    <p className="text-xs text-gray-500 mt-1 md:mt-2">Same password used multiple times</p>
                </div>

                <div className="bg-[#141b26] border border-purple-500/30 rounded-xl p-4 md:p-6">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <h3 className="text-xs md:text-sm font-bold text-gray-400 uppercase">Breached</h3>
                        <Shield className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-purple-500">{breachedCount}</div>
                    <p className="text-xs text-gray-500 mt-1 md:mt-2">Found in known data breaches</p>
                </div>
            </div>

            {/* Issues List */}
            {issues.length > 0 && (
                <div className="bg-[#141b26] border border-[#2d3748] rounded-xl overflow-hidden">
                    <div className="p-3 md:p-4 border-b border-[#2d3748]">
                        <h3 className="font-bold text-base md:text-lg">Security Issues</h3>
                    </div>
                    <div className="divide-y divide-[#2d3748] max-h-[500px] overflow-y-auto">
                        {issues.map((issue, idx) => (
                            <div key={idx} className="p-3 md:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 hover:bg-[#1b2431] transition-colors">
                                <div className="flex items-center gap-2 md:gap-4">
                                    {issue.type === 'weak' && <XCircle className="w-4 h-4 md:w-5 md:h-5 text-red-500 flex-shrink-0" />}
                                    {issue.type === 'reused' && <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-orange-500 flex-shrink-0" />}
                                    {issue.type === 'breached' && <Shield className="w-4 h-4 md:w-5 md:h-5 text-purple-500 flex-shrink-0" />}
                                    <div className="min-w-0">
                                        <div className="font-semibold text-sm md:text-base">{issue.name}</div>
                                        <div className="text-xs md:text-sm text-gray-500 capitalize">{issue.type} password</div>
                                    </div>
                                </div>
                                <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-bold flex-shrink-0 ${issue.severity === 'high' ? 'bg-red-500/10 text-red-500' :
                                        issue.severity === 'medium' ? 'bg-orange-500/10 text-orange-500' :
                                            'bg-yellow-500/10 text-yellow-500'
                                    }`}>
                                    {issue.severity.toUpperCase()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!loading && issues.length === 0 && (
                <div className="bg-[#141b26] border border-[#2d3748] rounded-xl p-8 md:p-20 flex flex-col items-center text-center">
                    <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-green-500 mb-3 md:mb-4" />
                    <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2">No issues found</h3>
                    <p className="text-sm md:text-base text-gray-500">Your vault is secure! Run an audit to check for vulnerabilities.</p>
                </div>
            )}
        </div>
    );
}
