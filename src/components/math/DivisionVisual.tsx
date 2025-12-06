'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, ChevronRight, RotateCcw, Plus } from 'lucide-react';
import { useSpeech } from '@/hooks/useSpeech';
import { ColumnCalculation } from './ColumnCalculation';

interface DivisionVisualProps {
  dividend: number;
  divisor: number;
  showResult?: boolean;
}

interface Item {
  id: string;
  num: number;
  groupIndex: number; // -1 = not in any group
}

interface Group {
  id: string;
  index: number;
}

export function DivisionVisual({ dividend, divisor, showResult }: DivisionVisualProps) {
  const { speak } = useSpeech();
  const answer = Math.floor(dividend / divisor);
  const [currentStep, setCurrentStep] = useState(-1);

  // For large numbers, show scaled representation
  // IMPORTANT: displayDividend must be a multiple of divisor so groups work correctly
  const isLarge = dividend > 100;
  const maxBlocks = 100;
  const maxGroups = Math.min(Math.floor(maxBlocks / divisor), answer); // Max groups we can show
  const displayDividend = isLarge ? maxGroups * divisor : dividend;
  const displayAnswer = isLarge ? maxGroups : answer; // Groups in the scaled display
  const scaleFactor = isLarge ? dividend / displayDividend : 1;

  // Items to drag
  const [items, setItems] = useState<Item[]>(() =>
    Array.from({ length: displayDividend }, (_, i) => ({
      id: `item-${i}`,
      num: i + 1,
      groupIndex: -1,
    }))
  );

  // Groups - start with one empty group, add more as needed
  const [groups, setGroups] = useState<Group[]>([{ id: 'group-0', index: 0 }]);

  // For display, limit items per group to 20 max for visual clarity
  const displayItemsPerGroup = 20;

  // Drag state
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Count items in each group
  const getItemsInGroup = (groupIdx: number) => items.filter(i => i.groupIndex === groupIdx);
  const unassignedItems = items.filter(i => i.groupIndex === -1);
  const fullGroups = groups.filter((_, idx) => getItemsInGroup(idx).length === divisor);

  // Steps for learning
  const steps = [
    { text: `We have ${dividend} items to share into groups of ${divisor}` },
    { text: `Drag items into Group 1 until it has ${divisor} items` },
    { text: `When a group is full, tap "+ New Group" to make another!` },
    { text: `Keep going until all items are in groups` },
    { text: `Count the groups - that's your answer!` },
  ];

  const isStepActive = currentStep >= 0;

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      speak(steps[nextStep].text);
    }
  };

  // Add a new group (no auto-speak)
  const addNewGroup = () => {
    const newIndex = groups.length;
    setGroups([...groups, { id: `group-${newIndex}`, index: newIndex }]);
  };

  // Handle dropping an item into a group (no auto-speak)
  const handleDropInGroup = (groupIdx: number) => {
    if (!draggedItem) return;

    const group = getItemsInGroup(groupIdx);
    if (group.length >= divisor) {
      return;
    }

    setItems(prev => prev.map(item =>
      item.id === draggedItem ? { ...item, groupIndex: groupIdx } : item
    ));

    setDraggedItem(null);
  };

  // Handle tapping an item (mobile-friendly alternative to drag) - no auto-speak
  const handleItemTap = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    if (item.groupIndex === -1) {
      // Find first group that isn't full
      let targetGroup = groups.findIndex((_, idx) => getItemsInGroup(idx).length < divisor);

      if (targetGroup === -1) {
        // All groups full, auto-create new group
        const newIndex = groups.length;
        setGroups(prev => [...prev, { id: `group-${newIndex}`, index: newIndex }]);
        targetGroup = newIndex;
      }

      setItems(prev => prev.map(i =>
        i.id === itemId ? { ...i, groupIndex: targetGroup } : i
      ));
    } else {
      // Remove from group back to pool
      setItems(prev => prev.map(i =>
        i.id === itemId ? { ...i, groupIndex: -1 } : i
      ));
    }
  };

  // Reset everything
  const resetAll = () => {
    setItems(items.map(i => ({ ...i, groupIndex: -1 })));
    setGroups([{ id: 'group-0', index: 0 }]);
    setCurrentStep(-1);
  };

  // Auto-fill demonstration
  const autoFill = () => {
    const newItems = [...items];
    const newGroups: Group[] = [];
    let currentGroup = 0;
    let countInGroup = 0;

    newItems.forEach((item, idx) => {
      if (countInGroup === 0) {
        newGroups.push({ id: `group-${currentGroup}`, index: currentGroup });
      }
      newItems[idx] = { ...item, groupIndex: currentGroup };
      countInGroup++;
      if (countInGroup >= divisor) {
        currentGroup++;
        countInGroup = 0;
      }
    });

    setItems(newItems);
    setGroups(newGroups);
    speak(`Done! We made ${fullGroups.length + Math.ceil(unassignedItems.length / divisor)} groups of ${divisor}!`);
  };

  const actualFullGroups = groups.filter((_, idx) => getItemsInGroup(idx).length === divisor).length;
  const isComplete = unassignedItems.length === 0 && actualFullGroups === displayAnswer;

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
            {dividend} ÷ {divisor} = How many groups?
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
                ? `You made ${actualFullGroups} groups of ${divisor}!`
                : `Tap items to put them in groups of ${divisor}. Tap "+ New Group" when a group is full!`}
          </span>
          <button
            onClick={() => speak(isStepActive ? steps[currentStep].text : `Tap items to put them in groups of ${divisor}`)}
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

      {/* Large number notice */}
      {isLarge && (
        <div className="mb-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-700 text-sm text-center">
            📐 Showing {displayDividend} items ({displayAnswer} groups of {divisor}) to demonstrate.
            <br />
            <strong>Real answer: {dividend} ÷ {divisor} = {answer} groups</strong>
          </p>
        </div>
      )}

      {/* Items pool */}
      <div className="mb-4 p-4 bg-white/70 rounded-xl min-h-[100px]">
        <p className="text-gray-600 mb-3 font-bold">
          Items to share: {unassignedItems.length} remaining
        </p>
        <div className="flex flex-wrap gap-2">
          {unassignedItems.map((item) => (
            <motion.button
              key={item.id}
              layout
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              draggable
              onDragStart={() => setDraggedItem(item.id)}
              onDragEnd={() => setDraggedItem(null)}
              onClick={() => handleItemTap(item.id)}
              className={`w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white font-bold shadow-lg cursor-grab active:cursor-grabbing hover:ring-4 hover:ring-primary/30 transition-all ${draggedItem === item.id ? 'opacity-50 scale-90' : ''
                }`}
            >
              {item.num}
            </motion.button>
          ))}
          {unassignedItems.length === 0 && (
            <p className="text-green-600 font-medium">All items placed!</p>
          )}
        </div>
      </div>

      {/* Groups area */}
      <div className="p-4 bg-white/70 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <p className="text-gray-600 font-bold">
            Groups (each holds {divisor} items):
          </p>
          <button
            onClick={addNewGroup}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-secondary text-white rounded-full hover:bg-secondary/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Group
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {groups.map((group, groupIdx) => {
            const groupItems = getItemsInGroup(groupIdx);
            const isFull = groupItems.length >= divisor;
            const isEmpty = groupItems.length === 0;

            return (
              <motion.div
                key={group.id}
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDropInGroup(groupIdx)}
                className={`p-3 rounded-xl min-h-[120px] transition-all ${isFull
                    ? 'bg-green-100 border-green-400 border-solid'
                    : isEmpty
                      ? 'bg-gray-50 border-gray-300 border-dashed'
                      : 'bg-secondary/10 border-secondary border-dashed'
                  }`}
                style={{ borderWidth: '3px' }}
              >
                <p className={`text-center text-sm font-bold mb-2 ${isFull ? 'text-green-600' : isEmpty ? 'text-gray-400' : 'text-secondary'
                  }`}>
                  Group {groupIdx + 1} {isFull && '✓'}
                </p>

                <div className="flex flex-wrap gap-1 justify-center min-h-[60px] items-center">
                  {groupItems.map((item) => (
                    <motion.button
                      key={item.id}
                      layout
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleItemTap(item.id)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md cursor-pointer ${isFull ? 'bg-green-500' : 'bg-secondary'
                        }`}
                    >
                      {item.num}
                    </motion.button>
                  ))}

                  {/* Empty slot indicators */}
                  {!isFull && Array.from({ length: divisor - groupItems.length }).map((_, i) => (
                    <div
                      key={`empty-${groupIdx}-${i}`}
                      className="w-9 h-9 rounded-full border-2 border-dashed border-gray-300 bg-white/50"
                    />
                  ))}
                </div>

                <p className={`text-center text-xs mt-2 ${isFull ? 'text-green-600 font-bold' : 'text-gray-500'}`}>
                  {groupItems.length} / {divisor}
                </p>
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
            <p className="text-3xl font-bold text-green-600">{actualFullGroups}</p>
            <p className="text-sm text-gray-500">Full groups</p>
          </div>
          <div className="text-4xl text-gray-300">×</div>
          <div className="text-center">
            <p className="text-3xl font-bold text-secondary">{divisor}</p>
            <p className="text-sm text-gray-500">Items each</p>
          </div>
          <div className="text-4xl text-gray-300">=</div>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{actualFullGroups * divisor}</p>
            <p className="text-sm text-gray-500">Items placed</p>
          </div>
        </div>
      </div>

      {/* Interactive column calculation */}
      <div className="mt-4">
        <ColumnCalculation
          num1={dividend}
          num2={divisor}
          operator="÷"
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
            {dividend} ÷ {divisor} = {answer} groups!
          </p>
          <p className="text-center text-green-600 mt-1">
            {dividend} items shared into groups of {divisor} makes {answer} groups
          </p>
        </motion.div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary" />
          <span className="text-gray-600">Tap to place</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-secondary" />
          <span className="text-gray-600">In a group</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-green-500" />
          <span className="text-gray-600">Group full!</span>
        </div>
      </div>
    </div>
  );
}
