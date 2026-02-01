/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { keyService } from "../keys/key.service";
import envConfig from "@/config/config";
import type { IGenerationConfig, IMessage } from "@/common/types";

class GeminiService {
  private dynamicModels: string[] = [];

  // --- Helper: Map Message ---
  public mapMessagesToGemini(messages: IMessage[]) {
    const systemParts: { text: string }[] = [];
    const contents: { role: string; parts: { text: string }[] }[] = [];

    for (const msg of messages) {
      if (msg.role === "system") {
        systemParts.push({ text: msg.content });
      } else {
        const role = msg.role === "assistant" ? "model" : "user";
        contents.push({ role, parts: [{ text: msg.content }] });
      }
    }

    const systemInstruction =
      systemParts.length > 0 ? { role: "user", parts: systemParts } : undefined;
    return { contents, systemInstruction };
  }

  // --- Core: Fetch Models ---
  public async fetchGoogleModels() {
    const key = await keyService.getOptimalKey();
    if (!key) {
      console.warn("⚠️ No active keys available to fetch models.");
      return;
    }

    try {
      const response = await fetch(
        `${envConfig.GEMINI_API_BASE_URL}?key=${key}`,
      );
      const data: any = await response.json();

      if (data.models) {
        this.dynamicModels = data.models
          .filter((m: any) =>
            m.supportedGenerationMethods?.includes("generateContent"),
          )
          .map((m: any) => m.name.replace("models/", ""));

        this.dynamicModels.sort((a) => (a.includes("pro") ? -1 : 1));
        console.log(`✅ Fetched ${this.dynamicModels.length} Gemini models.`);
      }
    } catch (e: any) {
      console.error("❌ Error fetching models:", e.message);
      if (this.dynamicModels.length === 0) {
        this.dynamicModels = [
          "gemini-2.0-flash",
          "gemini-1.5-pro",
          "gemini-1.5-flash",
        ];
      }
    }
  }

  public getDynamicModels() {
    return this.dynamicModels;
  }

  public initializeModelFetching() {
    setTimeout(
      () => this.fetchGoogleModels(),
      envConfig.INITIAL_MODEL_FETCH_DELAY,
    );
    setInterval(() => this.fetchGoogleModels(), envConfig.MODEL_FETCH_INTERVAL);
  }

  // --- Core: Generate ---
  public async generateContent(
    apiKey: string,
    modelName: string,
    messages: IMessage[],
    generationConfig: IGenerationConfig = {},
    stream = false,
  ) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const { contents, systemInstruction } = this.mapMessagesToGemini(messages);

    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction,
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT" as any,
          threshold: "BLOCK_NONE" as any,
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH" as any,
          threshold: "BLOCK_NONE" as any,
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT" as any,
          threshold: "BLOCK_NONE" as any,
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT" as any,
          threshold: "BLOCK_NONE" as any,
        },
      ],
    });

    if (stream) {
      return await model.generateContentStream({ contents, generationConfig });
    } else {
      return await model.generateContent({ contents, generationConfig });
    }
  }
}

export const geminiService = new GeminiService();
