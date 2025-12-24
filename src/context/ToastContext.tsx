'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, LucideIcon } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const icons: Record<ToastType, LucideIcon> = {
        success: CheckCircle,
        error: AlertCircle,
        info: Info,
        warning: AlertCircle,
    };

    const colors: Record<ToastType, string> = {
        success: 'border-green-500/50 bg-green-500/10 text-green-400',
        error: 'border-red-500/50 bg-red-500/10 text-red-400',
        info: 'border-blue-500/50 bg-blue-500/10 text-blue-400',
        warning: 'border-orange-500/50 bg-orange-500/10 text-orange-400',
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container - Responsive */}
            <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 md:bottom-6 md:right-6 z-[9999] flex flex-col gap-2 sm:gap-3 max-w-sm sm:max-w-md w-[calc(100%-1.5rem)] sm:w-auto px-3 sm:px-0">
                {toasts.map(toast => {
                    const Icon = icons[toast.type];
                    return (
                        <div
                            key={toast.id}
                            className={`flex items-start sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl border backdrop-blur-md shadow-lg sm:shadow-2xl animate-in slide-in-from-right-5 sm:slide-in-from-right-10 fade-in duration-300 text-xs sm:text-sm ${colors[toast.type]}`}
                        >
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 sm:mt-0" />
                            <p className="font-semibold flex-1 break-words">{toast.message}</p>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="p-0.5 sm:p-1 hover:bg-white/10 rounded-lg transition-colors shrink-0"
                            >
                                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
