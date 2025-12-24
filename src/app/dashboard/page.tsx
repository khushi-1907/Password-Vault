'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, ExternalLink, Copy, Trash2, Edit3, Shield, Eye, EyeOff, X, Globe, User, Key, FileText, Check, Lock as LockIcon, Star, History } from 'lucide-react';
import { encryptData, decryptData } from '@/lib/encryption';
import { useToast } from '@/context/ToastContext';

interface VaultItem {
    _id: string;
    name: string;
    username: string;
    url: string;
    password: string;
    notes?: string;
    isFavorite: boolean;
    passwordHistory: string[];
    createdAt: string;
}

export default function DashboardPage() {
    const { showToast } = useToast();
    const [items, setItems] = useState<VaultItem[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
    const [masterPassword, setMasterPassword] = useState('');
    const [isMasterPasswordSet, setIsMasterPasswordSet] = useState(false);
    const [copiedId, setCopiedId] = useState('');
    const [showHistory, setShowHistory] = useState(false);

    const [newItem, setNewItem] = useState({
        name: '',
        username: '',
        password: '',
        url: '',
        notes: '',
        isFavorite: false,
    });

    useEffect(() => {
        const storedKey = sessionStorage.getItem('vaultKey');
        if (storedKey) {
            setMasterPassword(storedKey);
            setIsMasterPasswordSet(true);
        }
        fetchItems();
    }, []);

    const fetchItems = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch('/api/vault', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setItems(data.items);
            } else {
                showToast(data.error || 'Failed to fetch items', 'error');
            }
        } catch (error) {
            showToast('Network error', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFavorite = async (id: string, current: boolean) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/vault/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isFavorite: !current })
            });

            if (res.ok) {
                fetchItems();
                showToast(!current ? 'Added to favorites' : 'Removed from favorites');
            }
        } catch (error) {
            showToast('Action failed', 'error');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token || !masterPassword) return;

        const encryptedPassword = encryptData(newItem.password, masterPassword);
        const encryptedNotes = newItem.notes ? encryptData(newItem.notes, masterPassword) : '';

        const payload = {
            ...newItem,
            password: encryptedPassword,
            notes: encryptedNotes,
        };

        const url = editingItem ? `/api/vault/${editingItem._id}` : '/api/vault';
        const method = editingItem ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setIsModalOpen(false);
                setEditingItem(null);
                setNewItem({ name: '', username: '', password: '', url: '', notes: '', isFavorite: false });
                fetchItems();
                showToast(editingItem ? 'Item updated' : 'Saved to vault');
            } else {
                const data = await res.json();
                showToast(data.error || 'Save failed', 'error');
            }
        } catch (error) {
            showToast('Save failed', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        const token = localStorage.getItem('token');
        if (!token || !confirm('Are you sure you want to delete this item?')) return;

        try {
            const res = await fetch(`/api/vault/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchItems();
                showToast('Item deleted');
            }
        } catch (error) {
            showToast('Delete failed', 'error');
        }
    };

    const handleCopy = (encryptedPassword: string, id: string) => {
        try {
            const decrypted = decryptData(encryptedPassword, masterPassword);
            navigator.clipboard.writeText(decrypted);
            setCopiedId(id);
            showToast('Password copied to clipboard');
            setTimeout(() => setCopiedId(''), 2000);
        } catch (e) {
            showToast('Decryption failed', 'error');
        }
    };

    const filteredItems = useMemo(() => {
        return items.filter(item =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            (item.url && item.url.toLowerCase().includes(search.toLowerCase())) ||
            (item.username && item.username.toLowerCase().includes(search.toLowerCase()))
        );
    }, [items, search]);

    if (!isMasterPasswordSet) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <div className="bg-[#141b26] border border-[#2d3748] p-8 rounded-2xl w-full max-w-md shadow-2xl">
                    <div className="flex justify-center mb-6">
                        <div className="bg-blue-600/10 p-4 rounded-full">
                            <Shield className="w-10 h-10 text-blue-500" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-4">Unlock Your Vault</h2>
                    <p className="text-gray-400 text-center text-sm mb-6 leading-relaxed">
                        Enter your master password to decrypt your stored items.
                    </p>
                    <input
                        type="password"
                        placeholder="Master Password"
                        className="w-full bg-[#1b2431] border border-[#2d3748] rounded-xl py-3.5 px-4 mb-4 focus:ring-1 focus:ring-[#2563eb] outline-none transition-all"
                        value={masterPassword}
                        onChange={(e) => setMasterPassword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                sessionStorage.setItem('vaultKey', masterPassword);
                                setIsMasterPasswordSet(true);
                            }
                        }}
                    />
                    <button
                        onClick={() => {
                            sessionStorage.setItem('vaultKey', masterPassword);
                            setIsMasterPasswordSet(true);
                        }}
                        className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-4 rounded-xl shadow-lg transition-all"
                    >
                        Unlock Vault
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
                <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search vault..."
                        className="w-full bg-[#141b26] border border-[#2d3748] rounded-lg md:rounded-xl py-2.5 md:py-3.5 pl-10 md:pl-12 pr-4 text-sm md:text-base focus:ring-1 focus:ring-[#2563eb] outline-none transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => {
                        setEditingItem(null);
                        setNewItem({ name: '', username: '', password: '', url: '', notes: '', isFavorite: false });
                        setIsModalOpen(true);
                        setShowHistory(false);
                    }}
                    className="flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 md:px-6 py-2.5 md:py-3.5 rounded-lg md:rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all whitespace-nowrap text-sm md:text-base"
                >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">Add Item</span>
                    <span className="sm:hidden">Add</span>
                </button>
            </div>

            {/* List Header - Hidden on mobile */}
            <div className="hidden md:grid bg-[#141b26] border-b border-[#2d3748] p-4 text-xs font-bold uppercase tracking-widest text-gray-500 rounded-t-xl grid-cols-12 gap-4">
                <div className="col-span-4">Name</div>
                <div className="col-span-3">Username</div>
                <div className="col-span-3">URL</div>
                <div className="col-span-2 text-right">Actions</div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2563eb]"></div>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="bg-[#141b26] border border-[#2d3748] rounded-xl p-20 flex flex-col items-center justify-center text-center">
                    <div className="bg-gray-800/20 p-6 rounded-full mb-6">
                        <LockIcon className="w-12 h-12 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Your vault is empty</h3>
                    <p className="text-gray-500 max-w-sm mb-8">
                        Store your first password securely.
                    </p>
                </div>
            ) : (
                <>
                    {/* Desktop List View */}
                    <div className="hidden md:block bg-[#141b26] border border-[#2d3748] rounded-b-xl overflow-hidden divide-y divide-[#2d3748]">
                        {filteredItems.map((item) => (
                            <div key={item._id} className="grid grid-cols-12 gap-4 p-5 items-center hover:bg-[#1b2431] transition-colors group">
                                <div className="col-span-4 flex items-center gap-4">
                                    <button
                                        onClick={() => handleToggleFavorite(item._id, item.isFavorite)}
                                        className={`shrink-0 transition-colors ${item.isFavorite ? 'text-yellow-500' : 'text-gray-600 hover:text-gray-400'}`}
                                    >
                                        <Star className={`w-5 h-5 ${item.isFavorite ? 'fill-current' : ''}`} />
                                    </button>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 bg-[#2563eb]/20 text-[#2563eb]`}>
                                        {item.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="truncate">
                                        <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{item.name}</div>
                                        <div className="text-xs text-gray-500 truncate">{item.url || 'No URL'}</div>
                                    </div>
                                </div>
                                <div className="col-span-3 text-sm text-gray-400 truncate">
                                    {item.username || '-'}
                                </div>
                                <div className="col-span-3 text-sm text-blue-500 truncate">
                                    {item.url && (
                                        <a href={item.url.startsWith('http') ? item.url : `https://${item.url}`} target="_blank" className="hover:underline flex items-center gap-1.5">
                                            {item.url}
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                    {!item.url && '-'}
                                </div>
                                <div className="col-span-2 flex justify-end items-center gap-1">
                                    <button
                                        onClick={() => handleCopy(item.password, item._id)}
                                        title="Copy Password"
                                        className="p-2.5 rounded-lg hover:bg-[#2d3748] text-gray-400 hover:text-white transition-colors"
                                    >
                                        {copiedId === item._id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingItem(item);
                                            setNewItem({
                                                name: item.name,
                                                username: item.username || '',
                                                password: decryptData(item.password, masterPassword),
                                                url: item.url || '',
                                                notes: item.notes ? decryptData(item.notes, masterPassword) : '',
                                                isFavorite: item.isFavorite || false,
                                            });
                                            setIsModalOpen(true);
                                            setShowHistory(false);
                                        }}
                                        title="Edit"
                                        className="p-2.5 rounded-lg hover:bg-[#2d3748] text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        title="Delete"
                                        className="p-2.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                    {filteredItems.map((item) => (
                        <div key={item._id} className="bg-[#141b26] border border-[#2d3748] rounded-xl p-4 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <button
                                            onClick={() => handleToggleFavorite(item._id, item.isFavorite)}
                                            className={`shrink-0 transition-colors ${item.isFavorite ? 'text-yellow-500' : 'text-gray-600 hover:text-gray-400'}`}
                                        >
                                            <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-current' : ''}`} />
                                        </button>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 bg-[#2563eb]/20 text-[#2563eb]`}>
                                            {item.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="font-bold text-white truncate text-sm">{item.name}</div>
                                    </div>
                                    <div className="text-xs text-gray-500 truncate ml-8">{item.url || 'No URL'}</div>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <button
                                        onClick={() => handleCopy(item.password, item._id)}
                                        title="Copy Password"
                                        className="p-1.5 rounded-lg hover:bg-[#2d3748] text-gray-400 hover:text-white transition-colors"
                                    >
                                        {copiedId === item._id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingItem(item);
                                            setNewItem({
                                                name: item.name,
                                                username: item.username || '',
                                                password: decryptData(item.password, masterPassword),
                                                url: item.url || '',
                                                notes: item.notes ? decryptData(item.notes, masterPassword) : '',
                                                isFavorite: item.isFavorite || false,
                                            });
                                            setIsModalOpen(true);
                                            setShowHistory(false);
                                        }}
                                        title="Edit"
                                        className="p-1.5 rounded-lg hover:bg-[#2d3748] text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        title="Delete"
                                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                            {item.username && <div className="text-xs text-gray-400 bg-[#1b2431] rounded-lg p-2">👤 {item.username}</div>}
                            {item.notes && <div className="text-xs text-gray-400 bg-[#1b2431] rounded-lg p-2 line-clamp-2">📝 {decryptData(item.notes, masterPassword)}</div>}
                        </div>
                    ))}
                </div>
                </>
            )}

            {/* Floating Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#141b26] border border-[#2d3748] w-full max-w-lg md:max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="p-4 md:p-6 border-b border-[#2d3748] flex justify-between items-center text-white sticky top-0 bg-[#141b26] z-10">
                            <h2 className="text-lg md:text-xl font-bold">{editingItem ? 'Edit Item' : 'Add Item'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#1b2431] rounded-lg transition-colors shrink-0">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex bg-[#1b2431] p-1 gap-1 mx-4 md:mx-6 mt-4 md:mt-6 rounded-lg">
                            <button
                                onClick={() => setShowHistory(false)}
                                className={`flex-1 py-1.5 md:py-2 rounded-md text-xs font-bold transition-all ${!showHistory ? 'bg-[#2563eb] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                Details
                            </button>
                            {editingItem && (
                                <button
                                    onClick={() => setShowHistory(true)}
                                    className={`flex-1 py-1.5 md:py-2 rounded-md text-xs font-bold transition-all ${showHistory ? 'bg-[#2563eb] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                >
                                    History
                                </button>
                            )}
                        </div>

                        {showHistory && editingItem ? (
                            <div className="p-4 md:p-8 space-y-4 max-h-[400px] overflow-y-auto">
                                <h3 className="text-xs md:text-sm font-bold text-gray-500 uppercase flex items-center gap-2">
                                    <History className="w-4 h-4" /> Password History
                                </h3>
                                {(!editingItem.passwordHistory || editingItem.passwordHistory.length === 0) ? (
                                    <p className="text-gray-500 text-xs md:text-sm py-8 md:py-10 text-center italic">No previous passwords recorded.</p>
                                ) : (
                                    <div className="space-y-2 md:space-y-3">
                                        {editingItem.passwordHistory.slice().reverse().map((encryptedPass, idx) => (
                                            <div key={idx} className="bg-[#1b2431] border border-[#2d3748] p-3 md:p-4 rounded-xl flex justify-between items-center group">
                                                <div className="font-mono text-xs text-gray-400">
                                                    ••••••••••••
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const decrypted = decryptData(encryptedPass, masterPassword);
                                                        navigator.clipboard.writeText(decrypted);
                                                        showToast('Previous password copied');
                                                    }}
                                                    className="p-1.5 md:p-2 bg-[#2d3748] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:text-white text-gray-400"
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={handleSave} className="p-4 md:p-8 space-y-4 md:space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Item Name</label>
                                        <div className="relative">
                                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                required
                                                className="w-full bg-[#1b2431] border border-[#2d3748] rounded-xl py-2.5 md:py-3 pl-10 pr-4 outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium text-white text-sm md:text-base"
                                                value={newItem.name}
                                                onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                                placeholder="Google Account"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Website URL</label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                className="w-full bg-[#1b2431] border border-[#2d3748] rounded-xl py-2.5 md:py-3 pl-10 pr-4 outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium text-white text-sm md:text-base"
                                                value={newItem.url}
                                                onChange={e => setNewItem({ ...newItem, url: e.target.value })}
                                                placeholder="google.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Username</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                className="w-full bg-[#1b2431] border border-[#2d3748] rounded-xl py-2.5 md:py-3 pl-10 pr-4 outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium text-white text-sm md:text-base"
                                                value={newItem.username}
                                                onChange={e => setNewItem({ ...newItem, username: e.target.value })}
                                                placeholder="e.g. user123"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                required
                                                type="password"
                                                className="w-full bg-[#1b2431] border border-[#2d3748] rounded-xl py-2.5 md:py-3 pl-10 pr-4 outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium text-white text-sm md:text-base"
                                                value={newItem.password}
                                                onChange={e => setNewItem({ ...newItem, password: e.target.value })}
                                                placeholder="••••••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Notes</label>
                                    <textarea
                                        className="w-full bg-[#1b2431] border border-[#2d3748] rounded-xl py-2.5 md:py-3 px-4 outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium text-white min-h-[60px] md:min-h-[80px] text-sm md:text-base"
                                        value={newItem.notes}
                                        onChange={e => setNewItem({ ...newItem, notes: e.target.value })}
                                        placeholder="Add extra info..."
                                    />
                                </div>

                                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 md:pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-4 md:px-6 py-3 md:py-4 border border-[#2d3748] rounded-xl font-bold hover:bg-[#1b2431] transition-all text-white text-sm md:text-base"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 md:px-6 py-3 md:py-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all text-sm md:text-base"
                                    >
                                        {editingItem ? 'Update Item' : 'Save Item'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
