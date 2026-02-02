import type { LogEntry } from "@/shared/types";

export function SystemLogs({ logs }: { logs: LogEntry[] }) {
  return (
    <div className="sticky top-6 flex h-125 flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#1e1e1e] shadow-md">
      {/* Terminal Header */}
      <div className="flex items-center gap-2 border-b border-[#3e3e3e] bg-[#2d2d2d] px-4 py-2">
        <div className="h-3 w-3 rounded-full bg-red-500"></div>
        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
        <div className="h-3 w-3 rounded-full bg-green-500"></div>
        <span className="ml-2 font-mono text-xs text-gray-400">
          system_logs.log
        </span>
      </div>

      {/* Terminal Body */}
      <div className="custom-scrollbar flex-1 space-y-2 overflow-y-auto p-4 font-mono text-xs md:text-sm">
        {logs.length === 0 && (
          <span className="text-gray-500 italic">
            Waiting for incoming signals...
          </span>
        )}
        {logs.map((l, i) => (
          <div
            key={i}
            className="flex gap-2 rounded p-0.5 break-all hover:bg-white/5"
          >
            <span className="shrink-0 text-gray-500">[{l.timestamp}]</span>
            <span
              className={
                l.type === "error"
                  ? "font-bold text-red-400"
                  : "text-emerald-400"
              }
            >
              {l.type === "error" ? "✖" : "➜"} {l.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
