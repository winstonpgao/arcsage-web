'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMathBuddyStore } from '@/lib/store';

// Find the best available voice for a natural, kid-friendly experience
function findBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  // Priority order for natural-sounding voices
  // These are typically higher quality neural/enhanced voices
  const preferredVoiceNames = [
    // macOS high-quality voices
    'Samantha', // macOS default, very natural
    'Karen', // Australian, friendly
    'Moira', // Irish, warm
    'Tessa', // South African
    'Fiona', // Scottish
    // Windows high-quality voices
    'Microsoft Zira', // US English
    'Microsoft Hazel', // UK English
    'Microsoft Susan', // UK English
    // Chrome/Android voices
    'Google US English',
    'Google UK English Female',
    // Generic fallbacks
    'Female',
    'Enhanced',
  ];

  // First try to find preferred voices
  for (const name of preferredVoiceNames) {
    const voice = voices.find(
      (v) => v.lang.startsWith('en') && v.name.includes(name)
    );
    if (voice) return voice;
  }

  // Fallback: find any English voice, preferring local voices (usually higher quality)
  const englishVoices = voices.filter((v) => v.lang.startsWith('en'));
  const localVoice = englishVoices.find((v) => v.localService);
  if (localVoice) return localVoice;

  // Last resort: any English voice
  return englishVoices[0] || null;
}

export function useSpeech() {
  const { voiceEnabled, voiceRate, setIsAiSpeaking } = useMathBuddyStore();
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  // Load voices (they load asynchronously in some browsers)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const best = findBestVoice(voices);
        setSelectedVoice(best);
      }
    };

    // Try immediately (works in Firefox)
    loadVoices();

    // Also listen for voiceschanged event (needed for Chrome)
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) {
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Configure voice settings for natural, kid-friendly speech
      utterance.rate = voiceRate * 0.9; // Slightly slower for kids
      utterance.pitch = 1.05; // Slightly higher pitch for friendly tone
      utterance.volume = 1;

      // Use the best voice we found
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => setIsAiSpeaking(true);
      utterance.onend = () => setIsAiSpeaking(false);
      utterance.onerror = () => setIsAiSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [voiceEnabled, voiceRate, setIsAiSpeaking, selectedVoice]
  );

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsAiSpeaking(false);
    }
  }, [setIsAiSpeaking]);

  const isSpeaking = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return false;
    }
    return window.speechSynthesis.speaking;
  }, []);

  return { speak, stop, isSpeaking };
}
