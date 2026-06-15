import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "./api";

interface Message {
  id: string;
  text: string;
  timestamp: number;
  sender: string;
}

export default function ChatRoomPage() {
  const { roomKey } = useParams<{ roomKey: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sender] = useState(() => "User" + Math.floor(Math.random() * 9000 + 1000));
  const [roomValid, setRoomValid] = useState<boolean | null>(null);
  const [expired, setExpired] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastFetchRef = useRef(0);

  // Validate room on mount
  useEffect(() => {
    if (!roomKey) return;
    const validate = async () => {
      const res = await api.validateRoom(roomKey);
      if (res.valid) {
        setRoomValid(true);
      } else {
        setRoomValid(false);
        setExpired(true);
      }
    };
    validate();
  }, [roomKey]);

  // Poll for messages
  useEffect(() => {
    if (!roomKey || !roomValid) return;

    const interval = setInterval(async () => {
      const res = await api.getMessages(roomKey, lastFetchRef.current);
      if (res.expired) {
        setExpired(true);
        setRoomValid(false);
        clearInterval(interval);
        return;
      }
      if (res.messages && res.messages.length > 0) {
        const newMsgs = res.messages as unknown as Message[];
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const unique = newMsgs.filter((m) => !existingIds.has(m.id));
          if (unique.length > 0) {
            return [...prev, ...unique];
          }
          return prev;
        });
        const maxTs = Math.max(...newMsgs.map((m) => m.timestamp));
        if (maxTs > lastFetchRef.current) {
          lastFetchRef.current = maxTs;
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [roomKey, roomValid]);

  // Auto scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !roomKey) return;

    setInput("");
    const res = await api.sendMessage(roomKey, text, sender);
    if (res.success && res.message) {
      const msg = res.message as unknown as Message;
      setMessages((prev) => [...prev, msg]);
      if (msg.timestamp > lastFetchRef.current) {
        lastFetchRef.current = msg.timestamp;
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Expired state
  if (expired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl">⏰</div>
          <h2 className="text-2xl font-bold text-white">Room Expired</h2>
          <p className="text-white/60">
            This room has exceeded its 24-hour lifespan and is no longer accessible.
          </p>
          <Link
            to="/create"
            className="inline-block py-3 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:scale-105 transition-all duration-200"
          >
            Create New Room
          </Link>
        </div>
      </div>
    );
  }

  // Invalid room
  if (roomValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl">🔍</div>
          <h2 className="text-2xl font-bold text-white">Room Not Found</h2>
          <p className="text-white/60">
            The room key you entered is invalid. Please check the key and try again.
          </p>
          <Link
            to="/join"
            className="inline-block py-3 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:scale-105 transition-all duration-200"
          >
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  // Loading
  if (roomValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-white/60">
          <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          <span>Connecting to room...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col">
      {/* Room Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-white/40 hover:text-white/70 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h2 className="text-white font-semibold text-sm">Room</h2>
            <p className="text-white/40 text-xs font-mono">{roomKey}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/30 text-xs">~24h</span>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/40 text-xs">Live</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-white/30 space-y-2">
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-lg">No messages yet</p>
            <p className="text-sm">Send a message to start the conversation</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender === sender;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fadeIn`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-lg ${
                  isMe
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md"
                    : "bg-white/10 text-white/90 rounded-bl-md border border-white/10"
                }`}
              >
                {!isMe && (
                  <p className="text-xs text-white/50 mb-1 font-medium">{msg.sender}</p>
                )}
                <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                <p className={`text-xs mt-1 ${isMe ? "text-white/60" : "text-white/40"}`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-white/10 px-4 py-3 bg-white/5">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            maxLength={500}
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 transition-all duration-200 shadow-lg shadow-purple-500/25"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
