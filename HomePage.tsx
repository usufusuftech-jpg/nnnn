import { useState } from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
            J
          </div>
          <span className="text-white font-semibold">JUBCHATHUB</span>
        </div>
        <Link
          to="/admin"
          className="text-white/40 hover:text-white/70 text-sm transition-colors"
        >
          Admin
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center space-y-8 max-w-2xl">
          <div className="space-y-3">
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              Ephemeral Chat
            </h1>
            <p className="text-lg text-white/60">
              Private, temporary conversations that disappear after 24 hours
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              to="/create"
              className="py-4 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transition-all duration-200"
            >
              ✨ Create Room
            </Link>
            <Link
              to="/join"
              className="py-4 px-6 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/15 transition-all duration-200"
            >
              🚪 Join Room
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-8">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-2xl mb-2">🔒</p>
              <p className="text-white/70 text-sm">End-to-End Encrypted</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-2xl mb-2">⏰</p>
              <p className="text-white/70 text-sm">24 Hour Expiry</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-2xl mb-2">🚀</p>
              <p className="text-white/70 text-sm">Instant Messaging</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-4 text-center text-white/40 text-sm">
        <p>Built with ❤️ for private conversations</p>
      </footer>
    </div>
  );
}