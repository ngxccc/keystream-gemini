/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";

interface LogEntry {
  timestamp?: string;
  message?: string;
  [key: string]: any;
}

interface Stats {
  total: number;
  successRate: number;
  errors: number;
  avg: number;
}

export const useSocket = () => {
  const [socket] = useState<Socket>(() => io({ path: "/socket.io" }));
  const [stats, setStats] = useState<Stats>({
    total: 0,
    successRate: 0,
    errors: 0,
    avg: 0,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [keys, setKeys] = useState<any[]>([]);
  const [trafficData, setTrafficData] = useState<number[]>(Array(30).fill(0));

  useEffect(() => {
    // Kết nối về chính host hiện tại (nhờ Vite Proxy lo phần port)
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socket.on("stats", (data: Stats) => {
      setStats(data);
    });

    socket.on("log", (log: LogEntry) => {
      setLogs((prev) => [...prev.slice(-199), log]); // Giữ 200 log cuối
    });

    socket.on("stats_update", (updatedKeys: any[]) => {
      setKeys(updatedKeys);
    });

    socket.on("traffic_update", () => {
      setTrafficData((prev) => {
        const newData = [...prev];
        newData[newData.length - 1] += 1;
        return newData;
      });
    });

    return () => {
      socket.disconnect();
      socket.off("stats");
    };
  }, [socket]);

  // Update chart theo interval (giống logic cũ của bạn)
  useEffect(() => {
    const interval = setInterval(() => {
      setTrafficData((prev) => {
        const next = [...prev];
        next.shift();
        next.push(0);
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return { socket, isConnected, logs, keys, trafficData, stats };
};
