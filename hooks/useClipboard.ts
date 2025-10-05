import { useRef, useState } from "react";
export default function useClipboard(ttl = 15000) {
  const [copied, setCopied] = useState(false);
  const ref = useRef<number | null>(null);

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    if (ref.current) window.clearTimeout(ref.current);
    ref.current = window.setTimeout(async () => {
      setCopied(false);
      // optional: attempt to clear clipboard (may be blocked)
      try { await navigator.clipboard.writeText(""); } catch {}
    }, ttl);
  };

  return { copied, copy };
}
