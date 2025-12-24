'use client';

import { useState, useCallback, useEffect } from 'react';
import { Copy, RefreshCw, Check } from 'lucide-react';

interface GeneratorOptions {
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
    [key: string]: boolean;
}

export default function Generator() {
    const [password, setPassword] = useState('');
    const [length, setLength] = useState(16);
    const [options, setOptions] = useState<GeneratorOptions>({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
    });
    const [copied, setCopied] = useState(false);

    const generatePassword = useCallback(() => {
        const charset = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
        };

        let characters = '';
        if (options.uppercase) characters += charset.uppercase;
        if (options.lowercase) characters += charset.lowercase;
        if (options.numbers) characters += charset.numbers;
        if (options.symbols) characters += charset.symbols;

        if (!characters) return;

        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        setPassword(result);
    }, [length, options]);

    useEffect(() => {
        generatePassword();
    }, [generatePassword]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const strength = length < 8 ? 'Weak' : length < 12 ? 'Fair' : length < 16 ? 'Strong' : 'Excellent';
    const strengthColor = length < 8 ? 'bg-red-500' : length < 12 ? 'bg-orange-500' : length < 16 ? 'bg-green-500' : 'bg-blue-500';

    return (
        <div className="bg-[#141b26] border border-[#2d3748] rounded-2xl p-6 md:p-8 w-full shadow-xl">
            <div className="flex items-center gap-3 mb-8">
                <RefreshCw className="w-5 h-5 text-[#2563eb]" />
                <h2 className="text-xl font-bold">Generator</h2>
            </div>

            <div className="relative mb-6">
                <div className="bg-[#1b2431] border border-[#2d3748] rounded-xl p-5 text-center text-xl md:text-2xl font-mono tracking-wider break-all pr-14 min-h-[72px] flex items-center justify-center">
                    {password}
                </div>
                <button
                    onClick={copyToClipboard}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-[#2d3748] rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                    {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
            </div>

            <div className="space-y-6">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-gray-400">
                    <span>Strength</span>
                    <span className={strength === 'Weak' ? 'text-red-500' : strength === 'Fair' ? 'text-orange-500' : 'text-green-500'}>
                        {strength}
                    </span>
                </div>
                <div className="w-full h-1.5 bg-[#1b2431] rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ${strengthColor}`}
                        style={{ width: `${(Math.min(length, 20) / 20) * 100}%` }}
                    />
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-400">Length</span>
                    <span className="bg-[#1b2431] px-3 py-1 rounded-md text-sm font-bold border border-[#2d3748]">{length}</span>
                </div>
                <input
                    type="range"
                    min="4"
                    max="64"
                    value={length}
                    onChange={(e) => setLength(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#1b2431] rounded-lg appearance-none cursor-pointer accent-[#2563eb]"
                />

                <div className="grid grid-cols-2 gap-4">
                    {Object.entries(options).map(([key, value]) => (
                        <label key={key} className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    checked={value}
                                    onChange={() => setOptions(prev => ({ ...prev, [key]: !prev[key as keyof GeneratorOptions] }))}
                                    className="peer appearance-none w-5 h-5 bg-[#1b2431] border border-[#2d3748] rounded-md checked:bg-[#2563eb] checked:border-[#2563eb] transition-all"
                                />
                                <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 left-0.5 pointer-events-none transition-opacity" />
                            </div>
                            <span className="text-sm font-medium text-gray-300 capitalize group-hover:text-white transition-colors">{key}</span>
                        </label>
                    ))}
                </div>

                <button
                    onClick={generatePassword}
                    className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                >
                    <RefreshCw className="w-5 h-5" />
                    Generate New Password
                </button>
            </div>
        </div>
    );
}
