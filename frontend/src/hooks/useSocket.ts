/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LogEntry } from "@/shared/types";
import type { ApiKeyDTO } from "@shared/types";
import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";

interface Stats {
  total: number;
  successRate: number;
  errors: number;
  avg: number;
}

const SOCKET_URL = import.meta.env.DEV ? "http://localhost:13337" : "/";

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

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
    socketRef.current ??= io(SOCKET_URL, {
      path: "/socket.io",
      transports: ["websocket", "polling"], // Thử websocket trước, fail thì polling
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

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
      console.log("🟢 Socket Connected:", socket.id);
      setIsConnected(true);
      void fetchKeys();
    };

    const onDisconnect = (reason: string) => {
      console.log("🔴 Socket Disconnected:", reason);
      setIsConnected(false);
    };

    const onConnectError = (err: Error) => {
      console.error("⚠️ Socket Connection Error:", err.message);
    };

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
    socket.on("connect_error", onConnectError);
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
      socketRef.current = null;
    };
  }, []);

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

  return {
    socket: socketRef.current,
    isConnected,
    logs,
    keys,
    trafficData,
    stats,
  };
};
