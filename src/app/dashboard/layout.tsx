'use client';

import { useState } from 'react';
import { Shield, LayoutDashboard, Key, ShieldAlert, Settings, LogOut, Lock as LockIcon, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/');
    };

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Generator', icon: Key, path: '/dashboard/generator' },
        { name: 'Audit', icon: ShieldAlert, path: '/dashboard/audit' },
        { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
    ];

    return (
        <div className="flex h-screen bg-[#0a0e14] text-white overflow-hidden font-sans">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex md:w-64 bg-[#0a0e14] border-r border-[#2d3748] flex-col shrink-0">
                <div className="p-6 md:p-8 pb-8 md:pb-12">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#2563eb] p-1.5 rounded-lg">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-lg md:text-xl font-bold tracking-tight">VaultApp</span>
                    </div>
                </div>

                <nav className="flex-1 px-3 md:px-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-sm md:text-base ${pathname === item.path ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-900/20' : 'text-gray-400 hover:text-white hover:bg-[#141b26]'}`}
                        >
                            <item.icon className="w-5 h-5 shrink-0" />
                            <span className="hidden md:inline">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-3 md:p-4 border-t border-[#2d3748] space-y-2">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:text-red-300 font-semibold transition-colors text-sm md:text-base rounded-xl hover:bg-red-500/10"
                    >
                        <LockIcon className="w-5 h-5 shrink-0" />
                        <span className="hidden md:inline">Lock Vault</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:text-white font-semibold transition-colors text-sm md:text-base rounded-xl hover:bg-[#141b26]"
                    >
                        <LogOut className="w-5 h-5 shrink-0" />
                        <span className="hidden md:inline">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar */}
            {sidebarOpen && (
                <aside className="md:hidden absolute inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)}>
                    <div className="w-64 bg-[#0a0e14] border-r border-[#2d3748] flex flex-col h-full" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 pb-8 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-[#2563eb] p-1.5 rounded-lg">
                                    <Shield className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-lg font-bold tracking-tight">VaultApp</span>
                            </div>
                            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-[#141b26] rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <nav className="flex-1 px-4 space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${pathname === item.path ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-900/20' : 'text-gray-400 hover:text-white hover:bg-[#141b26]'}`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>

                        <div className="p-4 border-t border-[#2d3748] space-y-2">
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setSidebarOpen(false);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:text-red-300 font-semibold transition-colors rounded-xl hover:bg-red-500/10"
                            >
                                <LockIcon className="w-5 h-5" />
                                Lock Vault
                            </button>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setSidebarOpen(false);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:text-white font-semibold transition-colors rounded-xl hover:bg-[#141b26]"
                            >
                                <LogOut className="w-5 h-5" />
                                Logout
                            </button>
                        </div>
                    </div>
                </aside>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Header */}
                <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-10 border-b border-[#2d3748] shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden p-2 hover:bg-[#141b26] rounded-lg transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-lg md:text-xl font-bold">My Vault</h1>
                    </div>
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-400">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="hidden sm:inline">Synced</span>
                        </div>
                        <div className="w-9 md:w-10 h-9 md:h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs md:text-sm shadow-inner transition-transform hover:scale-105 cursor-pointer">
                            JD
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
