"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Optional: keep your API base URL in an env var like NEXT_PUBLIC_API_BASE_URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic front-end validation
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);

      const resp = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!resp.ok) {
        // Try to read error message from API if present
        let message = "Login failed. Please check your credentials.";
        try {
          const errJson = await resp.json();
          if (errJson?.detail) message = Array.isArray(errJson.detail) ? errJson.detail[0]?.msg || message : errJson.detail;
        } catch (_) {
          // ignore json parse error and keep default
        }
        throw new Error(message);
      }

      const data = (await resp.json()) as {
        access_token: string;
        token_type: string;
        user?: { email: string; role?: string };
      };

      // Store token (localStorage for SPA usage). For higher security, prefer an httpOnly cookie set via an API route.
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("token_type", data.token_type || "bearer");
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      setSuccess("✅ Login Successful!");

      // Small delay so the success message is visible (optional)
      setTimeout(() => {
        router.push("/dashboard");
      }, 600);
    } catch (err: any) {
      setError(err.message || "Something went wrong while logging in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="w-full max-w-md rounded-2xl bg-gray-900 p-8 shadow-xl border border-gray-800">
        <h2 className="mb-6 text-center text-2xl font-bold text-white">Admin Panel - SmartHire</h2>

        {error && (
          <div className="mb-4 rounded-lg bg-red-900/40 border border-red-700 p-3 text-sm text-red-300">{error}</div>
        )}
        {success && (
          <div className="mb-4 rounded-lg bg-green-900/40 border border-green-700 p-3 text-sm text-green-300">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-gray-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 p-3 font-semibold text-white transition hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in…" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
