'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMathBuddyStore } from '@/lib/store';
import { useSpeech } from '@/hooks/useSpeech';
import { callLLM, LLMProvider } from '@/lib/llmClient';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  Send,
  Volume2,
  VolumeX,
  Loader2,
  MessageCircle,
  X,
  Bot,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatInterface() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    chatMessages,
    addChatMessage,
    isChatLoading,
    setIsChatLoading,
    currentProblem,
    studentName,
    yearLevel,
    llmProvider,
    getActiveApiKey,
    voiceEnabled,
    setVoiceEnabled,
    isAiSpeaking,
  } = useMathBuddyStore();

  const { speak, stop } = useSpeech();

  const hasLLM = llmProvider !== 'none' && getActiveApiKey();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Welcome message when chat opens
  useEffect(() => {
    if (isOpen && chatMessages.length === 0 && currentProblem) {
      const welcomeMsg = hasLLM
        ? `Hi${studentName ? ` ${studentName}` : ''}! I'm MathBuddy. I'm here to help you with this problem. Feel free to ask me anything - like "why?" or "can you explain?" I'm here to help!`
        : `Hi${studentName ? ` ${studentName}` : ''}! Look at the step-by-step explanation below each problem. Click "Need a hint?" for help! To chat with an AI tutor, add an API key in Settings.`;
      addChatMessage({ role: 'assistant', content: welcomeMsg });
      if (voiceEnabled) {
        speak(welcomeMsg);
      }
    }
  }, [isOpen, chatMessages.length, currentProblem, studentName, addChatMessage, voiceEnabled, speak, hasLLM]);

  const sendMessage = async () => {
    if (!input.trim() || isChatLoading) return;

    const userMessage = input.trim();
    setInput('');
    addChatMessage({ role: 'user', content: userMessage });

    // If no LLM configured, provide helpful built-in response
    if (!hasLLM) {
      const builtInResponses = [
        `Great question! Check out the step-by-step explanation that appears after you answer. It breaks down exactly how to solve ${currentProblem?.topic} problems!`,
        `I'd love to help more! To chat with me, ask a parent to add an API key in Settings. For now, try the "Need a hint?" button!`,
        `Look at the visual helper - it shows you how the numbers work together! The colored blocks and number lines make math easier to understand.`,
      ];
      const response = builtInResponses[Math.floor(Math.random() * builtInResponses.length)];
      addChatMessage({ role: 'assistant', content: response });
      if (voiceEnabled) speak(response);
      return;
    }

    setIsChatLoading(true);

    try {
      const messages = [
        ...chatMessages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user' as const, content: userMessage },
      ];

      const responseText = await callLLM(
        llmProvider as LLMProvider,
        getActiveApiKey() || '',
        messages,
        currentProblem,
        studentName,
        yearLevel
      );

      addChatMessage({ role: 'assistant', content: responseText });
      if (voiceEnabled) {
        speak(responseText);
      }
    } catch (error) {
      addChatMessage({
        role: 'assistant',
        content: `Sorry, I had trouble responding. ${error instanceof Error ? error.message : 'Please try again!'}`,
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  const quickQuestions = [
    "Why?",
    "Can you explain?",
    "Show me step by step",
    "Give me a hint",
    "I don't understand",
  ];

  return (
    <>
      {/* Chat toggle button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50',
          'flex items-center justify-center',
          'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
          isOpen && 'from-gray-500 to-gray-600'
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {isAiSpeaking && (
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"
          />
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-8rem)] z-40"
          >
            <Card className="h-full flex flex-col overflow-hidden p-0">
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      {hasLLM ? '🤖' : '📚'}
                    </div>
                    <div>
                      <h3 className="font-bold">MathBuddy</h3>
                      <p className="text-xs opacity-80">
                        {hasLLM ? `AI Tutor (${llmProvider})` : 'Helper Mode'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (isAiSpeaking) {
                        stop();
                      }
                      setVoiceEnabled(!voiceEnabled);
                    }}
                    className="text-white hover:bg-white/10"
                  >
                    {voiceEnabled ? (
                      <Volume2 className="w-5 h-5" />
                    ) : (
                      <VolumeX className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* No LLM notice */}
              {!hasLLM && (
                <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-100 text-xs text-yellow-700">
                  <Bot className="w-4 h-4 inline mr-1" />
                  Basic mode - Add an API key in Settings for AI chat!
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'flex',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] px-4 py-3 rounded-2xl',
                        message.role === 'user'
                          ? 'bg-purple-500 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.role === 'assistant' && (
                        <button
                          onClick={() => speak(message.content)}
                          className="mt-2 text-xs text-gray-500 hover:text-purple-500 flex items-center gap-1"
                        >
                          <Volume2 className="w-3 h-3" />
                          Listen
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}

                {isChatLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                      <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick questions */}
              <div className="px-4 py-2 border-t border-gray-100 overflow-x-auto">
                <div className="flex gap-2">
                  {quickQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setInput(q);
                        setTimeout(sendMessage, 100);
                      }}
                      className="px-3 py-1 text-xs bg-gray-100 hover:bg-purple-100 hover:text-purple-600 rounded-full whitespace-nowrap transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask me anything..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-sm"
                    disabled={isChatLoading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!input.trim() || isChatLoading}
                    className="rounded-full w-10 h-10 p-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
