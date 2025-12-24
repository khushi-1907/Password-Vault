'use client';

import Generator from '@/components/Generator';
import { Lightbulb } from 'lucide-react';

export default function GeneratorPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <Generator />
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#141b26] border border-[#2d3748] p-6 rounded-2xl shadow-xl">
                        <div className="flex gap-4">
                            <div className="bg-yellow-500/10 p-3 rounded-xl h-fit">
                                <Lightbulb className="w-6 h-6 text-yellow-500" />
                            </div>
                            <div>
                                <h3 className="font-bold mb-2">Security Tip</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Enable 2FA on your most critical accounts like banking and email for an extra layer of protection.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#141b26] border border-[#2d3748] p-6 rounded-2xl shadow-xl">
                        <h3 className="font-bold mb-4">Password Best Practices</h3>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li className="flex gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                                Use at least 16 characters for critical accounts.
                            </li>
                            <li className="flex gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                                Avoid using look-alike characters (O and 0, l and 1).
                            </li>
                            <li className="flex gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                                Mix symbols and numbers sporadically.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
