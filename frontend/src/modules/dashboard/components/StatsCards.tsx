import { Card } from "@/components/ui/card";

interface StatsData {
  total: number;
  successRate: number;
  errors: number;
  avg: number;
}

export function StatsCards({ stats }: { stats: StatsData }) {
  const items = [
    {
      title: "Total Requests",
      value: stats?.total || 0,
      color: "text-indigo-600",
    },
    {
      title: "Success Rate",
      value: `${stats?.successRate || 0}%`,
      color: "text-emerald-600",
    },
    { title: "Errors", value: stats?.errors || 0, color: "text-rose-600" },
    { title: "Avg Daily", value: stats?.avg || 0, color: "text-amber-600" },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
      {items.map((item, idx) => (
        <Card key={idx} className="border-slate-200 p-4 shadow-sm">
          <div className="text-xs font-medium tracking-wider text-slate-500 uppercase">
            {item.title}
          </div>
          <div className={`mt-1 text-2xl font-bold ${item.color}`}>
            {item.value}
          </div>
        </Card>
      ))}
    </div>
  );
}
