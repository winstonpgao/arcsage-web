import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MathProblem, YearLevel, Difficulty, MathTopic, ChatMessage, SessionStats, YEAR_TOPICS } from '@/types/math';
import { generateProblem } from './problemGenerator';

export type LLMProvider = 'none' | 'anthropic' | 'openai' | 'gemini' | 'xai';
export type Theme = 'purple' | 'blue' | 'green' | 'orange' | 'pink';

interface APIKeys {
  anthropic: string;
  openai: string;
  gemini: string;
  xai: string;
}

// Problem history entry with marking
export interface ProblemHistoryEntry {
  id: string;
  problem: MathProblem;
  userAnswer: string;
  isCorrect: boolean;
  timestamp: Date;
  timeSpent: number; // in seconds
}

// User profile
export interface UserProfile {
  id: string;
  name: string;
  avatar: string; // emoji or avatar code
  createdAt: Date;
}

interface MathBuddyState {
  // Theme
  theme: Theme;

  // User profile
  currentProfile: UserProfile | null;
  profiles: UserProfile[];

  // User settings
  studentName: string;
  yearLevel: YearLevel;
  difficulty: Difficulty;
  selectedTopic: MathTopic | null;

  // LLM settings
  llmProvider: LLMProvider;
  apiKeys: APIKeys;

  // Current session
  currentProblem: MathProblem | null;
  userAnswer: string;
  isCorrect: boolean | null;
  showExplanation: boolean;
  problemStartTime: number | null; // timestamp when problem started

  // Problem queue for navigation
  problemQueue: MathProblem[];
  currentProblemIndex: number;

  // Problem history
  history: ProblemHistoryEntry[];

  // Chat
  chatMessages: ChatMessage[];
  isAiSpeaking: boolean;
  isChatLoading: boolean;

  // Stats
  stats: SessionStats;

  // Voice settings
  voiceEnabled: boolean;
  voiceRate: number;

  // Visual settings
  showBlockNumbers: boolean;

  // Theme actions
  setTheme: (theme: Theme) => void;

  // Profile actions
  createProfile: (name: string, avatar: string) => void;
  switchProfile: (id: string) => void;
  deleteProfile: (id: string) => void;
  updateProfile: (id: string, updates: Partial<Pick<UserProfile, 'name' | 'avatar'>>) => void;

  // User settings actions
  setStudentName: (name: string) => void;
  setYearLevel: (level: YearLevel) => void;
  setDifficulty: (diff: Difficulty) => void;
  setSelectedTopic: (topic: MathTopic | null) => void;

  setLLMProvider: (provider: LLMProvider) => void;
  setApiKey: (provider: keyof APIKeys, key: string) => void;
  getActiveApiKey: () => string;

  generateNewProblem: () => void;
  goToNextProblem: () => void;
  goToPreviousProblem: () => void;
  skipProblem: () => void;
  setUserAnswer: (answer: string) => void;
  checkAnswer: () => boolean;
  revealExplanation: () => void;

  // History actions
  clearHistory: () => void;
  getRecentHistory: (limit?: number) => ProblemHistoryEntry[];
  getHistoryByTopic: (topic: MathTopic) => ProblemHistoryEntry[];

  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChat: () => void;
  setIsAiSpeaking: (speaking: boolean) => void;
  setIsChatLoading: (loading: boolean) => void;

  setVoiceEnabled: (enabled: boolean) => void;
  setVoiceRate: (rate: number) => void;
  setShowBlockNumbers: (show: boolean) => void;

  resetStats: () => void;
  resetSession: () => void;
}

