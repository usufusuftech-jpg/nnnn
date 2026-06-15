import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setStatus(`Live · ${d.rooms} active rooms`))
      .catch(() => setStatus("Connecting..."));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
            J
          </div>
          <span className="text-white font-semibold text-lg">JUBCHATHUB</span>
        </div>
        <Link
          to="/admin"
          className="text-xs text-white/50 hover:text-white/80 transition-colors px-3 py-1.5 rounded-md border border-white/10 hover:border-white/30"
        >
          Admin
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-md mx-auto space-y-8">
          {/* Logo Animation */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shadow-2xl shadow-purple-500/30 animate-pulse">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Ephemeral Chat
            </h1>
            <p className="text-white/60 text-lg leading-relaxed">
              Private, temporary chat rooms that disappear after 24 hours. No sign-up. No trace.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3 pt-4">
            <Link
              to="/create"
              className="block w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all duration-200"
            >
              Create a Room
            </Link>
            <Link
              to="/join"
              className="block w-full py-3.5 px-6 rounded-xl bg-white/10 text-white font-semibold text-lg border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-200"
            >
              Join a Room
            </Link>
          </div>

          {/* Status */}
          {status && (
            <p className="text-white/40 text-sm pt-2">{status}</p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-white/5">
        <p className="text-center text-white/30 text-xs">
          Rooms auto-expire after 24 hours · No data stored permanently
        </p>
      </footer>
    </div>
  );
}
