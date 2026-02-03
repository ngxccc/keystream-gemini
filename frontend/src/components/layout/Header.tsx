import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface HeaderProps {
  isConnected: boolean;
}

export function Header({ isConnected }: HeaderProps) {
  const [isCopying, setIsCopying] = useState(false);

  const handleCopyConfig = async () => {
    try {
      setIsCopying(true);
      // 1. Gọi API lấy danh sách model mới nhất từ Backend
      const res = await fetch("/api/gemini/models");
      if (!res.ok) throw new Error("Failed to fetch models");

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data = await res.json();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const textModels: string[] = data.data.text ?? [];

      if (textModels.length === 0) {
        toast.error("No models found. Please check backend.");
        return;
      }

      // 2. Tạo template YAML cho Continue.dev
      const yamlLines = textModels.map((model) => {
        // Tự động detect context length (giả lập)
        const contextLength =
          model.includes("1.5") || model.includes("flash") ? 1000000 : 32000;

        return `  - name: "⚡ ${model}"
    model: "${model}"
    provider: openai
    apiBase: "http://localhost:13337/v1"
    apiKey: "sk-local-proxy"
    contextLength: ${contextLength}`;
      });

      const configContent = `models:\n${yamlLines.join("\n")}`;

      // 3. Copy vào clipboard
      await navigator.clipboard.writeText(configContent);
      toast.success("Continue.dev config copied to clipboard!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate config.");
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <header className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h2 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          <span className="animate-bounce">✨</span>
          <span className="bg-linear-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            KeyStream Gemini
          </span>
        </h2>
        <div className="mt-2 flex items-center gap-2">
          <div
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${
              isConnected
                ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                : "border-rose-200 bg-rose-100 text-rose-700"
            }`}
          >
            <span
              className={`mr-1.5 h-2 w-2 rounded-full ${
                isConnected ? "animate-pulse bg-emerald-500" : "bg-rose-500"
              }`}
            ></span>
            {isConnected ? "SYSTEM ONLINE" : "DISCONNECTED"}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="gap-2 shadow-sm"
          onClick={() => void handleCopyConfig()}
          disabled={isCopying}
        >
          {isCopying ? (
            <Settings className="h-4 w-4 animate-spin" />
          ) : (
            <Settings className="h-4 w-4" />
          )}
          Config
        </Button>
        <Button variant="outline" className="shadow-sm">
          Theme
        </Button>
      </div>
    </header>
  );
}
