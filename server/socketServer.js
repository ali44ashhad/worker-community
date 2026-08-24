import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import dbConnect from "./config/database.js";
import { ALLOWED_ORIGINS } from "./config/allowedOrigins.js";
import { initChatSocket } from "./socket/chatSocket.js";

const allowedOrigins = ALLOWED_ORIGINS;

async function start() {
  await dbConnect();

  const httpServer = http.createServer((req, res) => {
    if (req.url === "/" || req.url === "/health") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Socket server is live");
      return;
    }
    res.writeHead(404);
    res.end();
  });

  const io = new Server(httpServer, {
    cors: {
      origin(origin, cb) {
        if (!origin || allowedOrigins.has(origin)) return cb(null, true);
        return cb(new Error("Not allowed by CORS"));
      },
      credentials: true,
    },
  });

  initChatSocket(io);

  const port = process.env.PORT || 3001;
  httpServer.listen(port, () => {
    console.log(`Socket.io server listening on port ${port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start socket server:", err);
  process.exit(1);
});
