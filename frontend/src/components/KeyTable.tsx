import { ShieldCheck, AlertCircle, Clock, Hash } from "lucide-react";

interface Key {
  hash?: string;
  key?: string;
  status?: string;
  usageSession?: number;
  errorsSession?: number;
  totalReq?: number;
}

interface KeyTableProps {
  keys?: Key[];
}

export const KeyTable = ({ keys = [] }: KeyTableProps) => {
  return (
    <div className="w-full overflow-hidden bg-white">
      {/* Container có scroll ngang cho mobile */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm text-left border-collapse">
          {/* --- HEADER --- */}
          <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs tracking-wider border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5" /> Key Hash
                </div>
              </th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Usage (Session)</th>
              <th className="px-6 py-4 text-right">Errors</th>
              <th className="px-6 py-4 text-right hidden md:table-cell">
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
                  className="hover:bg-slate-50/80 transition-colors duration-150 group"
                >
                  {/* Column 1: Key Hash */}
                  <td className="px-6 py-4 font-mono text-xs md:text-sm text-slate-600">
                    <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200 group-hover:bg-white group-hover:border-indigo-200 transition-colors">
                      {key.hash ?? maskKey(key.key)}
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
                      className={`${(key.errorsSession ?? 0) > 0 ? "text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded" : "text-slate-400"}`}
                    >
                      {key.errorsSession ?? 0}
                    </span>
                  </td>

                  {/* Column 5: Total (Hidden on Mobile) */}
                  <td className="px-6 py-4 text-right hidden md:table-cell text-slate-500">
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
        <div className="bg-slate-50/50 px-6 py-3 border-t border-slate-200 text-xs text-slate-400 flex justify-between">
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
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
        <ShieldCheck className="w-3 h-3" /> Active
      </span>
    );
  }

  if (s === "rate_limited" || s === "busy") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
        <Clock className="w-3 h-3" /> Rate Limited
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
      <AlertCircle className="w-3 h-3" /> {status ?? "Error"}
    </span>
  );
};

// 2. Empty State khi chưa có key nào
const EmptyState = () => (
  <tr>
    <td
      colSpan={5}
      className="px-6 py-12 text-center text-slate-400 bg-slate-50/30"
    >
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
          <Hash className="w-5 h-5 text-slate-300" />
        </div>
        <p className="font-medium">No API Keys Found</p>
        <p className="text-xs max-w-xs">
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
