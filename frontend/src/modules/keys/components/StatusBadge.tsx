import { ShieldCheck, Clock, AlertCircle } from "lucide-react";

interface StatusBadgeProps {
  status?: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
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
