'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, ChevronRight, RotateCcw } from 'lucide-react';
import { useSpeech } from '@/hooks/useSpeech';

interface RectangleVisualProps {
  length: number;
  width: number;
  showArea?: boolean;
  showPerimeter?: boolean;
  showResult?: boolean;
}

export function RectangleVisual({ length, width, showArea = true, showPerimeter = false, showResult = false }: RectangleVisualProps) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [countedCells, setCountedCells] = useState<Map<string, number>>(new Map()); // Map cell key to sequence number
  const { speak } = useSpeech();

  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ row: number, col: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ row: number, col: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Scale factor for display - limit to reasonable visual size
  const maxDisplaySize = 15;
  const displayLength = Math.min(length, maxDisplaySize);
  const displayWidth = Math.min(width, maxDisplaySize);
  const maxDim = Math.max(displayLength, displayWidth);
  const cellSize = maxDim <= 4 ? 52 : maxDim <= 8 ? 40 : maxDim <= 12 ? 32 : 26;

  const totalCells = displayLength * displayWidth;
  const area = length * width;
  const perimeter = 2 * (length + width);

  // Steps for area
  const areaSteps = [
    { text: `This rectangle is ${length} units long`, highlight: 'length' },
    { text: `And ${width} units wide`, highlight: 'width' },
    { text: `Tap each square to count them!`, highlight: 'count' },
    { text: `${length} times ${width} equals ${area} square units!`, highlight: 'result' },
  ];

  // Steps for perimeter
  const perimeterSteps = [
    { text: `Walk around the outside of the shape`, highlight: 'all' },
    { text: `Top side: ${length} units`, highlight: 'top' },
    { text: `Right side: ${width} units`, highlight: 'right' },
    { text: `Bottom side: ${length} units`, highlight: 'bottom' },
    { text: `Left side: ${width} units`, highlight: 'left' },
    { text: `Add them all: ${length} + ${width} + ${length} + ${width} = ${perimeter}!`, highlight: 'result' },
  ];

  const steps = showArea ? areaSteps : perimeterSteps;
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
    setCountedCells(new Map());
  };

  const handleCellClick = (row: number, col: number) => {
    const key = `${row}-${col}`;
    const newCounted = new Map(countedCells);
    if (newCounted.has(key)) {
      newCounted.delete(key);
      // Renumber remaining cells
      const entries = Array.from(newCounted.entries()).sort((a, b) => a[1] - b[1]);
      newCounted.clear();
      entries.forEach(([k], idx) => newCounted.set(k, idx + 1));
    } else {
      const nextNum = newCounted.size + 1;
      newCounted.set(key, nextNum);
      // Speak the count
      speak(`${nextNum}`);
    }
    setCountedCells(newCounted);
  };

  const countAllCells = () => {
    const allCells = new Map<string, number>();
    let num = 1;
    for (let r = 0; r < displayWidth; r++) {
      for (let c = 0; c < displayLength; c++) {
        allCells.set(`${r}-${c}`, num++);
      }
    }
    setCountedCells(allCells);
    speak(`All ${totalCells} squares counted!`);
  };

  // Check if a cell is on the edge (for perimeter highlighting)
  const isOnEdge = (row: number, col: number, edge: string) => {
    if (edge === 'top') return row === 0;
    if (edge === 'bottom') return row === displayWidth - 1;
    if (edge === 'left') return col === 0;
    if (edge === 'right') return col === displayLength - 1;
    if (edge === 'all') return row === 0 || row === displayWidth - 1 || col === 0 || col === displayLength - 1;
    return false;
  };

  // Get cells in drag selection rectangle
  const getCellsInDragSelection = useCallback(() => {
    if (!dragStart || !dragCurrent) return new Set<string>();

    const minRow = Math.min(dragStart.row, dragCurrent.row);
    const maxRow = Math.max(dragStart.row, dragCurrent.row);
    const minCol = Math.min(dragStart.col, dragCurrent.col);
    const maxCol = Math.max(dragStart.col, dragCurrent.col);

    const cells = new Set<string>();
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        cells.add(`${r}-${c}`);
      }
    }
    return cells;
  }, [dragStart, dragCurrent]);

  const dragSelectionCells = getCellsInDragSelection();

  // Get sorted list of cells in drag selection for numbering
  const sortedDragCells = Array.from(dragSelectionCells).sort((a, b) => {
    const [r1, c1] = a.split('-').map(Number);
    const [r2, c2] = b.split('-').map(Number);
    if (r1 !== r2) return r1 - r2;
    return c1 - c2;
  });

  // Handle drag start
  const handleDragStart = (row: number, col: number) => {
    if (!showArea) return;
    setIsDragging(true);
    setDragStart({ row, col });
    setDragCurrent({ row, col });
  };

  // Handle drag move
  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !gridRef.current) return;

    e.preventDefault();

    const rect = gridRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    // Calculate which cell we're over
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    // Account for padding (12px = p-3) and gap (4px = gap-1)
    const padding = 12;
    const gap = 4;
    const cellWithGap = cellSize + gap;

    const col = Math.max(0, Math.min(displayLength - 1, Math.floor((relX - padding) / cellWithGap)));
    const row = Math.max(0, Math.min(displayWidth - 1, Math.floor((relY - padding) / cellWithGap)));

    setDragCurrent({ row, col });
  }, [isDragging, cellSize, displayLength, displayWidth]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (isDragging && dragStart && dragCurrent) {
      // Check if this was a click (start == current)
      if (dragStart.row === dragCurrent.row && dragStart.col === dragCurrent.col) {
        handleCellClick(dragStart.row, dragStart.col);
      } else {
        // Drag selection - add range
        const newCounted = new Map(countedCells);
        const selectionCells = getCellsInDragSelection();

        // Sort selection cells for deterministic numbering
        const sortedSelection = Array.from(selectionCells).sort((a, b) => {
          const [r1, c1] = a.split('-').map(Number);
          const [r2, c2] = b.split('-').map(Number);
          if (r1 !== r2) return r1 - r2;
          return c1 - c2;
        });

        let addedCount = 0;
        let nextNum = newCounted.size + 1;

        sortedSelection.forEach(cell => {
          if (!newCounted.has(cell)) {
            newCounted.set(cell, nextNum++);
            addedCount++;
          }
        });

        if (addedCount > 0) {
          setCountedCells(newCounted);
          speak(`${addedCount} squares added`);
        }
      }
    }

    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
  }, [isDragging, dragStart, dragCurrent, countedCells, getCellsInDragSelection, speak]);

  // Attach document-level listeners for drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleDragMove, { passive: false });
      document.addEventListener('touchend', handleDragEnd);

      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.removeEventListener('touchmove', handleDragMove);
        document.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  return (
    <div
      className="p-6 rounded-2xl shadow-lg border-2"
      style={{
        background: 'linear-gradient(135deg, var(--visual-bg-from, #faf5ff) 0%, var(--visual-bg-to, #f3e8ff) 100%)',
        borderColor: 'var(--visual-border, #c4b5fd)',
      }}
    >
      {/* Header with title */}
      <div className="mb-4 p-3 bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="text-lg font-bold text-primary">
            {showArea ? 'Find the Area' : 'Find the Perimeter'}
          </p>
          <div className="flex gap-2">
            {showArea && (
              <button
                onClick={countAllCells}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                Count All
              </button>
            )}
          </div>
        </div>

        {/* Step-by-step instruction */}
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
          <span className="text-blue-700 font-medium flex-1">
            {isStepActive ? steps[currentStep].text : (showArea
              ? `Count all the squares inside! Length = ${length}, Width = ${width}`
              : `Add up all the sides around the outside!`
            )}
          </span>
          <button
            onClick={() => speak(isStepActive ? steps[currentStep].text : (showArea
              ? `Count all the squares inside! Length is ${length}, Width is ${width}`
              : `Add up all the sides around the outside!`
            ))}
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
                className={`w-3 h-3 rounded-full transition-colors ${i <= currentStep ? 'bg-primary' : 'bg-gray-200'
                  }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {(isStepActive || countedCells.size > 0) && (
              <button
                onClick={resetSteps}
                className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            )}
            {currentStep < steps.length - 1 && (
              <button
                onClick={goToNextStep}
                className="flex items-center gap-1 px-4 py-1 text-sm bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
              >
                {currentStep === -1 ? 'Start Learning' : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main visual area */}
      <div className="flex justify-center">
        <div className="relative inline-block">
          {/* Length label (top) */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: isStepActive && steps[currentStep]?.highlight === 'length' ? 1.1 : 1,
            }}
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
          >
            <div className={`px-4 py-2 rounded-full font-bold text-lg shadow-lg transition-all ${isStepActive && (steps[currentStep]?.highlight === 'length' || steps[currentStep]?.highlight === 'top')
              ? 'bg-primary text-white ring-4 ring-primary/30'
              : 'bg-primary/80 text-white'
              }`}>
              {length} units
            </div>
            <div className="text-primary text-xl font-bold">↓</div>
          </motion.div>

          {/* Width label (left) */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{
              opacity: 1,
              x: 0,
              scale: isStepActive && steps[currentStep]?.highlight === 'width' ? 1.1 : 1,
            }}
            className="absolute top-1/2 -left-28 transform -translate-y-1/2 flex items-center gap-1"
          >
            <div className={`px-4 py-2 rounded-full font-bold text-lg shadow-lg transition-all ${isStepActive && (steps[currentStep]?.highlight === 'width' || steps[currentStep]?.highlight === 'left')
              ? 'bg-secondary text-white ring-4 ring-secondary/30'
              : 'bg-secondary/80 text-white'
              }`}>
              {width} units
            </div>
            <div className="text-secondary text-xl font-bold">→</div>
          </motion.div>

          {/* The grid - with drag selection */}
          <motion.div
            ref={gridRef}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className={`grid gap-1 p-3 bg-white rounded-xl shadow-inner border-4 ${showArea ? 'select-none touch-none' : ''}`}
            style={{
              gridTemplateColumns: `repeat(${displayLength}, ${cellSize}px)`,
              borderColor: 'var(--primary, #8b5cf6)',
              cursor: showArea ? (isDragging ? 'crosshair' : 'pointer') : 'default',
            }}
          >
            {Array.from({ length: displayWidth }).map((_, row) =>
              Array.from({ length: displayLength }).map((_, col) => {
                const key = `${row}-${col}`;
                const isCounted = countedCells.has(key);
                const isInDragSelection = dragSelectionCells.has(key);
                const highlightEdge = isStepActive && showPerimeter && isOnEdge(row, col, steps[currentStep]?.highlight);

                return (
                  <motion.div
                    key={key}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: (row * displayLength + col) * 0.02 }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleDragStart(row, col);
                    }}
                    onTouchStart={() => handleDragStart(row, col)}
                    onClick={() => {
                      // Click handled in handleDragEnd to avoid conflict
                    }}
                    className={`rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center touch-none ${showArea ? 'cursor-pointer' : 'cursor-default'
                      } ${isInDragSelection && !isCounted ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      background: isCounted
                        ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                        : isInDragSelection
                          ? 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)'
                          : highlightEdge
                            ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                            : 'linear-gradient(135deg, var(--visual-cell, #ddd6fe) 0%, white 100%)',
                      color: isCounted || isInDragSelection || highlightEdge ? 'white' : 'var(--primary, #8b5cf6)',
                      border: `2px solid ${isCounted ? '#16a34a' : isInDragSelection ? '#3b82f6' : highlightEdge ? '#f59e0b' : 'var(--visual-border, #c4b5fd)'}`,
                      boxShadow: isCounted || isInDragSelection || highlightEdge ? '0 4px 6px rgba(0,0,0,0.15)' : 'none',
                    }}
                  >
                    {isCounted
                      ? countedCells.get(key)
                      : isInDragSelection
                        ? (countedCells.size + sortedDragCells.indexOf(key) + 1)
                        : ''}
                  </motion.div>
                );
              })
            )}
          </motion.div>

          {/* Drag hint */}
          {showArea && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Tip: Click and drag to select multiple squares!
            </p>
          )}

          {/* Bottom label for perimeter */}
          {showPerimeter && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: isStepActive && steps[currentStep]?.highlight === 'bottom' ? 1.1 : 1,
              }}
              className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
            >
              <div className="text-primary text-xl font-bold">↑</div>
              <div className={`px-4 py-2 rounded-full font-bold text-lg shadow-lg transition-all ${isStepActive && steps[currentStep]?.highlight === 'bottom'
                ? 'bg-primary text-white ring-4 ring-primary/30'
                : 'bg-primary/80 text-white'
                }`}>
                {length} units
              </div>
            </motion.div>
          )}

          {/* Right label for perimeter */}
          {showPerimeter && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{
                opacity: 1,
                x: 0,
                scale: isStepActive && steps[currentStep]?.highlight === 'right' ? 1.1 : 1,
              }}
              className="absolute top-1/2 -right-28 transform -translate-y-1/2 flex items-center gap-1"
            >
              <div className="text-secondary text-xl font-bold">←</div>
              <div className={`px-4 py-2 rounded-full font-bold text-lg shadow-lg transition-all ${isStepActive && steps[currentStep]?.highlight === 'right'
                ? 'bg-secondary text-white ring-4 ring-secondary/30'
                : 'bg-secondary/80 text-white'
                }`}>
                {width} units
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Progress bar for counting (area only) */}
      {showArea && (
        <div className="mt-8 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="text-gray-600 font-medium">Squares counted:</span>
            <span className="text-primary font-bold">{countedCells.size} / {totalCells}</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 to-green-500"
              initial={{ width: 0 }}
              animate={{ width: `${(countedCells.size / totalCells) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          {countedCells.size === totalCells && (
            <motion.p
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-green-600 font-bold text-center mt-2"
            >
              You counted all {totalCells} squares!
            </motion.p>
          )}
        </div>
      )}

      {/* Formula explanation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 text-center"
      >
        {showArea ? (
          <div className="space-y-3 bg-white p-4 rounded-xl shadow border border-gray-200">
            <p className="text-gray-700 font-bold text-lg">Area = Length × Width</p>
            <div className="flex items-center justify-center gap-2 text-2xl font-bold flex-wrap">
              <span className="px-3 py-1 bg-primary/10 rounded-lg text-primary">{length}</span>
              <span className="text-gray-500">×</span>
              <span className="px-3 py-1 bg-secondary/10 rounded-lg text-secondary">{width}</span>
              <span className="text-gray-500">=</span>
              <span className={`px-3 py-1 rounded-lg ${showResult || countedCells.size === totalCells ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                {showResult || countedCells.size === totalCells ? area : '?'}
              </span>
              <span className="text-gray-500 text-lg">square units</span>
            </div>
            <p className="text-sm text-gray-500">
              Each small square = 1 square unit
            </p>
          </div>
        ) : (
          <div className="space-y-3 bg-white p-4 rounded-xl shadow border border-gray-200">
            <p className="text-gray-700 font-bold text-lg">Perimeter = All sides added together</p>
            <div className="flex items-center justify-center gap-1 text-xl font-bold flex-wrap">
              <span className="px-2 py-1 bg-primary/10 rounded text-primary">{length}</span>
              <span className="text-gray-400">+</span>
              <span className="px-2 py-1 bg-secondary/10 rounded text-secondary">{width}</span>
              <span className="text-gray-400">+</span>
              <span className="px-2 py-1 bg-primary/10 rounded text-primary">{length}</span>
              <span className="text-gray-400">+</span>
              <span className="px-2 py-1 bg-secondary/10 rounded text-secondary">{width}</span>
              <span className="text-gray-500">=</span>
              <span className={`px-2 py-1 rounded ${showResult || (isStepActive && currentStep === steps.length - 1) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                {showResult || (isStepActive && currentStep === steps.length - 1) ? perimeter : '?'}
              </span>
              <span className="text-gray-500 text-base">units</span>
            </div>
            <p className="text-sm text-gray-500">
              Walk around the outside and count!
            </p>
          </div>
        )}
      </motion.div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary" />
          <span className="text-gray-600 font-medium">Length ({length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-secondary" />
          <span className="text-gray-600 font-medium">Width ({width})</span>
        </div>
        {showArea && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-500 rounded flex items-center justify-center text-white text-xs">✓</div>
            <span className="text-gray-600 font-medium">Counted</span>
          </div>
        )}
        {showPerimeter && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded" />
            <span className="text-gray-600 font-medium">Edge (perimeter)</span>
          </div>
        )}
      </div>

      {/* Truncation notice */}
      {(length > maxDisplaySize || width > maxDisplaySize) && (
        <p className="text-xs text-gray-400 text-center mt-3">
          (Showing scaled version - actual size: {length} × {width})
        </p>
      )}
    </div>
  );
}
