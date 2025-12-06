'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, ChevronRight, RotateCcw, Plus, Minus } from 'lucide-react';
import { useSpeech } from '@/hooks/useSpeech';
import { ColumnCalculation } from './ColumnCalculation';

interface MultiplicationGridProps {
  num1: number;
  num2: number;
  showResult?: boolean;
}

export function MultiplicationGrid({ num1, num2, showResult }: MultiplicationGridProps) {
  const { speak } = useSpeech();
  const answer = num1 * num2;
  const [currentStep, setCurrentStep] = useState(-1);

  // num1 × num2 = num1 groups, each with num2 items
  // Example: 9 × 8 = 9 groups of 8
  const targetGroups = num1;
  const itemsPerGroup = num2;

  // For display, limit items per group to 20 max for visual clarity
  const displayItemsPerGroup = Math.min(itemsPerGroup, 20);

  // Track number of groups (start with 1, user can add more up to targetGroups)
  const [numGroups, setNumGroups] = useState(1);

  // Each group tracks how many items it has (0 to displayItemsPerGroup)
  const [groupCounts, setGroupCounts] = useState<number[]>(() => [0]);

  // Steps for learning
  const steps = [
    { text: `${num1} × ${num2} means ${num1} groups of ${num2}` },
    { text: `Start by making groups. Tap "+ New Group" to add groups!` },
    { text: `Tap + to add ${displayItemsPerGroup} items to each group` },
    { text: `Make ${targetGroups} groups, each with ${itemsPerGroup} items` },
    { text: `Count all: ${targetGroups} × ${itemsPerGroup} = ${answer}!` },
  ];

  const isStepActive = currentStep >= 0;

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      speak(steps[nextStep].text);
    }
  };

  // Add a new group
  const addNewGroup = () => {
    if (numGroups >= targetGroups) return; // Can't exceed target
    setNumGroups(prev => prev + 1);
    setGroupCounts(prev => [...prev, 0]);
  };

  // Add one item to a group
  const addToGroup = (groupIdx: number) => {
    if (groupCounts[groupIdx] >= displayItemsPerGroup) return;
    setGroupCounts(prev => {
      const newCounts = [...prev];
      newCounts[groupIdx] = prev[groupIdx] + 1;

      // Auto-add a new group if this group just became full and we haven't reached target
      const justBecameFull = newCounts[groupIdx] === displayItemsPerGroup;
      const isLastGroup = groupIdx === newCounts.length - 1;
      const canAddMore = newCounts.length < targetGroups;

      if (justBecameFull && isLastGroup && canAddMore) {
        // Add a new empty group
        setNumGroups(n => n + 1);
        return [...newCounts, 0];
      }

      return newCounts;
    });
  };

  // Remove one item from a group
  const removeFromGroup = (groupIdx: number) => {
    if (groupCounts[groupIdx] <= 0) return;
    setGroupCounts(prev => {
      const newCounts = [...prev];
      newCounts[groupIdx] = prev[groupIdx] - 1;
      return newCounts;
    });
  };

  // Reset everything
  const resetAll = () => {
    setNumGroups(1);
    setGroupCounts([0]);
    setCurrentStep(-1);
  };

  // Auto-fill demonstration - create all groups and fill them
  const autoFill = () => {
    setNumGroups(targetGroups);
    setGroupCounts(Array(targetGroups).fill(displayItemsPerGroup));
    speak(`Done! ${targetGroups} groups of ${itemsPerGroup} equals ${answer}!`);
  };

  const fullGroupsCount = groupCounts.filter(c => c === displayItemsPerGroup).length;
  const totalItemsPlaced = groupCounts.reduce((sum, c) => sum + c, 0);
  // Complete when we have all groups and all are full
  const isComplete = numGroups === targetGroups && fullGroupsCount === targetGroups;

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
            {num1} × {num2} = {targetGroups} groups of {itemsPerGroup}
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
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
          <span className="text-blue-700 font-medium flex-1">
            {isStepActive
              ? steps[currentStep].text
              : isComplete
                ? `${fullGroupsCount} groups × ${displayItemsPerGroup} = ${totalItemsPlaced}!`
                : numGroups < targetGroups
                  ? `Make ${targetGroups} groups! (${numGroups}/${targetGroups} created)`
                  : `Fill each group with ${displayItemsPerGroup} items!`}
          </span>
          <button
            onClick={() => speak(isStepActive ? steps[currentStep].text : `${num1} times ${num2} means ${targetGroups} groups of ${itemsPerGroup}`)}
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
                className={`w-3 h-3 rounded-full transition-colors ${i <= currentStep ? 'bg-primary' : 'bg-gray-200'
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

      {/* Large number notice - only show if items per group is scaled */}
      {itemsPerGroup > 10 && (
        <div className="mb-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-700 text-sm text-center">
            📐 Each group shows {displayItemsPerGroup} items (scaled from {itemsPerGroup}).
            <br />
            <strong>Real answer: {num1} × {num2} = {answer}</strong>
          </p>
        </div>
      )}

      {/* Groups area */}
      <div className="p-4 bg-white/70 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <p className="text-gray-600 font-bold">
            {numGroups}/{targetGroups} Groups (tap + to add items):
          </p>
          {numGroups < targetGroups && (
            <button
              onClick={addNewGroup}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-secondary text-white rounded-full hover:bg-secondary/80 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Group
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {groupCounts.map((count, groupIdx) => {
            const isFull = count >= displayItemsPerGroup;

            return (
              <motion.div
                key={`group-${groupIdx}`}
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: groupIdx * 0.05 }}
                className={`p-3 rounded-xl transition-all ${isFull
                    ? 'bg-green-100 border-green-400 border-solid'
                    : 'bg-secondary/10 border-secondary border-dashed'
                  }`}
                style={{ borderWidth: '3px' }}
              >
                <p className={`text-center text-sm font-bold mb-2 ${isFull ? 'text-green-600' : 'text-secondary'}`}>
                  Group {groupIdx + 1} {isFull && '✓'}
                </p>

                {/* Visual items in group */}
                <div className="flex flex-wrap gap-1 justify-center min-h-[50px] items-center mb-2">
                  {Array.from({ length: count }).map((_, i) => {
                    // Sequential number: group offset + position in group
                    const seqNum = groupIdx * displayItemsPerGroup + i + 1;
                    return (
                      <motion.div
                        key={`item-${groupIdx}-${i}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md ${isFull ? 'bg-green-500' : 'bg-secondary'
                          }`}
                      >
                        {seqNum}
                      </motion.div>
                    );
                  })}

                  {/* Empty slots */}
                  {!isFull && Array.from({ length: displayItemsPerGroup - count }).map((_, i) => (
                    <div
                      key={`empty-${groupIdx}-${i}`}
                      className="w-7 h-7 rounded-lg border-2 border-dashed border-gray-300 bg-white/50"
                    />
                  ))}
                </div>

                {/* +/- controls */}
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => removeFromGroup(groupIdx)}
                    disabled={count <= 0}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md transition-all ${count <= 0
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-red-400 hover:bg-red-500 active:scale-95'
                      }`}
                  >
                    <Minus className="w-5 h-5" />
                  </button>

                  <span className={`text-xl font-bold w-12 text-center ${isFull ? 'text-green-600' : 'text-secondary'}`}>
                    {count}/{displayItemsPerGroup}
                  </span>

                  <button
                    onClick={() => addToGroup(groupIdx)}
                    disabled={count >= displayItemsPerGroup}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md transition-all ${count >= displayItemsPerGroup
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600 active:scale-95'
                      }`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Count by skip counting */}
      <div className="mt-4 p-3 bg-white rounded-xl">
        <p className="text-gray-600 text-center mb-2 font-medium">Count by {displayItemsPerGroup}s:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {groupCounts.map((count, idx) => {
            const runningTotal = groupCounts.slice(0, idx + 1).reduce((sum, c) => sum + c, 0);
            const isFull = count === displayItemsPerGroup;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: count > 0 ? 1 : 0.3, y: 0 }}
                className={`px-3 py-1 rounded-full text-sm font-bold ${isFull
                    ? 'bg-green-100 text-green-700'
                    : count > 0
                      ? 'bg-secondary/20 text-secondary'
                      : 'bg-gray-100 text-gray-400'
                  }`}
              >
                {runningTotal}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Progress summary */}
      <div className="mt-4 p-3 bg-white rounded-xl">
        <p className="text-gray-600 text-center mb-2 font-medium">Progress:</p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{fullGroupsCount}/{targetGroups}</p>
            <p className="text-sm text-gray-500">Full groups</p>
          </div>
          <div className="text-4xl text-gray-300">×</div>
          <div className="text-center">
            <p className="text-3xl font-bold text-secondary">{itemsPerGroup}</p>
            <p className="text-sm text-gray-500">Items each</p>
          </div>
          <div className="text-4xl text-gray-300">=</div>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{fullGroupsCount * itemsPerGroup}</p>
            <p className="text-sm text-gray-500">Total items</p>
          </div>
        </div>
      </div>

      {/* Interactive column calculation */}
      <div className="mt-4">
        <ColumnCalculation
          num1={num1}
          num2={num2}
          operator="×"
          showResult={showResult || isComplete}
        />
      </div>

      {/* Result */}
      {(showResult || isComplete) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-4 bg-green-100 rounded-xl border-2 border-green-300"
        >
          <p className="text-center text-green-800 font-bold text-2xl">
            {num1} × {num2} = {answer}!
          </p>
          <p className="text-center text-green-600 mt-1">
            {targetGroups} groups of {itemsPerGroup} = {answer} total
          </p>
        </motion.div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg border-2 border-dashed border-gray-300" />
          <span className="text-gray-600">Empty slot</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-secondary" />
          <span className="text-gray-600">Item added</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-green-500" />
          <span className="text-gray-600">Group full!</span>
        </div>
      </div>
    </div>
  );
}
