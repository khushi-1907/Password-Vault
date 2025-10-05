import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { decryptToObject, encryptObject } from "../lib/crypto";
import useClipboard from "../hooks/useClipboard";
import PasswordGenerator from "../components/PasswordGenerator";

type VaultItem = {
  id: string;
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
};

export default function VaultPage() {
  const { token, key } = useAuth();
  const [itemsEnc, setItemsEnc] = useState<any[]>([]);
  const [items, setItems] = useState<VaultItem[]>([]);
  const [q, setQ] = useState("");
  const [showGenerator, setShowGenerator] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [copiedField, setCopiedField] = useState<{id: string, field: string} | null>(null);

  const [form, setForm] = useState({
    title: "",
    username: "",
    password: "",
    url: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState("");

  // Fetch encrypted items
  const fetchItems = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get("/api/vault/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItemsEnc(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [token]);

  // Decrypt items client-side
  useEffect(() => {
    if (!key) return;
    (async () => {
      const decs = await Promise.all(
        itemsEnc.map(async (it) => {
          try {
            const obj = await decryptToObject(it.ciphertext, it.iv, key);
            return { id: it.id, ...obj };
          } catch {
            return null;
          }
        })
      );
      setItems(decs.filter(Boolean) as VaultItem[]);
    })();
  }, [itemsEnc, key]);

  const filtered = items.filter((it) => {
    const qq = q.toLowerCase();
    return (
      !q ||
      it.title.toLowerCase().includes(qq) ||
      it.username?.toLowerCase().includes(qq) ||
      it.url?.toLowerCase().includes(qq)
    );
  });

  const addItem = async () => {
    if (!key || !token) return;
    setLoading(true);
    try {
      const { ciphertext, iv } = await encryptObject(form, key);
      await axios.post(
        "/api/vault/create",
        { ciphertext, iv },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setForm({ title: "", username: "", password: "", url: "", notes: "" });
      setFlash("🎉 Item added successfully!");
      setShowForm(false);
      fetchItems();
      setTimeout(() => setFlash(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!token) return;
    setLoading(true);
    try {
      await axios.delete("/api/vault/delete", {
        headers: { Authorization: `Bearer ${token}` },
        data: { id },
      });
      setFlash("🗑️ Item deleted!");
      fetchItems();
      setTimeout(() => setFlash(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ title: "", username: "", password: "", url: "", notes: "" });
    setShowForm(false);
    setShowGenerator(false);
  };

  const togglePasswordVisibility = (itemId: string) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (text: string, itemId: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField({ id: itemId, field });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getCopyButtonText = (itemId: string, field: string) => {
    if (copiedField?.id === itemId && copiedField?.field === field) {
      return "Copied!";
    }
    return field === 'username' ? "Copy User" : "Copy Pass";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-red-900 text-white p-3 xs:p-4 sm:p-6 md:p-8">
      {/* Flash Message */}
      {flash && (
        <div className="fixed top-3 xs:top-4 left-1/2 transform -translate-x-1/2 z-50 w-full px-3 xs:px-4 max-w-xs xs:max-w-sm sm:max-w-md">
          <div className="bg-gray-900 border border-gray-700 text-white px-4 xs:px-6 py-2 xs:py-3 rounded-2xl shadow-2xl animate-fade-in text-sm xs:text-base w-full">
            {flash}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col xs:flex-row justify-between items-center gap-4 mb-6 sm:mb-8">
          <div className="text-center xs:text-left w-full xs:w-auto">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent break-words">
              🔒 Your Vault
            </h1>
            <p className="text-gray-300 mt-1 xs:mt-2 text-sm xs:text-base">
              {items.length} item{items.length !== 1 ? 's' : ''} secured
            </p>
          </div>
          
          <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 w-full xs:w-auto">
            {/* Search */}
            <div className="relative w-full xs:w-48 sm:w-56 md:w-64">
              <input
                className="bg-gray-900 border border-gray-700 text-white p-2 xs:p-3 pl-8 xs:pl-10 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all placeholder-gray-400 text-sm xs:text-base"
                placeholder="Search vault..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <div className="absolute left-2 xs:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm xs:text-base">
                🔍
              </div>
            </div>

            {/* Add Item Button */}
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold px-4 xs:px-6 py-2 xs:py-3 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 text-sm xs:text-base w-full xs:w-auto"
            >
              <span>+</span>
              <span className="whitespace-nowrap">New Item</span>
            </button>
          </div>
        </div>

        {/* Add Item Form - Slide Down */}
        {showForm && (
          <div className="bg-gray-900 border border-gray-700 p-4 xs:p-6 rounded-2xl xs:rounded-3xl shadow-2xl mb-6 sm:mb-8 animate-slide-down">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
              <input
                className="bg-gray-800 border border-gray-700 text-white p-2 xs:p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all placeholder-gray-400 text-sm xs:text-base"
                placeholder="Title *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <input
                className="bg-gray-800 border border-gray-700 text-white p-2 xs:p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all placeholder-gray-400 text-sm xs:text-base"
                placeholder="Username/Email"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
              <div className="flex gap-2 sm:col-span-2">
                <input
                  className="bg-gray-800 border border-gray-700 text-white p-2 xs:p-3 rounded-xl flex-1 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all placeholder-gray-400 text-sm xs:text-base"
                  placeholder="Password *"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  type={showGenerator ? "text" : "password"}
                />
   <button
  type="button"
  className="bg-pink-500 hover:bg-pink-600 text-white px-2 xs:px-3 sm:px-4 py-2 xs:py-3 rounded-xl transition font-semibold whitespace-nowrap text-xs xs:text-sm sm:text-base min-w-[80px] xs:min-w-[90px] sm:min-w-[100px]"
  onClick={() => setShowGenerator(!showGenerator)}
>
  🎲 Generate
</button>
              </div>
              <input
                className="bg-gray-800 border border-gray-700 text-white p-2 xs:p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all placeholder-gray-400 text-sm xs:text-base"
                placeholder="URL"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
              <div className="sm:col-span-2">
                <textarea
                  className="bg-gray-800 border border-gray-700 text-white p-2 xs:p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all placeholder-gray-400 text-sm xs:text-base"
                  placeholder="Notes"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>

            {showGenerator && (
              <div className="mt-3 xs:mt-4">
                <PasswordGenerator
                  onPick={(pw) => setForm({ ...form, password: pw })}
                />
              </div>
            )}

            <div className="flex flex-col xs:flex-row gap-3 mt-4 xs:mt-6">
              <button
                type="button"
                className={`flex-1 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white p-2 xs:p-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex justify-center items-center gap-2 text-sm xs:text-base ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                onClick={addItem}
                disabled={loading || !form.title || !form.password}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 xs:h-5 xs:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <span>Adding...</span>
                  </>
                ) : (
                  "💾 Save Item"
                )}
              </button>
              <button
                type="button"
                className="bg-gray-800 hover:bg-gray-700 text-white p-2 xs:p-3 rounded-xl font-semibold transition-all duration-300 px-4 xs:px-6 text-sm xs:text-base"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Vault Items Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 xs:py-16">
            <div className="text-4xl xs:text-5xl sm:text-6xl mb-3 xs:mb-4">🔒</div>
            <h3 className="text-xl xs:text-2xl font-semibold text-gray-300 mb-1 xs:mb-2">
              {items.length === 0 ? "Your vault is empty" : "No items found"}
            </h3>
            <p className="text-gray-400 mb-4 xs:mb-6 text-sm xs:text-base px-4">
              {items.length === 0 
                ? "Get started by adding your first secure item" 
                : "Try adjusting your search terms"}
            </p>
            {items.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold px-6 xs:px-8 py-2 xs:py-3 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 text-sm xs:text-base"
              >
                Add Your First Item
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xs:gap-5 sm:gap-6">
            {filtered.map((it) => (
              <div
                key={it.id}
                className="bg-gray-900 border border-gray-700 rounded-2xl xs:rounded-3xl p-4 xs:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
              >
                {/* Item Header */}
                <div className="flex justify-between items-start mb-3 xs:mb-4">
                  <h3 className="font-bold text-lg xs:text-xl text-white truncate flex-1 mr-2">
                    {it.title}
                  </h3>
                  <button
                    onClick={() => deleteItem(it.id)}
                    className="opacity-0 group-hover:opacity-100 bg-red-500/20 hover:bg-red-500/30 text-red-300 p-1 xs:p-2 rounded-xl transition-all duration-300 text-sm"
                    title="Delete item"
                  >
                    🗑️
                  </button>
                </div>

                {/* Item Content */}
                <div className="space-y-2 xs:space-y-3 mb-3 xs:mb-4">
                  {it.username && (
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wide">Username</label>
                      <div className="text-gray-200 truncate font-mono text-xs xs:text-sm">{it.username}</div>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wide">Password</label>
                    <div className="flex items-center gap-2">
                      <div className="text-gray-100 font-mono text-xs xs:text-sm truncate flex-1">
                        {visiblePasswords.has(it.id) ? it.password : '••••••••••'}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => togglePasswordVisibility(it.id)}
                          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 p-1 xs:p-2 rounded-xl transition-all duration-300 text-sm"
                          title={visiblePasswords.has(it.id) ? "Hide password" : "Show password"}
                        >
                          {visiblePasswords.has(it.id) ? "👁️‍🗨️" : "👁️"}
                        </button>
                        <button
                          onClick={() => copyToClipboard(it.password, it.id, 'password')}
                          className="bg-green-500/20 hover:bg-green-500/30 text-green-300 p-1 xs:p-2 rounded-xl transition-all duration-300 text-sm"
                          title="Copy password"
                        >
                          {copiedField?.id === it.id && copiedField?.field === 'password' ? "✅" : "📋"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {it.url && (
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wide">URL</label>
                      <div className="text-blue-300 truncate text-xs xs:text-sm">
                        <a href={it.url} target="_blank" rel="noopener noreferrer" className="hover:underline break-all">
                          {it.url.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    </div>
                  )}

                  {it.notes && (
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wide">Notes</label>
                      <div className="text-gray-300 text-xs xs:text-sm line-clamp-2 break-words">{it.notes}</div>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 pt-3 xs:pt-4 border-t border-gray-700">
                  <button
                    onClick={() => copyToClipboard(it.username, it.id, 'username')}
                    className={`flex-1 py-1 xs:py-2 rounded-xl text-xs xs:text-sm transition-all duration-300 ${
                      copiedField?.id === it.id && copiedField?.field === 'username'
                        ? 'bg-green-500/30 text-green-300'
                        : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300'
                    }`}
                  >
                    {getCopyButtonText(it.id, 'username')}
                  </button>
                  <button
                    onClick={() => copyToClipboard(it.password, it.id, 'password')}
                    className={`flex-1 py-1 xs:py-2 rounded-xl text-xs xs:text-sm transition-all duration-300 ${
                      copiedField?.id === it.id && copiedField?.field === 'password'
                        ? 'bg-green-500/30 text-green-300'
                        : 'bg-green-500/20 hover:bg-green-500/30 text-green-300'
                    }`}
                  >
                    {getCopyButtonText(it.id, 'password')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}