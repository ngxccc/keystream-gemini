import type { Server } from "node:http";

export class ModelController {
  constructor(private io: Server) {}

  public getModels = (req: Request, res: Response) => {
    // ... logic cũ
  };

  public refreshModels = async (req: Request, res: Response) => {
    // ... logic cũ
    this.io.emit("stats_update", ...); // Cần io nên phải inject vào
  };
}
