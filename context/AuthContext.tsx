// context/AuthContext.tsx
import React, { createContext, useContext, useState } from "react";
import { deriveKey } from "../lib/crypto";
import axios from "axios";

type AuthCtx = {
  token: string | null;
  key: CryptoKey | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [key, setKey] = useState<CryptoKey | null>(null);

  const login = async (email: string, password: string) => {
    const res = await axios.post("/api/auth/login", { email, password });
    const { token: t, encryptionSalt } = res.data;
    setToken(t);
    const k = await deriveKey(password, encryptionSalt);
    setKey(k);
    return true;
  };

  const logout = () => { setToken(null); setKey(null); };

  return <AuthContext.Provider value={{ token, key, login, logout }}>{children}</AuthContext.Provider>
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
