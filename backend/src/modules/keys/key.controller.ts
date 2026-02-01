import type { Request, Response } from "express";
import { keyService } from "./key.service";
import z from "zod";

const addKeySchema = z.object({
  key: z.string().min(10, "Key is too short"),
});

export class KeyController {
  // GET /api/keys
  public async getKeys(_req: Request, res: Response) {
    const keys = await keyService.getAllKeys();
    res.json(keys);
  }

  // POST /api/keys
  public async addKey(req: Request, res: Response) {
    const parseResult = addKeySchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues[0].message });
      return;
    }

    const { key } = parseResult.data;

    const success = await keyService.addKey(key);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: "Key already exists" });
    }
  }
}

export const keyController = new KeyController();