export const useMathBuddyStore = create<MathBuddyState>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'purple',

      currentProfile: null,
      profiles: [],

      studentName: '',
      yearLevel: 1,
      difficulty: 'easy',
      selectedTopic: null,

      llmProvider: 'none',
      apiKeys: {
        anthropic: '',
        openai: '',
        gemini: '',
        xai: '',
      },

      currentProblem: null,
      userAnswer: '',
      isCorrect: null,
      showExplanation: false,
      problemStartTime: null,

      problemQueue: [],
      currentProblemIndex: 0,

      history: [],

      chatMessages: [],
      isAiSpeaking: false,
      isChatLoading: false,

      stats: {
        totalProblems: 0,
        correctAnswers: 0,
        currentStreak: 0,
        bestStreak: 0,
        topicsStudied: [],
        timeSpent: 0,
      },

      voiceEnabled: true,
      voiceRate: 0.9, // Slightly slower default for kids
      showBlockNumbers: false, // Hide by default

      // Theme actions
      setTheme: (theme) => set({ theme }),

      // Profile actions
      createProfile: (name, avatar) => {
        const newProfile: UserProfile = {
          id: Math.random().toString(36).substring(2, 9),
          name,
          avatar,
          createdAt: new Date(),
        };
        set((state) => ({
          profiles: [...state.profiles, newProfile],
          currentProfile: newProfile,
          studentName: name,
        }));
      },

      switchProfile: (id) => {
        const profile = get().profiles.find((p) => p.id === id);
        if (profile) {
          set({ currentProfile: profile, studentName: profile.name });
        }
      },

      deleteProfile: (id) => {
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
          currentProfile: state.currentProfile?.id === id ? null : state.currentProfile,
        }));
      },

      updateProfile: (id, updates) => {
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
          currentProfile:
            state.currentProfile?.id === id
              ? { ...state.currentProfile, ...updates }
              : state.currentProfile,
        }));
      },

      // User settings actions
      setStudentName: (name) => set({ studentName: name }),
      setYearLevel: (level) => set({ yearLevel: level, selectedTopic: null }),
      setDifficulty: (diff) => set({ difficulty: diff }),
      setSelectedTopic: (topic) => set({ selectedTopic: topic }),

      setLLMProvider: (provider) => set({ llmProvider: provider }),
      setApiKey: (provider, key) => set((state) => ({
        apiKeys: { ...state.apiKeys, [provider]: key }
      })),
      getActiveApiKey: () => {
        const { llmProvider, apiKeys } = get();
        if (llmProvider === 'none') return '';
        return apiKeys[llmProvider] || '';
      },

      generateNewProblem: () => {
        const { yearLevel, difficulty, selectedTopic, problemQueue, currentProblemIndex } = get();
        const topics = YEAR_TOPICS[yearLevel];
        const topic = selectedTopic || topics[Math.floor(Math.random() * topics.length)];

        const problem = generateProblem(topic, yearLevel, difficulty);

        // Add to queue
        const newQueue = [...problemQueue.slice(0, currentProblemIndex + 1), problem];
        const newIndex = newQueue.length - 1;

        set({
          currentProblem: problem,
          problemQueue: newQueue,
          currentProblemIndex: newIndex,
          userAnswer: '',
          isCorrect: null,
          showExplanation: false,
          chatMessages: [],
          problemStartTime: Date.now(),
        });
      },

      goToNextProblem: () => {
        const { problemQueue, currentProblemIndex, yearLevel, difficulty, selectedTopic } = get();

        // If there's a next problem in the queue, go to it
        if (currentProblemIndex < problemQueue.length - 1) {
          const nextIndex = currentProblemIndex + 1;
          set({
            currentProblem: problemQueue[nextIndex],
            currentProblemIndex: nextIndex,
            userAnswer: '',
            isCorrect: null,
            showExplanation: false,
            chatMessages: [],
            problemStartTime: Date.now(),
          });
        } else {
          // Generate a new problem
          get().generateNewProblem();
        }
      },

      goToPreviousProblem: () => {
        const { problemQueue, currentProblemIndex } = get();

        if (currentProblemIndex > 0) {
          const prevIndex = currentProblemIndex - 1;
          set({
            currentProblem: problemQueue[prevIndex],
            currentProblemIndex: prevIndex,
            userAnswer: '',
            isCorrect: null,
            showExplanation: false,
            chatMessages: [],
            problemStartTime: Date.now(),
          });
        }
      },

      skipProblem: () => {
        // Skip without showing answer - just go to next problem
        get().goToNextProblem();
      },

      setUserAnswer: (answer) => set({ userAnswer: answer }),

      checkAnswer: () => {
        const { currentProblem, userAnswer, stats, problemStartTime, history } = get();
        if (!currentProblem) return false;

        const normalizedUserAnswer = userAnswer.trim().toLowerCase();
        const correctAnswer = String(currentProblem.answer).toLowerCase();

        // Check main answer and acceptable alternatives
        const isCorrect =
          normalizedUserAnswer === correctAnswer ||
          currentProblem.acceptableAnswers?.some(
            (alt) => String(alt).toLowerCase() === normalizedUserAnswer
          ) ||
          // Handle numeric comparison
          parseFloat(normalizedUserAnswer) === parseFloat(correctAnswer);

        const newStreak = isCorrect ? stats.currentStreak + 1 : 0;
        const newBestStreak = Math.max(stats.bestStreak, newStreak);

        // Update stats
        const newTopics = stats.topicsStudied.includes(currentProblem.topic)
          ? stats.topicsStudied
          : [...stats.topicsStudied, currentProblem.topic];

        // Calculate time spent
        const timeSpent = problemStartTime ? Math.round((Date.now() - problemStartTime) / 1000) : 0;

        // Add to history
        const historyEntry: ProblemHistoryEntry = {
          id: Math.random().toString(36).substring(2, 9),
          problem: currentProblem,
          userAnswer,
          isCorrect,
          timestamp: new Date(),
          timeSpent,
        };

        set({
          isCorrect,
          history: [historyEntry, ...history].slice(0, 100), // Keep last 100 entries
          stats: {
            ...stats,
            totalProblems: stats.totalProblems + 1,
            correctAnswers: isCorrect ? stats.correctAnswers + 1 : stats.correctAnswers,
            currentStreak: newStreak,
            bestStreak: newBestStreak,
            topicsStudied: newTopics,
            timeSpent: stats.timeSpent + timeSpent,
          },
        });

        return isCorrect;
      },

      revealExplanation: () => set({ showExplanation: true }),

      // History actions
      clearHistory: () => set({ history: [] }),

      getRecentHistory: (limit = 10) => {
        return get().history.slice(0, limit);
      },

      getHistoryByTopic: (topic) => {
        return get().history.filter((h) => h.problem.topic === topic);
      },

      addChatMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date(),
        };
        set((state) => ({
          chatMessages: [...state.chatMessages, newMessage],
        }));
      },

      clearChat: () => set({ chatMessages: [] }),

      setIsAiSpeaking: (speaking) => set({ isAiSpeaking: speaking }),
      setIsChatLoading: (loading) => set({ isChatLoading: loading }),

      setVoiceEnabled: (enabled) => set({ voiceEnabled: enabled }),
      setVoiceRate: (rate) => set({ voiceRate: rate }),
      setShowBlockNumbers: (show) => set({ showBlockNumbers: show }),

      resetStats: () =>
        set({
          stats: {
            totalProblems: 0,
            correctAnswers: 0,
            currentStreak: 0,
            bestStreak: 0,
            topicsStudied: [],
            timeSpent: 0,
          },
        }),

      resetSession: () =>
        set({
          currentProblem: null,
          problemQueue: [],
          currentProblemIndex: 0,
          userAnswer: '',
          isCorrect: null,
          showExplanation: false,
          chatMessages: [],
          problemStartTime: null,
          stats: {
            totalProblems: 0,
            correctAnswers: 0,
            currentStreak: 0,
            bestStreak: 0,
            topicsStudied: [],
            timeSpent: 0,
          },
        }),
    }),
    {
      name: 'mathbuddy-storage',
      version: 4,
      partialize: (state) => ({
        theme: state.theme,
        currentProfile: state.currentProfile,
        profiles: state.profiles,
        studentName: state.studentName,
        yearLevel: state.yearLevel,
        difficulty: state.difficulty,
        llmProvider: state.llmProvider,
        apiKeys: state.apiKeys,
        stats: state.stats,
        history: state.history,
        voiceEnabled: state.voiceEnabled,
        voiceRate: state.voiceRate,
        showBlockNumbers: state.showBlockNumbers,
      }),
      migrate: (persistedState, version) => {
        const state = persistedState as Record<string, unknown>;

        // Migration from v1 (single apiKey) to v2 (multi-provider)
        if (version < 2) {
          // Handle old single apiKey field
          const oldApiKey = state.apiKey as string | undefined;
          if (oldApiKey && !state.apiKeys) {
            state.apiKeys = {
              anthropic: oldApiKey,
              openai: '',
              gemini: '',
              xai: '',
            };
            state.llmProvider = 'anthropic';
          }
          delete state.apiKey;

          // Ensure apiKeys exists
          if (!state.apiKeys) {
            state.apiKeys = {
              anthropic: '',
              openai: '',
              gemini: '',
              xai: '',
            };
          }

          // Ensure llmProvider exists
          if (!state.llmProvider) {
            state.llmProvider = 'none';
          }

          // Clamp yearLevel to 1-6 range (migration from old 6-10 range)
          const yearLevel = state.yearLevel as number;
          if (yearLevel > 6) {
            state.yearLevel = 6;
          } else if (yearLevel < 1) {
            state.yearLevel = 1;
          }
        }

        // Migration from v2 to v3 (add theme, profiles, history)
        if (version < 3) {
          if (!state.theme) {
            state.theme = 'purple';
          }
          if (!state.profiles) {
            state.profiles = [];
          }
          if (!state.currentProfile) {
            state.currentProfile = null;
          }
          if (!state.history) {
            state.history = [];
          }
        }

        // Migration to v4 (force showBlockNumbers to false for all users)
        if (version < 4) {
          state.showBlockNumbers = false;
        }

        return state as unknown as MathBuddyState;
      },
    }
  )
);
