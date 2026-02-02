import { Router } from "express";
import { ChatController } from "./chat.controller";
import type { Server } from "socket.io";

// Vì ChatController cần IO, ta bọc nó trong 1 function để nhận IO từ index.ts
export const createChatRoutes = (io: Server) => {
  const router = Router();
  const chatController = new ChatController(io);

  // Định nghĩa route: /v1/chat/completions
  router.post("/completions", chatController.handleChat);

  return router;
};
