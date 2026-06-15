const API_BASE = "/api";

interface ApiResponse {
  success?: boolean;
  error?: string;
  roomKey?: string;
  createdAt?: number;
  valid?: boolean;
  message?: Record<string, unknown>;
  messages?: Record<string, unknown>[];
  expired?: boolean;
  token?: string;
  rooms?: Record<string, unknown>[];
  total?: number;
  bannedKeys?: string[];
  msg?: string;
}

async function request(endpoint: string, options: RequestInit = {}): Promise<ApiResponse> {
  const url = `${API_BASE}${endpoint}`;
  const config: RequestInit = {
    headers: { "Content-Type": "application/json" },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    return await res.json();
  } catch {
    return { success: false, error: "Network error. Please try again." };
  }
}

export const api = {
  createRoom(): Promise<ApiResponse> {
    return request("/room/create", { method: "POST" });
  },
  joinRoom(roomKey: string): Promise<ApiResponse> {
    return request("/room/join", {
      method: "POST",
      body: JSON.stringify({ roomKey }),
    });
  },
  validateRoom(roomKey: string): Promise<ApiResponse> {
    return request("/room/validate", {
      method: "POST",
      body: JSON.stringify({ roomKey }),
    });
  },
  sendMessage(roomKey: string, message: string, sender: string): Promise<ApiResponse> {
    return request("/message/send", {
      method: "POST",
      body: JSON.stringify({ roomKey, message, sender }),
    });
  },
  getMessages(roomKey: string, since = 0): Promise<ApiResponse> {
    return request(`/message/get?roomKey=${encodeURIComponent(roomKey)}&since=${since}`);
  },
  adminLogin(username: string, password: string): Promise<ApiResponse> {
    return request("/admin/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },
  getAdminRooms(token: string): Promise<ApiResponse> {
    return request(`/admin/rooms?token=${encodeURIComponent(token)}`);
  },
  deleteRoom(token: string, roomKey: string, action = "delete"): Promise<ApiResponse> {
    return request("/admin/room", {
      method: "DELETE",
      body: JSON.stringify({ token, roomKey, action }),
    });
  },
  getAdminMessages(token: string, roomKey: string): Promise<ApiResponse> {
    return request(`/admin/messages?token=${encodeURIComponent(token)}&roomKey=${encodeURIComponent(roomKey)}`);
  },
};
