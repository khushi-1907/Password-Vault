'use client';

import { useState, useEffect } from 'react';
import { Download, Upload, Settings, FileText, AlertCircle } from 'lucide-react';
import { decryptData } from '@/lib/encryption';
import { exportToCSV, importFromCSV, downloadCSV } from '@/lib/csv';
import { useToast } from '@/context/ToastContext';

export default function SettingsPage() {
    const { showToast } = useToast();
    const [masterPassword, setMasterPassword] = useState('');
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        const storedKey = sessionStorage.getItem('vaultKey');
        if (storedKey) {
            setMasterPassword(storedKey);
        }
    }, []);

    const handleExport = async () => {
        if (!masterPassword) {
            showToast('Master password required', 'error');
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/vault', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok) {
                // Decrypt items for export
                const decryptedItems = data.items.map((item: any) => ({
                    name: item.name,
                    username: item.username || '',
                    password: decryptData(item.password, masterPassword),
                    url: item.url || '',
                    notes: item.notes ? decryptData(item.notes, masterPassword) : '',
                }));

                const csv = exportToCSV(decryptedItems);
                downloadCSV(csv, `vault-export-${new Date().toISOString().split('T')[0]}.csv`);
                showToast('Vault exported successfully');
            }
        } catch (error) {
            showToast('Export failed', 'error');
        }
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !masterPassword) {
            showToast('Master password required', 'error');
            return;
        }

        setImporting(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const csvContent = e.target?.result as string;
                const items = importFromCSV(csvContent, masterPassword);

                // Upload each item to the vault
                const token = localStorage.getItem('token');
                let successCount = 0;

                for (const item of items) {
                    const res = await fetch('/api/vault', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(item)
                    });

                    if (res.ok) successCount++;
                }

                showToast(`Imported ${successCount} of ${items.length} items`);
            } catch (error) {
                showToast('Import failed', 'error');
            } finally {
                setImporting(false);
            }
        };

        reader.readAsText(file);
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 md:gap-3">
                    <Settings className="w-7 h-7 md:w-8 md:h-8 text-blue-500" />
                    Settings
                </h1>
                <p className="text-sm md:text-base text-gray-400 mt-1 md:mt-2">Manage your vault data and preferences</p>
            </div>

            {/* Import/Export Section */}
            <div className="bg-[#141b26] border border-[#2d3748] rounded-xl p-4 md:p-6 space-y-4 md:space-y-6">
                <div>
                    <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4">Data Management</h3>

                    <div className="space-y-3 md:space-y-4">
                        {/* Export */}
                        <div className="flex flex-col sm:flex-row sm:items-start gap-3 md:gap-4 p-3 md:p-4 bg-[#1b2431] rounded-xl border border-[#2d3748]">
                            <Download className="w-5 h-5 md:w-6 md:h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm md:text-base mb-1">Export Vault</h4>
                                <p className="text-xs md:text-sm text-gray-400 mb-2 md:mb-3">Download all your passwords as a CSV file (unencrypted)</p>
                                <button
                                    onClick={handleExport}
                                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-xs md:text-sm transition-all"
                                >
                                    Export to CSV
                                </button>
                            </div>
                        </div>

                        {/* Import */}
                        <div className="flex flex-col sm:flex-row sm:items-start gap-3 md:gap-4 p-3 md:p-4 bg-[#1b2431] rounded-xl border border-[#2d3748]">
                            <Upload className="w-5 h-5 md:w-6 md:h-6 text-green-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm md:text-base mb-1">Import Passwords</h4>
                                <p className="text-xs md:text-sm text-gray-400 mb-2 md:mb-3">Import from Chrome, Bitwarden, or generic CSV format</p>
                                <label className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-xs md:text-sm transition-all cursor-pointer inline-block text-center">
                                    {importing ? 'Importing...' : 'Choose CSV File'}
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleImport}
                                        disabled={importing}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Warning */}
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3 p-3 md:p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div className="text-xs md:text-sm">
                        <p className="font-semibold text-orange-500 mb-1">Security Notice</p>
                        <p className="text-gray-400">Exported CSV files contain your passwords in plaintext. Store them securely and delete after use.</p>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div className="bg-[#141b26] border border-[#2d3748] rounded-xl p-4 md:p-6">
                <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4">About VaultApp</h3>
                <div className="space-y-2 text-xs md:text-sm text-gray-400">
                    <p>Version 1.0.0</p>
                    <p>End-to-end encrypted password manager</p>
                    <p className="pt-2 text-xs">All encryption happens on your device. Your master password never leaves your browser.</p>
                </div>
            </div>
        </div>
    );
}
