import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "./api";

export default function CreateRoomPage() {
  const [loading, setLoading] = useState(false);
  const [roomKey, setRoomKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCreate = async () => {
    setLoading(true);
    setError("");
    const res = await api.createRoom();
    if (res.success && res.roomKey) {
      setRoomKey(res.roomKey);
    } else {
      setError(res.error || "Failed to create room. Try again.");
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (roomKey) {
      navigator.clipboard.writeText(roomKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEnter = () => {
    if (roomKey) {
      navigate(`/chat/${roomKey}`);
    }
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
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white">Create a Room</h1>
            <p className="text-white/60">
              Generate a unique key and share it with someone to chat privately.
            </p>
          </div>

          {!roomKey ? (
            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Generating..." : "✨ Generate Room Key"}
            </button>
          ) : (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center space-y-3">
                <p className="text-white/60 text-sm">Your Room Key</p>
                <div className="text-3xl font-mono font-bold text-white tracking-wider bg-white/5 rounded-lg py-4 px-2 border border-white/10">
                  {roomKey}
                </div>
                <p className="text-white/40 text-xs">
                  Share this key with the person you want to chat with.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCopy}
                  className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium border border-white/20 hover:bg-white/15 transition-all duration-200"
                >
                  {copied ? "✅ Copied!" : "📋 Copy Key"}
                </button>
                <button
                  onClick={handleEnter}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:scale-105 transition-all duration-200"
                >
                  🚪 Enter Room
                </button>
              </div>

              <button
                onClick={() => {
                  setRoomKey(null);
                  setCopied(false);
                }}
                className="w-full py-2 text-white/40 hover:text-white/60 text-sm transition-colors"
              >
                Create another room
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          <div className="text-center">
            <Link
              to="/join"
              className="text-white/50 hover:text-white/80 text-sm transition-colors"
            >
              Have a key? Join a room instead
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}