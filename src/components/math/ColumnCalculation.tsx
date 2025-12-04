'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, RotateCcw, Check } from 'lucide-react';
import { useSpeech } from '@/hooks/useSpeech';

interface ColumnCalculationProps {
  num1: number;
  num2: number;
  operator: '+' | '-' | '×' | '÷';
  showResult?: boolean;
  onCorrect?: () => void;
}

// Short Division Component (短除法) - simple format matching dividend digits
function ShortDivision({ dividend, divisor, showResult = false, onCorrect }: {
  dividend: number;
  divisor: number;
  showResult?: boolean;
  onCorrect?: () => void;
}) {
  const { speak } = useSpeech();
  const quotient = Math.floor(dividend / divisor);
  const remainder = dividend % divisor;
  const dividendStr = String(dividend);

  // Quotient padded to match dividend length (e.g., 56÷8=7 becomes "07" to align with "56")
  const quotientPadded = String(quotient).padStart(dividendStr.length, '0');

  // State for user inputs - one input per dividend digit
  const [userQuotientDigits, setUserQuotientDigits] = useState<string[]>(() =>
    Array(dividendStr.length).fill('')
  );
  const [isCorrect, setIsCorrect] = useState(false);

  const quotientRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handle quotient digit input
  const handleQuotientChange = (index: number, value: string) => {
    if (value === '') {
      const newDigits = [...userQuotientDigits];
      newDigits[index] = '';
      setUserQuotientDigits(newDigits);
      return;
    }

    const char = value.slice(-1);
    if (char < '0' || char > '9') return;

    const newDigits = [...userQuotientDigits];
    newDigits[index] = char;
    setUserQuotientDigits(newDigits);

    // Auto-advance to next input
    if (char && index < userQuotientDigits.length - 1) {
      setTimeout(() => quotientRefs.current[index + 1]?.focus(), 50);
    }

    checkComplete(newDigits);
  };

  // Check if complete and correct
  const checkComplete = (quotientDigits: string[]) => {
    const userAnswer = quotientDigits.join('');
    if (!quotientDigits.includes('')) {
      // Check quotient is correct (compare with padded quotient)
      const correct = userAnswer === quotientPadded;
      setIsCorrect(correct);
      if (correct) {
        speak('Correct! Great job!');
        onCorrect?.();
      }
    }
  };

  // Handle key navigation for quotient
  const handleQuotientKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (userQuotientDigits[index] === '' && index > 0) {
        quotientRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...userQuotientDigits];
        newDigits[index] = '';
        setUserQuotientDigits(newDigits);
      }
      e.preventDefault();
    } else if (e.key === 'Delete') {
      const newDigits = [...userQuotientDigits];
      newDigits[index] = '';
      setUserQuotientDigits(newDigits);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      quotientRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < userQuotientDigits.length - 1) {
      quotientRefs.current[index + 1]?.focus();
    }
  };

  // Reset
  const reset = () => {
    setUserQuotientDigits(Array(dividendStr.length).fill(''));
    setIsCorrect(false);
    quotientRefs.current[0]?.focus();
  };

  // Auto-fill when showResult
  useEffect(() => {
    if (showResult && !isCorrect) {
      setUserQuotientDigits(quotientPadded.split(''));
      setIsCorrect(true);
    }
  }, [showResult, quotientPadded, isCorrect]);

  return (
    <div className="p-4 bg-white rounded-xl shadow-md border-2 border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-gray-600">
          Division (除法):
        </p>
        <div className="flex gap-2">
          <button
            onClick={reset}
            className="p-1 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => speak(`${dividend} divided by ${divisor}`)}
            className="p-1 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Division layout */}
      <div className="flex justify-center overflow-x-auto">
        <div className="font-mono text-xl min-w-fit">
          {/* Quotient row (answer on top) - one input per dividend digit */}
          <div className="flex items-end mb-1">
            <div className="w-12 shrink-0"></div>
            <div className="flex">
              {dividendStr.split('').map((_, i) => {
                const expectedDigit = quotientPadded[i];
                const userDigit = userQuotientDigits[i] || '';
                const isThisCorrect = userDigit === expectedDigit;
                const isEmpty = userDigit === '';

                return (
                  <motion.div
                    key={`q-${i}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <input
                      ref={(el) => { quotientRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      value={userDigit}
                      onChange={(e) => handleQuotientChange(i, e.target.value)}
                      onKeyDown={(e) => handleQuotientKeyDown(i, e)}
                      disabled={isCorrect || showResult}
                      className={`w-10 h-10 text-center text-xl font-bold rounded border-2 transition-all outline-none ${
                        isCorrect || showResult
                          ? 'bg-green-100 border-green-400 text-green-700'
                          : isEmpty
                            ? 'bg-gray-50 border-gray-300 text-gray-700 focus:border-purple-400 focus:bg-white'
                            : isThisCorrect
                              ? 'bg-purple-50 border-purple-300 text-purple-700'
                              : 'bg-red-50 border-red-300 text-red-600'
                      }`}
                      placeholder="_"
                    />
                  </motion.div>
                );
              })}
              {/* Remainder display */}
              {remainder > 0 && (isCorrect || showResult) && (
                <span className="ml-2 text-orange-600 font-bold text-base self-center">
                  r{remainder}
                </span>
              )}
            </div>
          </div>

          {/* Line under quotient */}
          <div className="flex items-center mb-2">
            <div className="w-12 shrink-0"></div>
            <div className="border-b-4 border-gray-700" style={{ width: `${dividendStr.length * 40}px` }}></div>
          </div>

          {/* Divisor and dividend row */}
          <div className="flex items-center">
            {/* Divisor */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-blue-600 font-bold w-10 text-right shrink-0"
            >
              {divisor}
            </motion.div>

            {/* Division bracket */}
            <div className="relative shrink-0 mx-0.5">
              <svg width="10" height="32" viewBox="0 0 10 32" className="text-gray-700">
                <path
                  d="M 8 0 Q 2 0, 2 16 Q 2 32, 8 32"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Dividend */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex text-pink-600 font-bold"
            >
              {dividendStr.split('').map((digit, i) => (
                <span key={`d-${i}`} className="w-10 text-center text-2xl">
                  {digit}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Hint */}
      {!isCorrect && !showResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-blue-50 rounded-lg"
        >
          <p className="text-sm text-blue-700">
            <strong>Fill in:</strong> {dividend} ÷ {divisor} = ?
          </p>
        </motion.div>
      )}

      {/* Feedback */}
      {isCorrect && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-3 bg-green-100 rounded-lg flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-green-700 font-bold">
            Correct! {dividend} ÷ {divisor} = {quotient}{remainder > 0 ? ` R${remainder}` : ''}
          </span>
        </motion.div>
      )}
    </div>
  );
}

export function ColumnCalculation({ num1, num2, operator, showResult = false, onCorrect }: ColumnCalculationProps) {
  const { speak } = useSpeech();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const carryRefs = useRef<(HTMLInputElement | null)[]>([]);

  // For division, use the special short division component
  if (operator === '÷') {
    return <ShortDivision dividend={num1} divisor={num2} showResult={showResult} onCorrect={onCorrect} />;
  }

  // Calculate the correct answer
  const calculateAnswer = () => {
    switch (operator) {
      case '+': return num1 + num2;
      case '-': return num1 - num2;
      case '×': return num1 * num2;
      default: return 0;
    }
  };

  const answer = calculateAnswer();
  const answerStr = String(Math.abs(answer));

  // For decimals
  const num1Str = String(num1);
  const num2Str = String(num2);
  const hasDecimal = num1Str.includes('.') || num2Str.includes('.');

  // Get decimal places
  const getDecimalPlaces = (n: string) => {
    const parts = n.split('.');
    return parts.length > 1 ? parts[1].length : 0;
  };

  const maxDecimals = Math.max(getDecimalPlaces(num1Str), getDecimalPlaces(num2Str));
  const answerDecimals = hasDecimal ? maxDecimals : 0;
  const answerFormatted = hasDecimal ? answer.toFixed(answerDecimals) : answerStr;

  // State for user input digits
  const [userDigits, setUserDigits] = useState<string[]>(() =>
    Array(answerFormatted.length).fill('')
  );
  const [isCorrect, setIsCorrect] = useState(false);

  // Format numbers for display
  const formatForDisplay = (n: number) => {
    if (hasDecimal) {
      return n.toFixed(maxDecimals);
    }
    return String(n);
  };

  const num1Display = formatForDisplay(num1);
  const num2Display = formatForDisplay(num2);

  // Get max length for alignment
  const maxLen = Math.max(num1Display.length, num2Display.length, answerFormatted.length);

  // Pad strings for alignment
  const padLeft = (s: string, len: number) => s.padStart(len, ' ');

  const num1Padded = padLeft(num1Display, maxLen);
  const num2Padded = padLeft(num2Display, maxLen);
  const answerPadded = padLeft(answerFormatted, maxLen);

  // Calculate expected carry/borrow values
  const calculateExpectedCarries = () => {
    const carries: { position: number; value: number }[] = [];

    if (operator === '+') {
      let carry = 0;
      const n1 = num1Padded.split('').reverse();
      const n2 = num2Padded.split('').reverse();

      for (let i = 0; i < maxLen; i++) {
        const d1 = n1[i] === ' ' || n1[i] === '.' ? 0 : parseInt(n1[i]) || 0;
        const d2 = n2[i] === ' ' || n2[i] === '.' ? 0 : parseInt(n2[i]) || 0;
        if (n1[i] === '.' || n2[i] === '.') continue;

        const sum = d1 + d2 + carry;
        if (sum >= 10) {
          // Carry goes to position to the left (maxLen - 1 - i - 1)
          carries.push({ position: maxLen - 2 - i, value: Math.floor(sum / 10) });
          carry = Math.floor(sum / 10);
        } else {
          carry = 0;
        }
      }
    } else if (operator === '-') {
      let borrow = 0;
      const n1 = num1Padded.split('').reverse();
      const n2 = num2Padded.split('').reverse();

      for (let i = 0; i < maxLen; i++) {
        const d1 = n1[i] === ' ' || n1[i] === '.' ? 0 : parseInt(n1[i]) || 0;
        const d2 = n2[i] === ' ' || n2[i] === '.' ? 0 : parseInt(n2[i]) || 0;
        if (n1[i] === '.' || n2[i] === '.') continue;

        const diff = d1 - borrow - d2;
        if (diff < 0) {
          carries.push({ position: maxLen - 2 - i, value: 1 });
          borrow = 1;
        } else {
          borrow = 0;
        }
      }
    } else if (operator === '×') {
      // For multiplication - simplified carry tracking
      let carry = 0;
      const n1Digits = String(num1).split('').reverse();
      const n2Digits = String(num2).split('').reverse();

      for (let i = 0; i < answerStr.length - 1; i++) {
        let columnSum = carry;
        for (let j = 0; j <= i && j < n2Digits.length; j++) {
          const k = i - j;
          if (k < n1Digits.length) {
            const d1 = parseInt(n1Digits[k]) || 0;
            const d2 = parseInt(n2Digits[j]) || 0;
            columnSum += d1 * d2;
          }
        }
        if (columnSum >= 10) {
          carries.push({ position: maxLen - 2 - i, value: Math.floor(columnSum / 10) });
          carry = Math.floor(columnSum / 10);
        } else {
          carry = 0;
        }
      }
    }

    return carries;
  };

  const expectedCarries = calculateExpectedCarries();

  // State for user carry inputs
  const [userCarries, setUserCarries] = useState<string[]>(() =>
    Array(maxLen).fill('')
  );

  // Handle digit input
  const handleDigitChange = (index: number, value: string) => {
    if (value === '') {
      const newDigits = [...userDigits];
      newDigits[index] = '';
      setUserDigits(newDigits);
      return;
    }

    const char = value.slice(-1);
    if (char !== '.' && (char < '0' || char > '9')) return;

    const newDigits = [...userDigits];
    newDigits[index] = char;
    setUserDigits(newDigits);

    // Auto-advance to next empty field
    if (char) {
      const nextEmpty = newDigits.findIndex((d, i) => i > index && d === '' && answerPadded[i] !== ' ' && answerPadded[i] !== '.');
      if (nextEmpty !== -1) {
        setTimeout(() => inputRefs.current[nextEmpty]?.focus(), 50);
      }
    }

    // Check if complete and correct
    checkComplete(newDigits);
  };

  // Handle carry input
  const handleCarryChange = (index: number, value: string) => {
    if (value === '') {
      const newCarries = [...userCarries];
      newCarries[index] = '';
      setUserCarries(newCarries);
      return;
    }

    const char = value.slice(-1);
    if (char < '0' || char > '9') return;

    const newCarries = [...userCarries];
    newCarries[index] = char;
    setUserCarries(newCarries);
  };

  // Check if answer is complete
  const checkComplete = (digits: string[]) => {
    const userAnswer = digits.join('');
    const expectedAnswer = answerPadded.replace(/ /g, '');

    if (!digits.some((d, i) => answerPadded[i] !== ' ' && answerPadded[i] !== '.' && d === '')) {
      const filteredUser = digits.filter((_, i) => answerPadded[i] !== ' ' && answerPadded[i] !== '.').join('');
      const filteredExpected = answerPadded.split('').filter(c => c !== ' ' && c !== '.').join('');
      const correct = filteredUser === filteredExpected;
      setIsCorrect(correct);
      if (correct) {
        speak('Correct! Great job!');
        onCorrect?.();
      }
    }
  };

  // Handle key navigation for answer
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (userDigits[index] === '') {
        // Move to previous non-space input
        for (let i = index - 1; i >= 0; i--) {
          if (answerPadded[i] !== ' ' && answerPadded[i] !== '.') {
            inputRefs.current[i]?.focus();
            break;
          }
        }
      } else {
        const newDigits = [...userDigits];
        newDigits[index] = '';
        setUserDigits(newDigits);
      }
      e.preventDefault();
    } else if (e.key === 'Delete') {
      const newDigits = [...userDigits];
      newDigits[index] = '';
      setUserDigits(newDigits);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      for (let i = index - 1; i >= 0; i--) {
        if (answerPadded[i] !== ' ' && answerPadded[i] !== '.') {
          inputRefs.current[i]?.focus();
          break;
        }
      }
    } else if (e.key === 'ArrowRight') {
      for (let i = index + 1; i < userDigits.length; i++) {
        if (answerPadded[i] !== ' ' && answerPadded[i] !== '.') {
          inputRefs.current[i]?.focus();
          break;
        }
      }
    } else if (e.key === 'ArrowUp') {
      carryRefs.current[index]?.focus();
    }
  };

  // Handle key navigation for carry
  const handleCarryKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (userCarries[index] === '') {
        for (let i = index - 1; i >= 0; i--) {
          if (num1Padded[i] !== ' ' && num1Padded[i] !== '.') {
            carryRefs.current[i]?.focus();
            break;
          }
        }
      } else {
        const newCarries = [...userCarries];
        newCarries[index] = '';
        setUserCarries(newCarries);
      }
      e.preventDefault();
    } else if (e.key === 'Delete') {
      const newCarries = [...userCarries];
      newCarries[index] = '';
      setUserCarries(newCarries);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      for (let i = index - 1; i >= 0; i--) {
        if (num1Padded[i] !== ' ' && num1Padded[i] !== '.') {
          carryRefs.current[i]?.focus();
          break;
        }
      }
    } else if (e.key === 'ArrowRight') {
      for (let i = index + 1; i < userCarries.length; i++) {
        if (num1Padded[i] !== ' ' && num1Padded[i] !== '.') {
          carryRefs.current[i]?.focus();
          break;
        }
      }
    } else if (e.key === 'ArrowDown') {
      inputRefs.current[index]?.focus();
    }
  };

  // Reset
  const reset = () => {
    setUserDigits(Array(answerFormatted.length).fill(''));
    setUserCarries(Array(maxLen).fill(''));
    setIsCorrect(false);
    inputRefs.current.find(ref => ref)?.focus();
  };

  // Show hint
  const revealHint = () => {
    const firstEmpty = userDigits.findIndex((d, i) => d === '' && answerPadded[i] !== ' ' && answerPadded[i] !== '.');
    if (firstEmpty !== -1) {
      const newDigits = [...userDigits];
      newDigits[firstEmpty] = answerFormatted[firstEmpty];
      setUserDigits(newDigits);
      checkComplete(newDigits);
    }
  };

  // Auto-fill when showResult is true
  useEffect(() => {
    if (showResult && !isCorrect) {
      setUserDigits(answerPadded.split(''));
      // Fill expected carries
      const newCarries = Array(maxLen).fill('');
      expectedCarries.forEach(c => {
        if (c.position >= 0 && c.position < maxLen) {
          newCarries[c.position] = String(c.value);
        }
      });
      setUserCarries(newCarries);
      setIsCorrect(true);
    }
  }, [showResult, answerPadded, isCorrect]);

  const operatorColors: Record<'+' | '-' | '×', string> = {
    '+': 'text-green-600',
    '-': 'text-red-500',
    '×': 'text-blue-600',
  };

  // Check if user answer matches so far
  const checkPartialCorrect = () => {
    return userDigits.every((d, i) => d === '' || answerPadded[i] === ' ' || d === answerPadded[i]);
  };

  const isPartialCorrect = checkPartialCorrect();

  return (
    <div className="p-4 bg-white rounded-xl shadow-md border-2 border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-gray-600">
          Fill in the answer:
          <span className="ml-2 text-xs text-purple-600">
            (type carries above 进位)
          </span>
        </p>
        <div className="flex gap-2">
          <button
            onClick={revealHint}
            className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200 transition-colors"
          >
            Hint
          </button>
          <button
            onClick={reset}
            className="p-1 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => speak(`${num1} ${operator === '×' ? 'times' : operator === '+' ? 'plus' : 'minus'} ${num2}`)}
            className="p-1 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Column calculation display */}
      <div className="flex flex-col items-center font-mono text-3xl">
        {/* Carry row - editable inputs ABOVE num1 (进位) */}
        <div className="flex items-center h-7">
          <span className="w-10"></span>
          <div className="flex">
            {num1Padded.split('').map((char, i) => {
              const expectedCarry = expectedCarries.find(c => c.position === i);
              const userCarry = userCarries[i] || '';
              const isSpace = char === ' ' || char === '.';

              return (
                <div key={`carry-${i}`} className="w-10 flex justify-center">
                  {!isSpace && (
                    <input
                      ref={(el) => { carryRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      value={userCarry}
                      onChange={(e) => handleCarryChange(i, e.target.value)}
                      onKeyDown={(e) => handleCarryKeyDown(i, e)}
                      disabled={isCorrect || showResult}
                      className={`w-6 h-6 text-center text-sm font-bold rounded border transition-all outline-none ${
                        isCorrect || showResult
                          ? expectedCarry ? 'bg-purple-100 border-purple-300 text-purple-700' : 'bg-transparent border-transparent'
                          : userCarry === ''
                            ? 'bg-transparent border-dashed border-gray-300 text-gray-400 focus:border-purple-400 focus:bg-purple-50'
                            : expectedCarry && userCarry === String(expectedCarry.value)
                              ? 'bg-purple-50 border-purple-300 text-purple-600'
                              : 'bg-gray-50 border-gray-300 text-gray-600'
                      }`}
                      placeholder=""
                      title="进位 carry"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* First number */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center"
        >
          <span className="w-10 text-right text-gray-300"></span>
          <div className="flex">
            {num1Padded.split('').map((char, i) => (
              <span
                key={`n1-${i}`}
                className={`w-10 text-center font-bold ${
                  char === '.' ? 'text-gray-400' : 'text-blue-600'
                }`}
              >
                {char}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Second number with operator */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center"
        >
          <span className={`w-10 text-center font-bold ${operatorColors[operator]}`}>
            {operator}
          </span>
          <div className="flex">
            {num2Padded.split('').map((char, i) => (
              <span
                key={`n2-${i}`}
                className={`w-10 text-center font-bold ${
                  char === '.' ? 'text-gray-400' : 'text-pink-600'
                }`}
              >
                {char}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Horizontal line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2 }}
          className="my-2"
          style={{ width: `${(maxLen + 1) * 40}px` }}
        >
          <div className="w-full h-1 bg-gray-400 rounded" />
        </motion.div>

        {/* Answer input row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center"
        >
          <span className={`w-10 text-center font-bold ${isCorrect ? 'text-green-500' : 'text-gray-400'}`}>
            =
          </span>
          <div className="flex">
            {answerPadded.split('').map((expectedChar, i) => {
              const userChar = userDigits[i] || '';
              const isDecimalPoint = expectedChar === '.';
              const isEmpty = userChar === '';
              const isThisCorrect = userChar === expectedChar;
              const isSpace = expectedChar === ' ';

              if (isSpace) {
                return <span key={`ans-${i}`} className="w-10" />;
              }

              if (isDecimalPoint) {
                return (
                  <span key={`ans-${i}`} className="w-10 text-center font-bold text-gray-400">
                    .
                  </span>
                );
              }

              return (
                <motion.div
                  key={`ans-${i}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                >
                  <input
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    value={userChar}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    disabled={isCorrect || showResult}
                    className={`w-10 h-12 text-center text-2xl font-bold rounded-lg border-2 transition-all outline-none ${
                      isCorrect || (showResult && userChar)
                        ? 'bg-green-100 border-green-400 text-green-700'
                        : isEmpty
                          ? 'bg-gray-50 border-gray-300 text-gray-700 focus:border-blue-400 focus:bg-white'
                          : isThisCorrect
                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                            : 'bg-red-50 border-red-300 text-red-600'
                    }`}
                    placeholder="_"
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Feedback */}
      {isCorrect && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-3 bg-green-100 rounded-lg flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-green-700 font-bold">
            Correct! {num1} {operator} {num2} = {answerFormatted}
          </span>
        </motion.div>
      )}

      {/* Wrong answer feedback */}
      {!isCorrect && !isPartialCorrect && userDigits.some(d => d !== '') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 p-2 bg-amber-50 rounded-lg flex items-center justify-center gap-2"
        >
          <span className="text-amber-700 text-sm">
            Check your digits - something doesn't match!
          </span>
        </motion.div>
      )}

      {/* Hint about decimal alignment */}
      {hasDecimal && !isCorrect && (
        <p className="mt-2 text-xs text-center text-gray-500">
          Remember: Line up the decimal points!
        </p>
      )}
    </div>
  );
}
