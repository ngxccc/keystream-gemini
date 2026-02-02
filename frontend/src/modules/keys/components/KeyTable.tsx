import type { ApiKeyDTO } from "@shared/types";
import { ShieldCheck, AlertCircle, Clock, Hash } from "lucide-react";

interface KeyTableProps {
  keys?: ApiKeyDTO[];
}

export const KeyTable = ({ keys = [] }: KeyTableProps) => {
  return (
    <div className="w-full overflow-hidden bg-white">
      {/* Container có scroll ngang cho mobile */}
      <div className="custom-scrollbar overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          {/* --- HEADER --- */}
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium tracking-wider text-slate-500 uppercase">
            <tr>
              <th className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5" /> Key Hash
                </div>
              </th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Usage (Session)</th>
              <th className="px-6 py-4 text-right">Errors</th>
              <th className="hidden px-6 py-4 text-right md:table-cell">
                Total Req
              </th>
            </tr>
          </thead>

          {/* --- BODY --- */}
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {keys.length === 0 ? (
              <EmptyState />
            ) : (
              keys.map((key, index) => (
                <tr
                  key={index}
                  className="group transition-colors duration-150 hover:bg-slate-50/80"
                >
                  {/* Column 1: Key Hash */}
                  <td className="px-6 py-4 font-mono text-xs text-slate-600 md:text-sm">
                    <span className="rounded border border-slate-200 bg-slate-100 px-2 py-1 transition-colors group-hover:border-indigo-200 group-hover:bg-white">
                      {maskKey(key.key)}
                    </span>
                  </td>

                  {/* Column 2: Status */}
                  <td className="px-6 py-4">
                    <StatusBadge status={key.status} />
                  </td>

                  {/* Column 3: Usage */}
                  <td className="px-6 py-4 text-right font-medium">
                    {key.usageSession?.toLocaleString() ?? 0}
                  </td>

                  {/* Column 4: Errors (Highlight Red if > 0) */}
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`${(key.errorsSession ?? 0) > 0 ? "rounded bg-rose-50 px-2 py-1 font-bold text-rose-600" : "text-slate-400"}`}
                    >
                      {key.errorsSession ?? 0}
                    </span>
                  </td>

                  {/* Column 5: Total (Hidden on Mobile) */}
                  <td className="hidden px-6 py-4 text-right text-slate-500 md:table-cell">
                    {key.totalReq?.toLocaleString() ?? 0}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination placeholder if needed */}
      {keys.length > 0 && (
        <div className="flex justify-between border-t border-slate-200 bg-slate-50/50 px-6 py-3 text-xs text-slate-400">
          <span>Showing {keys.length} active keys</span>
          <span>Pool Health: Good</span>
        </div>
      )}
    </div>
  );
};

// --- Helper Components ---

// 1. Badge trạng thái đẹp mắt
const StatusBadge = ({ status }: { status?: string }) => {
  // Chuẩn hóa status về lowercase để check
  const s = status?.toLowerCase() ?? "unknown";

  if (s === "active" || s === "good") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
        <ShieldCheck className="h-3 w-3" /> Active
      </span>
    );
  }

  if (s === "rate_limited" || s === "busy") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
        <Clock className="h-3 w-3" /> Rate Limited
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700">
      <AlertCircle className="h-3 w-3" /> {status ?? "Error"}
    </span>
  );
};

// 2. Empty State khi chưa có key nào
const EmptyState = () => (
  <tr>
    <td
      colSpan={5}
      className="bg-slate-50/30 px-6 py-12 text-center text-slate-400"
    >
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
          <Hash className="h-5 w-5 text-slate-300" />
        </div>
        <p className="font-medium">No API Keys Found</p>
        <p className="max-w-xs text-xs">
          Add your Google AI Studio keys using the form on the right to start
          processing requests.
        </p>
      </div>
    </td>
  </tr>
);

// 3. Helper mask key nếu backend trả về raw key (chỉ hiện 4 kí tự cuối)
const maskKey = (keyString?: string) => {
  if (!keyString) return "UNKNOWN";
  if (keyString.length < 8) return keyString;
  return `...${keyString.slice(-8)}`;
};

export default KeyTable;
