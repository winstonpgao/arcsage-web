"use client";

import { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { useAppStore } from "@/store/app-store";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { setConfig, setSettings, setConfigLoaded } = useAppStore();

  // Load configuration on mount
  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch("/api/config");
        if (response.ok) {
          const data = await response.json();
          setConfig(data.config);
          setSettings(data.settings);
        }
      } catch (error) {
        console.error("Failed to load config:", error);
      } finally {
        setConfigLoaded(true);
      }
    }
    loadConfig();
  }, [setConfig, setSettings, setConfigLoaded]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
