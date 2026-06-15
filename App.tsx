// JUBCHATHUB - Serverless API for Vercel
// Runtime memory storage (ephemeral)

const rooms = new Map();
const messages = new Map();
const bannedKeys = new Set();

const ADMIN_USERNAME = "Admin";
const ADMIN_PASSWORD = "57585857";

function generateRoomKey() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let key = "";
  for (let i = 0; i < 12; i++) {
    if (i === 4 || i === 8) key += "-";
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}

function isExpired(createdAt) {
  return Date.now() - createdAt > 24 * 60 * 60 * 1000;
}

function cleanupExpiredRooms() {
  const now = Date.now();
  for (const [key, room] of rooms) {
    if (now - room.createdAt > 24 * 60 * 60 * 1000) {
      rooms.delete(key);
      messages.delete(key);
    }
  }
}

function sanitize(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function getBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
}

function json(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  // Cleanup expired rooms on every request
  cleanupExpiredRooms();

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname.replace(/\/$/, "");

  try {
    // === ROOM: CREATE ===
    if (path === "/api/room/create" && req.method === "POST") {
      const key = generateRoomKey();
      const room = {
        key,
        createdAt: Date.now(),
        userCount: 0,
      };
      rooms.set(key, room);
      messages.set(key, []);
      return json(res, 200, { success: true, roomKey: key });
    }

    // === ROOM: JOIN ===
    if (path === "/api/room/join" && req.method === "POST") {
      const body = await getBody(req);
      const roomKey = sanitize(body.roomKey || "").toUpperCase();

      if (bannedKeys.has(roomKey)) {
        return json(res, 200, {
          success: false,
          error: "This room key has been banned by admin.",
        });
      }

      const room = rooms.get(roomKey);
      if (!room) {
        return json(res, 200, {
          success: false,
          error: "Room not found. Check your key and try again.",
        });
      }

      if (isExpired(room.createdAt)) {
        rooms.delete(roomKey);
        messages.delete(roomKey);
        return json(res, 200, {
          success: false,
          error: "This room has expired (24h limit).",
        });
      }

      room.userCount += 1;
      return json(res, 200, {
        success: true,
        roomKey: room.key,
        createdAt: room.createdAt,
      });
    }

    // === ROOM: VALIDATE ===
    if (path === "/api/room/validate" && req.method === "POST") {
      const body = await getBody(req);
      const roomKey = sanitize(body.roomKey || "").toUpperCase();

      const room = rooms.get(roomKey);
      if (!room || isExpired(room.createdAt)) {
        if (room) {
          rooms.delete(roomKey);
          messages.delete(roomKey);
        }
        return json(res, 200, { valid: false });
      }

      return json(res, 200, { valid: true, createdAt: room.createdAt });
    }

    // === MESSAGE: SEND ===
    if (path === "/api/message/send" && req.method === "POST") {
      const body = await getBody(req);
      const roomKey = sanitize(body.roomKey || "").toUpperCase();
      const text = sanitize(body.message || "").trim();

      if (!text) {
        return json(res, 200, { success: false, error: "Message cannot be empty." });
      }

      const room = rooms.get(roomKey);
      if (!room || isExpired(room.createdAt)) {
        return json(res, 200, { success: false, error: "Room expired or not found." });
      }

      const msg = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        text,
        timestamp: Date.now(),
        sender: sanitize(body.sender || "Anonymous"),
      };

      const roomMessages = messages.get(roomKey) || [];
      roomMessages.push(msg);
      // Keep only last 200 messages to prevent memory issues
      if (roomMessages.length > 200) {
        roomMessages.splice(0, roomMessages.length - 200);
      }

      return json(res, 200, { success: true, message: msg });
    }

    // === MESSAGE: GET ===
    if (path === "/api/message/get" && req.method === "GET") {
      const roomKey = sanitize(url.searchParams.get("roomKey") || "").toUpperCase();
      const since = parseInt(url.searchParams.get("since") || "0");

      const room = rooms.get(roomKey);
      if (!room || isExpired(room.createdAt)) {
        return json(res, 200, { messages: [], expired: true });
      }

      const roomMessages = (messages.get(roomKey) || []).filter(
        (m) => m.timestamp > since
      );

      return json(res, 200, { messages: roomMessages, expired: false });
    }

    // === ADMIN: LOGIN ===
    if (path === "/api/admin/login" && req.method === "POST") {
      const body = await getBody(req);
      const username = sanitize(body.username || "");
      const password = sanitize(body.password || "");

      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        return json(res, 200, { success: true, token: "admin-session-token" });
      }

      return json(res, 200, { success: false, error: "Invalid credentials." });
    }

    // === ADMIN: ROOMS ===
    if (path === "/api/admin/rooms" && req.method === "GET") {
      const token = sanitize(url.searchParams.get("token") || "");
      if (token !== "admin-session-token") {
        return json(res, 401, { error: "Unauthorized." });
      }

      const activeRooms = [];
      for (const [key, room] of rooms) {
        if (!isExpired(room.createdAt)) {
          const roomMessages = messages.get(key) || [];
          activeRooms.push({
            key: room.key,
            createdAt: room.createdAt,
            userCount: room.userCount,
            messageCount: roomMessages.length,
            age: Math.floor((Date.now() - room.createdAt) / 1000),
            lastMessage: roomMessages.length > 0
              ? roomMessages[roomMessages.length - 1]
              : null,
          });
        }
      }

      return json(res, 200, {
        rooms: activeRooms,
        total: activeRooms.length,
        bannedKeys: Array.from(bannedKeys),
      });
    }

    // === ADMIN: DELETE ROOM ===
    if (path === "/api/admin/room" && req.method === "DELETE") {
      const body = await getBody(req);
      const token = sanitize(body.token || "");
      const roomKey = sanitize(body.roomKey || "").toUpperCase();
      const action = body.action || "delete";

      if (token !== "admin-session-token") {
        return json(res, 401, { error: "Unauthorized." });
      }

      if (action === "ban") {
        bannedKeys.add(roomKey);
        rooms.delete(roomKey);
        messages.delete(roomKey);
        return json(res, 200, { success: true, message: "Room banned and deleted." });
      }

      if (action === "delete" || action === "force-close") {
        rooms.delete(roomKey);
        messages.delete(roomKey);
        return json(res, 200, { success: true, message: "Room deleted." });
      }

      return json(res, 200, { success: false, error: "Unknown action." });
    }

    // === ADMIN: GET MESSAGES ===
    if (path === "/api/admin/messages" && req.method === "GET") {
      const token = sanitize(url.searchParams.get("token") || "");
      const roomKey = sanitize(url.searchParams.get("roomKey") || "").toUpperCase();

      if (token !== "admin-session-token") {
        return json(res, 401, { error: "Unauthorized." });
      }

      const roomMessages = messages.get(roomKey) || [];
      return json(res, 200, { messages: roomMessages });
    }

    // === HEALTH CHECK ===
    if (path === "/api/health") {
      return json(res, 200, {
        status: "ok",
        rooms: rooms.size,
        uptime: process.uptime(),
      });
    }

    // 404 for unknown API routes
    return json(res, 404, { error: "Not found" });
  } catch (err) {
    return json(res, 500, { error: "Internal server error" });
  }
}
