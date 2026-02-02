import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from "chart.js";
import type { ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
);

export const TrafficChart = ({ data }: { data: number[] }) => {
  const chartData = {
    labels: Array(30).fill(""),
    datasets: [
      {
        label: "Requests",
        data: data,
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { display: false },
      y: { display: false, beginAtZero: true },
    },
    plugins: { legend: { display: false } },
    animation: { duration: 0 },
  };

  return (
    <div style={{ height: "280px" }}>
      <Line data={chartData} options={options} />
    </div>
  );
};
