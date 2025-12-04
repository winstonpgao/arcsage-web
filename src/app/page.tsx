'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMathBuddyStore } from '@/lib/store';
import { ProblemDisplay } from '@/components/math/ProblemDisplay';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  Play,
  Settings,
  Trophy,
  Flame,
  Target,
  BookOpen,
  Volume2,
  VolumeX,
  X,
  History,
  User,
  Palette,
  Check,
  Clock,
  Plus,
} from 'lucide-react';
import { YEAR_TOPICS, TOPIC_NAMES, YearLevel, Difficulty } from '@/types/math';
import { LLMProvider, Theme } from '@/lib/store';
import { cn } from '@/lib/utils';

const THEME_CONFIG: Record<Theme, { name: string; colors: string; emoji: string }> = {
  purple: { name: 'Purple', colors: 'from-purple-500 to-pink-500', emoji: '💜' },
  blue: { name: 'Blue', colors: 'from-blue-500 to-cyan-500', emoji: '💙' },
  green: { name: 'Green', colors: 'from-green-500 to-teal-500', emoji: '💚' },
  orange: { name: 'Orange', colors: 'from-orange-500 to-yellow-500', emoji: '🧡' },
  pink: { name: 'Pink', colors: 'from-pink-500 to-purple-500', emoji: '💖' },
};

// Expanded avatar options - animals, characters, objects
const AVATARS = [
  // Animals
  '🦊', '🐱', '🐶', '🐰', '🦁', '🐼', '🐨', '🦄', '🐸', '🐵', '🦋', '🐯',
  '🐻', '🐮', '🐷', '🐹', '🐥', '🦉', '🐢', '🐬', '🦈', '🐙', '🦖', '🦕',
  // People & Characters
  '👦', '👧', '🧑', '👸', '🤴', '🧙', '🦸', '🧚', '🤖', '👽', '🎅', '🧛',
  // Objects & Symbols
  '⭐', '🌟', '💫', '🌈', '🎈', '🎨', '🚀', '⚽', '🎸', '🎮', '📚', '💎',
];

