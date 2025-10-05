// components/PasswordGenerator.tsx
import React, { useState } from "react";

type Props = {
  onPick: (password: string) => void;
};

const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const numbers = "0123456789";
const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

export default function PasswordGenerator({ onPick }: Props) {
  const [length, setLength] = useState(16);
  const [useLetters, setUseLetters] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);

  const generate = () => {
    let chars = "";
    if (useLetters) chars += letters;
    if (useNumbers) chars += numbers;
    if (useSymbols) chars += symbols;
    if (!chars) return;
    let pwd = "";
    for (let i = 0; i < length; i++) {
      pwd += chars[Math.floor(Math.random() * chars.length)];
    }
    onPick(pwd);
  };

  return (
    <div className="flex flex-col gap-2 p-2 border rounded max-w-sm">
      <label>
        Length: {length}
        <input
          type="range"
          min={8}
          max={64}
          value={length}
          onChange={e => setLength(Number(e.target.value))}
        />
      </label>
      <label><input type="checkbox" checked={useLetters} onChange={e=>setUseLetters(e.target.checked)} /> Letters</label>
      <label><input type="checkbox" checked={useNumbers} onChange={e=>setUseNumbers(e.target.checked)} /> Numbers</label>
      <label><input type="checkbox" checked={useSymbols} onChange={e=>setUseSymbols(e.target.checked)} /> Symbols</label>
      <button onClick={generate} className="bg-green-500 text-white p-1 rounded">Generate</button>
    </div>
  );
}
