'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MathProblem } from '@/types/math';
import { useMathBuddyStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { VisualBlocks } from './VisualBlocks';
import { MultiplicationGrid } from './MultiplicationGrid';
import { ClockVisual } from './ClockVisual';
import { RectangleVisual } from './RectangleVisual';
import { DivisionVisual } from './DivisionVisual';
import { FractionVisual } from './FractionVisual';
import { PercentageVisual } from './PercentageVisual';
import { PatternVisual } from './PatternVisual';
import { DecimalVisual } from './DecimalVisual';
import { GenericVisual } from './GenericVisual';
import { Lightbulb, Check, Volume2 } from 'lucide-react';
import { useSpeech } from '@/hooks/useSpeech';
import { Confetti } from '@/components/ui/Confetti';

// Encouraging messages for wrong answers - positive and supportive!
const getEncouragingMessage = (problem: MathProblem, userAnswer: string, attempt: number): string => {
  const correctAnswer = Number(problem.answer);
  const givenAnswer = Number(userAnswer);

  // Positive encouragement phrases
  const encouragements = [
    "You're doing great! Keep trying! 🌟",
    "I believe in you! Let's try again! 💪",
    "You're learning so well! One more try! ⭐",
    "Great effort! You're so close! 🎯",
    "Keep going, superstar! 🚀",
  ];

  const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];

  if (isNaN(givenAnswer)) {
    return `${randomEncouragement}\n\nTip: Type a number as your answer!`;
  }

  const diff = Math.abs(correctAnswer - givenAnswer);

  if (diff <= 2) {
    return `WOW! You're SO close! Just a tiny bit off! 🌟\n\nYou got ${givenAnswer}, and the answer is really close to that!`;
  } else if (diff <= 5) {
    return `${randomEncouragement}\n\nYou're getting warmer! Your answer ${givenAnswer} is in the right area!`;
  } else if (givenAnswer < correctAnswer) {
    return `${randomEncouragement}\n\nHint: Try a bigger number than ${givenAnswer}!`;
  } else {
    return `${randomEncouragement}\n\nHint: Try a smaller number than ${givenAnswer}!`;
  }
};

// Get a helpful, specific hint based on the problem
const getHelpfulHint = (problem: MathProblem): string => {
  const { numbers } = problem;
  if (!numbers) return problem.hint || "Look at the problem carefully and try counting!";

  const { num1, num2, operator } = numbers;

  switch (problem.topic) {
    case 'addition':
      return `Let's add ${num1} and ${num2} together!\n\n` +
        `Start with ${num1}, then count up ${num2} more:\n` +
        `${num1}... ${Array.from({ length: Math.min(num2, 5) }, (_, i) => num1 + i + 1).join('... ')}${num2 > 5 ? '...' : ''}\n\n` +
        `Or use your fingers to help count!`;
    case 'subtraction':
      return `Let's take ${num2} away from ${num1}!\n\n` +
        `Start with ${num1}, then count back ${num2}:\n` +
        `${num1}... ${Array.from({ length: Math.min(num2, 5) }, (_, i) => num1 - i - 1).join('... ')}${num2 > 5 ? '...' : ''}\n\n` +
        `Imagine you have ${num1} sweets and eat ${num2}. How many left?`;
    case 'multiplication':
      return `${num1} × ${num2} means ${num1} groups of ${num2}!\n\n` +
        `Count by ${num2}s, ${num1} times:\n` +
        `${Array.from({ length: num1 }, (_, i) => num2 * (i + 1)).join(', ')}\n\n` +
        `Or count all the squares in the picture!`;
    case 'division':
      return `${num1} ÷ ${num2} means sharing ${num1} into ${num2} equal groups!\n\n` +
        `If you have ${num1} sweets and ${num2} friends, how many does each friend get?\n\n` +
        `Try counting: ${num2}, ${num2 * 2}, ${num2 * 3}... until you reach ${num1}!`;
    default:
      return problem.hint || "Take your time and think about what the question is asking!";
  }
};

interface ProblemDisplayProps {
  problem: MathProblem;
  onComplete: (correct: boolean) => void;
}

