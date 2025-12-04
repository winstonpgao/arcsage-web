'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
  scale: number;
}

const COLORS = [
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#22c55e', // green
  '#f59e0b', // amber
  '#3b82f6', // blue
  '#ef4444', // red
  '#06b6d4', // cyan
];

const EMOJIS = ['🎉', '⭐', '🌟', '✨', '💫', '🎊', '🎈', '🏆', '👏', '💪'];

export function Confetti({ trigger }: { trigger: boolean }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [emoji, setEmoji] = useState('🎉');

  useEffect(() => {
    if (trigger) {
      // Generate confetti pieces
      const newPieces: ConfettiPiece[] = [];
      for (let i = 0; i < 50; i++) {
        newPieces.push({
          id: i,
          x: Math.random() * 100, // percentage across screen
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          delay: Math.random() * 0.5,
          rotation: Math.random() * 360,
          scale: 0.5 + Math.random() * 0.5,
        });
      }
      setPieces(newPieces);
      setEmoji(EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);

      // Clear after animation
      const timer = setTimeout(() => setPieces([]), 3000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!trigger || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Big center emoji */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.5, times: [0, 0.3, 0.7, 1] }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl"
      >
        {emoji}
      </motion.div>

      {/* Confetti pieces */}
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{
            x: `${piece.x}vw`,
            y: '-10vh',
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: '110vh',
            rotate: piece.rotation + 720,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random(),
            delay: piece.delay,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            width: 12 * piece.scale,
            height: 12 * piece.scale,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}

      {/* Stars burst */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={`star-${i}`}
          initial={{
            x: '50vw',
            y: '40vh',
            scale: 0,
            opacity: 1,
          }}
          animate={{
            x: `${30 + Math.random() * 40}vw`,
            y: `${20 + Math.random() * 30}vh`,
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1,
            delay: i * 0.1,
          }}
          className="absolute text-4xl"
        >
          ⭐
        </motion.div>
      ))}
    </div>
  );
}
