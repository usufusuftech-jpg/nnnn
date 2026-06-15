import { Link } from "react-router-dom";

export default function NotFoundPage() {
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
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl">🔍</div>
          <h1 className="text-4xl font-bold text-white">404</h1>
          <p className="text-white/60">Page not found</p>
          <Link
            to="/"
            className="inline-block py-3 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transition-all duration-200"
          >
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}