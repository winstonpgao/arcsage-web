"use client";

import { useAppStore } from "@/store/app-store";
import {
  Calculator,
  Settings,
  History,
  Trophy,
  Star,
  Zap,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const {
    sessionStats,
    setShowSettings,
    setShowHistory,
    setShowAchievements,
    showSettings,
    showHistory,
    showAchievements,
  } = useAppStore();

  const navItems = [
    {
      icon: Calculator,
      label: "Practice",
      active: !showSettings && !showHistory && !showAchievements,
      onClick: () => {
        setShowSettings(false);
        setShowHistory(false);
        setShowAchievements(false);
      },
    },
    {
      icon: History,
      label: "History",
      active: showHistory,
      onClick: () => {
        setShowSettings(false);
        setShowHistory(true);
        setShowAchievements(false);
      },
    },
    {
      icon: Trophy,
      label: "Achievements",
      active: showAchievements,
      onClick: () => {
        setShowSettings(false);
        setShowHistory(false);
        setShowAchievements(true);
      },
    },
    {
      icon: Settings,
      label: "Settings",
      active: showSettings,
      onClick: () => {
        setShowSettings(true);
        setShowHistory(false);
        setShowAchievements(false);
      },
    },
  ];

  return (
    <aside
      className={cn(
        "w-64 bg-gradient-to-b from-indigo-600 to-purple-700 text-white flex flex-col",
        className
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
            🧮
          </div>
          <div>
            <h1 className="text-xl font-bold">MathBuddy</h1>
            <p className="text-xs text-white/70">Learn Math the Fun Way!</p>
          </div>
        </div>
      </div>

      {/* Session Stats */}
      <div className="p-4 border-b border-white/20">
        <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">
          This Session
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-300">
              <Star className="w-4 h-4" />
              <span className="font-bold">{sessionStats.correct}</span>
            </div>
            <p className="text-xs text-white/60 mt-1">Correct</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-orange-300">
              <Zap className="w-4 h-4" />
              <span className="font-bold">{sessionStats.streak}</span>
            </div>
            <p className="text-xs text-white/60 mt-1">Streak</p>
          </div>
        </div>
        <div className="mt-3 text-center text-sm text-white/70">
          {sessionStats.total > 0 ? (
            <>
              {sessionStats.correct}/{sessionStats.total} (
              {Math.round((sessionStats.correct / sessionStats.total) * 100)}%)
            </>
          ) : (
            "Start practicing!"
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.label}>
              <button
                onClick={item.onClick}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                  item.active
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Token Usage */}
      <div className="p-4 border-t border-white/20">
        <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
          Token Usage
        </h2>
        <div className="text-sm space-y-1">
          <div className="flex justify-between text-white/70">
            <span>Input:</span>
            <span>{sessionStats.inputTokens.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-white/70">
            <span>Output:</span>
            <span>{sessionStats.outputTokens.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-white font-medium pt-1 border-t border-white/20">
            <span>Cost:</span>
            <span>${sessionStats.totalCost.toFixed(4)}</span>
          </div>
        </div>
      </div>

      {/* Help */}
      <div className="p-4">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white/80 transition-colors">
          <HelpCircle className="w-4 h-4" />
          <span>How to Use</span>
        </button>
      </div>
    </aside>
  );
}
