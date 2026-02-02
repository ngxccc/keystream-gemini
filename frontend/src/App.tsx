import { useSocket } from "@/hooks/useSocket";
import { Header } from "@/components/layout/Header";

import { TrafficChart, StatsCards, SystemLogs } from "@/modules/dashboard";
import { AddKeyForm, KeyTable } from "@/modules/keys";

function App() {
  const { isConnected, trafficData, keys, logs, stats } = useSocket();

  return (
    <div className="mx-auto min-h-screen w-full max-w-400 bg-zinc-50 p-4 font-sans text-slate-800 md:p-6">
      <Header isConnected={isConnected} />

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-8">
          {/* Traffic Chart */}
          <div className="h-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <h3 className="font-semibold text-slate-700">
                📡 Live Traffic Monitor
              </h3>
              <span className="font-mono text-xs text-slate-400">
                Real-time updates
              </span>
            </div>
            <div className="h-[calc(100%-60px)] w-full p-4">
              <TrafficChart data={trafficData} />
            </div>
          </div>

          {/* Placeholders for Future Charts */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-400">
              [History Chart Placeholder]
            </div>
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-400">
              [Model Distribution Placeholder]
            </div>
          </div>

          {/* Key Management Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-3 font-semibold text-slate-700">
              Key Pool Status
            </div>
            <KeyTable keys={keys} />
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-4">
          {/* Add Key Form */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <AddKeyForm />
          </div>

          {/* Logs Terminal */}
          <SystemLogs logs={logs} />
        </div>
      </div>
    </div>
  );
}

export default App;
