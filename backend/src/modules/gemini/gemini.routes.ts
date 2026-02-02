import { Router } from "express";
import type { Server } from "socket.io";
import { GeminiController } from "./gemini.controller";

export const createGeminiRoutes = (io: Server) => {
  const router = Router();
  const modelController = new GeminiController(io);

  router.get("/models", modelController.getModels);
  router.post("/models/refresh", modelController.refreshModels);

  return router;
};
