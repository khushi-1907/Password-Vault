// pages/signup.tsx
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setFlash("");
    setLoading(true);
    try {
      await axios.post("/api/auth/signup", { email, password });
      setFlash("Signup successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (e: any) {
      setErr(e.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 via-pink-500 to-red-500">
      <div className="bg-white dark:bg-gray-900 p-10 rounded-3xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-6">
          Create Your Account
        </h2>

        {flash && (
          <div className="mb-4 text-green-600 font-medium text-center animate-pulse">
            {flash}
          </div>
        )}
        {err && (
          <div className="mb-4 text-red-500 font-medium text-center animate-pulse">
            {err}
          </div>
        )}

        <form onSubmit={submit} className="flex flex-col gap-5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 flex justify-center items-center gap-2"
          >
            {loading && (
              <svg
                className="animate-spin h-5 w-5 text-white"
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
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500 dark:text-gray-400 text-sm">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-pink-500 font-medium hover:underline"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
