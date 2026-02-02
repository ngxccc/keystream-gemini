export interface LogEntry {
  type?: "info" | "success" | "error";
  timestamp?: string;
  message?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
