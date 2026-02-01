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
