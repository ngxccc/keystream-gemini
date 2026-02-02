/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LogEntry } from "@/shared/types";
import type { ApiKeyDTO } from "@shared/types";
import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";

interface Stats {
  total: number;
  successRate: number;
  errors: number;
  avg: number;
}

export const useSocket = () => {
  const [socket] = useState<Socket>(() =>
    io({
      path: "/socket.io",
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    }),
  );

  const [stats, setStats] = useState<Stats>({
    total: 0,
    successRate: 0,
    errors: 0,
    avg: 0,
  });

  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [keys, setKeys] = useState<ApiKeyDTO[]>([]);
  const [trafficData, setTrafficData] = useState<number[]>(Array(30).fill(0));

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const res = await fetch("/api/keys");
        if (res.ok) {
          const data = (await res.json()) as ApiKeyDTO[];
          setKeys(data);
        }
      } catch (error) {
        console.error("Failed to fetch initial keys:", error);
      }
    };

    const onConnect = () => {
      setIsConnected(true);
      void fetchKeys();
    };

    const onDisconnect = () => setIsConnected(false);

    const onStats = (data: Stats) => setStats(data);

    const onLog = (log: LogEntry) => {
      setLogs((prev) => [...prev.slice(-199), log]);
    };

    const onStatsUpdate = (updatedKeys: any[]) => {
      // Socket báo có biến -> Cập nhật lại list key
      console.log("Socket received keys update:", updatedKeys.length);
      setKeys(updatedKeys);
    };

    const onTrafficUpdate = () => {
      setTrafficData((prev) => {
        const newData = [...prev];
        newData[newData.length - 1] += 1;
        return newData;
      });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("stats", onStats);
    socket.on("log", onLog);
    socket.on("stats_update", onStatsUpdate);
    socket.on("traffic_update", onTrafficUpdate);

    fetchKeys().catch((e) => console.error("Initial fetch failed", e));

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("stats", onStats);
      socket.off("log", onLog);
      socket.off("stats_update", onStatsUpdate);
      socket.off("traffic_update", onTrafficUpdate);
      socket.disconnect();
    };
  }, [socket]);

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
