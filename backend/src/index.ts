import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createServer } from "node:http";
import envConfig from "./config/config";
import keyRoutes from "./modules/keys/key.routes";
import { createChatRoutes } from "./modules/chat/chat.routes";
import { geminiService } from "./modules/gemini/gemini.service";
import { statsService } from "./modules/stats/stats.service";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
const PORT = envConfig.PORT;

// --- Middlewares ---
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(morgan("dev"));

// --- Initialization ---
try {
  geminiService.initializeModelFetching();
  statsService.initialize();
  console.log("✅ Services Initialized");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} catch (error: any) {
  console.error("❌ Failed to initialize services:", error.message);
  process.exit(1);
}

// --- Routes Wiring ---
app.use("/api/keys", keyRoutes); // Quản lý Key
app.use("/v1/chat", createChatRoutes(io)); // Chat OpenAI format (Inject IO)
// app.use("/api/stats", ...);

// --- Start ---
server.listen(PORT, () => {
  console.log(`🚀 Proxy running at http://localhost:${PORT}`);
});
