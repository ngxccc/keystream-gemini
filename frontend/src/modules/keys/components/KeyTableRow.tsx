import type { ApiKeyDTO } from "@shared/types";
import { Copy, Trash2, Calendar, Clock } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

interface KeyTableRowProps {
  apiKey: ApiKeyDTO;
  onDelete?: (key: string) => void;
}

export const KeyTableRow = ({ apiKey, onDelete }: KeyTableRowProps) => {
  const [now] = useState(() => Date.now());

  const handleCopy = () => {
    void navigator.clipboard.writeText(apiKey.key);
    toast.success("Key copied to clipboard!");
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const formatLastUsed = (timestamp?: number) => {
    if (!timestamp || timestamp === 0) return "Never";
    const diff = now - timestamp;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return new Date(timestamp).toLocaleString("vi-VN");
  };

  const maskKey = (keyString?: string) => {
    if (!keyString) return "UNKNOWN";
    if (keyString.length < 8) return keyString;
    return `...${keyString.slice(-8)}`;
  };

  return (
    <tr className="group transition-colors duration-150 hover:bg-slate-50/80">
      {/* Key Hash + Copy */}
      <td className="px-6 py-4 font-mono text-xs text-slate-600 md:text-sm">
        <div className="flex items-center gap-2">
          <span className="rounded border border-slate-200 bg-slate-100 px-2 py-1 transition-colors group-hover:border-indigo-200 group-hover:bg-white">
            {maskKey(apiKey.key)}
          </span>
          <button
            onClick={handleCopy}
            className="hidden text-slate-400 group-hover:block hover:text-indigo-600"
            title="Copy full key"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <StatusBadge status={apiKey.status} />
      </td>

      {/* Session Usage */}
      <td className="px-6 py-4 text-right font-medium">
        {apiKey.usageSession?.toLocaleString() ?? 0}
      </td>

      {/* 4. Total Requests */}
      <td className="px-6 py-4 text-right text-slate-500">
        {apiKey.totalReq?.toLocaleString() ?? 0}
      </td>

      {/* 5. Errors */}
      <td className="px-6 py-4 text-right">
        <span
          className={`${(apiKey.errorsSession ?? 0) > 0 ? "rounded bg-rose-50 px-2 py-1 font-bold text-rose-600" : "text-slate-400"}`}
        >
          {apiKey.errorsSession ?? 0}
        </span>
      </td>

      {/* 6. Last Used */}
      <td className="px-6 py-4 text-xs whitespace-nowrap text-slate-500">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-slate-400" />
          {formatLastUsed(apiKey.lastUsed)}
        </div>
      </td>

      {/* 7. Created At */}
      <td className="px-6 py-4 text-xs whitespace-nowrap text-slate-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3 text-slate-400" />
          {formatDate(apiKey.createdAt as string)}
        </div>
      </td>

      {/* 8. Actions */}
      <td className="px-6 py-4 text-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
          onClick={() => onDelete?.(apiKey.key)}
          title="Remove Key"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
};
