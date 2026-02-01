import { Server } from "socket.io";
import { keyService } from "../keys/key.service";
import { geminiService } from "../gemini/gemini.service";
import { statsService } from "../stats/stats.service";
import type { Request, Response } from "express";
import type { IGenerationConfig } from "@/common/types";
import type {
  GenerateContentResult,
  GenerateContentStreamResult,
} from "@google/generative-ai";

export class ChatController {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  // Entry point cho Route gọi vào
  public handleChat = async (req: Request, res: Response) => {
    // Gọi hàm xử lý nội bộ với danh sách key đã thử rỗng []
    await this.processRequest(req, res, []);
  };

  // Hàm logic chính (Refactor từ handleRequest cũ)
  private processRequest = async (
    req: Request,
    res: Response,
    _attemptedKeys: string[],
  ) => {
    const currentKey = await keyService.getOptimalKey();

    if (!currentKey) {
      return res.status(429).json({
        error: {
          message:
            "All keys are currently exhausted or in cooldown. Please wait.",
          code: 429,
        },
      });
    }

    await keyService.updateKeyStatus(currentKey, "active");
    const allKeys = await keyService.getAllKeys();
    this.io.emit("stats_update", allKeys);

    const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    let targetModel = req.body.model || "gemini-pro";

    // Clean model name
    targetModel = targetModel.replace("models/", "").replace(/^Proxy:\s*/, "");

    this.io.emit("log", {
      id: requestId,
      type: "info",
      message: `[${targetModel}] -> Attempting Key: ...${currentKey.slice(-4)}`,
      timestamp: new Date().toLocaleTimeString(),
    });

    try {
      const generationConfig = this.buildGenerationConfig(req.body);

      if (req.body.stream) {
        await this.handleStream(
          req,
          res,
          currentKey,
          targetModel,
          generationConfig,
          requestId,
        );
      } else {
        await this.handleNonStream(
          req,
          res,
          currentKey,
          targetModel,
          generationConfig,
          requestId,
        );
      }
    } catch (error) {
      await this.handleError(
        req,
        res,
        error,
        currentKey,
        targetModel,
        _attemptedKeys,
        requestId,
      );
    }
  };

  // Tách nhỏ logic Stream cho gọn
  private handleStream = async (
    req: Request,
    res: Response,
    key: string,
    model: string,
    config: IGenerationConfig,
    reqId: string,
  ) => {
    const result = (await geminiService.generateContent(
      key,
      model,
      req.body.messages,
      config,
      true, // isStream
    )) as GenerateContentStreamResult;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let isClientConnected = true;
    req.on("close", () => {
      isClientConnected = false;
    });

    try {
      for await (const chunk of result.stream) {
        if (!isClientConnected) break;

        const text = chunk.text(); // Có thể try-catch bên trong nếu cần
        if (text) {
          const chunkData = {
            id: reqId,
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1000),
            model: model,
            choices: [
              { delta: { content: text }, index: 0, finish_reason: null },
            ],
          };
          res.write(`data: ${JSON.stringify(chunkData)}\n\n`);
        }
      }

      if (isClientConnected) {
        res.write(`data: [DONE]\n\n`);
        res.end();
      }

      this.logSuccess(key, model, reqId, "Stream Success.");
    } catch (streamError) {
      const errorMessage =
        streamError instanceof Error ? streamError.message : "Unknown error";
      console.error("Stream processing error:", errorMessage);
      statsService.trackRequest(key, model, false);
      await keyService.incrementUsage(key, true);

      this.io.emit("log", {
        id: reqId,
        type: "error",
        message: "Stream interrupted: " + errorMessage,
        timestamp: new Date().toLocaleTimeString(),
      });
      const allKeys = await keyService.getAllKeys();
      this.io.emit("stats_update", allKeys);
    }
  };

  // Tách logic Non-Stream
  private handleNonStream = async (
    req: Request,
    res: Response,
    key: string,
    model: string,
    config: IGenerationConfig,
    reqId: string,
  ) => {
    const result = (await geminiService.generateContent(
      key,
      model,
      req.body.messages,
      config,
      false,
    )) as GenerateContentResult;
    const response = await result.response;
    const text = response.text();

    this.logSuccess(key, model, reqId, "Request Success.");

    res.json({
      id: reqId,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: model,
      choices: [
        {
          message: { role: "assistant", content: text },
          finish_reason: "stop",
          index: 0,
        },
      ],
    });
  };

  // Logic Retry đệ quy
  private handleError = async (
    req: Request,
    res: Response,
    error: unknown,
    key: string,
    model: string,
    attemptedKeys: string[],
    reqId: string,
  ) => {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const isRateLimit =
      errorMessage.includes("429") ||
      errorMessage.includes("Quota") ||
      errorMessage.includes("exhausted");

    this.io.emit("log", {
      id: reqId,
      type: "error",
      message: isRateLimit ? `Rate Limit Hit` : errorMessage,
      timestamp: new Date().toLocaleTimeString(),
    });

    if (isRateLimit) {
      await keyService.updateKeyStatus(key, "cooldown");
      await keyService.incrementUsage(key, true);
      const allKeys = await keyService.getAllKeys();
      this.io.emit("stats_update", allKeys);

      const newAttemptedKeys = [...attemptedKeys, key];
      const allKeysCount = (await keyService.getAllKeys()).length;

      // 🔥 RECURSIVE RETRY LOGIC
      if (newAttemptedKeys.length < allKeysCount) {
        if (!res.headersSent) {
          await new Promise((r) => setTimeout(r, 200));
          // Gọi lại chính nó (this.processRequest)
          return this.processRequest(req, res, newAttemptedKeys);
        }
      }
    }

    if (!res.headersSent) {
      statsService.trackRequest(key, model, false);
      res.status(500).json({
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  };

  private async logSuccess(
    key: string,
    model: string,
    reqId: string,
    msg: string,
  ) {
    await keyService.incrementUsage(key, false);
    statsService.trackRequest(key, model, true);
    this.io.emit("traffic_update");
    this.io.emit("log", {
      id: reqId,
      type: "success",
      message: msg,
      timestamp: new Date().toLocaleTimeString(),
    });
    const allKeys = await keyService.getAllKeys();
    this.io.emit("stats_update", allKeys);
  }

  private buildGenerationConfig(body: {
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    top_k?: number;
  }): IGenerationConfig {
    const config: Partial<IGenerationConfig> = {
      temperature: body.temperature,
      maxOutputTokens: body.max_tokens,
      topP: body.top_p,
      topK: body.top_k,
    };
    Object.keys(config).forEach((k) => {
      const key = k as keyof IGenerationConfig;
      if (config[key] === undefined) {
        delete config[key];
      }
    });
    return config as IGenerationConfig;
  }
}
