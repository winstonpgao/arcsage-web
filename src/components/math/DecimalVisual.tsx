'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, ChevronRight, RotateCcw, Plus, Minus } from 'lucide-react';
import { useSpeech } from '@/hooks/useSpeech';
import { ColumnCalculation } from './ColumnCalculation';

interface DecimalVisualProps {
  num1: number;
  num2: number;
  operator: '+' | '-';
  showResult?: boolean;
}

export function DecimalVisual({ num1, num2, operator, showResult = false }: DecimalVisualProps) {
  const { speak } = useSpeech();
  const [currentStep, setCurrentStep] = useState(-1);

  // Parse decimal parts
  const parseDecimal = (n: number) => {
    const str = n.toFixed(1);
    const [whole, decimal] = str.split('.');
    return {
      whole: parseInt(whole),
      decimal: parseInt(decimal || '0'),
      original: n
    };
  };

  const n1 = parseDecimal(num1);
  const n2 = parseDecimal(num2);
  const result = operator === '+' ? num1 + num2 : num1 - num2;
  const resultParsed = parseDecimal(result);

  // For blocks visualization - each whole number is a full block (10 units), each decimal is 1 unit
  const getBlocksForNumber = (whole: number, decimal: number) => {
    return { wholeBlocks: whole, tenthBlocks: decimal };
  };

  const blocks1 = getBlocksForNumber(n1.whole, n1.decimal);
  const blocks2 = getBlocksForNumber(n2.whole, n2.decimal);
  const blocksResult = getBlocksForNumber(resultParsed.whole, resultParsed.decimal);

  // Steps for learning
  const additionSteps = [
    { text: `Let's add ${num1} and ${num2}` },
    { text: `${num1} has ${n1.whole} whole${n1.whole !== 1 ? 's' : ''} and ${n1.decimal} tenth${n1.decimal !== 1 ? 's' : ''}` },
    { text: `${num2} has ${n2.whole} whole${n2.whole !== 1 ? 's' : ''} and ${n2.decimal} tenth${n2.decimal !== 1 ? 's' : ''}` },
    { text: `Line up the decimal points and add!` },
    { text: `${num1} + ${num2} = ${result.toFixed(1)}!` },
  ];

  const subtractionSteps = [
    { text: `Let's subtract ${num2} from ${num1}` },
    { text: `${num1} has ${n1.whole} whole${n1.whole !== 1 ? 's' : ''} and ${n1.decimal} tenth${n1.decimal !== 1 ? 's' : ''}` },
    { text: `We need to take away ${n2.whole} whole${n2.whole !== 1 ? 's' : ''} and ${n2.decimal} tenth${n2.decimal !== 1 ? 's' : ''}` },
    { text: `Line up the decimal points and subtract!` },
    { text: `${num1} - ${num2} = ${result.toFixed(1)}!` },
  ];

  const steps = operator === '+' ? additionSteps : subtractionSteps;
  const isStepActive = currentStep >= 0;

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      speak(steps[nextStep].text);
    }
  };

  const resetSteps = () => {
    setCurrentStep(-1);
  };

  // Render a block grid for a number (whole blocks + tenth blocks)
  const renderBlockGrid = (whole: number, decimal: number, color: string, label: string) => {
    const maxWholeBlocks = Math.min(whole, 5); // Show max 5 whole blocks
    const maxTenthBlocks = Math.min(decimal, 10);

    return (
      <div className="flex flex-col items-center">
        <p className={`text-sm font-bold mb-2 ${color}`}>{label}</p>

        <div className="flex gap-2 flex-wrap justify-center">
          {/* Whole blocks (10-unit blocks) */}
          {Array.from({ length: maxWholeBlocks }).map((_, i) => (
            <motion.div
              key={`whole-${i}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              <div className={`w-12 h-16 rounded-lg border-2 ${
                color.includes('primary') ? 'bg-primary/20 border-primary' :
                color.includes('secondary') ? 'bg-secondary/20 border-secondary' :
                'bg-green-100 border-green-500'
              }`}>
                {/* 10 small squares inside to represent tenths */}
                <div className="grid grid-cols-2 gap-0.5 p-1 h-full">
                  {Array.from({ length: 10 }).map((_, j) => (
                    <div
                      key={j}
                      className={`rounded-sm ${
                        color.includes('primary') ? 'bg-primary' :
                        color.includes('secondary') ? 'bg-secondary' :
                        'bg-green-500'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-center mt-1 font-bold text-gray-600">1</p>
            </motion.div>
          ))}

          {/* Show "..." if there are more blocks */}
          {whole > 5 && (
            <div className="flex items-center text-gray-400 text-lg font-bold">
              +{whole - 5} more
            </div>
          )}

          {/* Decimal (tenth) blocks */}
          {maxTenthBlocks > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: maxWholeBlocks * 0.1 }}
              className="relative"
            >
              <div className={`w-12 h-16 rounded-lg border-2 border-dashed ${
                color.includes('primary') ? 'bg-primary/10 border-primary' :
                color.includes('secondary') ? 'bg-secondary/10 border-secondary' :
                'bg-green-50 border-green-400'
              }`}>
                <div className="grid grid-cols-2 gap-0.5 p-1 h-full">
                  {Array.from({ length: 10 }).map((_, j) => (
                    <div
                      key={j}
                      className={`rounded-sm ${
                        j < maxTenthBlocks
                          ? color.includes('primary') ? 'bg-primary' :
                            color.includes('secondary') ? 'bg-secondary' :
                            'bg-green-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-center mt-1 font-bold text-gray-600">0.{decimal}</p>
            </motion.div>
          )}
        </div>

        <p className={`text-lg font-bold mt-2 ${color}`}>
          = {(whole + decimal / 10).toFixed(1)}
        </p>
      </div>
    );
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
            {operator === '+' ? 'Adding' : 'Subtracting'} Decimals
          </p>
          <div className="flex gap-2">
            {isStepActive && (
              <button
                onClick={resetSteps}
                className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Instruction */}
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
          <span className="text-blue-700 font-medium flex-1">
            {isStepActive ? steps[currentStep].text : 'Line up the decimal points like a tower!'}
          </span>
          <button
            onClick={() => speak(isStepActive ? steps[currentStep].text : 'Line up the decimal points like a tower!')}
            className="p-1 hover:bg-blue-100 rounded-full"
          >
            <Volume2 className="w-4 h-4 text-blue-600" />
          </button>
        </div>

        {/* Step navigation */}
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

      {/* Visual blocks */}
      <div className="p-4 bg-white/70 rounded-xl mb-4">
        <p className="text-gray-600 font-bold mb-4 text-center text-sm">
          Each full block = 1.0 (ten tenths)
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          {/* First number */}
          {renderBlockGrid(blocks1.wholeBlocks, blocks1.tenthBlocks, 'text-primary', `${num1}`)}

          {/* Operator */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg ${
              operator === '+' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {operator === '+' ? <Plus className="w-6 h-6" /> : <Minus className="w-6 h-6" />}
          </motion.div>

          {/* Second number */}
          {renderBlockGrid(blocks2.wholeBlocks, blocks2.tenthBlocks, 'text-secondary', `${num2}`)}
        </div>
      </div>

      {/* Interactive column calculation */}
      <div className="mb-4">
        <ColumnCalculation
          num1={num1}
          num2={num2}
          operator={operator}
          showResult={showResult || currentStep === steps.length - 1}
        />

        {/* Decimal point alignment helper */}
        <div className="mt-3 flex justify-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-lg border border-amber-200">
            <span className="text-amber-600 text-sm font-medium">
              Line up the decimal points and fill in the answer!
            </span>
          </div>
        </div>
      </div>

      {/* Result with blocks */}
      <AnimatePresence>
        {(showResult || currentStep === steps.length - 1) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-green-50 rounded-xl border-2 border-green-200"
          >
            <p className="text-center text-green-800 font-bold text-lg mb-3">
              Answer: {result.toFixed(1)}
            </p>
            {renderBlockGrid(blocksResult.wholeBlocks, blocksResult.tenthBlocks, 'text-green-600', 'Result')}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-10 rounded border-2 border-primary bg-primary/20 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-0.5 p-0.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-1 h-1 bg-primary rounded-sm" />
              ))}
            </div>
          </div>
          <span className="text-gray-600">= 1.0 (full block)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-10 rounded border-2 border-dashed border-primary bg-primary/10 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-0.5 p-0.5">
              <div className="w-1 h-1 bg-primary rounded-sm" />
              <div className="w-1 h-1 bg-gray-300 rounded-sm" />
              <div className="w-1 h-1 bg-gray-300 rounded-sm" />
              <div className="w-1 h-1 bg-gray-300 rounded-sm" />
            </div>
          </div>
          <span className="text-gray-600">= 0.1 (one tenth)</span>
        </div>
      </div>
    </div>
  );
}
