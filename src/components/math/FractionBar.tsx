'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FractionBarProps {
  numerator: number;
  denominator: number;
  label?: string;
  color?: 'blue' | 'pink' | 'green' | 'purple';
}

export function FractionBar({ numerator, denominator, label, color = 'blue' }: FractionBarProps) {
  const colors = {
    blue: 'bg-blue-500',
    pink: 'bg-pink-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="text-center">
      {label && <p className="text-sm text-gray-600 mb-2">{label}</p>}
      <div className="flex justify-center gap-0.5">
        {Array.from({ length: denominator }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              'w-12 h-16 rounded border-2 border-gray-300',
              i < numerator ? colors[color] : 'bg-gray-100'
            )}
          />
        ))}
      </div>
      <p className="mt-2 text-lg font-bold">
        {numerator}/{denominator}
      </p>
    </div>
  );
}

interface FractionVisualProps {
  fraction1: { num: number; denom: number };
  fraction2?: { num: number; denom: number };
  operator?: string;
  result?: { num: number; denom: number };
  showResult?: boolean;
}

export function FractionVisual({
  fraction1,
  fraction2,
  operator,
  result,
  showResult,
}: FractionVisualProps) {
  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
      <div className="flex flex-wrap items-center justify-center gap-6">
        <FractionBar
          numerator={fraction1.num}
          denominator={fraction1.denom}
          color="blue"
        />

        {operator && fraction2 && (
          <>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold text-gray-600"
            >
              {operator}
            </motion.span>

            <FractionBar
              numerator={fraction2.num}
              denominator={fraction2.denom}
              color="pink"
            />
          </>
        )}

        {showResult && result && (
          <>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-bold text-gray-600"
            >
              =
            </motion.span>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <FractionBar
                numerator={result.num}
                denominator={result.denom}
                color="green"
              />
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
