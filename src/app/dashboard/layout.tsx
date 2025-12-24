'use client';

import { Shield, LayoutDashboard, Key, ShieldAlert, Settings, LogOut, Lock as LockIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

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
            {/* Sidebar */}
            <aside className="w-64 bg-[#0a0e14] border-r border-[#2d3748] flex flex-col shrink-0">
                <div className="p-8 pb-12">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#2563eb] p-1.5 rounded-lg">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">VaultApp</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${pathname === item.path ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-900/20' : 'text-gray-400 hover:text-white hover:bg-[#141b26]'}`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-[#2d3748]">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:text-red-300 font-semibold transition-colors"
                    >
                        <LockIcon className="w-5 h-5" />
                        Lock Vault
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:text-white font-semibold transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Header */}
                <header className="h-20 flex items-center justify-between px-10 border-b border-[#2d3748] shrink-0">
                    <h1 className="text-xl font-bold">My Vault</h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            Synced
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm shadow-inner transition-transform hover:scale-105 cursor-pointer">
                            JD
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
