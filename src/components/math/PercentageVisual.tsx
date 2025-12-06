'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, ChevronRight, RotateCcw, Droplets } from 'lucide-react';
import { useSpeech } from '@/hooks/useSpeech';

interface PercentageVisualProps {
  percent: number;
  total: number;
  showResult?: boolean;
}

// Glass of water/juice component - responsive and properly sized
function Glass({
  fillPercent,
  color,
  onFill,
  interactive = true
}: {
  fillPercent: number;
  color: string;
  label?: string;
  onFill?: () => void;
  interactive?: boolean;
}) {
  // Glass dimensions
  const glassWidth = 100;
  const glassHeight = 160;
  const glassX = 70;
  const glassY = 20; // Top of glass
  const glassBottom = glassY + glassHeight; // Bottom of glass interior
  const innerHeight = glassHeight - 10; // Usable fill area

  // Calculate fill - water fills from bottom up
  const fillHeight = fillPercent > 0 ? Math.max((fillPercent / 100) * innerHeight, 8) : 0; // Min 8px when > 0
  const waterTop = glassBottom - fillHeight;

  const svgWidth = 230;
  const svgHeight = glassHeight + 60;

  return (
    <div className="flex flex-col items-center w-full max-w-xs">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto"
        style={{ maxHeight: '280px', cursor: interactive ? 'pointer' : 'default' }}
        onClick={interactive ? onFill : undefined}
      >
        {/* Gradients */}
        <defs>
          <linearGradient id={`waterGrad-${fillPercent}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <stop offset="50%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Scale marks on LEFT side */}
        {[0, 25, 50, 75, 100].map((mark) => {
          const markY = glassBottom - ((mark / 100) * innerHeight);
          return (
            <g key={mark}>
              {/* Tick line */}
              <line
                x1={glassX - 10}
                y1={markY}
                x2={glassX - 2}
                y2={markY}
                stroke="#555"
                strokeWidth="2"
              />
              {/* Label */}
              <text
                x={glassX - 14}
                y={markY + 4}
                fontSize="13"
                fill="#333"
                fontWeight="bold"
                textAnchor="end"
              >
                {mark}%
              </text>
            </g>
          );
        })}

        {/* Glass body - outline */}
        <rect
          x={glassX}
          y={glassY}
          width={glassWidth}
          height={glassHeight}
          rx="8"
          fill="rgba(220, 240, 255, 0.3)"
          stroke="#87CEEB"
          strokeWidth="4"
        />

        {/* Water fill - simple rect from bottom */}
        {fillPercent > 0 && (
          <motion.rect
            x={glassX + 4}
            width={glassWidth - 8}
            rx="4"
            fill={`url(#waterGrad-${fillPercent})`}
            initial={{ height: 0, y: glassBottom }}
            animate={{
              height: fillHeight,
              y: waterTop
            }}
            transition={{ type: 'spring', stiffness: 60, damping: 12 }}
          />
        )}

        {/* Water surface line */}
        {fillPercent > 0 && (
          <motion.line
            x1={glassX + 6}
            x2={glassX + glassWidth - 6}
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="3"
            initial={{ y1: glassBottom, y2: glassBottom }}
            animate={{ y1: waterTop + 2, y2: waterTop + 2 }}
            transition={{ type: 'spring', stiffness: 60, damping: 12 }}
          />
        )}

        {/* Bubbles in water */}
        {fillPercent > 5 && (
          <>
            <motion.circle
              cx={glassX + 30}
              r="4"
              fill="rgba(255,255,255,0.7)"
              initial={{ cy: glassBottom - 10 }}
              animate={{
                cy: [glassBottom - 10, waterTop + 20],
                opacity: [0.8, 0]
              }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
            />
            <motion.circle
              cx={glassX + 60}
              r="3"
              fill="rgba(255,255,255,0.6)"
              initial={{ cy: glassBottom - 15 }}
              animate={{
                cy: [glassBottom - 15, waterTop + 15],
                opacity: [0.7, 0]
              }}
              transition={{ repeat: Infinity, duration: 1.8, delay: 0.5, ease: "easeOut" }}
            />
            <motion.circle
              cx={glassX + 80}
              r="2.5"
              fill="rgba(255,255,255,0.5)"
              initial={{ cy: glassBottom - 8 }}
              animate={{
                cy: [glassBottom - 8, waterTop + 25],
                opacity: [0.6, 0]
              }}
              transition={{ repeat: Infinity, duration: 2.2, delay: 1, ease: "easeOut" }}
            />
          </>
        )}

        {/* Glass rim highlight */}
        <rect
          x={glassX + 4}
          y={glassY + 2}
          width={glassWidth - 8}
          height={6}
          rx="3"
          fill="rgba(255,255,255,0.6)"
        />

        {/* Current level indicator on right */}
        {fillPercent > 0 && (
          <g>
            <motion.line
              x1={glassX + glassWidth + 2}
              x2={glassX + glassWidth + 18}
              stroke={color}
              strokeWidth="3"
              initial={{ y1: glassBottom, y2: glassBottom }}
              animate={{ y1: waterTop, y2: waterTop }}
              transition={{ type: 'spring', stiffness: 60, damping: 12 }}
            />
            <motion.text
              x={glassX + glassWidth + 22}
              fontSize="15"
              fill={color}
              fontWeight="bold"
              initial={{ y: glassBottom + 5 }}
              animate={{ y: waterTop + 5 }}
              transition={{ type: 'spring', stiffness: 60, damping: 12 }}
            >
              {fillPercent}%
            </motion.text>
          </g>
        )}

        {/* Tap hint at bottom */}
        {interactive && (
          <text
            x={glassX + glassWidth / 2}
            y={svgHeight - 8}
            fontSize="11"
            fill="#888"
            textAnchor="middle"
          >
            tap glass to remove water
          </text>
        )}
      </svg>
    </div>
  );
}

// Water drop button
function WaterDrop({
  onClick,
  color,
  value
}: {
  onClick: () => void;
  color: string;
  value: number;
}) {
  return (
    <motion.button
      initial={{ scale: 0, y: -20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0, y: 20 }}
      whileHover={{ scale: 1.2, y: -5 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="relative flex flex-col items-center"
    >
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <svg width="50" height="60" viewBox="0 0 50 60">
          <defs>
            <linearGradient id={`dropGradient-${value}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color} stopOpacity="1" />
            </linearGradient>
          </defs>
          {/* Water drop shape */}
          <path
            d="M25 5 C25 5 5 30 5 40 C5 50 15 55 25 55 C35 55 45 50 45 40 C45 30 25 5 25 5 Z"
            fill={`url(#dropGradient-${value})`}
            stroke={color}
            strokeWidth="2"
          />
          {/* Shine */}
          <ellipse cx="15" cy="35" rx="5" ry="8" fill="rgba(255,255,255,0.4)" />
        </svg>
      </motion.div>
      <span className="text-sm font-bold text-gray-700 mt-1">{value}%</span>
    </motion.button>
  );
}

// Items grid showing the percentage
function ItemsGrid({
  total,
  filled,
  color
}: {
  total: number;
  filled: number;
  color: string;
}) {
  const cols = Math.min(10, total);
  const rows = Math.ceil(total / cols);

  return (
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {Array.from({ length: total }).map((_, i) => {
        const isHighlighted = i < filled;
        return (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.02 }}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isHighlighted
              ? 'text-white'
              : 'bg-gray-200 text-gray-500'
              }`}
            style={isHighlighted ? { backgroundColor: color } : {}}
          >
            {i + 1}
          </motion.div>
        );
      })}
    </div>
  );
}

export function PercentageVisual({ percent, total, showResult }: PercentageVisualProps) {
  const { speak } = useSpeech();
  const [currentStep, setCurrentStep] = useState(-1);
  const [currentFill, setCurrentFill] = useState(0);

  const result = (percent / 100) * total;

  const steps = [
    { text: `${percent}% means ${percent} out of every 100!` },
    { text: `Tap water drops to fill the glass to ${percent}%` },
    { text: `You can add 5% or 10% drops` },
    { text: `Fill it up to exactly ${percent}%` },
    { text: `${percent}% of ${total} = ${result}!` },
  ];

  const isStepActive = currentStep >= 0;
  const currentResult = (currentFill / 100) * total;
  const allCorrect = currentFill === percent;

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      speak(steps[nextStep].text);
    }
  };

  const resetAll = () => {
    setCurrentStep(-1);
    setCurrentFill(0);
  };

  // Add a drop (5% or 10%)
  const addDrop = (amount: number) => {
    if (currentFill + amount <= 100) {
      setCurrentFill(currentFill + amount);
    }
  };

  // Remove water (click on glass)
  const removeWater = () => {
    if (currentFill > 0) {
      setCurrentFill(Math.max(currentFill - 5, 0));
    }
  };

  // Auto-fill for "Show Me"
  const autoFill = () => {
    setCurrentFill(percent);
    speak(`${percent}% of ${total} equals ${result}. The glass is ${percent} percent full!`);
  };

  // Determine water color based on percentage
  const getWaterColor = () => {
    if (percent <= 25) return '#87CEEB'; // Light blue
    if (percent <= 50) return '#4FC3F7'; // Medium blue
    if (percent <= 75) return '#29B6F6'; // Deeper blue
    return '#0288D1'; // Deep blue
  };

  const waterColor = getWaterColor();

  return (
    <div
      className="p-6 rounded-2xl shadow-lg border-2"
      style={{
        background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
        borderColor: '#4DD0E1',
      }}
    >
      {/* Header */}
      <div className="mb-4 p-3 bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="text-lg font-bold text-cyan-600">
            <Droplets className="inline w-5 h-5 mr-1" />
            Finding {percent}% of {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={resetAll}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={autoFill}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-full transition-colors"
            >
              Show Me
            </button>
          </div>
        </div>

        {/* Instruction */}
        <div className="flex items-center gap-2 p-2 bg-cyan-50 rounded-lg">
          <span className="text-cyan-700 font-medium flex-1">
            {isStepActive
              ? steps[currentStep].text
              : allCorrect
                ? `The glass is ${percent}% full! ${percent}% of ${total} = ${result}`
                : `Tap the water drops to fill the glass to ${percent}%!`}
          </span>
          <button
            onClick={() => speak(isStepActive ? steps[currentStep].text : `Fill the glass to ${percent} percent`)}
            className="p-1 hover:bg-cyan-100 rounded-full"
          >
            <Volume2 className="w-4 h-4 text-cyan-600" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-colors ${i <= currentStep ? 'bg-cyan-500' : 'bg-gray-200'
                  }`}
              />
            ))}
          </div>
          {currentStep < steps.length - 1 && (
            <button
              onClick={goToNextStep}
              className="flex items-center gap-1 px-4 py-1 text-sm bg-cyan-500 text-white rounded-full hover:bg-cyan-600 transition-colors"
            >
              {currentStep === -1 ? 'Learn Step by Step' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Water drops controls */}
      <div className="mb-4 p-4 bg-white/70 rounded-xl">
        <p className="text-gray-600 font-bold mb-3 text-center">
          <Droplets className="inline w-5 h-5 mr-1 text-cyan-500" />
          Add water drops:
        </p>
        <div className="flex flex-wrap gap-8 justify-center min-h-[80px] items-center">
          <WaterDrop
            onClick={() => addDrop(5)}
            color={waterColor}
            value={5}
          />
          <WaterDrop
            onClick={() => addDrop(10)}
            color={waterColor}
            value={10}
          />
        </div>
      </div>

      {/* Glass visual */}
      <div className="p-4 bg-white/70 rounded-xl">
        <div className="flex flex-col items-center">
          <p className="text-gray-600 font-bold mb-2 text-center">
            Fill to {percent}%:
          </p>
          <Glass
            fillPercent={currentFill}
            color={waterColor}
            onFill={removeWater}
          />
          <div className="mt-2 flex items-center gap-4">
            <p className={`text-2xl font-bold ${allCorrect ? 'text-green-600' : 'text-cyan-600'}`}>
              {currentFill}% {allCorrect && '✓'}
            </p>
            {!allCorrect && currentFill > 0 && (
              <p className="text-sm text-gray-500">
                {currentFill < percent
                  ? `Need ${percent - currentFill}% more`
                  : `Remove ${currentFill - percent}%`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Items representation */}
      <div className="mt-4 p-4 bg-white/70 rounded-xl">
        <p className="text-gray-600 font-bold mb-3 text-center">
          {currentFill}% of {total} items:
        </p>
        <div className="flex justify-center">
          <ItemsGrid
            total={total}
            filled={Math.round(currentResult)}
            color={waterColor}
          />
        </div>
        <p className="text-center text-gray-500 mt-3">
          {Math.round(currentResult)} out of {total} items = {currentFill}%
        </p>
      </div>

      {/* Calculation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 p-4 bg-white rounded-xl"
      >
        <p className="text-gray-600 text-center mb-3 font-medium">
          Calculate:
        </p>
        <div className="flex items-center justify-center gap-3 text-xl font-bold flex-wrap">
          <span className={allCorrect ? 'text-cyan-600' : 'text-gray-400'}>
            {currentFill}%
          </span>
          <span className="text-gray-500">of</span>
          <span className="text-gray-700">{total}</span>
          <span className="text-gray-500">=</span>
          <div className="flex flex-col items-center text-sm">
            <span className={allCorrect ? 'text-cyan-600' : 'text-gray-400'}>
              {currentFill}
            </span>
            <div className="w-10 h-0.5 bg-gray-400" />
            <span className="text-gray-600">100</span>
          </div>
          <span className="text-gray-500">×</span>
          <span className="text-gray-700">{total}</span>
          <span className="text-gray-500">=</span>
          <span className={allCorrect ? 'text-green-600 text-2xl' : 'text-gray-400'}>
            {Math.round(currentResult)}
          </span>
        </div>
      </motion.div>

      {/* Success message */}
      {(showResult || allCorrect) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-4 bg-green-100 rounded-xl border-2 border-green-300"
        >
          <p className="text-center text-green-800 font-bold text-xl">
            <Droplets className="inline w-6 h-6 mr-2" />
            {percent}% of {total} = {result}
          </p>
          <p className="text-center text-green-600 mt-1">
            The glass is {percent}% full with water!
          </p>
        </motion.div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: waterColor }} />
          <span className="text-gray-600">Filled with water</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-200 border border-gray-300" />
          <span className="text-gray-600">Empty space</span>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-cyan-500" />
          <span className="text-gray-600">10% water drop</span>
        </div>
      </div>
    </div>
  );
}
