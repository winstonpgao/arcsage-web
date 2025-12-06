'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, ChevronRight, RotateCcw, Check } from 'lucide-react';
import { useSpeech } from '@/hooks/useSpeech';

interface PatternVisualProps {
  pattern: (number | string)[];
  answer: number | string;
  showResult?: boolean;
}

export function PatternVisual({ pattern, answer, showResult }: PatternVisualProps) {
  const { speak } = useSpeech();
  const [currentStep, setCurrentStep] = useState(-1);
  const [selectedAnswer, setSelectedAnswer] = useState<number | string | null>(null);
  const [isDraggingBar, setIsDraggingBar] = useState(false);
  const barContainerRef = useRef<HTMLDivElement>(null);

  // Find the blank position (marked as '?' or null)
  const blankIndex = pattern.findIndex(p => p === '?' || p === null);
  const hasBlank = blankIndex !== -1;

  // Get numeric values for grid display
  const nums = pattern.filter(p => typeof p === 'number') as number[];
  const maxNum = Math.max(...nums, Number(answer) || 0);
  const gridMax = maxNum + 2;

  // Detect pattern type and difference
  const detectPatternInfo = () => {
    if (nums.length < 2) return { type: 'unknown', diff: 0 };

    const diff = nums[1] - nums[0];
    const allSameDiff = nums.every((n, i) => i === 0 || n - nums[i - 1] === diff);

    if (allSameDiff) {
      if (diff > 0) return { type: `counting up by ${diff}`, diff };
      if (diff < 0) return { type: `counting down by ${Math.abs(diff)}`, diff };
      return { type: 'same number', diff: 0 };
    }

    if (nums.length >= 2 && nums[0] !== 0) {
      const ratio = nums[1] / nums[0];
      const allSameRatio = nums.every((n, i) => i === 0 || n / nums[i - 1] === ratio);
      if (allSameRatio && ratio === Math.floor(ratio)) {
        return { type: `multiplying by ${ratio}`, diff: 0, ratio };
      }
    }

    return { type: 'special pattern', diff: 0 };
  };

  const patternInfo = detectPatternInfo();
  const patternType = patternInfo.type;

  const steps = [
    { text: `Look at this pattern: ${pattern.filter(p => p !== '?').join(', ')}` },
    { text: `This pattern is ${patternType}` },
    { text: `Drag the red bar to set your answer!` },
  ];

  const isStepActive = currentStep >= 0;
  const isCorrect = selectedAnswer !== null && String(selectedAnswer) === String(answer);

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      speak(steps[nextStep].text);
    }
  };

  const resetAll = () => {
    setSelectedAnswer(null);
    setCurrentStep(-1);
  };

  const showAnswerFn = () => {
    setSelectedAnswer(answer);
    speak(`The answer is ${answer}!`);
  };

  // Handle bar dragging
  const handleBarDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDraggingBar(true);
  }, []);

  const handleBarDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDraggingBar || !barContainerRef.current) return;
    e.preventDefault();

    const rect = barContainerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const relX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, relX / rect.width));
    const newValue = Math.round(percentage * gridMax);
    setSelectedAnswer(newValue);
  }, [isDraggingBar, gridMax]);

  const handleBarDragEnd = useCallback(() => {
    setIsDraggingBar(false);
  }, []);

  useEffect(() => {
    if (isDraggingBar) {
      document.addEventListener('mousemove', handleBarDragMove);
      document.addEventListener('mouseup', handleBarDragEnd);
      document.addEventListener('touchmove', handleBarDragMove, { passive: false });
      document.addEventListener('touchend', handleBarDragEnd);

      return () => {
        document.removeEventListener('mousemove', handleBarDragMove);
        document.removeEventListener('mouseup', handleBarDragEnd);
        document.removeEventListener('touchmove', handleBarDragMove);
        document.removeEventListener('touchend', handleBarDragEnd);
      };
    }
  }, [isDraggingBar, handleBarDragMove, handleBarDragEnd]);

  return (
    <div
      className="p-6 rounded-2xl shadow-lg border-2"
      style={{
        background: 'linear-gradient(135deg, var(--visual-bg-from, #faf5ff) 0%, var(--visual-bg-to, #f3e8ff) 100%)',
        borderColor: 'var(--visual-border, #c4b5fd)',
      }}
    >
      {/* Header */}
      <div className="mb-4 p-3 bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="text-lg font-bold text-primary">Complete the Pattern</p>
          <div className="flex gap-2">
            <button
              onClick={resetAll}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={showAnswerFn}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-full transition-colors"
            >
              Show Me
            </button>
          </div>
        </div>

        {/* Instruction */}
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
          <span className="text-blue-700 font-medium flex-1">
            {isStepActive
              ? steps[currentStep].text
              : isCorrect
                ? `Correct! The pattern is ${patternType}`
                : 'Drag the red bar left or right to set your answer!'}
          </span>
          <button
            onClick={() => speak(isStepActive ? steps[currentStep].text : 'Drag the red bar to set your answer')}
            className="p-1 hover:bg-blue-100 rounded-full"
          >
            <Volume2 className="w-4 h-4 text-blue-600" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i <= currentStep ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          {currentStep < steps.length - 1 && (
            <button
              onClick={goToNextStep}
              className="flex items-center gap-1 px-4 py-1 text-sm bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
            >
              {currentStep === -1 ? 'Learn Step by Step' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bar Chart Visual */}
      <div className="p-3 bg-white/70 rounded-xl mb-4">
        <p className="text-gray-600 font-bold mb-3 text-center text-sm">Drag the red bar to set answer:</p>

        <div className="space-y-2">
          {pattern.map((item, rowIdx) => {
            const isBlank = item === '?' || item === null;
            const value = isBlank ? (selectedAnswer !== null ? Number(selectedAnswer) : null) : Number(item);
            const showAsCorrect = isBlank && isCorrect;
            const showAsWrong = isBlank && selectedAnswer !== null && !isCorrect;
            const barWidth = value !== null ? Math.max((value / gridMax) * 100, 5) : 0;

            return (
              <motion.div
                key={rowIdx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: rowIdx * 0.1 }}
                className="flex items-center gap-2"
              >
                {/* Row label */}
                <div className={`w-8 text-right font-bold text-sm ${isBlank ? 'text-secondary' : 'text-primary'}`}>
                  {isBlank ? '?' : item}
                </div>

                {/* Bar container - draggable for blank row */}
                <div
                  ref={isBlank ? barContainerRef : undefined}
                  className={`flex-1 h-10 bg-gray-100 rounded-lg overflow-hidden relative border-2 border-gray-300 ${
                    isBlank ? 'cursor-ew-resize' : ''
                  }`}
                  onMouseDown={isBlank ? handleBarDragStart : undefined}
                  onTouchStart={isBlank ? handleBarDragStart : undefined}
                >
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    {Array.from({ length: gridMax }, (_, i) => (
                      <div
                        key={`grid-${i}`}
                        className="h-full border-r border-gray-300"
                        style={{ width: `${100 / gridMax}%` }}
                      />
                    ))}
                  </div>

                  {/* The bar */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: isDraggingBar && isBlank ? undefined : `${barWidth}%` }}
                    style={isDraggingBar && isBlank ? { width: `${barWidth}%` } : undefined}
                    transition={isDraggingBar ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
                    className={`h-full rounded-md flex items-center justify-end pr-2 shadow-md ${
                      isBlank
                        ? showAsCorrect
                          ? 'bg-gradient-to-r from-green-500 to-green-600'
                          : showAsWrong
                            ? 'bg-gradient-to-r from-red-500 to-red-600'
                            : value !== null
                              ? 'bg-gradient-to-r from-red-500 to-red-600'
                              : 'bg-gray-300'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600'
                    }`}
                  >
                    {value !== null && (
                      <span className="text-white font-bold text-base drop-shadow-lg">
                        {value}
                      </span>
                    )}
                  </motion.div>

                  {/* Drag hint for blank row */}
                  {isBlank && value === null && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-gray-500 text-sm font-medium">← drag to set value →</span>
                    </div>
                  )}
                </div>

                {/* Value indicator */}
                <div className={`w-10 text-left font-bold text-sm ${
                  isBlank
                    ? showAsCorrect ? 'text-green-600' : showAsWrong ? 'text-red-500' : 'text-secondary'
                    : 'text-primary'
                }`}>
                  {value !== null ? value : '?'}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Pattern sequence display */}
      <div className="p-3 bg-white/70 rounded-xl mb-4">
        <p className="text-gray-600 font-bold mb-3 text-center text-sm">Pattern Sequence:</p>
        <div className="flex flex-wrap gap-2 justify-center items-center">
          {pattern.map((item, idx) => {
            const isBlank = item === '?' || item === null;
            const displayValue = isBlank ? selectedAnswer : item;
            const showAsCorrect = isBlank && isCorrect;
            const showAsWrong = isBlank && selectedAnswer !== null && !isCorrect;

            return (
              <motion.div
                key={idx}
                layout
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-1"
              >
                {isBlank ? (
                  <motion.div
                    className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-base font-bold transition-all ${
                      showAsCorrect
                        ? 'bg-green-100 border-green-500 text-green-700'
                        : showAsWrong
                          ? 'bg-red-100 border-red-400 text-red-600'
                          : selectedAnswer !== null
                            ? 'bg-secondary/20 border-secondary text-secondary'
                            : 'bg-gray-100 border-dashed border-gray-400 text-gray-400'
                    }`}
                  >
                    {displayValue !== null ? displayValue : '?'}
                    {showAsCorrect && <Check className="w-3 h-3 ml-0.5" />}
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center text-base font-bold shadow-md"
                  >
                    {item}
                  </motion.div>
                )}

                {idx < pattern.length - 1 && (
                  <span className="text-gray-400 text-sm">→</span>
                )}
              </motion.div>
            );
          })}
        </div>

        {patternInfo.diff !== 0 && (
          <div className="mt-2 flex justify-center gap-1 flex-wrap">
            {pattern.slice(0, -1).map((_, idx) => (
              <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                +{Math.abs(patternInfo.diff)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Pattern explanation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 p-3 bg-white rounded-xl"
      >
        <p className="text-gray-600 text-center mb-2 font-medium">Pattern type:</p>
        <p className="text-center text-lg font-bold text-primary">{patternType}</p>
      </motion.div>

      {/* Success message */}
      {(showResult || isCorrect) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-4 bg-green-100 rounded-xl border-2 border-green-300"
        >
          <p className="text-center text-green-800 font-bold text-2xl">
            The answer is {answer}!
          </p>
          <p className="text-center text-green-600 mt-1">
            {pattern.filter(p => p !== '?').join(', ')}, {answer}
          </p>
        </motion.div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary" />
          <span className="text-gray-600">Pattern number</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-red-500 to-red-600" />
          <span className="text-gray-600">Drag to set answer</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-green-500" />
          <span className="text-gray-600">Correct!</span>
        </div>
      </div>
    </div>
  );
}
