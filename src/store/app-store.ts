import { create } from "zustand";
import type { APIConfig, UserSettings, DEFAULT_API_CONFIG, DEFAULT_USER_SETTINGS } from "@/types/config";
import type { MathProblem, Message, SessionStats, Difficulty, Operation } from "@/types/math";

interface AppState {
  // Configuration
  config: APIConfig;
  settings: UserSettings;
  configLoaded: boolean;

  // Current session
  currentProblem: MathProblem | null;
  messages: Message[];
  sessionStats: SessionStats;
  difficulty: Difficulty;
  selectedOperation: Operation | null;
  sessionStartTime: Date | null;

  // UI state
  isLoading: boolean;
  showSettings: boolean;
  showHistory: boolean;
  showAchievements: boolean;

  // Actions - Config
  setConfig: (config: APIConfig) => void;
  setSettings: (settings: UserSettings) => void;
  setConfigLoaded: (loaded: boolean) => void;

  // Actions - Session
  setCurrentProblem: (problem: MathProblem | null) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  updateSessionStats: (updates: Partial<SessionStats>) => void;
  resetSessionStats: () => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setSelectedOperation: (operation: Operation | null) => void;
  startSession: () => void;

  // Actions - UI
  setIsLoading: (loading: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowHistory: (show: boolean) => void;
  setShowAchievements: (show: boolean) => void;
}

const initialStats: SessionStats = {
  correct: 0,
  total: 0,
  streak: 0,
  bestStreak: 0,
  inputTokens: 0,
  outputTokens: 0,
  totalCost: 0,
};

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  config: {
    llmProvider: "anthropic",
    llmModel: "claude-3-5-haiku-20241022",
    anthropicApiKey: "",
    openaiApiKey: "",
    maxTokens: 500,
    temperature: 0.7,
  },
  settings: {
    childName: "Friend",
    childAge: 8,
    preferredDifficulty: "auto",
    soundEnabled: true,
    celebrationsEnabled: true,
  },
  configLoaded: false,

  currentProblem: null,
  messages: [],
  sessionStats: initialStats,
  difficulty: "easy",
  selectedOperation: null,
  sessionStartTime: null,

  isLoading: false,
  showSettings: false,
  showHistory: false,
  showAchievements: false,

  // Config actions
  setConfig: (config) => set({ config }),
  setSettings: (settings) => set({ settings }),
  setConfigLoaded: (loaded) => set({ configLoaded: loaded }),

  // Session actions
  setCurrentProblem: (problem) => set({ currentProblem: problem }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
  updateSessionStats: (updates) =>
    set((state) => ({
      sessionStats: { ...state.sessionStats, ...updates },
    })),
  resetSessionStats: () => set({ sessionStats: initialStats }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setSelectedOperation: (operation) => set({ selectedOperation: operation }),
  startSession: () => set({ sessionStartTime: new Date() }),

  // UI actions
  setIsLoading: (loading) => set({ isLoading: loading }),
  setShowSettings: (show) => set({ showSettings: show }),
  setShowHistory: (show) => set({ showHistory: show }),
  setShowAchievements: (show) => set({ showAchievements: show }),
}));
