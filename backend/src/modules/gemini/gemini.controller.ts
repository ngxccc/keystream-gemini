import type { Request, Response } from "express";
import type { Server } from "socket.io";
import { geminiService } from "./gemini.service";

export class GeminiController {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  public getModels = (_req: Request, res: Response) => {
    const models = geminiService.getAllModelCategories();
    res.json({ data: models });
  };

  public refreshModels = async (_req: Request, res: Response) => {
    try {
      await geminiService.fetchGoogleModels();

      const newModels = geminiService.getAllModelCategories();

      this.io.emit("models_updated", newModels);

      res.json({
        message: "Models refreshed successfully",
        count: {
          text: newModels.text.length,
          video: newModels.video.length,
          image: newModels.image.length,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to refresh models" });
    }
  };
}
