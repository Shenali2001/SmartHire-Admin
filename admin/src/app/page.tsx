// app/login/page.tsx (Next.js 13+ with App Router)

"use client";
import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Dummy check (replace with API/auth logic)
    if (username === "admin" && password === "admin123") {
      alert("✅ Login Successful!");
      window.location.href = "/admin"; // redirect
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="w-full max-w-md rounded-2xl bg-gray-900 p-8 shadow-xl border border-gray-800">
        <h2 className="mb-6 text-center text-2xl font-bold text-white">
          Admin Panel Login
        </h2>

        {error && (
          <div className="mb-4 rounded-lg bg-red-900/40 border border-red-700 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Username
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 p-3 font-semibold text-white transition hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
