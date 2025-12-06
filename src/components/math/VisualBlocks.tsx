'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, ChevronRight, RotateCcw } from 'lucide-react';
import { useSpeech } from '@/hooks/useSpeech';
import { useMathBuddyStore } from '@/lib/store';
import { ColumnCalculation } from './ColumnCalculation';

interface VisualBlocksProps {
  num1: number;
  num2: number;
  operator: string;
  showResult?: boolean;
  answer?: number;
}

interface Block {
  id: string;
  num: number;
  color: 'primary' | 'secondary';
  inCountingArea: boolean;
  removed: boolean;
}

export function VisualBlocks({ num1, num2, operator, showResult, answer }: VisualBlocksProps) {
  const { showBlockNumbers, setShowBlockNumbers } = useMathBuddyStore();
  const { speak } = useSpeech();
  const [currentStep, setCurrentStep] = useState(-1);

  const isSubtraction = operator === '-';

  // For large numbers, use scaled representation
  const maxBlocks = 100;
  const isLarge = isSubtraction ? num1 > maxBlocks : (num1 + num2) > maxBlocks;

  // Calculate display numbers - scale down if too large, preserving exact ratio
  let displayNum1 = num1;
  let displayNum2 = num2;
  let scaleFactor = 1;

  if (isLarge) {
    // Use GCD to preserve exact ratio for both addition and subtraction
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(num1, num2);
    const ratio1 = num1 / divisor;
    const ratio2 = num2 / divisor;

    if (isSubtraction) {
      // For subtraction, scale to fit num1 within maxBlocks while preserving ratio
      const multiplier = Math.floor(maxBlocks / ratio1);
      if (multiplier >= 1) {
        displayNum1 = ratio1 * multiplier;
        displayNum2 = ratio2 * multiplier;
        scaleFactor = displayNum1 / num1;
      } else {
        // Ratio1 > maxBlocks (e.g., 98:5 coprime)
        // Scale down proportionally to fit
        scaleFactor = maxBlocks / num1;
        displayNum1 = Math.round(num1 * scaleFactor);
        displayNum2 = Math.max(1, Math.round(num2 * scaleFactor)); // At least 1
      }
    } else {
      // For addition, scale to fit sum within maxBlocks while preserving ratio
      const ratioSum = ratio1 + ratio2;
      const multiplier = Math.floor(maxBlocks / ratioSum);

      if (multiplier >= 1) {
        displayNum1 = ratio1 * multiplier;
        displayNum2 = ratio2 * multiplier;
      } else {
        // If ratio is too large, just use minimal representation
        displayNum1 = Math.max(1, Math.min(ratio1, maxBlocks - 1));
        displayNum2 = Math.max(1, Math.min(ratio2, maxBlocks - displayNum1));
      }

      scaleFactor = displayNum1 / num1;
    }
  }

  // Initialize blocks
  const [blocks, setBlocks] = useState<Block[]>(() => {
    if (isSubtraction) {
      // For subtraction, only create blocks for num1
      return Array.from({ length: displayNum1 }, (_, i) => ({
        id: `first-${i}`,
        num: i + 1,
        color: 'primary' as const,
        inCountingArea: false,
        removed: false,
      }));
    } else {
      // For addition, create blocks for both numbers
      const firstBlocks = Array.from({ length: displayNum1 }, (_, i) => ({
        id: `first-${i}`,
        num: i + 1,
        color: 'primary' as const,
        inCountingArea: false,
        removed: false,
      }));
      const secondBlocks = Array.from({ length: displayNum2 }, (_, i) => ({
        id: `second-${i}`,
        num: i + 1,
        color: 'secondary' as const,
        inCountingArea: false,
        removed: false,
      }));
      return [...firstBlocks, ...secondBlocks];
    }
  });

  const [countingAreaBlocks, setCountingAreaBlocks] = useState<Block[]>([]);

  // Drag selection state
  const [dragStartId, setDragStartId] = useState<string | null>(null);
  const [dragCurrentId, setDragCurrentId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPoint, setDragStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [dragTargetState, setDragTargetState] = useState<boolean>(false); // true = add/remove, false = revert

  // Helper to parse block ID
  const parseBlockId = (id: string) => {
    const [group, indexStr] = id.split('-');
    return { group, index: parseInt(indexStr, 10) };
  };

  // Get range of blocks between start and current
  const getSelectionRange = (start: string, current: string) => {
    const startInfo = parseBlockId(start);
    const currentInfo = parseBlockId(current);

    // Must be in same group
    if (startInfo.group !== currentInfo.group) return [start];

    const min = Math.min(startInfo.index, currentInfo.index);
    const max = Math.max(startInfo.index, currentInfo.index);

    const rangeIds: string[] = [];
    for (let i = min; i <= max; i++) {
      rangeIds.push(`${startInfo.group}-${i}`);
    }
    return rangeIds;
  };

  // Handle pointer down to start interaction
  const handlePointerDown = (e: React.PointerEvent, block: Block) => {
    if (showResult) return;
    // We don't prevent default immediately to allow potential scrolling if it's not a drag
    // But for blocks, we usually want to prevent default to stop text selection/scrolling if we intend to drag
    // We'll use touch-action: none in CSS to handle scrolling behavior better

    setDragStartId(block.id);
    setDragCurrentId(block.id);
    setDragStartPoint({ x: e.clientX, y: e.clientY });
    setIsDragging(false);

    // Determine target state based on start block (for drag preview)
    if (isSubtraction) {
      setDragTargetState(!block.removed);
    } else {
      setDragTargetState(!block.inCountingArea);
    }
  };

  // Handle global pointer move and up
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragStartId || !dragStartPoint) return;

      // Calculate distance moved
      const dx = e.clientX - dragStartPoint.x;
      const dy = e.clientY - dragStartPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If moved more than 5px, consider it a drag
      if (distance > 5 && !isDragging) {
        setIsDragging(true);
      }

      // If dragging, update current target
      if (distance > 5 || isDragging) {
        e.preventDefault(); // Prevent scrolling once we are dragging
        const element = document.elementFromPoint(e.clientX, e.clientY);
        const blockButton = element?.closest('button[data-block-id]');

        if (blockButton) {
          const id = blockButton.getAttribute('data-block-id');
          if (id) setDragCurrentId(id);
        }
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!dragStartId) return;

      if (isDragging && dragCurrentId) {
        // Handle Drag Selection
        const range = getSelectionRange(dragStartId, dragCurrentId);

        if (isSubtraction) {
          setBlocks(prev => prev.map(b =>
            range.includes(b.id) ? { ...b, removed: dragTargetState } : b
          ));
        } else {
          setBlocks(prev => {
            const newBlocks = prev.map(b =>
              range.includes(b.id) ? { ...b, inCountingArea: dragTargetState } : b
            );
            // Sync countingAreaBlocks
            setCountingAreaBlocks(newBlocks.filter(b => b.inCountingArea));
            return newBlocks;
          });
        }
      } else {
        // Handle Single Click (Toggle)
        // We use dragStartId because dragCurrentId might not have updated if no move
        const targetId = dragStartId;

        if (isSubtraction) {
          setBlocks(prev => prev.map(b =>
            b.id === targetId ? { ...b, removed: !b.removed } : b
          ));
        } else {
          setBlocks(prev => {
            // Check current state of the block to toggle it correctly
            const targetBlock = prev.find(b => b.id === targetId);
            if (!targetBlock) return prev;

            const newInCounting = !targetBlock.inCountingArea;

            const newBlocks = prev.map(b =>
              b.id === targetId ? { ...b, inCountingArea: newInCounting } : b
            );

            // Sync countingAreaBlocks
            if (newInCounting) {
              // Add to counting area (append) - wait, we need to reconstruct from blocks to keep order or just append?
              // The original logic appended. But syncing from filter is safer for consistency.
              // However, original logic for addition:
              // "Move to counting area" -> append
              // "Move back" -> filter
              // Let's stick to syncing from the main blocks array to ensure consistency
              setCountingAreaBlocks(newBlocks.filter(b => b.inCountingArea));
            } else {
              setCountingAreaBlocks(prevCounting => prevCounting.filter(b => b.id !== targetId));
            }

            return newBlocks;
          });
        }
      }

      // Reset state
      setDragStartId(null);
      setDragCurrentId(null);
      setDragStartPoint(null);
      setIsDragging(false);
    };

    if (dragStartId) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [dragStartId, dragCurrentId, dragStartPoint, isDragging, dragTargetState, isSubtraction]);

  // Handle block click - NO-OP now as we handle it in pointerUp
  const handleBlockClick = (block: Block) => {
    // Left empty intentionally
  };

  // Move all blocks to counting area
  const moveAllToCountingArea = () => {
    const allBlocks = blocks.map(b => ({ ...b, inCountingArea: true }));
    setBlocks(allBlocks);
    setCountingAreaBlocks(allBlocks);
  };

  // Reset all blocks
  const resetBlocks = () => {
    setBlocks(blocks.map(b => ({ ...b, inCountingArea: false, removed: false })));
    setCountingAreaBlocks([]);
    setCurrentStep(-1);
  };

  // Auto-remove correct amount for subtraction
  const autoRemove = () => {
    const newBlocks = blocks.map((b, i) => ({
      ...b,
      removed: i < displayNum2,
    }));
    setBlocks(newBlocks);
    speak(`Removed ${num2}! ${num1} minus ${num2} equals ${answer}!`);
  };

  // Get blocks that are not in counting area
  const firstGroupBlocks = blocks.filter(b => b.color === 'primary' && !b.inCountingArea);
  const secondGroupBlocks = blocks.filter(b => b.color === 'secondary' && !b.inCountingArea);
  const removedCount = blocks.filter(b => b.removed).length;

  // Calculate actual answer based on removed blocks (for display)
  const actualRemaining = displayNum1 - removedCount;
  const targetRemoveCount = displayNum2;

  // Steps for learning
  const additionSteps = [
    { text: `We need to add ${num1} and ${num2} together.` },
    { text: `Tap the blue blocks to move them to the counting area.` },
    { text: `Now tap the pink blocks too!` },
    { text: `Count all the blocks: ${num1} plus ${num2} equals ${answer}!` },
  ];

  const subtractionSteps = [
    { text: `We need to take away ${num2} from ${num1}.` },
    { text: `We start with ${num1} blocks.` },
    { text: `Tap ${num2} blocks to cross them out!` },
    { text: `Count what's left: ${num1} minus ${num2} equals ${answer}!` },
  ];

  const steps = isSubtraction ? subtractionSteps : additionSteps;

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      speak(steps[nextStep].text);
    }
  };

  // Render a single block
  const renderBlock = (block: Block) => {
    // Determine if this block is currently being selected/modified in a drag
    let isRemoved = block.removed;
    let isInCounting = block.inCountingArea;

    if (isDragging && dragStartId && dragCurrentId) {
      const range = getSelectionRange(dragStartId, dragCurrentId);
      if (range.includes(block.id)) {
        if (isSubtraction) {
          isRemoved = dragTargetState;
        } else {
          isInCounting = dragTargetState;
        }
      }
    }

    const colorClass = block.color === 'primary'
      ? 'var(--primary, #3b82f6)'
      : 'var(--secondary, #06b6d4)';

    return (
      <motion.button
        key={block.id}
        data-block-id={block.id}
        layout
        initial={{ scale: 0 }}
        animate={{
          scale: isRemoved ? 0.6 : 1,
          opacity: isRemoved ? 0.3 : 1,
        }}
        whileHover={{ scale: isRemoved ? 0.6 : 1.1 }}
        whileTap={{ scale: 0.9 }}
        onPointerDown={(e) => handlePointerDown(e, block)}
        disabled={showResult}
        className={`w-10 h-10 rounded-lg shadow-md flex items-center justify-center font-bold text-white transition-all cursor-pointer ${isRemoved ? 'line-through' : 'hover:ring-2 hover:ring-white'
          } touch-none select-none`} // touch-none is crucial for drag
        style={{ backgroundColor: isRemoved ? '#d1d5db' : colorClass }}
      >
        {showBlockNumbers && <span className="text-xs">{block.num}</span>}
      </motion.button>
    );
  };

  // Render blocks in rows of 10
  const renderBlockRows = (blockList: Block[], label: string, color: string, count: number) => {
    if (blockList.length === 0) return null;

    const rows: Block[][] = [];
    for (let i = 0; i < blockList.length; i += 10) {
      rows.push(blockList.slice(i, i + 10));
    }

    return (
      <div className="space-y-2">
        <p className="text-lg font-bold mb-2" style={{ color }}>
          {label}: {count}{isLarge && blockList.length !== count ? ` (showing ${blockList.length})` : ''}
        </p>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1.5 flex-wrap items-center">
            {row.map((block) => renderBlock(block))}
            <span className="text-gray-500 font-medium text-sm ml-2">({rowIndex * 10 + row.length})</span>
          </div>
        ))}
      </div>
    );
  };

  // Addition visual with drag to count
  const renderAddition = () => (
    <div className="space-y-6">
      {/* Large number notice */}
      {isLarge && (
        <div className="p-2 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-700 text-sm text-center">
            📐 Showing scaled version. Real: {num1} + {num2} = {answer}
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="p-3 bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="text-lg font-bold text-primary">
            {num1} + {num2} = ?
          </p>
          <button
            onClick={() => setShowBlockNumbers(!showBlockNumbers)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            {showBlockNumbers ? 'Hide' : 'Show'} numbers
          </button>
        </div>

        {/* Instruction */}
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
          <span className="text-blue-700 font-medium flex-1">
            {currentStep >= 0 ? steps[currentStep].text : '👆 Tap blocks to move them to the counting area!'}
          </span>
          <button
            onClick={() => speak(currentStep >= 0 ? steps[currentStep].text : 'Tap blocks to move them to the counting area')}
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
          <div className="flex gap-2">
            {(currentStep >= 0 || countingAreaBlocks.length > 0) && (
              <button
                onClick={resetBlocks}
                className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            )}
            <button
              onClick={moveAllToCountingArea}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-full transition-colors"
            >
              Show Me
            </button>
            {currentStep < steps.length - 1 && (
              <button
                onClick={goToNextStep}
                className="flex items-center gap-1 px-4 py-1 text-sm bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
              >
                {currentStep === -1 ? 'Learn' : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* First group - only show blocks not in counting area */}
      {firstGroupBlocks.length > 0 && (
        <motion.div
          layout
          className="p-4 bg-white/70 rounded-xl"
        >
          {renderBlockRows(firstGroupBlocks, 'First number', 'var(--primary, #3b82f6)', num1)}
        </motion.div>
      )}

      {/* Plus sign - only show if both groups have remaining blocks */}
      {firstGroupBlocks.length > 0 && secondGroupBlocks.length > 0 && (
        <motion.div layout className="flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center">
            <span className="text-3xl font-bold text-gray-600">+</span>
          </div>
        </motion.div>
      )}

      {/* Second group - only show blocks not in counting area */}
      {secondGroupBlocks.length > 0 && (
        <motion.div
          layout
          className="p-4 bg-white/70 rounded-xl"
        >
          {renderBlockRows(secondGroupBlocks, 'Second number', 'var(--secondary, #06b6d4)', num2)}
        </motion.div>
      )}

      {/* Counting area */}
      <motion.div
        layout
        className="p-4 bg-green-50 rounded-xl border-2 border-dashed border-green-300"
      >
        <p className="text-green-700 font-bold mb-3 text-center">
          🎯 Counting Area: {countingAreaBlocks.length} blocks
        </p>

        {countingAreaBlocks.length === 0 ? (
          <p className="text-center text-green-600 py-4">
            Tap blocks above to move them here and count!
          </p>
        ) : (
          <div className="space-y-2">
            {/* Show all blocks in counting area in rows of 10 */}
            {Array.from({ length: Math.ceil(countingAreaBlocks.length / 10) }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex gap-1.5 flex-wrap items-center">
                {countingAreaBlocks.slice(rowIndex * 10, (rowIndex + 1) * 10).map((block, i) => (
                  <motion.button
                    key={block.id}
                    data-block-id={block.id}
                    layout
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    onPointerDown={(e) => handlePointerDown(e, block)}
                    className="w-10 h-10 rounded-lg shadow-md flex items-center justify-center font-bold text-white cursor-pointer hover:ring-2 hover:ring-white touch-none select-none"
                    style={{
                      backgroundColor: block.color === 'primary'
                        ? 'var(--primary, #3b82f6)'
                        : 'var(--secondary, #06b6d4)'
                    }}
                  >
                    {showBlockNumbers && <span className="text-xs">{rowIndex * 10 + i + 1}</span>}
                  </motion.button>
                ))}
                <span className="text-green-600 font-bold text-sm ml-2">
                  = {Math.min((rowIndex + 1) * 10, countingAreaBlocks.length)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Running total */}
        {countingAreaBlocks.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-4 p-3 bg-white rounded-lg text-center"
          >
            <p className="text-gray-600">Total count:</p>
            <p className="text-4xl font-bold text-green-600">
              {countingAreaBlocks.length}
            </p>
            {countingAreaBlocks.length === displayNum1 + displayNum2 && (
              <p className="text-green-600 font-medium mt-1">✓ You counted all the blocks!</p>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Interactive column calculation */}
      <motion.div layout>
        <ColumnCalculation
          num1={num1}
          num2={num2}
          operator="+"
          showResult={showResult || countingAreaBlocks.length === displayNum1 + displayNum2}
        />
      </motion.div>
    </div>
  );

  // Subtraction visual
  const renderSubtraction = () => {
    const subtractionBlocks = blocks.filter(b => b.color === 'primary');
    const isComplete = removedCount === targetRemoveCount;

    return (
      <div className="space-y-6">
        {/* Large number notice */}
        {isLarge && (
          <div className="p-2 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-yellow-700 text-sm text-center">
              📐 Showing scaled version. Real: {num1} - {num2} = {answer}
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="p-3 bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-lg font-bold text-primary">
              {num1} - {num2} = ?
            </p>
            <button
              onClick={() => setShowBlockNumbers(!showBlockNumbers)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              {showBlockNumbers ? 'Hide' : 'Show'} numbers
            </button>
          </div>

          {/* Instruction */}
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
            <span className="text-blue-700 font-medium flex-1">
              {currentStep >= 0 ? steps[currentStep].text : `👆 Tap ${isLarge ? targetRemoveCount : num2} blocks to take them away!`}
            </span>
            <button
              onClick={() => speak(currentStep >= 0 ? steps[currentStep].text : `Tap ${num2} blocks to take them away`)}
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
            <div className="flex gap-2">
              {(currentStep >= 0 || removedCount > 0) && (
                <button
                  onClick={resetBlocks}
                  className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              )}
              <button
                onClick={autoRemove}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-full transition-colors"
              >
                Show Me
              </button>
              {currentStep < steps.length - 1 && (
                <button
                  onClick={goToNextStep}
                  className="flex items-center gap-1 px-4 py-1 text-sm bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
                >
                  {currentStep === -1 ? 'Learn' : 'Next'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Blocks */}
        <motion.div layout className="p-4 bg-white/70 rounded-xl">
          <p className="text-lg font-bold mb-3" style={{ color: 'var(--primary, #3b82f6)' }}>
            Start with {num1} blocks{isLarge ? ` (showing ${displayNum1})` : ''}:
          </p>
          <div className="space-y-2">
            {Array.from({ length: Math.ceil(subtractionBlocks.length / 10) }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex gap-1.5 flex-wrap items-center">
                {subtractionBlocks.slice(rowIndex * 10, (rowIndex + 1) * 10).map((block) =>
                  renderBlock(block)
                )}
                <span className="text-gray-500 font-medium text-sm ml-2">
                  ({rowIndex * 10 + subtractionBlocks.slice(rowIndex * 10, (rowIndex + 1) * 10).length})
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Progress - simplified to show only remaining count */}
        <div className="p-4 bg-white rounded-xl shadow-inner">
          <div className="flex flex-col items-center gap-2">
            <p className="text-gray-500 text-sm">Blocks remaining:</p>
            <motion.p
              key={actualRemaining}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className={`text-5xl font-bold ${isComplete ? 'text-green-600' : 'text-primary'}`}
            >
              {isComplete ? answer : (isLarge ? Math.round(actualRemaining / scaleFactor) : actualRemaining)}
            </motion.p>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-red-400 to-red-500"
              initial={{ width: 0 }}
              animate={{ width: `${(removedCount / targetRemoveCount) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <p className="text-center text-gray-500 mt-2">
            {removedCount < targetRemoveCount
              ? `Take away ${targetRemoveCount - removedCount} more`
              : removedCount === targetRemoveCount
                ? '✓ Perfect!'
                : `Too many! Tap some back.`}
          </p>
        </div>

        {/* Interactive column calculation */}
        <ColumnCalculation
          num1={num1}
          num2={num2}
          operator="-"
          showResult={showResult || isComplete}
        />

        {/* Success message */}
        {(showResult || isComplete) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-green-100 rounded-xl border-2 border-green-300"
          >
            <p className="text-center text-green-800 font-bold text-2xl">
              {num1} - {num2} = {answer}!
            </p>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div
      className="p-6 rounded-2xl border-2 shadow-lg"
      style={{
        background: 'linear-gradient(135deg, var(--visual-bg-from, #faf5ff) 0%, var(--visual-bg-to, #f3e8ff) 100%)',
        borderColor: 'var(--visual-border, #c4b5fd)',
      }}
    >
      {isSubtraction ? renderSubtraction() : renderAddition()}

      {/* Legend */}
      <div className="mt-4 flex justify-center gap-6 text-sm text-gray-500">
        <span className="flex items-center gap-2">
          <div className="w-5 h-5 rounded" style={{ backgroundColor: 'var(--primary, #3b82f6)' }} />
          <span>{isSubtraction ? 'Blocks' : 'First'}</span>
        </span>
        {!isSubtraction && (
          <span className="flex items-center gap-2">
            <div className="w-5 h-5 rounded" style={{ backgroundColor: 'var(--secondary, #06b6d4)' }} />
            <span>Second</span>
          </span>
        )}
        {isSubtraction && (
          <span className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gray-300" />
            <span>Taken away</span>
          </span>
        )}
      </div>
    </div>
  );
}
