'use client';

import { useState } from 'react';
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
  const [draggedItem, setDraggedItem] = useState<number | string | null>(null);

  // Find the blank position (marked as '?' or null)
  const blankIndex = pattern.findIndex(p => p === '?' || p === null);
  const hasBlank = blankIndex !== -1;

  // Get numeric values for grid display
  const nums = pattern.filter(p => typeof p === 'number') as number[];
  const maxNum = Math.max(...nums, Number(answer) || 0);
  const gridMax = maxNum + 2; // No cap - use horizontal scrolling instead

  // Generate answer options
  const generateOptions = () => {
    const correctAnswer = Number(answer);
    const options = new Set<number>();
    options.add(correctAnswer);

    // Find the pattern difference
    let diff = 0;
    if (nums.length >= 2) {
      diff = nums[1] - nums[0];
    }

    // Add plausible wrong answers
    options.add(correctAnswer + diff);
    options.add(correctAnswer - diff);
    options.add(correctAnswer + 1);
    options.add(correctAnswer - 1);
    options.add(correctAnswer * 2);

    // Filter to reasonable positive numbers and limit to 4
    return Array.from(options)
      .filter(n => n >= 0 && n !== correctAnswer || n === correctAnswer)
      .slice(0, 4)
      .sort(() => Math.random() - 0.5);
  };

  const [options] = useState(generateOptions);

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

    // Check for multiplication pattern
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
    { text: `What number comes next? Drag an answer to the empty box!` },
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
    setDraggedItem(null);
  };

  const handleDragStart = (value: number | string) => {
    setDraggedItem(value);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDrop = () => {
    if (draggedItem !== null) {
      setSelectedAnswer(draggedItem);
      setDraggedItem(null);
    }
  };

  const handleOptionClick = (value: number | string) => {
    setSelectedAnswer(value);
  };

  const showAnswer = () => {
    setSelectedAnswer(answer);
    speak(`The answer is ${answer}!`);
  };

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
          <p className="text-lg font-bold text-primary">
            Complete the Pattern
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
              onClick={showAnswer}
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
                : 'Drag the correct number to complete the pattern!'}
          </span>
          <button
            onClick={() => speak(isStepActive ? steps[currentStep].text : `Complete the pattern by dragging the right number`)}
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

      {/* Grid Visual - dots/blocks for each number */}
      <div className="p-3 bg-white/70 rounded-xl mb-4 overflow-x-auto">
        <p className="text-gray-600 font-bold mb-3 text-center text-sm">Pattern Grid (each dot = 1):</p>
        <div className="flex flex-col gap-2">
          {pattern.map((item, rowIdx) => {
            const isBlank = item === '?' || item === null;
            const value = isBlank ? (selectedAnswer !== null ? Number(selectedAnswer) : 0) : Number(item);
            const showAsCorrect = isBlank && isCorrect;
            const showAsWrong = isBlank && selectedAnswer !== null && !isCorrect;

            // Group dots into rows of 10 for easier counting
            const fullTens = Math.floor(value / 10);
            const remainder = value % 10;

            return (
              <motion.div
                key={`grid-${rowIdx}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rowIdx * 0.1 }}
                className="flex items-start gap-2"
              >
                {/* Row label */}
                <div className={`w-8 text-right font-bold text-sm pt-1 ${isBlank ? 'text-secondary' : 'text-primary'}`}>
                  {isBlank ? '?' : item}
                </div>

                {/* Dots grid */}
                <div className="flex flex-col gap-1">
                  {/* Full rows of 10 */}
                  {Array.from({ length: fullTens }).map((_, tenIdx) => (
                    <div key={tenIdx} className="flex gap-0.5">
                      {Array.from({ length: 10 }).map((_, dotIdx) => (
                        <div
                          key={dotIdx}
                          className={`w-4 h-4 rounded-full ${
                            isBlank
                              ? showAsCorrect
                                ? 'bg-green-500'
                                : showAsWrong
                                  ? 'bg-red-400'
                                  : 'bg-orange-400'
                              : 'bg-gradient-to-br from-blue-400 to-purple-500'
                          }`}
                        />
                      ))}
                      <span className="text-xs text-gray-400 ml-1 self-center">{(tenIdx + 1) * 10}</span>
                    </div>
                  ))}
                  {/* Remainder dots */}
                  {remainder > 0 && (
                    <div className="flex gap-0.5">
                      {Array.from({ length: remainder }).map((_, dotIdx) => (
                        <div
                          key={dotIdx}
                          className={`w-4 h-4 rounded-full ${
                            isBlank
                              ? showAsCorrect
                                ? 'bg-green-500'
                                : showAsWrong
                                  ? 'bg-red-400'
                                  : 'bg-orange-400'
                              : 'bg-gradient-to-br from-blue-400 to-purple-500'
                          }`}
                        />
                      ))}
                      {/* Empty slots to show what 10 would look like */}
                      {Array.from({ length: 10 - remainder }).map((_, dotIdx) => (
                        <div
                          key={`empty-${dotIdx}`}
                          className="w-4 h-4 rounded-full bg-gray-200 border border-gray-300"
                        />
                      ))}
                      <span className="text-xs text-gray-400 ml-1 self-center">{value}</span>
                    </div>
                  )}
                  {/* If value is 0 or blank with no answer */}
                  {value === 0 && (
                    <div className="flex gap-0.5">
                      {Array.from({ length: 10 }).map((_, dotIdx) => (
                        <div
                          key={`empty-${dotIdx}`}
                          className="w-4 h-4 rounded-full bg-gray-200 border border-dashed border-gray-300"
                        />
                      ))}
                      <span className="text-xs text-gray-400 ml-1 self-center">?</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">Each row of 10 dots = 10 (十进制)</p>
      </div>

      {/* Bar Chart Visual */}
      <div className="p-3 bg-white/70 rounded-xl mb-4">
        <p className="text-gray-600 font-bold mb-3 text-center text-sm">Pattern on Bar Chart:</p>

        {/* Horizontal bar chart */}
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

                {/* Bar container */}
                <div
                  className="flex-1 h-10 bg-gray-100 rounded-lg overflow-hidden relative cursor-pointer border-2 border-gray-300"
                  onClick={() => {
                    if (isBlank) {
                      // Cycle through possible answers on click
                      const currentVal = selectedAnswer !== null ? Number(selectedAnswer) : 0;
                      const nextVal = currentVal + 1 > gridMax ? 1 : currentVal + 1;
                      setSelectedAnswer(nextVal);
                    }
                  }}
                >
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex">
                    {Array.from({ length: gridMax }, (_, i) => (
                      <div
                        key={`grid-${i}`}
                        className="h-full border-r border-gray-300"
                        style={{ width: `${100 / gridMax}%` }}
                      />
                    ))}
                  </div>

                  {/* The bar - much more visible colors */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`h-full rounded-md flex items-center justify-end pr-3 shadow-md ${
                      isBlank
                        ? showAsCorrect
                          ? 'bg-gradient-to-r from-green-500 to-green-600'
                          : showAsWrong
                            ? 'bg-gradient-to-r from-red-500 to-red-600'
                            : value !== null
                              ? 'bg-gradient-to-r from-orange-400 to-orange-500'
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

                  {/* Click hint for blank row */}
                  {isBlank && value === null && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-gray-500 text-sm font-medium">tap to set value</span>
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

        {/* Interactive slider for answer (only when blank exists) */}
        {hasBlank && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-700 font-medium text-sm text-center mb-2">
              Slide to set the answer:
            </p>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-500">0</span>
              <input
                type="range"
                min="0"
                max={gridMax}
                value={selectedAnswer !== null ? Number(selectedAnswer) : 0}
                onChange={(e) => setSelectedAnswer(Number(e.target.value))}
                className="flex-1 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-secondary"
              />
              <span className="text-sm font-bold text-gray-500">{gridMax}</span>
              <span className="text-lg font-bold text-secondary min-w-[3rem] text-center">
                {selectedAnswer !== null ? selectedAnswer : '?'}
              </span>
            </div>
          </div>
        )}

        {/* Pattern explanation */}
        <div className="mt-3 p-2 bg-blue-50 rounded-lg text-center">
          <p className="text-blue-700 font-medium text-sm">
            {hasBlank ? 'Use the slider or tap the bar to set the answer!' : 'See the pattern grow!'}
            {patternInfo.diff !== 0 && (
              <span className="font-bold"> (+{Math.abs(patternInfo.diff)} each step)</span>
            )}
          </p>
        </div>
      </div>

      {/* Pattern sequence display - compact */}
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
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-base font-bold transition-all ${
                      showAsCorrect
                        ? 'bg-green-100 border-green-500 text-green-700'
                        : showAsWrong
                          ? 'bg-red-100 border-red-400 text-red-600'
                          : selectedAnswer !== null
                            ? 'bg-secondary/20 border-secondary text-secondary'
                            : 'bg-gray-100 border-dashed border-gray-400 text-gray-400'
                    }`}
                    animate={{
                      scale: draggedItem !== null ? 1.1 : 1,
                    }}
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

                {/* Arrow between items */}
                {idx < pattern.length - 1 && (
                  <span className="text-gray-400 text-sm">→</span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Show pattern step info */}
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

      {/* Answer options - draggable */}
      <div className="p-3 bg-white/70 rounded-xl">
        <p className="text-gray-600 font-bold mb-3 text-center text-sm">
          Drag or tap the correct answer:
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isThisCorrect = String(option) === String(answer);

            return (
              <motion.button
                key={idx}
                layout
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                draggable
                onDragStart={() => handleDragStart(option)}
                onDragEnd={handleDragEnd}
                onClick={() => handleOptionClick(option)}
                className={`w-11 h-11 rounded-lg flex items-center justify-center text-lg font-bold shadow-md cursor-grab active:cursor-grabbing transition-all ${
                  isSelected
                    ? isThisCorrect
                      ? 'bg-green-500 text-white ring-2 ring-green-300'
                      : 'bg-red-400 text-white ring-2 ring-red-300'
                    : 'bg-secondary text-white hover:ring-2 hover:ring-secondary/30'
                } ${draggedItem === option ? 'opacity-50 scale-90' : ''}`}
              >
                {option}
              </motion.button>
            );
          })}
        </div>
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
          <div className="w-6 h-6 rounded-lg bg-secondary" />
          <span className="text-gray-600">Answer option</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-green-500" />
          <span className="text-gray-600">Correct!</span>
        </div>
      </div>
    </div>
  );
}
