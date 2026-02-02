import type { Server } from "socket.io";
import { keyService } from "../keys/key.service";
import { geminiService } from "../gemini/gemini.service";
import { statsService } from "../stats/stats.service";
import type { Request, Response } from "express";
import type {
  GenerateContentResult,
  GenerateContentStreamResult,
} from "@google/generative-ai";
import envConfig from "@/config/config";
import type { IChatRequestBody, IGenerationConfig } from "@shared/types";

export class ChatController {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  // Entry Point: The Survival Loop
  public handleChat = async (
    req: Request<object, object, IChatRequestBody>,
    res: Response,
  ) => {
    const { model, stream } = req.body;
    const maxRetries = envConfig.MAX_RETRIES;
    let attempt = 0;
    let success = false;
    let currentKey: string | null = null;

    const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    let targetModel = model ?? "gemini-pro";
    targetModel = targetModel.replace("models/", "").replace(/^Proxy:\s*/, "");

    while (attempt < maxRetries && !success) {
      attempt++;

      try {
        currentKey = await keyService.getAndLockOptimalKey();

        if (!currentKey) {
          if (!res.headersSent) {
            return res.status(429).json({
              error: {
                message: "System overloaded. No available keys.",
                code: 429,
              },
            });
          }
          break;
        }

        this.io.emit("log", {
          id: requestId,
          type: "info",
          message: `[${targetModel}] Attempt ${attempt}/${maxRetries} -> Key: ...${currentKey.slice(-4)}`,
          timestamp: new Date().toLocaleTimeString(),
        });

        const generationConfig = this.buildGenerationConfig(req.body);

        if (stream) {
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

        success = true;

        // Update stats thành công
        statsService.trackRequest(currentKey, targetModel, true);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(
          `Attempt ${attempt} failed with key ...${currentKey?.slice(-4)}:`,
          errorMessage,
        );

        // Phân loại lỗi
        const isRateLimit =
          errorMessage.includes("429") ||
          errorMessage.includes("Quota") ||
          errorMessage.includes("exhausted");

        // Nếu có key, phạt nó ngay
        if (currentKey) {
          await keyService.incrementUsage(currentKey, true); // Tăng error count
          if (isRateLimit) {
            await keyService.updateKeyStatus(currentKey, "cooldown");
          }
        }

        this.io.emit("log", {
          id: requestId,
          type: "error",
          message: `Failed: ${isRateLimit ? "Rate Limit" : errorMessage}`,
          timestamp: new Date().toLocaleTimeString(),
        });

        // Nếu là Rate Limit -> Continue vòng lặp (Retry với key mới)
        // Nếu là lỗi khác (400 Bad Request, v.v) -> Break luôn
        if (!isRateLimit) {
          if (!res.headersSent) {
            res.status(500).json({ error: { message: errorMessage } });
          }
          break;
        }
      }
    }

    if (!success && !res.headersSent) {
      res.status(503).json({
        error: {
          message: "All retry attempts failed. Please try again later.",
          code: 503,
        },
      });
    }

    // Update Dashboard Stats một lần cuối cùng
    const allKeys = await keyService.getAllKeys();
    this.io.emit("stats_update", allKeys);
  };

  private handleStream = async (
    req: Request<object, object, IChatRequestBody>,
    res: Response,
    key: string,
    model: string,
    config: IGenerationConfig,
    reqId: string,
  ) => {
    if (!req.body.messages) {
      throw new Error("Messages are required");
    }

    const result = (await geminiService.generateContent(
      key,
      model,
      req.body.messages,
      config,
      true,
    )) as GenerateContentStreamResult;

    // Chỉ set header khi chắc chắn có result
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let isClientConnected = true;
    req.on("close", () => (isClientConnected = false));

    for await (const chunk of result.stream) {
      if (!isClientConnected) break;
      const text = chunk.text();
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

    await this.logSuccess(key, model, reqId, "Stream finished successfully.");
  };

  private handleNonStream = async (
    req: Request<object, object, IChatRequestBody>,
    res: Response,
    key: string,
    model: string,
    config: IGenerationConfig,
    reqId: string,
  ) => {
    if (!req.body.messages) {
      throw new Error("Messages are required");
    }

    const result = (await geminiService.generateContent(
      key,
      model,
      req.body.messages,
      config,
      false,
    )) as GenerateContentResult;

    const response = result.response;
    const text = response.text();

    await this.logSuccess(key, model, reqId, "Request finished successfully.");

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

  private async logSuccess(
    key: string,
    _model: string,
    reqId: string,
    msg: string,
  ) {
    await keyService.incrementUsage(key, false); // Tăng usage counter thành công
    this.io.emit("traffic_update");
    this.io.emit("log", {
      id: reqId,
      type: "success",
      message: msg,
      timestamp: new Date().toLocaleTimeString(),
    });
  }

  private buildGenerationConfig(body: IChatRequestBody): IGenerationConfig {
    const config: Partial<IGenerationConfig> = {
      temperature: body.temperature,
      maxOutputTokens: body.maxTokens,
      topP: body.topP,
      topK: body.topK,
    };
    // Xóa các key undefined để tránh gửi rác lên Google
    Object.keys(config).forEach(
      (key) =>
        config[key as keyof IGenerationConfig] === undefined &&
        delete config[key as keyof IGenerationConfig],
    );
    return config as IGenerationConfig;
  }
}
