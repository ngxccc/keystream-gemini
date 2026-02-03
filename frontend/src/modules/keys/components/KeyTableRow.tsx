import type { ApiKeyDTO } from "@shared/types";
import { StatusBadge } from "./StatusBadge";

interface KeyTableRowProps {
  apiKey: ApiKeyDTO;
}

export const KeyTableRow = ({ apiKey }: KeyTableRowProps) => {
  return (
    <tr className="group transition-colors duration-150 hover:bg-slate-50/80">
      {/* Column 1: Key Hash */}
      <td className="px-6 py-4 font-mono text-xs text-slate-600 md:text-sm">
        <span className="rounded border border-slate-200 bg-slate-100 px-2 py-1 transition-colors group-hover:border-indigo-200 group-hover:bg-white">
          {maskKey(apiKey.key)}
        </span>
      </td>

      {/* Column 2: Status */}
      <td className="px-6 py-4">
        <StatusBadge status={apiKey.status} />
      </td>

      {/* Column 3: Usage */}
      <td className="px-6 py-4 text-right font-medium">
        {apiKey.usageSession?.toLocaleString() ?? 0}
      </td>

      {/* Column 4: Errors (Highlight Red if > 0) */}
      <td className="px-6 py-4 text-right">
        <span
          className={`${(apiKey.errorsSession ?? 0) > 0 ? "rounded bg-rose-50 px-2 py-1 font-bold text-rose-600" : "text-slate-400"}`}
        >
          {apiKey.errorsSession ?? 0}
        </span>
      </td>

      {/* Column 5: Total (Hidden on Mobile) */}
      <td className="hidden px-6 py-4 text-right text-slate-500 md:table-cell">
        {apiKey.totalReq?.toLocaleString() ?? 0}
      </td>
    </tr>
  );
};

const maskKey = (keyString?: string) => {
  if (!keyString) return "UNKNOWN";
  if (keyString.length < 8) return keyString;
  return `...${keyString.slice(-8)}`;
};
