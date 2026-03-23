"use client";
import { useState } from "react";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({ subsets: ["latin"] });

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      window.location.href = "/";
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1
          className={`${orbitron.className} text-2xl font-bold text-green-400 mb-1 text-center`}
        >
          ADMIN
        </h1>
        <p className="text-green-700 font-mono text-xs text-center mb-8 tracking-widest uppercase">
          Authorized access only
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-green-600 font-mono text-xs mb-1 uppercase tracking-widest">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="w-full bg-black border border-green-800 rounded px-3 py-2 text-green-300 font-mono text-sm focus:outline-none focus:border-green-500 placeholder-green-900"
              placeholder="username"
            />
          </div>

          <div>
            <label className="block text-green-600 font-mono text-xs mb-1 uppercase tracking-widest">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full bg-black border border-green-800 rounded px-3 py-2 text-green-300 font-mono text-sm focus:outline-none focus:border-green-500 placeholder-green-900"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-500 font-mono text-xs text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-900 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-green-300 font-mono text-sm py-2 rounded border border-green-700 transition-colors"
          >
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
