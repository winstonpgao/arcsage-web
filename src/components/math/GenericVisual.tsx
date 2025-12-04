'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MathProblem } from '@/types/math';
import { Volume2, Play } from 'lucide-react';
import { useSpeech } from '@/hooks/useSpeech';

interface GenericVisualProps {
  problem: MathProblem;
  showResult?: boolean;
}

export function GenericVisual({ problem, showResult }: GenericVisualProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { speak } = useSpeech();

  const renderFractionVisual = () => {
    // Parse fractions from the question (e.g., "1/4 + 2/4 = ?")
    const fractionMatch = problem.question.match(/(\d+)\/(\d+)\s*\+\s*(\d+)\/(\d+)/);
    if (!fractionMatch) return null;

    const [, num1, denom1, num2] = fractionMatch.map(Number);
    const denom = denom1;
    const totalParts = denom;
    const resultNum = num1 + num2;

    const steps = [
      `We have two fractions with the same bottom number: ${denom}`,
      `The first fraction has ${num1} parts colored`,
      `The second fraction has ${num2} parts colored`,
      `Add the top numbers: ${num1} plus ${num2} equals ${resultNum}`,
      `The answer is ${resultNum} over ${denom}!`,
    ];

    const startAnimation = () => {
      setIsAnimating(true);
      setCurrentStep(0);
      steps.forEach((step, index) => {
        setTimeout(() => {
          setCurrentStep(index);
          speak(step);
        }, index * 2500);
      });
      setTimeout(() => setIsAnimating(false), steps.length * 2500);
    };

    return (
      <div
        className="p-6 rounded-2xl shadow-lg border-2"
        style={{
          background: 'linear-gradient(135deg, var(--visual-bg-from, #faf5ff) 0%, var(--visual-bg-to, #f3e8ff) 100%)',
          borderColor: 'var(--visual-border, #c4b5fd)',
        }}
      >
        {/* Controls */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-primary font-bold text-lg">Adding Fractions</p>
          <button
            onClick={startAnimation}
            disabled={isAnimating}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-primary text-white rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            Learn
          </button>
        </div>

        {/* Current instruction */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-blue-50 rounded-xl mb-4 flex items-center gap-2"
        >
          <span className="text-blue-700 font-medium">
            {isAnimating ? steps[currentStep] : 'When fractions have the same bottom number, just add the tops!'}
          </span>
          <button
            onClick={() => speak(isAnimating ? steps[currentStep] : 'When fractions have the same bottom number, just add the tops!')}
            className="p-1 hover:bg-blue-100 rounded-full"
          >
            <Volume2 className="w-4 h-4 text-blue-600" />
          </button>
        </motion.div>

        <div className="flex items-center justify-center gap-6 flex-wrap">
          {/* First fraction bar */}
          <motion.div
            animate={{ scale: isAnimating && currentStep === 1 ? 1.05 : 1 }}
            className="flex flex-col items-center"
          >
            <p className="text-lg font-bold text-primary mb-2">{num1}/{denom}</p>
            <div className="flex gap-1">
              {Array.from({ length: totalParts }).map((_, i) => (
                <motion.div
                  key={`f1-${i}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`w-12 h-16 rounded-lg border-2 ${
                    i < num1
                      ? 'bg-primary border-primary'
                      : 'bg-gray-100 border-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">{num1} colored</p>
          </motion.div>

          <motion.span
            animate={{ scale: isAnimating && currentStep >= 3 ? 1.2 : 1 }}
            className="text-4xl font-bold text-gray-600"
          >
            +
          </motion.span>

          {/* Second fraction bar */}
          <motion.div
            animate={{ scale: isAnimating && currentStep === 2 ? 1.05 : 1 }}
            className="flex flex-col items-center"
          >
            <p className="text-lg font-bold text-secondary mb-2">{num2}/{denom}</p>
            <div className="flex gap-1">
              {Array.from({ length: totalParts }).map((_, i) => (
                <motion.div
                  key={`f2-${i}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className={`w-12 h-16 rounded-lg border-2 ${
                    i < num2
                      ? 'bg-secondary border-secondary'
                      : 'bg-gray-100 border-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">{num2} colored</p>
          </motion.div>
        </div>

        {/* Result */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showResult || (isAnimating && currentStep >= 4) ? 1 : 0.5, y: 0 }}
          className="mt-6 p-4 bg-white rounded-xl"
        >
          <div className="text-center">
            <p className="text-gray-600 mb-2">Add the top numbers:</p>
            <p className="text-2xl font-bold">
              <span className="text-primary">{num1}</span>
              <span className="text-gray-600"> + </span>
              <span className="text-secondary">{num2}</span>
              <span className="text-gray-600"> = </span>
              <span className={showResult ? 'text-green-600' : 'text-gray-400'}>
                {showResult ? resultNum : '?'}
              </span>
            </p>
            {showResult && (
              <p className="text-green-600 font-bold text-xl mt-2">
                Answer: {resultNum}/{denom}
              </p>
            )}
          </div>
        </motion.div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary" />
            <span className="text-gray-600">First fraction</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-secondary" />
            <span className="text-gray-600">Second fraction</span>
          </div>
        </div>
      </div>
    );
  };

  const renderDivisionVisual = () => {
    const { numbers } = problem;
    if (!numbers) return null;

    const { num1: dividend, num2: divisor } = numbers;
    const answer = Math.floor(dividend / divisor);
    const displayDividend = Math.min(dividend, 20);

    // Interactive state for division
    const [items, setItems] = React.useState(() =>
      Array.from({ length: displayDividend }, (_, i) => ({
        id: `item-${i}`,
        num: i + 1,
        groupIndex: -1, // -1 means not in any group yet
      }))
    );

    const [groups, setGroups] = React.useState(() =>
      Array.from({ length: answer }, (_, i) => ({
        id: `group-${i}`,
        items: [] as number[],
      }))
    );

    // Count items in each group
    const getItemsInGroup = (groupIdx: number) => items.filter(i => i.groupIndex === groupIdx);
    const unassignedItems = items.filter(i => i.groupIndex === -1);
    const allGroupsFull = groups.every((_, idx) => getItemsInGroup(idx).length === divisor);

    // Handle tapping an item to assign it to next available group
    const handleItemTap = (itemId: string) => {
      const item = items.find(i => i.id === itemId);
      if (!item) return;

      if (item.groupIndex === -1) {
        // Find first group that isn't full
        const availableGroupIdx = groups.findIndex((_, idx) => getItemsInGroup(idx).length < divisor);
        if (availableGroupIdx !== -1) {
          setItems(items.map(i =>
            i.id === itemId ? { ...i, groupIndex: availableGroupIdx } : i
          ));
          speak(`${getItemsInGroup(availableGroupIdx).length + 1} in group ${availableGroupIdx + 1}`);
        }
      } else {
        // Remove from group
        setItems(items.map(i =>
          i.id === itemId ? { ...i, groupIndex: -1 } : i
        ));
      }
    };

    // Auto-fill all groups
    const autoFillGroups = () => {
      const newItems = [...items];
      let currentGroup = 0;
      let countInGroup = 0;

      newItems.forEach((item, idx) => {
        if (currentGroup < answer) {
          newItems[idx] = { ...item, groupIndex: currentGroup };
          countInGroup++;
          if (countInGroup >= divisor) {
            currentGroup++;
            countInGroup = 0;
          }
        }
      });

      setItems(newItems);
      speak(`Done! We made ${answer} groups of ${divisor}!`);
    };

    // Reset all items
    const resetItems = () => {
      setItems(items.map(i => ({ ...i, groupIndex: -1 })));
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
        <div className="flex items-center justify-between mb-4">
          <p className="text-primary font-bold text-lg">
            Share {dividend} into groups of {divisor}
          </p>
          <div className="flex gap-2">
            <button
              onClick={resetItems}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              Reset
            </button>
            <button
              onClick={autoFillGroups}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
            >
              <Play className="w-4 h-4" />
              Auto Fill
            </button>
          </div>
        </div>

        {/* Instruction */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-blue-50 rounded-xl mb-4 flex items-center gap-2"
        >
          <span className="text-blue-700 font-medium flex-1">
            {allGroupsFull
              ? `Great! You made ${answer} groups of ${divisor}!`
              : `Tap items to put them in groups! Each group needs ${divisor} items.`}
          </span>
          <button
            onClick={() => speak(allGroupsFull
              ? `Great! You made ${answer} groups of ${divisor}!`
              : `Tap items to put them in groups! Each group needs ${divisor} items.`)}
            className="p-1 hover:bg-blue-100 rounded-full"
          >
            <Volume2 className="w-4 h-4 text-blue-600" />
          </button>
        </motion.div>

        {/* Unassigned items pool */}
        <div className="mb-4 p-4 bg-white/70 rounded-xl min-h-[80px]">
          <p className="text-gray-600 mb-3 font-medium">
            Items to share: {unassignedItems.length} left
          </p>
          <div className="flex flex-wrap gap-2 justify-start">
            {items.filter(i => i.groupIndex === -1).map((item) => (
              <motion.button
                key={item.id}
                layout
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleItemTap(item.id)}
                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-md cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
              >
                {item.num}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Groups - where items go */}
        <div className="p-4 bg-white/70 rounded-xl">
          <p className="text-gray-600 mb-3 font-medium">
            Make {answer} groups (put {divisor} in each):
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {groups.map((group, groupIdx) => {
              const groupItems = getItemsInGroup(groupIdx);
              const isFull = groupItems.length >= divisor;

              return (
                <motion.div
                  key={group.id}
                  layout
                  className={`p-3 rounded-xl border-3 min-h-[100px] transition-all ${
                    isFull
                      ? 'bg-green-100 border-green-400'
                      : 'bg-secondary/10 border-secondary/50 border-dashed'
                  }`}
                  style={{ borderWidth: '3px' }}
                >
                  <p className={`text-center text-sm font-bold mb-2 ${isFull ? 'text-green-600' : 'text-secondary'}`}>
                    Group {groupIdx + 1} {isFull && '✓'}
                  </p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {groupItems.map((item) => (
                      <motion.button
                        key={item.id}
                        layout
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleItemTap(item.id)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm cursor-pointer ${
                          isFull ? 'bg-green-500' : 'bg-secondary'
                        }`}
                      >
                        {item.num}
                      </motion.button>
                    ))}
                    {/* Empty slots */}
                    {Array.from({ length: divisor - groupItems.length }).map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 bg-gray-50"
                      />
                    ))}
                  </div>
                  <p className="text-center text-xs text-gray-500 mt-2">
                    {groupItems.length} / {divisor}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Count by divisor */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 p-3 bg-white rounded-xl"
        >
          <p className="text-gray-600 text-center mb-2">Count by {divisor}s:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {Array.from({ length: answer }).map((_, i) => {
              const groupFilled = getItemsInGroup(i).length === divisor;
              return (
                <motion.span
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className={`px-3 py-1 rounded-full font-bold ${
                    groupFilled
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {(i + 1) * divisor}
                </motion.span>
              );
            })}
          </div>
        </motion.div>

        {/* Result */}
        {(showResult || allGroupsFull) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-4 bg-green-100 rounded-xl border-2 border-green-300"
          >
            <p className="text-center text-green-800 font-bold text-2xl">
              {dividend} ÷ {divisor} = {answer} groups! 🎉
            </p>
          </motion.div>
        )}

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary" />
            <span className="text-gray-600">Not grouped yet</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500" />
            <span className="text-gray-600">In a full group</span>
          </div>
        </div>
      </div>
    );
  };

  const renderMoneyVisual = () => {
    const { numbers } = problem;
    if (!numbers) return null;

    const { num1: price1, num2: price2 } = numbers;
    const total = price1 + price2;

    const steps = [
      `We have two amounts of money to add`,
      `First amount: $${price1}`,
      `Second amount: $${price2}`,
      `Add them together: $${price1} plus $${price2} equals $${total}`,
    ];

    const startAnimation = () => {
      setIsAnimating(true);
      setCurrentStep(0);
      steps.forEach((step, index) => {
        setTimeout(() => {
          setCurrentStep(index);
          speak(step);
        }, index * 2000);
      });
      setTimeout(() => setIsAnimating(false), steps.length * 2000);
    };

    return (
      <div
        className="p-6 rounded-2xl shadow-lg border-2"
        style={{
          background: 'linear-gradient(135deg, var(--visual-bg-from, #faf5ff) 0%, var(--visual-bg-to, #f3e8ff) 100%)',
          borderColor: 'var(--visual-border, #c4b5fd)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-primary font-bold text-lg">Adding Money Together</p>
          <button
            onClick={startAnimation}
            disabled={isAnimating}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-primary text-white rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            Learn
          </button>
        </div>

        {/* Current instruction */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-blue-50 rounded-xl mb-4 flex items-center gap-2"
        >
          <span className="text-blue-700 font-medium">
            {isAnimating ? steps[currentStep] : 'Add the money amounts together!'}
          </span>
          <button
            onClick={() => speak(isAnimating ? steps[currentStep] : 'Add the money amounts together!')}
            className="p-1 hover:bg-blue-100 rounded-full"
          >
            <Volume2 className="w-4 h-4 text-blue-600" />
          </button>
        </motion.div>

        <div className="flex items-center justify-center gap-8 flex-wrap">
          {/* First item */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{
              scale: isAnimating && currentStep === 1 ? 1.1 : 1,
              rotate: 0
            }}
            className="flex flex-col items-center"
          >
            <div className="text-6xl mb-2">💰</div>
            <div className="bg-green-500 text-white px-5 py-2 rounded-full font-bold text-2xl shadow-lg">
              ${price1}
            </div>
          </motion.div>

          <span className="text-4xl font-bold text-gray-600">+</span>

          {/* Second item */}
          <motion.div
            initial={{ scale: 0, rotate: 10 }}
            animate={{
              scale: isAnimating && currentStep === 2 ? 1.1 : 1,
              rotate: 0
            }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="text-6xl mb-2">💵</div>
            <div className="bg-green-500 text-white px-5 py-2 rounded-full font-bold text-2xl shadow-lg">
              ${price2}
            </div>
          </motion.div>

          {showResult && (
            <>
              <span className="text-4xl font-bold text-gray-600">=</span>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center"
              >
                <div className="text-6xl mb-2">🎉</div>
                <div className="bg-primary text-white px-5 py-2 rounded-full font-bold text-2xl shadow-lg">
                  ${total}
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderPatternVisual = () => {
    // Parse pattern from question like "What comes next? 2, 4, 6, 8, ?"
    const patternMatch = problem.question.match(/(\d+),\s*(\d+),\s*(\d+),\s*(\d+)/);
    if (!patternMatch) return null;

    const [, n1, n2, n3, n4] = patternMatch.map(Number);
    const step = n2 - n1;
    const next = n4 + step;

    const steps = [
      `Look at the pattern: ${n1}, ${n2}, ${n3}, ${n4}...`,
      `What's the rule? Each number goes up by ${step}!`,
      `${n1} plus ${step} is ${n2}`,
      `${n4} plus ${step} is ${next}. That's our answer!`,
    ];

    const startAnimation = () => {
      setIsAnimating(true);
      setCurrentStep(0);
      steps.forEach((step, index) => {
        setTimeout(() => {
          setCurrentStep(index);
          speak(step);
        }, index * 2500);
      });
      setTimeout(() => setIsAnimating(false), steps.length * 2500);
    };

    return (
      <div
        className="p-6 rounded-2xl shadow-lg border-2"
        style={{
          background: 'linear-gradient(135deg, var(--visual-bg-from, #faf5ff) 0%, var(--visual-bg-to, #f3e8ff) 100%)',
          borderColor: 'var(--visual-border, #c4b5fd)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-primary font-bold text-lg">Find the Pattern! (+{step} each time)</p>
          <button
            onClick={startAnimation}
            disabled={isAnimating}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-primary text-white rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            Learn
          </button>
        </div>

        {/* Current instruction */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-blue-50 rounded-xl mb-4 flex items-center gap-2"
        >
          <span className="text-blue-700 font-medium">
            {isAnimating ? steps[currentStep] : `Find what comes next! The pattern adds ${step} each time.`}
          </span>
          <button
            onClick={() => speak(isAnimating ? steps[currentStep] : `Find what comes next! The pattern adds ${step} each time.`)}
            className="p-1 hover:bg-blue-100 rounded-full"
          >
            <Volume2 className="w-4 h-4 text-blue-600" />
          </button>
        </motion.div>

        <div className="flex items-center justify-center gap-2 flex-wrap p-4 bg-white/70 rounded-xl">
          {[n1, n2, n3, n4].map((num, i) => (
            <motion.div key={i} className="flex items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.2 }}
                className="w-16 h-16 rounded-xl bg-primary text-white flex items-center justify-center text-2xl font-bold shadow-lg"
              >
                {num}
              </motion.div>
              {i < 3 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.2 + 0.1 }}
                  className="mx-2 text-secondary font-bold text-lg"
                >
                  +{step}→
                </motion.span>
              )}
            </motion.div>
          ))}

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mx-2 text-secondary font-bold text-lg"
          >
            +{step}→
          </motion.span>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1 }}
            className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg ${
              showResult
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-400 border-2 border-dashed border-gray-400'
            }`}
          >
            {showResult ? next : '?'}
          </motion.div>
        </div>
      </div>
    );
  };

  const renderDecimalVisual = () => {
    const decMatch = problem.question.match(/([\d.]+)\s*\+\s*([\d.]+)/);
    if (!decMatch) return null;

    const [, d1, d2] = decMatch;
    const num1 = parseFloat(d1);
    const num2 = parseFloat(d2);
    const result = (num1 + num2).toFixed(1);

    return (
      <div
        className="p-6 rounded-2xl shadow-lg border-2"
        style={{
          background: 'linear-gradient(135deg, var(--visual-bg-from, #faf5ff) 0%, var(--visual-bg-to, #f3e8ff) 100%)',
          borderColor: 'var(--visual-border, #c4b5fd)',
        }}
      >
        <p className="text-center text-primary font-bold text-lg mb-4">Adding Decimals - Line Up the Dots!</p>

        <div className="flex flex-col items-center gap-2 font-mono text-3xl p-4 bg-white/70 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 w-8"></span>
            <span className="text-primary font-bold">{d1}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 w-8">+</span>
            <span className="text-secondary font-bold">{d2}</span>
          </div>
          <div className="border-t-3 border-gray-400 w-40 my-2" style={{ borderTopWidth: '3px' }}></div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 w-8">=</span>
            <span className={`font-bold ${showResult ? 'text-green-600' : 'text-gray-300'}`}>
              {showResult ? result : '?.?'}
            </span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-xl flex items-center gap-2 justify-center">
          <span className="text-blue-700 font-medium">
            💡 Tip: Line up the decimal points like a tower!
          </span>
          <button
            onClick={() => speak('Line up the decimal points like a tower!')}
            className="p-1 hover:bg-blue-100 rounded-full"
          >
            <Volume2 className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      </div>
    );
  };

  const renderPercentageVisual = () => {
    const percMatch = problem.question.match(/(\d+)%\s*of\s*(\d+)/);
    if (!percMatch) return null;

    const [, perc, total] = percMatch.map(Number);
    const result = (perc / 100) * total;
    const filledBars = Math.round(perc / 10);

    return (
      <div
        className="p-6 rounded-2xl shadow-lg border-2"
        style={{
          background: 'linear-gradient(135deg, var(--visual-bg-from, #faf5ff) 0%, var(--visual-bg-to, #f3e8ff) 100%)',
          borderColor: 'var(--visual-border, #c4b5fd)',
        }}
      >
        <p className="text-center text-primary font-bold text-lg mb-4">{perc}% means {perc} out of 100</p>

        {/* Percentage bar */}
        <div className="flex justify-center gap-1 mb-4 p-4 bg-white/70 rounded-xl">
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`w-10 h-20 rounded ${
                i < filledBars ? 'bg-primary' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <p className="text-center text-gray-600 font-medium">{filledBars} out of 10 bars = {perc}%</p>

        <div className="mt-4 p-4 bg-white rounded-xl text-center shadow-inner">
          <p className="text-gray-600 text-lg">{perc}% of {total} = </p>
          <p className={`text-3xl font-bold ${showResult ? 'text-green-600' : 'text-gray-300'}`}>
            {showResult ? result : '?'}
          </p>
        </div>
      </div>
    );
  };

  // Choose which visual to render based on problem topic
  switch (problem.topic) {
    case 'fractions':
      return renderFractionVisual();
    case 'money':
      return renderMoneyVisual();
    case 'division':
      return renderDivisionVisual();
    case 'patterns':
      return renderPatternVisual();
    case 'decimals':
      return renderDecimalVisual();
    case 'percentages':
      return renderPercentageVisual();
    default:
      return null;
  }
}
