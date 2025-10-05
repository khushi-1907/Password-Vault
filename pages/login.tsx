// pages/login.tsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [flash, setFlash] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setFlash("");
    setLoading(true);
    try {
      await login(email, password);
      setFlash("Login successful! Redirecting to your Vault…");
      setTimeout(() => router.push("/vault"), 1500);
    } catch (e: any) {
      setErr("Login failed: Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-xs sm:max-w-sm md:max-w-md">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-4 sm:mb-6">
          Welcome Back
        </h2>

        {flash && (
          <div className="mb-3 sm:mb-4 text-green-600 font-medium text-center animate-pulse text-sm sm:text-base">
            {flash}
          </div>
        )}
        {err && (
          <div className="mb-3 sm:mb-4 text-red-500 font-medium text-center animate-pulse text-sm sm:text-base">
            {err}
          </div>
        )}

        <form onSubmit={submit} className="flex flex-col gap-4 sm:gap-5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all text-sm sm:text-base"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all text-sm sm:text-base"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 flex justify-center items-center gap-2 text-sm sm:text-base"
          >
            {loading && (
              <svg
                className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            )}
            {loading ? "Logging In..." : "Login"}
          </button>
        </form>

        <p className="mt-4 sm:mt-6 text-center text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
          Don't have an account?{" "}
          <a
            href="/signup"
            className="text-pink-500 font-medium hover:underline"
          >
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}