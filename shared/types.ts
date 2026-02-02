export interface IGenerationConfig {
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
}

export interface IMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ILogEntry {
  id: string;
  type: "info" | "success" | "error";
  message: string;
  timestamp: string;
}

export interface IGeminiModel {
  name: string;
  version: string;
  displayName: string;
  description: string;
  inputTokenLimit: number;
  outputTokenLimit: number;
  supportedGenerationMethods: string[];
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTemperature?: number;
  thinking?: boolean;
}

export interface IGeminiModelListResponse {
  models: IGeminiModel[];
}

export interface ICategorizedModels {
  text: string[]; // Model chat (generateContent)
  image: string[]; // Model vẽ tranh (predict - Imagen)
  video: string[]; // Model tạo video (predictLongRunning - Veo)
  embedding: string[]; // Model embedding (embedContent)
}

export interface IChatRequestBody {
  model?: string;
  stream?: boolean;
  messages?: IMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

export interface ApiKeyDTO {
  key: string;
  status: string;
  usageSession?: number;
  errorsSession?: number;
  totalReq?: number;
  lastUsed: number;
  createdAt?: string | Date;
}
