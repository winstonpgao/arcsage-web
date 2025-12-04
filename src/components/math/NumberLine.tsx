'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NumberLineProps {
  num1: number;
  num2: number;
  operator: string;
  answer: number;
  showResult?: boolean;
}

export function NumberLine({ num1, num2, operator, answer, showResult }: NumberLineProps) {
  // Calculate range for number line
  const minVal = Math.min(num1, num2, answer, 0);
  const maxVal = Math.max(num1, num2, answer);
  const range = maxVal - minVal;
  const padding = Math.max(5, Math.ceil(range * 0.2));
  const start = minVal - padding;
  const end = maxVal + padding;
  const totalRange = end - start;

  // Generate tick marks - ensure we show the key numbers
  const step = Math.ceil(totalRange / 12) || 1; // Aim for ~12 ticks
  const ticks: number[] = [];
  for (let i = Math.ceil(start / step) * step; i <= end; i += step) {
    ticks.push(i);
  }

  // Calculate position as percentage (0-100)
  const getPosition = (value: number) => ((value - start) / totalRange) * 100;

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
      {/* Container with fixed padding for the number line area */}
      <div className="relative h-32 mx-4">
        {/* Number line base */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-300 rounded-full transform -translate-y-1/2">
          {/* Zero marker if in range */}
          {start <= 0 && end >= 0 && (
            <div
              className="absolute top-1/2 w-0.5 h-4 bg-gray-600 transform -translate-y-1/2"
              style={{ left: `${getPosition(0)}%` }}
            />
          )}
        </div>

        {/* Tick marks */}
        <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2">
          {ticks.map((tick) => (
            <div
              key={tick}
              className="absolute transform -translate-x-1/2"
              style={{ left: `${getPosition(tick)}%` }}
            >
              <div className={cn(
                'w-0.5 h-3 transform -translate-y-1/2',
                tick === 0 ? 'bg-gray-600 h-4' : 'bg-gray-400'
              )} />
              <span className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
                {tick}
              </span>
            </div>
          ))}
        </div>

        {/* Starting point marker */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ left: `${getPosition(num1)}%` }}
        >
          <div className="w-6 h-6 rounded-full bg-blue-500 shadow-lg flex items-center justify-center">
            <span className="text-xs text-white font-bold">1</span>
          </div>
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-2 py-1 rounded text-sm font-medium whitespace-nowrap">
            Start: {num1}
          </div>
        </motion.div>

        {/* Jump arrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute top-1/2 transform -translate-y-full"
          style={{
            left: `${Math.min(getPosition(num1), getPosition(answer))}%`,
            width: `${Math.abs(getPosition(answer) - getPosition(num1))}%`,
          }}
        >
          <svg
            className="w-full h-12"
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
          >
            <motion.path
              d={operator === '+' || (operator === '-' && num2 < 0)
                ? "M 0 35 Q 50 0 100 35"
                : "M 100 35 Q 50 0 0 35"
              }
              fill="none"
              stroke="#f472b6"
              strokeWidth="3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
            <motion.polygon
              points={operator === '+' || (operator === '-' && num2 < 0)
                ? "95,30 100,35 95,40"
                : "5,30 0,35 5,40"
              }
              fill="#f472b6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            />
          </svg>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 bg-pink-500 text-white px-2 py-1 rounded text-sm font-medium">
            {operator} {Math.abs(num2)}
          </div>
        </motion.div>

        {/* Result marker */}
        {showResult && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ left: `${getPosition(answer)}%` }}
          >
            <div className="w-8 h-8 rounded-full bg-green-500 shadow-lg flex items-center justify-center">
              <span className="text-xs text-white font-bold">!</span>
            </div>
            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded text-sm font-bold whitespace-nowrap">
              = {answer}
            </div>
          </motion.div>
        )}
      </div>

      {/* Explanation text for kids */}
      <div className="mt-8 text-center text-gray-600">
        <p className="text-lg">
          {operator === '-'
            ? `Start at ${num1}, jump back ${num2} steps`
            : `Start at ${num1}, jump forward ${num2} steps`}
        </p>
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500" />
          <span>Start here</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-pink-500" />
          <span>Jump</span>
        </div>
        {showResult && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span>Answer!</span>
          </div>
        )}
      </div>
    </div>
  );
}
