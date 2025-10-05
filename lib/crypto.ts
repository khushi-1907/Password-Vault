// lib/crypto.ts (client-side)
export function bufToBase64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
export function base64ToBuf(b64: string) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export async function deriveKey(password: string, saltB64: string, iterations = 200000) {
  const salt = base64ToBuf(saltB64);
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt, iterations, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  return key;
}

export async function encryptObject(obj: any, key: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const data = enc.encode(JSON.stringify(obj));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  return { ciphertext: bufToBase64(ciphertext), iv: bufToBase64(iv.buffer) };
}

export async function decryptToObject(cipherB64: string, ivB64: string, key: CryptoKey) {
  const ct = base64ToBuf(cipherB64);
  const iv = new Uint8Array(base64ToBuf(ivB64));
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  const dec = new TextDecoder().decode(plain);
  return JSON.parse(dec);
}
