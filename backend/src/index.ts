import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createServer } from "node:http";
import envConfig from "./config/config";
import { createGeminiRoutes, geminiService } from "./modules/gemini";
import { statsService } from "./modules/stats";
import { keyRoutes } from "./modules/keys";
import { createChatRoutes } from "./modules/chat";

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
} catch (error) {
  console.error(
    "❌ Failed to initialize services:",
    error instanceof Error ? error.message : String(error),
  );
  process.exit(1);
}

// --- Routes Wiring ---
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.use("/api/keys", keyRoutes); // Quản lý Key
app.use("/v1/chat", createChatRoutes(io)); // Chat OpenAI format (Inject IO)
app.use("/api/gemini", createGeminiRoutes(io));

app.use((_req, res) => {
  res.status(404).json({
    error: { message: "Endpoint not found", code: 404 },
  });
});

// TODO: tách ra một file
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("🔥 Unhandled Error:", err);
    res.status(500).json({
      error: {
        message: "Internal Server Error",
        details: err instanceof Error ? err.message : String(err),
      },
    });
  },
);

// --- Start ---
server.listen(PORT, () => {
  console.log(`🚀 Proxy running at http://localhost:${PORT}`);
});

process.on("SIGINT", () => {
  void (() => {
    console.log("\n🛑 Shutting down gracefully...");
    void io.close();
    server.close(() => {
      console.log("✅ Server closed");
      process.exit(0);
    });
  })();
});