export function ProblemDisplay({ problem, onComplete }: ProblemDisplayProps) {
  const [inputAnswer, setInputAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showVisual, setShowVisual] = useState(true);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [encouragingMessage, setEncouragingMessage] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const { speak } = useSpeech();

  const checkAnswer = (answer: string) => {
    const normalizedAnswer = answer.trim().toLowerCase();
    const correctAnswer = String(problem.answer).toLowerCase();

    const correct =
      normalizedAnswer === correctAnswer ||
      problem.acceptableAnswers?.some(
        (alt) => String(alt).toLowerCase() === normalizedAnswer
      ) ||
      parseFloat(normalizedAnswer) === parseFloat(correctAnswer);

    setIsCorrect(correct);

    if (correct) {
      setAnswered(true);
      setShowConfetti(true);
      // No auto speech - let user control with Read Aloud button
      onComplete(correct);
    } else {
      // Don't mark as fully answered - give encouragement to try again
      const newAttempts = wrongAttempts + 1;
      setWrongAttempts(newAttempts);

      const encouragement = getEncouragingMessage(problem, answer, newAttempts);
      setEncouragingMessage(encouragement);

      if (newAttempts >= 3) {
        // After 3 tries, show the answer with encouragement - speak the explanation
        speak(`Great effort! The answer is ${problem.answer}.`);
        setShowAnswer(true);
        setAnswered(true);
        onComplete(false);
      } else {
        // No auto speech for wrong attempts - just show encouragement on screen
        // Clear input for retry
        setInputAnswer('');
      }
    }
  };

  const handleSubmit = () => {
    if (inputAnswer.trim()) {
      checkAnswer(inputAnswer);
    }
  };

  const handleDragAnswer = (answer: string, correct: boolean) => {
    setIsCorrect(correct);

    if (correct) {
      setAnswered(true);
      setShowConfetti(true);
      // No auto speech - let user control
      onComplete(correct);
    } else {
      const newAttempts = wrongAttempts + 1;
      setWrongAttempts(newAttempts);

      const encouragement = getEncouragingMessage(problem, answer, newAttempts);
      setEncouragingMessage(encouragement);

      if (newAttempts >= 3) {
        speak(`Great effort! The answer is ${problem.answer}.`);
        setShowAnswer(true);
        setAnswered(true);
        onComplete(false);
      }
      // No auto speech for wrong attempts
    }
  };

  const [multipleChoiceOptions] = useState(() => {
    const answerStr = String(problem.answer);
    const options = new Set<string>();
    options.add(answerStr);

    // Check if this is a time answer (format like "7:30" or "12:45")
    const timeMatch = answerStr.match(/^(\d{1,2}):(\d{2})$/);

    if (timeMatch) {
      // Generate time-based options
      const hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);

      // Add nearby time options
      const timeOffsets = [
        { h: 0, m: 15 }, { h: 0, m: -15 }, { h: 0, m: 30 }, { h: 0, m: -30 },
        { h: 1, m: 0 }, { h: -1, m: 0 }, { h: 1, m: 30 }, { h: -1, m: 30 }
      ].sort(() => Math.random() - 0.5);

      for (const offset of timeOffsets) {
        if (options.size >= 4) break;
        let newHours = hours + offset.h;
        let newMinutes = minutes + offset.m;

        // Normalize minutes
        if (newMinutes >= 60) { newMinutes -= 60; newHours += 1; }
        if (newMinutes < 0) { newMinutes += 60; newHours -= 1; }

        // Normalize hours (12-hour format)
        if (newHours > 12) newHours -= 12;
        if (newHours <= 0) newHours += 12;

        const wrongTime = `${newHours}:${newMinutes.toString().padStart(2, '0')}`;
        if (wrongTime !== answerStr) {
          options.add(wrongTime);
        }
      }
    } else {
      // Numeric answer - use offsets
      const answer = Number(problem.answer);
      if (!isNaN(answer)) {
        // Check if this is a decimal answer
        const isDecimal = answerStr.includes('.') || problem.topic === 'decimals';
        const decimalPlaces = isDecimal ? (answerStr.split('.')[1]?.length || 1) : 0;

        // Use smaller offsets for decimals
        const offsets = isDecimal
          ? [-0.5, -0.3, -0.2, -0.1, 0.1, 0.2, 0.3, 0.5, 1, -1]
          : [-3, -2, -1, 1, 2, 3, 4, 5];
        const shuffledOffsets = offsets.sort(() => Math.random() - 0.5);

        for (const offset of shuffledOffsets) {
          if (options.size >= 4) break;
          const wrongAnswer = answer + offset;
          if (wrongAnswer >= 0) {
            // Round to avoid floating point precision issues
            const formatted = isDecimal
              ? wrongAnswer.toFixed(decimalPlaces)
              : String(Math.round(wrongAnswer));
            if (formatted !== answerStr) {
              options.add(formatted);
            }
          }
        }
      }
    }

    return Array.from(options).sort(() => Math.random() - 0.5);
  });

  const handleMultipleChoiceAnswer = (selectedAnswer: string) => {
    checkAnswer(selectedAnswer);
  };

  const renderVisual = () => {
    // Clock visual for time problems
    if (problem.visualType === 'clock' && problem.clockTime) {
      return (
        <ClockVisual
          hours={problem.clockTime.hours}
          minutes={problem.clockTime.minutes}
        />
      );
    }

    // Rectangle visual for area/perimeter problems
    if (problem.visualType === 'rectangle' && problem.dimensions) {
      const isArea = problem.question.toLowerCase().includes('area');
      return (
        <RectangleVisual
          length={problem.dimensions.length}
          width={problem.dimensions.width}
          showArea={isArea}
          showPerimeter={!isArea}
          showResult={answered}
        />
      );
    }

    // Handle topics that parse from question text (don't need problem.numbers)
    if (problem.topic === 'fractions') {
      // Parse fractions from the question (e.g., "1/4 + 2/4 = ?" or "2/3 + 1/3 = ?")
      const fractionMatch = problem.question.match(/(\d+)\/(\d+)\s*\+\s*(\d+)\/(\d+)/);
      if (fractionMatch) {
        const [, fn1, fd1, fn2, fd2] = fractionMatch.map(Number);
        return (
          <FractionVisual
            num1={fn1}
            denom1={fd1}
            num2={fn2}
            denom2={fd2}
            showResult={answered}
          />
        );
      }
      // Fallback to generic for other fraction formats
      return (
        <GenericVisual
          problem={problem}
          showResult={answered}
        />
      );
    }

    if (problem.topic === 'percentages') {
      // Parse percentage from the question (e.g., "50% of 20 = ?" or "What is 25% of 100?")
      const percMatch = problem.question.match(/(\d+)%\s*of\s*(\d+)/i);
      if (percMatch) {
        const [, perc, total] = percMatch.map(Number);
        return (
          <PercentageVisual
            percent={perc}
            total={total}
            showResult={answered}
          />
        );
      }
      // Fallback to generic
      return (
        <GenericVisual
          problem={problem}
          showResult={answered}
        />
      );
    }

    if (problem.topic === 'patterns') {
      // Parse pattern from the question - handles "What comes next? 1, 6, 11, 16, ?" format
      const patternMatch = problem.question.match(/(\d+(?:\s*,\s*\d+)+)\s*,?\s*\?/);
      if (patternMatch) {
        const nums = patternMatch[1].split(',').map(s => Number(s.trim()));
        const pattern = [...nums, '?'];
        return (
          <PatternVisual
            pattern={pattern}
            answer={problem.answer}
            showResult={answered}
          />
        );
      }
      // Fallback to generic
      return (
        <GenericVisual
          problem={problem}
          showResult={answered}
        />
      );
    }

    if (problem.topic === 'decimals') {
      // Parse decimal operation from question (e.g., "3.7 + 2.7 = ?" or "5.5 - 2.3 = ?")
      const decimalMatch = problem.question.match(/([\d.]+)\s*([+\-])\s*([\d.]+)/);
      if (decimalMatch) {
        const [, d1, op, d2] = decimalMatch;
        const num1 = parseFloat(d1);
        const num2 = parseFloat(d2);
        return (
          <DecimalVisual
            num1={num1}
            num2={num2}
            operator={op as '+' | '-'}
            showResult={answered}
          />
        );
      }
      // Fallback to generic
      return (
        <GenericVisual
          problem={problem}
          showResult={answered}
        />
      );
    }

    // For topics that need problem.numbers
    if (!problem.numbers) return null;

    const { num1, num2, operator } = problem.numbers;

    switch (problem.topic) {
      case 'multiplication':
        return (
          <MultiplicationGrid
            num1={num1}
            num2={num2}
            showResult={answered}
          />
        );
      case 'addition':
      case 'subtraction':
        // Always use VisualBlocks (squares) - consistent visual style
        return (
          <VisualBlocks
            num1={num1}
            num2={num2}
            operator={operator}
            showResult={answered}
            answer={Number(problem.answer)}
          />
        );
      case 'division':
        return (
          <DivisionVisual
            dividend={num1}
            divisor={num2}
            showResult={answered}
          />
        );
      default:
        // Try generic visual for other topics (decimals, money)
        return (
          <GenericVisual
            problem={problem}
            showResult={answered}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Confetti animation */}
      <Confetti trigger={showConfetti} />

      {/* Question Card */}
      <Card variant="gradient" className="text-center">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="space-y-4"
        >
          <p className="text-sm uppercase tracking-wider opacity-80">
            {problem.topic.replace('_', ' ')} • {problem.difficulty}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold">
            {problem.question}
          </h2>
          {/* Visual content (emojis) displayed separately - not read aloud */}
          {problem.visualContent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl tracking-wider py-4"
            >
              {problem.visualContent}
            </motion.div>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => speak(problem.question)}
            className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/40 shadow-lg"
          >
            <Volume2 className="w-5 h-5 mr-2" />
            Read Question
          </Button>
        </motion.div>
      </Card>

      {/* Visual representation */}
      {showVisual && renderVisual() && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {renderVisual()}
        </motion.div>
      )}

      {/* Toggle visual button */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowVisual(!showVisual)}
        >
          {showVisual ? 'Hide' : 'Show'} visual helper
        </Button>
      </div>

      {/* Answer section */}
      <AnimatePresence mode="wait">
        {!answered ? (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Multiple choice buttons */}
            <div className="space-y-4">
              <p className="text-center text-gray-600 font-medium">
                Choose the correct answer:
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                {multipleChoiceOptions.map((option, index) => (
                  <motion.button
                    key={option}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleMultipleChoiceAnswer(option)}
                    className="px-6 py-4 text-2xl font-bold rounded-xl border-3 border-gray-200 bg-white hover:border-primary hover:bg-primary/5 shadow-md hover:shadow-lg transition-all"
                    style={{ borderWidth: '3px' }}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Hint button */}
            <div className="flex justify-center">
              <Button
                variant="ghost"
                onClick={() => setShowHint(!showHint)}
                className="text-purple-600 hover:text-purple-700"
              >
                <Lightbulb className="w-5 h-5 mr-2" />
                {showHint ? 'Hide helper' : '💡 I need help!'}
              </Button>
            </div>

            {/* Hint display - with helpful content and read aloud */}
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Card className="bg-blue-50 border-blue-200">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-6 h-6 text-blue-500" />
                          <span className="font-bold text-blue-800">Here's how to solve it:</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => speak(getHelpfulHint(problem))}
                          className="text-blue-600 hover:bg-blue-100"
                        >
                          <Volume2 className="w-4 h-4 mr-1" />
                          Read to me
                        </Button>
                      </div>
                      <p className="text-blue-800 whitespace-pre-line text-lg leading-relaxed">
                        {getHelpfulHint(problem)}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Encouraging message when wrong - positive and supportive! */}
            <AnimatePresence>
              {wrongAttempts > 0 && !answered && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="bg-purple-50 border-purple-200">
                    <div className="flex items-start gap-3">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="text-3xl"
                      >
                        💪
                      </motion.div>
                      <div className="flex-1">
                        <p className="text-purple-800 font-bold text-lg mb-2">
                          You can do it! ({3 - wrongAttempts} {3 - wrongAttempts === 1 ? 'try' : 'tries'} left)
                        </p>
                        <p className="text-purple-700 whitespace-pre-line">{encouragingMessage}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-sm mx-auto"
          >
            <Card variant={isCorrect ? 'success' : 'error'} className="py-3 px-4">
              <div className="flex items-center justify-center gap-3">
                {isCorrect ? (
                  <>
                    <motion.div
                      initial={{ rotate: -180, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ type: 'spring' }}
                    >
                      <Check className="w-8 h-8" />
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-bold">Correct!</h3>
                      <p className="text-sm">Great job!</p>
                    </div>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ rotate: 180, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ type: 'spring' }}
                    >
                      <Lightbulb className="w-8 h-8" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-bold">Answer: <strong className="text-xl">{problem.answer}</strong></h3>
                      <p className="text-sm opacity-80">Keep trying!</p>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Steps explanation */}
      {answered && problem.steps && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <h3 className="font-bold text-lg mb-4">Step by step:</h3>
            <div className="space-y-3">
              {problem.steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.2 }}
                  className="flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-gray-700">{step.description}</p>
                    {step.formula && (
                      <p className="text-purple-600 font-mono">{step.formula}</p>
                    )}
                    {step.result && (
                      <p className="font-bold text-green-600">{step.result}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