export default function HomePage() {
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showProfiles, setShowProfiles] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'general' | 'theme' | 'ai'>('general');
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileAvatar, setNewProfileAvatar] = useState('🦊');
  const [isStarted, setIsStarted] = useState(false);
  const [mounted, setMounted] = useState(false);

  const {
    theme,
    setTheme,
    currentProfile,
    profiles,
    createProfile,
    switchProfile,
    studentName,
    setStudentName,
    yearLevel,
    setYearLevel,
    difficulty,
    setDifficulty,
    selectedTopic,
    setSelectedTopic,
    llmProvider,
    setLLMProvider,
    apiKeys,
    setApiKey,
    currentProblem,
    generateNewProblem,
    goToNextProblem,
    goToPreviousProblem,
    skipProblem,
    problemQueue,
    currentProblemIndex,
    stats,
    history,
    voiceEnabled,
    setVoiceEnabled,
  } = useMathBuddyStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStart = () => {
    generateNewProblem();
    setIsStarted(true);
  };

  const handleProblemComplete = (correct: boolean) => {
    // Stats are updated in the store's checkAnswer
    // Don't auto-advance - let user click Next when ready
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-3xl"
            >
              🧮
            </motion.div>
            <div>
              <h1 className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                MathBuddy
              </h1>
              <p className="text-xs text-gray-500">Your AI Math Tutor</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Stats with clear labels */}
            {isStarted && (
              <div className="hidden sm:flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-lg text-green-700" title="Correct answers out of total">
                  <Target className="w-4 h-4" />
                  <span className="font-medium">{stats.correctAnswers}/{stats.totalProblems}</span>
                  <span className="text-xs text-green-600">Score</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-lg text-orange-600" title="Current streak of correct answers">
                  <Flame className="w-4 h-4" />
                  <span className="font-medium">{stats.currentStreak}</span>
                  <span className="text-xs text-orange-500">Streak</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 rounded-lg text-purple-600" title="Best streak ever">
                  <Trophy className="w-4 h-4" />
                  <span className="font-medium">{stats.bestStreak}</span>
                  <span className="text-xs text-purple-500">Best</span>
                </div>
              </div>
            )}

            {/* History */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(true)}
              className="p-2"
              title="History"
            >
              <History className="w-5 h-5" />
            </Button>

            {/* Profile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowProfiles(true)}
              className="p-2"
              title="Profiles"
            >
              {currentProfile ? (
                <span className="text-xl">{currentProfile.avatar}</span>
              ) : (
                <User className="w-5 h-5" />
              )}
            </Button>

            {/* Voice toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="p-2"
              title={voiceEnabled ? 'Mute' : 'Unmute'}
            >
              {voiceEnabled ? (
                <Volume2 className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-400" />
              )}
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="p-2"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Student Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                  />
                </div>

                {/* LLM Provider Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Chat Provider (Optional)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {([
                      { id: 'none', name: 'None', emoji: '📚' },
                      { id: 'anthropic', name: 'Claude', emoji: '🤖' },
                      { id: 'openai', name: 'ChatGPT', emoji: '💬' },
                      { id: 'gemini', name: 'Gemini', emoji: '✨' },
                      { id: 'xai', name: 'Grok', emoji: '🚀' },
                    ] as { id: LLMProvider; name: string; emoji: string }[]).map((provider) => (
                      <button
                        key={provider.id}
                        onClick={() => setLLMProvider(provider.id)}
                        className={cn(
                          'py-2 px-3 rounded-lg font-medium transition-all text-sm',
                          llmProvider === provider.id
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        )}
                      >
                        {provider.emoji} {provider.name}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    AI chat is optional! The app works great without it using built-in explanations.
                  </p>
                </div>

                {/* API Key Input - Only show if a provider is selected */}
                {llmProvider !== 'none' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {llmProvider === 'anthropic' && 'Anthropic API Key'}
                      {llmProvider === 'openai' && 'OpenAI API Key'}
                      {llmProvider === 'gemini' && 'Google Gemini API Key'}
                      {llmProvider === 'xai' && 'xAI (Grok) API Key'}
                    </label>
                    <input
                      type="password"
                      value={apiKeys[llmProvider]}
                      onChange={(e) => setApiKey(llmProvider, e.target.value)}
                      placeholder={
                        llmProvider === 'anthropic' ? 'sk-ant-...' :
                        llmProvider === 'openai' ? 'sk-...' :
                        llmProvider === 'gemini' ? 'AIza...' :
                        'xai-...'
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {llmProvider === 'anthropic' && (
                        <>Get your key at{' '}
                          <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                            console.anthropic.com
                          </a>
                        </>
                      )}
                      {llmProvider === 'openai' && (
                        <>Get your key at{' '}
                          <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                            platform.openai.com
                          </a>
                        </>
                      )}
                      {llmProvider === 'gemini' && (
                        <>Get your key at{' '}
                          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                            aistudio.google.com
                          </a>
                        </>
                      )}
                      {llmProvider === 'xai' && (
                        <>Get your key at{' '}
                          <a href="https://console.x.ai" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                            console.x.ai
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                )}

                {/* Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {([1, 2, 3, 4, 5, 6] as YearLevel[]).map((year) => (
                      <button
                        key={year}
                        onClick={() => setYearLevel(year)}
                        className={cn(
                          'py-2 rounded-lg font-medium transition-all',
                          yearLevel === year
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        )}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['easy', 'medium', 'hard', 'challenge'] as Difficulty[]).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setDifficulty(diff)}
                        className={cn(
                          'py-2 rounded-lg font-medium capitalize transition-all',
                          difficulty === diff
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        )}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Palette className="w-4 h-4 inline mr-1" />
                    Theme Color
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {(Object.keys(THEME_CONFIG) as Theme[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={cn(
                          'p-3 rounded-lg font-medium transition-all flex flex-col items-center gap-1',
                          theme === t
                            ? `bg-gradient-to-r ${THEME_CONFIG[t].colors} text-white shadow-lg`
                            : 'bg-gray-100 hover:bg-gray-200'
                        )}
                      >
                        <span className="text-xl">{THEME_CONFIG[t].emoji}</span>
                        <span className="text-xs">{THEME_CONFIG[t].name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => setShowSettings(false)}
                  className="w-full"
                >
                  Save Settings
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Problem History
                </h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No problems solved yet!</p>
                  <p className="text-sm">Start learning to see your history here.</p>
                </div>
              ) : (
                <div className="overflow-y-auto flex-1 space-y-3">
                  {history.slice(0, 20).map((entry) => (
                    <div
                      key={entry.id}
                      className={cn(
                        'p-4 rounded-xl border-2',
                        entry.isCorrect
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-lg">{entry.problem.question}</span>
                        {entry.isCorrect ? (
                          <Check className="w-6 h-6 text-green-600" />
                        ) : (
                          <X className="w-6 h-6 text-red-600" />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>
                          Your answer: <strong>{entry.userAnswer || '(skipped)'}</strong>
                          {!entry.isCorrect && (
                            <> • Correct: <strong className="text-green-600">{entry.problem.answer}</strong></>
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {entry.timeSpent}s
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1 capitalize">
                        {entry.problem.topic.replace('_', ' ')} • {entry.problem.difficulty}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Summary Stats */}
              {history.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                      {history.length}
                    </div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {history.filter(h => h.isCorrect).length}
                    </div>
                    <div className="text-xs text-gray-500">Correct</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-500">
                      {Math.round((history.filter(h => h.isCorrect).length / history.length) * 100)}%
                    </div>
                    <div className="text-xs text-gray-500">Accuracy</div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profiles Modal */}
      <AnimatePresence>
        {showProfiles && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowProfiles(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profiles
                </h2>
                <button
                  onClick={() => setShowProfiles(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Current Profile */}
              {currentProfile && (
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-200">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{currentProfile.avatar}</span>
                    <div>
                      <div className="font-bold text-lg">{currentProfile.name}</div>
                      <div className="text-sm text-gray-600">Current Player</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Profiles */}
              {profiles.filter(p => p.id !== currentProfile?.id).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Switch Profile</h3>
                  <div className="space-y-2">
                    {profiles.filter(p => p.id !== currentProfile?.id).map((profile) => (
                      <button
                        key={profile.id}
                        onClick={() => {
                          switchProfile(profile.id);
                          setShowProfiles(false);
                        }}
                        className="w-full p-3 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center gap-3 transition-all"
                      >
                        <span className="text-2xl">{profile.avatar}</span>
                        <span className="font-medium">{profile.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Create New Profile */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Create New Profile</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder="Enter name..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                  />
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Choose Avatar</label>
                    <div className="flex flex-wrap gap-2">
                      {AVATARS.map((avatar) => (
                        <button
                          key={avatar}
                          onClick={() => setNewProfileAvatar(avatar)}
                          className={cn(
                            'w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all',
                            newProfileAvatar === avatar
                              ? 'bg-purple-100 ring-2 ring-purple-500'
                              : 'bg-gray-100 hover:bg-gray-200'
                          )}
                        >
                          {avatar}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      if (newProfileName.trim()) {
                        createProfile(newProfileName.trim(), newProfileAvatar);
                        setNewProfileName('');
                        setNewProfileAvatar('🦊');
                        setShowProfiles(false);
                      }
                    }}
                    disabled={!newProfileName.trim()}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Profile
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!isStarted ? (
            // Welcome Screen
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Welcome Card */}
              <Card className="text-center py-8">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-6xl mb-4"
                >
                  👋
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">
                  Welcome{studentName ? `, ${studentName}` : ''}!
                </h2>
                <p className="text-gray-600">
                  Ready to become a math superstar? Let&apos;s learn together!
                </p>
              </Card>

              {/* Level Selection */}
              <Card>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-500" />
                  Select Your Level
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {([1, 2, 3, 4, 5, 6] as YearLevel[]).map((level) => (
                    <motion.button
                      key={level}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setYearLevel(level)}
                      className={cn(
                        'p-4 rounded-xl font-bold transition-all',
                        yearLevel === level
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'bg-white border-2 border-gray-200 hover:border-purple-300'
                      )}
                    >
                      <div className="text-2xl">Lv.{level}</div>
                    </motion.button>
                  ))}
                </div>
              </Card>

              {/* Topic Selection */}
              <Card>
                <h3 className="font-bold text-lg mb-4">Choose a Topic (or Random)</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedTopic === null ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedTopic(null)}
                  >
                    🎲 Random
                  </Button>
                  {YEAR_TOPICS[yearLevel].map((topic) => (
                    <Button
                      key={topic}
                      variant={selectedTopic === topic ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedTopic(topic)}
                    >
                      {TOPIC_NAMES[topic]}
                    </Button>
                  ))}
                </div>
              </Card>

              {/* Difficulty Selection */}
              <Card>
                <h3 className="font-bold text-lg mb-4">Difficulty Level</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['easy', 'medium', 'hard', 'challenge'] as Difficulty[]).map((diff) => (
                    <motion.button
                      key={diff}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setDifficulty(diff)}
                      className={cn(
                        'p-3 rounded-xl font-medium capitalize transition-all',
                        difficulty === diff
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'bg-white border-2 border-gray-200 hover:border-purple-300'
                      )}
                    >
                      {diff === 'easy' && '🌱 '}
                      {diff === 'medium' && '🌿 '}
                      {diff === 'hard' && '🌳 '}
                      {diff === 'challenge' && '🏆 '}
                      {diff}
                    </motion.button>
                  ))}
                </div>
              </Card>

              {/* Start Button */}
              <div className="text-center">
                <Button onClick={handleStart} size="lg" className="px-12">
                  <Play className="w-6 h-6 mr-2" />
                  Start Learning!
                </Button>
              </div>

              {/* Stats Summary */}
              {stats.totalProblems > 0 && (
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <h3 className="font-bold text-lg mb-4">Your Progress</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold text-purple-600">
                        {stats.totalProblems}
                      </div>
                      <div className="text-sm text-gray-600">Problems Solved</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-green-600">
                        {stats.totalProblems > 0
                          ? Math.round((stats.correctAnswers / stats.totalProblems) * 100)
                          : 0}%
                      </div>
                      <div className="text-sm text-gray-600">Accuracy</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-orange-500">
                        {stats.bestStreak}
                      </div>
                      <div className="text-sm text-gray-600">Best Streak</div>
                    </div>
                  </div>
                </Card>
              )}
            </motion.div>
          ) : (
            // Problem Screen
            <motion.div
              key="problem"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Back button */}
              <div className="mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsStarted(false)}
                >
                  ← Back to Menu
                </Button>
              </div>

              {/* Problem Display */}
              {currentProblem && (
                <ProblemDisplay
                  key={`problem-${currentProblemIndex}`}
                  problem={currentProblem}
                  onComplete={handleProblemComplete}
                />
              )}

              {/* Navigation Buttons */}
              <div className="mt-6 flex justify-between items-center max-w-md mx-auto px-4">
                <Button
                  onClick={goToPreviousProblem}
                  variant="ghost"
                  disabled={currentProblemIndex === 0}
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  ← Prev
                </Button>
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                  {currentProblemIndex + 1}
                </span>
                <Button
                  onClick={skipProblem}
                  variant="secondary"
                  size="sm"
                >
                  Next →
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Interface */}
      {isStarted && <ChatInterface />}
    </main>
  );
}
