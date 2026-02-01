import { useSocket } from "./hooks/useSocket";
import { TrafficChart } from "./components/TrafficChart";
import { AddKeyForm } from "./components/AddKeyForm";
import KeyTable from "./components/KeyTable";

interface StatsCardProps {
  title: string;
  value: number | string;
  color: string;
}

function App() {
  // Giả định hook trả về thêm stats
  const { isConnected, trafficData, keys, logs, stats } = useSocket();

  return (
    // FIX: max-w-400 -> max-w-[1600px]
    // bg-zinc-50: ok
    <div className="min-h-screen w-full max-w-400 mx-auto p-4 md:p-6 bg-zinc-50 text-slate-800 font-sans">
      {/* --- HEADER --- */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="flex items-center gap-3 text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            <span className="animate-bounce">✨</span>
            <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-500 to-purple-600">
              KeyStream-Gemini
            </span>
          </h2>
          <div className="mt-2 flex items-center gap-2">
            <div
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                isConnected
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : "bg-rose-100 text-rose-700 border-rose-200"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full mr-1.5 ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
              ></span>
              {isConnected ? "SYSTEM ONLINE" : "DISCONNECTED"}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50">
            Config
          </button>
          <button className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50">
            Theme
          </button>
        </div>
      </header>

      {/* --- PART 1: STATS CARDS (Mới thêm vào) --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Requests"
          value={stats?.total || 0}
          color="text-indigo-600"
        />
        <StatsCard
          title="Success Rate"
          value={`${stats?.successRate || 0}%`}
          color="text-emerald-600"
        />
        <StatsCard
          title="Errors"
          value={stats?.errors || 0}
          color="text-rose-600"
        />
        <StatsCard
          title="Avg Daily"
          value={stats?.avg || 0}
          color="text-amber-600"
        />
      </div>

      {/* --- PART 2: MAIN GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* === LEFT COLUMN (8/12) === */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Traffic Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-100">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-semibold text-slate-700">
                📡 Live Traffic Monitor
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Real-time updates
              </span>
            </div>
            <div className="p-4 h-[calc(100%-60px)] w-full">
              <TrafficChart data={trafficData} />
            </div>
          </div>

          {/* Secondary Charts Area (Placeholder for History/Model Dist) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 h-64 flex items-center justify-center text-slate-400 text-sm">
              [History Chart Component]
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 h-64 flex items-center justify-center text-slate-400 text-sm">
              [Model Dist Chart Component]
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50 font-semibold text-slate-700">
              Key Pool Status
            </div>
            <KeyTable keys={keys} />
          </div>
        </div>

        {/* === RIGHT COLUMN (4/12) === */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Add Key Form */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <AddKeyForm />
          </div>

          {/* Logs Terminal */}
          <div className="bg-[#1e1e1e] rounded-xl shadow-md border border-slate-800 overflow-hidden flex flex-col h-125 sticky top-6">
            <div className="px-4 py-2 bg-[#2d2d2d] border-b border-[#3e3e3e] flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="ml-2 text-xs text-gray-400 font-mono">
                system_logs.log
              </span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs md:text-sm space-y-2 custom-scrollbar">
              {logs.length === 0 && (
                <span className="text-gray-500 italic">
                  Waiting for incoming signals...
                </span>
              )}
              {logs.map((l, i) => (
                <div
                  key={i}
                  className="flex gap-2 break-all hover:bg-white/5 p-0.5 rounded"
                >
                  <span className="text-gray-500 shrink-0">
                    [{l.timestamp}]
                  </span>
                  <span
                    className={
                      l.type === "error"
                        ? "text-red-400 font-bold"
                        : "text-emerald-400"
                    }
                  >
                    {l.type === "error" ? "✖" : "➜"} {l.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mini Component cho Stats Card để code đỡ dài
const StatsCard = ({ title, value, color }: StatsCardProps) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
    <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">
      {title}
    </div>
    <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
  </div>
);

export default App;
