import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";
import { keyService } from "../keys/key.service";
import envConfig from "@/config/config";
import type {
  ICategorizedModels,
  IGeminiModelListResponse,
  IGenerationConfig,
  IMessage,
} from "@/common/types";

class GeminiService {
  private models: ICategorizedModels = {
    text: [],
    image: [],
    video: [],
    embedding: [],
  };

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

  public async fetchGoogleModels() {
    const key = await keyService.getAndLockOptimalKey();
    if (!key) {
      console.warn("⚠️ No active keys available to fetch models.");
      if (this.models.text.length === 0) this.loadFallbackModels();
      return;
    }

    try {
      const response = await fetch(
        `${envConfig.GEMINI_API_BASE_URL}?key=${key}`,
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = (await response.json()) as IGeminiModelListResponse;

      if (data.models) {
        const tempModels: ICategorizedModels = {
          text: [],
          image: [],
          video: [],
          embedding: [],
        };

        data.models.forEach((m) => {
          const cleanName = m.name.replace("models/", "");
          const methods = m.supportedGenerationMethods || [];

          if (methods.includes("generateContent")) {
            tempModels.text.push(cleanName);
          } else if (methods.includes("predict")) {
            tempModels.image.push(cleanName); // Imagen
          } else if (methods.includes("predictLongRunning")) {
            tempModels.video.push(cleanName); // Veo
          } else if (methods.includes("embedContent")) {
            tempModels.embedding.push(cleanName);
          }
        });

        // TODO: enhance sort logic
        tempModels.text.sort((a, b) => {
          const priority = (name: string) => {
            if (name.includes("gemini-3-pro")) return 4;
            if (name.includes("gemini-2.5-pro")) return 3;
            if (name.includes("gemini-1.5-pro")) return 2;
            if (name.includes("flash")) return 1;
            return 0;
          };
          return priority(b) - priority(a); // Descending
        });

        this.models = tempModels;
        console.log(
          `✅ Fetched: ${this.models.text.length} Text, ${this.models.image.length} Image, ${this.models.video.length} Video models.`,
        );
      }
    } catch (e) {
      console.error(
        "❌ Error fetching models:",
        e instanceof Error ? e.message : String(e),
      );
      if (this.models.text.length === 0) this.loadFallbackModels();
    }
  }

  private loadFallbackModels() {
    this.models.text = [
      "gemini-3-pro-preview",
      "gemini-2.5-pro",
      "gemini-1.5-pro",
      "gemini-3-flash-preview",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
    ];
  }

  public getAllModelCategories() {
    return this.models;
  }

  public initializeModelFetching() {
    setTimeout(
      () => void this.fetchGoogleModels(),
      envConfig.INITIAL_MODEL_FETCH_DELAY,
    );
    setInterval(
      () => void this.fetchGoogleModels(),
      envConfig.MODEL_FETCH_INTERVAL,
    );
  }

  public async generateContent(
    apiKey: string,
    modelName: string,
    messages: IMessage[],
    generationConfig: IGenerationConfig = {},
    stream = false,
  ) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const { contents, systemInstruction } = this.mapMessagesToGemini(messages);

    if (modelName.includes("thinking")) {
      // Có thể override config ở đây nếu cần thiết
    }

    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
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
