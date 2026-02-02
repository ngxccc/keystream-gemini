import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  CheckCircle,
  AlertOctagon,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

const StatCard = ({
  title,
  value,
  icon: Icon,
  colorClass,
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className={`h-4 w-4 ${colorClass}`} />
    </CardHeader>
    <CardContent>
      <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
    </CardContent>
  </Card>
);

export const StatsGrid = ({
  stats,
}: {
  stats: {
    totalRequests: string | number;
    successRate: string | number;
    errors: string | number;
    avgDaily: string | number;
  };
}) => {
  // stats prop structure: { totalRequests, successRate, errors, avgDaily }
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <StatCard
        title="Total Requests"
        value={stats.totalRequests}
        icon={Activity}
        colorClass="text-primary"
      />
      <StatCard
        title="Success Rate"
        value={stats.successRate}
        icon={CheckCircle}
        colorClass="text-emerald-500"
      />
      <StatCard
        title="Errors"
        value={stats.errors}
        icon={AlertOctagon}
        colorClass="text-rose-500"
      />
      <StatCard
        title="Avg Daily (7d)"
        value={stats.avgDaily}
        icon={BarChart3}
        colorClass="text-amber-500"
      />
    </div>
  );
};
