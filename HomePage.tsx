import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await api.adminLogin(username, password);
    if (res.success && res.token) {
      sessionStorage.setItem("adminToken", res.token);
      navigate("/admin/dashboard");
    } else {
      setError(res.error || "Invalid credentials.");
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
            J
          </div>
          <span className="text-white font-semibold">JUBCHATHUB</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="text-4xl">🔐</div>
            <h1 className="text-3xl font-bold text-white">Admin Login</h1>
            <p className="text-white/60">Enter your credentials to access the dashboard.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-white/50 text-sm mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                onKeyDown={handleKeyDown}
                placeholder="Enter username"
                autoFocus
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-white/50 text-sm mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onKeyDown={handleKeyDown}
                placeholder="Enter password"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          <div className="text-center">
            <p className="text-white/30 text-xs">
              Demo credentials: Admin / 57585857
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
