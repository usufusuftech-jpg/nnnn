import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "./api";

export default function JoinRoomPage() {
  const [roomKey, setRoomKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleJoin = async () => {
    const key = roomKey.trim().toUpperCase();
    if (!key) {
      setError("Please enter a room key.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await api.joinRoom(key);
    if (res.success) {
      navigate(`/chat/${key}`);
    } else {
      setError(res.error || "Failed to join room. Check the key and try again.");
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleJoin();
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
            <div className="text-4xl">🚪</div>
            <h1 className="text-3xl font-bold text-white">Join a Room</h1>
            <p className="text-white/60">Enter the room key to join a conversation.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-white/50 text-sm mb-1.5">Room Key</label>
              <input
                type="text"
                value={roomKey}
                onChange={(e) => {
                  setRoomKey(e.target.value);
                  setError("");
                }}
                onKeyDown={handleKeyDown}
                placeholder="e.g., ABC-DEF-GHI"
                autoFocus
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all"
              />
            </div>

            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-50 transition-all"
            >
              {loading ? "Joining..." : "Join Room"}
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          <div className="text-center">
            <Link
              to="/create"
              className="text-white/50 hover:text-white/80 text-sm transition-colors"
            >
              Don't have a key? Create a room instead
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}