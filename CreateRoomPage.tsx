import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";

interface RoomData {
  key: string;
  createdAt: number;
  userCount: number;
  messageCount: number;
  age: number;
  lastMessage?: { text: string; sender: string; timestamp: number } | null;
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [bannedKeys, setBannedKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [roomMessages, setRoomMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Check auth
  useEffect(() => {
    const t = sessionStorage.getItem("adminToken");
    if (!t) {
      navigate("/admin");
      return;
    }
    setToken(t);
  }, [navigate]);

  const fetchRooms = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const res = await api.getAdminRooms(token);
    if (res.rooms) {
      setRooms(res.rooms as unknown as RoomData[]);
    }
    if (res.bannedKeys) {
      setBannedKeys(res.bannedKeys as string[]);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    if (token) fetchRooms();
  }, [token, fetchRooms]);

  // Auto-refresh rooms every 10 seconds
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(fetchRooms, 10000);
    return () => clearInterval(interval);
  }, [token, fetchRooms]);

  const handleDelete = async (roomKey: string) => {
    if (!token) return;
    setActionLoading(roomKey);
    const res = await api.deleteRoom(token, roomKey, "delete");
    if (res.success) {
      setRooms((prev) => prev.filter((r) => r.key !== roomKey));
      if (selectedRoom === roomKey) {
        setSelectedRoom(null);
        setRoomMessages([]);
      }
    }
    setActionLoading(null);
  };

  const handleBan = async (roomKey: string) => {
    if (!token) return;
    setActionLoading(roomKey);
    const res = await api.deleteRoom(token, roomKey, "ban");
    if (res.success) {
      setRooms((prev) => prev.filter((r) => r.key !== roomKey));
      setBannedKeys((prev) => [...prev, roomKey]);
      if (selectedRoom === roomKey) {
        setSelectedRoom(null);
        setRoomMessages([]);
      }
    }
    setActionLoading(null);
  };

  const handleViewMessages = async (roomKey: string) => {
    if (!token) return;
    if (selectedRoom === roomKey) {
      setSelectedRoom(null);
      setRoomMessages([]);
      return;
    }
    setSelectedRoom(roomKey);
    setMessagesLoading(true);
    const res = await api.getAdminMessages(token, roomKey);
    if (res.messages) {
      setRoomMessages(res.messages as any[]);
    }
    setMessagesLoading(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    navigate("/admin");
  };

  const formatAge = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
              J
            </div>
            <span className="text-white font-semibold">JUBCHATHUB</span>
          </Link>
          <span className="text-white/30 text-sm">|</span>
          <span className="text-purple-300 text-sm font-medium">Admin Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchRooms}
            disabled={loading}
            className="px-3 py-1.5 text-xs text-white/60 hover:text-white/80 border border-white/20 rounded-lg hover:border-white/40 transition-colors disabled:opacity-50"
          >
            {loading ? "⟳" : "↻"} Refresh
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs text-red-300 hover:text-red-200 border border-red-500/20 rounded-lg hover:border-red-500/40 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-white/40 text-xs">Active Rooms</p>
            <p className="text-2xl font-bold text-white">{rooms.length}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-white/40 text-xs">Total Messages</p>
            <p className="text-2xl font-bold text-white">
              {rooms.reduce((sum, r) => sum + r.messageCount, 0)}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-white/40 text-xs">Total Users</p>
            <p className="text-2xl font-bold text-white">
              {rooms.reduce((sum, r) => sum + r.userCount, 0)}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-white/40 text-xs">Banned Keys</p>
            <p className="text-2xl font-bold text-red-400">{bannedKeys.length}</p>
          </div>
        </div>

        {/* Banned Keys */}
        {bannedKeys.length > 0 && (
          <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/20">
            <p className="text-red-300 text-sm font-medium mb-2">🚫 Banned Room Keys</p>
            <div className="flex flex-wrap gap-2">
              {bannedKeys.map((key) => (
                <span key={key} className="text-xs font-mono bg-red-500/10 text-red-300 px-2 py-1 rounded border border-red-500/20">
                  {key}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Rooms Table */}
        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <h2 className="text-white font-semibold">Active Rooms</h2>
          </div>

          {loading && rooms.length === 0 ? (
            <div className="p-8 text-center text-white/40">Loading rooms...</div>
          ) : rooms.length === 0 ? (
            <div className="p-8 text-center text-white/30">
              <p className="text-2xl mb-2">🔇</p>
              <p>No active rooms</p>
              <p className="text-xs mt-1">Rooms appear here when users create them.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/40 text-xs uppercase border-b border-white/5">
                    <th className="text-left px-4 py-3 font-medium">Room Key</th>
                    <th className="text-left px-4 py-3 font-medium">Age</th>
                    <th className="text-left px-4 py-3 font-medium">Users</th>
                    <th className="text-left px-4 py-3 font-medium">Messages</th>
                    <th className="text-left px-4 py-3 font-medium">Created</th>
                    <th className="text-right px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room.key} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewMessages(room.key)}
                          className="font-mono text-purple-300 hover:text-purple-200 text-xs transition-colors"
                        >
                          {room.key}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-white/70 text-xs">{formatAge(room.age)}</td>
                      <td className="px-4 py-3 text-white/70 text-xs">{room.userCount}</td>
                      <td className="px-4 py-3 text-white/70 text-xs">{room.messageCount}</td>
                      <td className="px-4 py-3 text-white/50 text-xs">{formatTime(room.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDelete(room.key)}
                            disabled={actionLoading === room.key}
                            className="px-2.5 py-1 text-xs bg-red-500/10 text-red-300 rounded-lg hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 disabled:opacity-50 transition-all"
                          >
                            {actionLoading === room.key ? "..." : "Delete"}
                          </button>
                          <button
                            onClick={() => handleBan(room.key)}
                            disabled={actionLoading === room.key}
                            className="px-2.5 py-1 text-xs bg-orange-500/10 text-orange-300 rounded-lg hover:bg-orange-500/20 border border-orange-500/20 hover:border-orange-500/40 disabled:opacity-50 transition-all"
                          >
                            Ban
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Messages for selected room */}
        {selectedRoom && (
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm">
                Messages in <span className="font-mono text-purple-300">{selectedRoom}</span>
              </h3>
              <button
                onClick={() => { setSelectedRoom(null); setRoomMessages([]); }}
                className="text-white/40 hover:text-white/70 text-xs transition-colors"
              >
                Close
              </button>
            </div>
            {messagesLoading ? (
              <div className="p-4 text-center text-white/40">Loading messages...</div>
            ) : roomMessages.length === 0 ? (
              <div className="p-4 text-center text-white/30 text-sm">No messages in this room.</div>
            ) : (
              <div className="max-h-64 overflow-y-auto p-4 space-y-2">
                {roomMessages.map((msg: any) => (
                  <div key={msg.id} className="bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-purple-300 text-xs font-medium">{msg.sender}</span>
                      <span className="text-white/30 text-xs">{formatTime(msg.timestamp)}</span>
                    </div>
                    <p className="text-white/80 text-sm">{msg.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
