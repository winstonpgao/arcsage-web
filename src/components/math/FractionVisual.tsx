'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, ChevronRight, RotateCcw } from 'lucide-react';
import { useSpeech } from '@/hooks/useSpeech';

interface FractionVisualProps {
  num1: number;
  denom1: number;
  num2: number;
  denom2: number;
  showResult?: boolean;
}

// Pizza slice SVG component
function PizzaSlice({
  index,
  total,
  filled,
  color,
  onClick,
  size = 200,
  interactive = true
}: {
  index: number;
  total: number;
  filled: boolean;
  color: string;
  onClick?: () => void;
  size?: number;
  interactive?: boolean;
}) {
  const angle = 360 / total;
  const startAngle = index * angle - 90; // Start from top
  const endAngle = startAngle + angle;

  const radius = size / 2 - 10;
  const centerX = size / 2;
  const centerY = size / 2;

  // Convert angles to radians and calculate arc points
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;

  const x1 = centerX + radius * Math.cos(startRad);
  const y1 = centerY + radius * Math.sin(startRad);
  const x2 = centerX + radius * Math.cos(endRad);
  const y2 = centerY + radius * Math.sin(endRad);

  const largeArcFlag = angle > 180 ? 1 : 0;

  const pathData = `
    M ${centerX} ${centerY}
    L ${x1} ${y1}
    A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
    Z
  `;

  const fillColor = filled
    ? color
    : 'rgba(200, 200, 200, 0.3)';

  return (
    <motion.path
      d={pathData}
      fill={fillColor}
      stroke={filled ? color : '#ccc'}
      strokeWidth="2"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.1, type: 'spring' }}
      whileHover={interactive ? { scale: 1.05, filter: 'brightness(1.1)' } : {}}
      whileTap={interactive ? { scale: 0.95 } : {}}
      onClick={onClick}
      style={{ cursor: interactive ? 'pointer' : 'default', transformOrigin: `${centerX}px ${centerY}px` }}
    />
  );
}

// Full pizza component
function Pizza({
  slices,
  filledSlices,
  color,
  onSliceClick,
  size = 200,
  label,
  interactive = true
}: {
  slices: number;
  filledSlices: number[];
  color: string;
  onSliceClick?: (index: number) => void;
  size?: number;
  label?: string;
  interactive?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Pizza base (crust) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 5}
          fill="#F5DEB3"
          stroke="#D2691E"
          strokeWidth="8"
        />
        {/* Pizza sauce */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 15}
          fill="#CD5C5C"
        />
        {/* Cheese base */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 20}
          fill="#FFFACD"
        />

        {/* Slices */}
        {Array.from({ length: slices }).map((_, i) => (
          <PizzaSlice
            key={i}
            index={i}
            total={slices}
            filled={filledSlices.includes(i)}
            color={color}
            onClick={() => onSliceClick?.(i)}
            size={size}
            interactive={interactive}
          />
        ))}

        {/* Slice lines */}
        {Array.from({ length: slices }).map((_, i) => {
          const angle = (i * 360 / slices - 90) * Math.PI / 180;
          const x2 = size / 2 + (size / 2 - 10) * Math.cos(angle);
          const y2 = size / 2 + (size / 2 - 10) * Math.sin(angle);
          return (
            <line
              key={`line-${i}`}
              x1={size / 2}
              y1={size / 2}
              x2={x2}
              y2={y2}
              stroke="#8B4513"
              strokeWidth="2"
            />
          );
        })}

        {/* Center circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="8"
          fill="#8B4513"
        />
      </svg>
      {label && (
        <p className="mt-2 text-lg font-bold text-center" style={{ color }}>
          {label}
        </p>
      )}
    </div>
  );
}

// Draggable pizza slice for the pool
function DraggableSlice({
  id,
  color,
  denom,
  onPlace
}: {
  id: string;
  color: string;
  denom: number;
  onPlace: () => void;
}) {
  return (
    <motion.button
      layout
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 180 }}
      whileHover={{ scale: 1.15, rotate: 10 }}
      whileTap={{ scale: 0.9 }}
      onClick={onPlace}
      className="relative w-16 h-16 rounded-full shadow-lg cursor-pointer"
      style={{ backgroundColor: color }}
    >
      {/* Mini pizza slice visual */}
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <path
          d="M32 32 L32 8 A24 24 0 0 1 52 24 Z"
          fill="#FFFACD"
          stroke="#8B4513"
          strokeWidth="2"
        />
        <circle cx="40" cy="18" r="3" fill="#CD5C5C" />
        <circle cx="38" cy="24" r="2" fill="#228B22" />
      </svg>
      <span className="absolute bottom-0 left-0 right-0 text-xs font-bold text-white bg-black/50 rounded-b-full py-0.5">
        1/{denom}
      </span>
    </motion.button>
  );
}

export function FractionVisual({ num1, denom1, num2, denom2, showResult }: FractionVisualProps) {
  const { speak } = useSpeech();
  const [currentStep, setCurrentStep] = useState(-1);

  // For same denominator addition
  const sameDenom = denom1 === denom2;
  const denom = denom1;
  const resultNum = num1 + num2;

  // Track which slices are filled in each pizza
  const [filledSlices1, setFilledSlices1] = useState<number[]>([]);
  const [filledSlices2, setFilledSlices2] = useState<number[]>([]);

  // Available slices in the pool
  const [availableSlices1, setAvailableSlices1] = useState(num1);
  const [availableSlices2, setAvailableSlices2] = useState(num2);

  const steps = sameDenom ? [
    { text: `We have two pizzas, each cut into ${denom} slices!` },
    { text: `Tap ${num1} slices to eat from the first pizza` },
    { text: `Tap ${num2} slices to eat from the second pizza` },
    { text: `Count all eaten slices: ${num1} + ${num2} = ${resultNum}` },
    { text: `Together we ate ${resultNum}/${denom} of pizza!` },
  ] : [
    { text: `These pizzas have different number of slices` },
  ];

  const isStepActive = currentStep >= 0;

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      speak(steps[nextStep].text);
    }
  };

  const resetAll = () => {
    setCurrentStep(-1);
    setFilledSlices1([]);
    setFilledSlices2([]);
    setAvailableSlices1(num1);
    setAvailableSlices2(num2);
  };

  // Place a slice from pool to pizza
  const placeSlice1 = () => {
    if (availableSlices1 > 0 && filledSlices1.length < num1) {
      const nextSlot = filledSlices1.length;
      setFilledSlices1([...filledSlices1, nextSlot]);
      setAvailableSlices1(availableSlices1 - 1);
    }
  };

  const placeSlice2 = () => {
    if (availableSlices2 > 0 && filledSlices2.length < num2) {
      const nextSlot = filledSlices2.length;
      setFilledSlices2([...filledSlices2, nextSlot]);
      setAvailableSlices2(availableSlices2 - 1);
    }
  };

  // Click on pizza slice to toggle
  const toggleSlice1 = (index: number) => {
    if (filledSlices1.includes(index)) {
      // Remove slice
      setFilledSlices1(filledSlices1.filter(i => i !== index));
      setAvailableSlices1(availableSlices1 + 1);
    } else if (availableSlices1 > 0) {
      // Add slice
      setFilledSlices1([...filledSlices1, index]);
      setAvailableSlices1(availableSlices1 - 1);
    }
  };

  const toggleSlice2 = (index: number) => {
    if (filledSlices2.includes(index)) {
      // Remove slice
      setFilledSlices2(filledSlices2.filter(i => i !== index));
      setAvailableSlices2(availableSlices2 + 1);
    } else if (availableSlices2 > 0) {
      // Add slice
      setFilledSlices2([...filledSlices2, index]);
      setAvailableSlices2(availableSlices2 - 1);
    }
  };

  // Auto-fill for "Show Me"
  const autoFill = () => {
    setFilledSlices1(Array.from({ length: num1 }, (_, i) => i));
    setFilledSlices2(Array.from({ length: num2 }, (_, i) => i));
    setAvailableSlices1(0);
    setAvailableSlices2(0);
    speak(`${num1}/${denom} plus ${num2}/${denom} equals ${resultNum}/${denom}. Yummy pizza!`);
  };

  const allCorrect = filledSlices1.length === num1 && filledSlices2.length === num2;

  // Combined result for visualization
  const combinedFilledSlices = useMemo(() => {
    return [
      ...filledSlices1,
      ...filledSlices2.map(i => i + num1)
    ];
  }, [filledSlices1, filledSlices2, num1]);

  return (
    <div
      className="p-6 rounded-2xl shadow-lg border-2"
      style={{
        background: 'linear-gradient(135deg, #fff5f5 0%, #ffe4e1 100%)',
        borderColor: '#f5a623',
      }}
    >
      {/* Header */}
      <div className="mb-4 p-3 bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="text-lg font-bold text-orange-600">
            🍕 Pizza Fractions: {num1}/{denom1} + {num2}/{denom2}
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
        <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
          <span className="text-orange-700 font-medium flex-1">
            {isStepActive
              ? steps[currentStep].text
              : allCorrect
                ? `Yum! We ate ${resultNum}/${denom} of pizza!`
                : 'Tap pizza slices or the slice buttons to eat them!'}
          </span>
          <button
            onClick={() => speak(isStepActive ? steps[currentStep].text : 'Tap pizza slices to eat them')}
            className="p-1 hover:bg-orange-100 rounded-full"
          >
            <Volume2 className="w-4 h-4 text-orange-600" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i <= currentStep ? 'bg-orange-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          {currentStep < steps.length - 1 && (
            <button
              onClick={goToNextStep}
              className="flex items-center gap-1 px-4 py-1 text-sm bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
            >
              {currentStep === -1 ? 'Learn Step by Step' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Slice pools */}
      <div className="mb-4 p-4 bg-white/70 rounded-xl">
        <p className="text-gray-600 font-bold mb-3 text-center">🍕 Slices to eat:</p>
        <div className="flex flex-wrap gap-6 justify-center">
          {/* First fraction slices */}
          <div className="flex flex-col items-center">
            <p className="text-blue-600 font-bold mb-2">Blue Pizza ({num1} slices)</p>
            <div className="flex gap-2 min-h-[70px] items-center">
              <AnimatePresence>
                {Array.from({ length: availableSlices1 }).map((_, i) => (
                  <DraggableSlice
                    key={`pool1-${i}`}
                    id={`pool1-${i}`}
                    color="#3B82F6"
                    denom={denom}
                    onPlace={placeSlice1}
                  />
                ))}
              </AnimatePresence>
              {availableSlices1 === 0 && (
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-green-600 font-bold"
                >
                  All eaten! 😋
                </motion.p>
              )}
            </div>
          </div>

          <div className="w-px bg-gray-300 mx-2 hidden sm:block" />

          {/* Second fraction slices */}
          <div className="flex flex-col items-center">
            <p className="text-orange-500 font-bold mb-2">Orange Pizza ({num2} slices)</p>
            <div className="flex gap-2 min-h-[70px] items-center">
              <AnimatePresence>
                {Array.from({ length: availableSlices2 }).map((_, i) => (
                  <DraggableSlice
                    key={`pool2-${i}`}
                    id={`pool2-${i}`}
                    color="#F97316"
                    denom={denom}
                    onPlace={placeSlice2}
                  />
                ))}
              </AnimatePresence>
              {availableSlices2 === 0 && (
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-green-600 font-bold"
                >
                  All eaten! 😋
                </motion.p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pizza visuals */}
      <div className="p-4 bg-white/70 rounded-xl">
        <div className="flex flex-wrap gap-8 justify-center items-start">
          {/* First pizza */}
          <div className="flex flex-col items-center">
            <Pizza
              slices={denom}
              filledSlices={filledSlices1}
              color="rgba(59, 130, 246, 0.7)"
              onSliceClick={toggleSlice1}
              size={180}
              label={`${filledSlices1.length}/${denom}`}
            />
            <p className={`text-sm mt-1 ${filledSlices1.length === num1 ? 'text-green-600 font-bold' : 'text-gray-500'}`}>
              {filledSlices1.length}/{num1} eaten {filledSlices1.length === num1 && '✓'}
            </p>
          </div>

          {/* Plus sign */}
          <div className="flex items-center justify-center self-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center"
            >
              <span className="text-3xl font-bold text-orange-500">+</span>
            </motion.div>
          </div>

          {/* Second pizza */}
          <div className="flex flex-col items-center">
            <Pizza
              slices={denom}
              filledSlices={filledSlices2}
              color="rgba(249, 115, 22, 0.7)"
              onSliceClick={toggleSlice2}
              size={180}
              label={`${filledSlices2.length}/${denom}`}
            />
            <p className={`text-sm mt-1 ${filledSlices2.length === num2 ? 'text-green-600 font-bold' : 'text-gray-500'}`}>
              {filledSlices2.length}/{num2} eaten {filledSlices2.length === num2 && '✓'}
            </p>
          </div>
        </div>
      </div>

      {/* Combined result pizza */}
      <div className="mt-4 p-4 bg-white/70 rounded-xl">
        <p className="text-gray-600 font-bold mb-3 text-center">🍕 Total slices eaten:</p>
        <div className="flex justify-center">
          <div className="flex flex-col items-center">
            <svg width={220} height={220} viewBox="0 0 220 220">
              {/* Pizza base */}
              <circle cx={110} cy={110} r={100} fill="#F5DEB3" stroke="#D2691E" strokeWidth="8" />
              <circle cx={110} cy={110} r={90} fill="#CD5C5C" />
              <circle cx={110} cy={110} r={85} fill="#FFFACD" />

              {/* Show all slices */}
              {Array.from({ length: denom }).map((_, i) => {
                const isFromFirst = filledSlices1.includes(i);
                const isFromSecond = i >= num1 && filledSlices2.includes(i - num1);
                const actualIndex = i < num1 ? i : i;
                const filled = (i < filledSlices1.length) || (i >= num1 && i < num1 + filledSlices2.length);

                return (
                  <PizzaSlice
                    key={i}
                    index={i}
                    total={denom}
                    filled={i < filledSlices1.length || (i >= num1 && i - num1 < filledSlices2.length)}
                    color={i < filledSlices1.length ? 'rgba(59, 130, 246, 0.7)' : 'rgba(249, 115, 22, 0.7)'}
                    size={220}
                    interactive={false}
                  />
                );
              })}

              {/* Slice lines */}
              {Array.from({ length: denom }).map((_, i) => {
                const angle = (i * 360 / denom - 90) * Math.PI / 180;
                const x2 = 110 + 95 * Math.cos(angle);
                const y2 = 110 + 95 * Math.sin(angle);
                return (
                  <line
                    key={`line-${i}`}
                    x1={110}
                    y1={110}
                    x2={x2}
                    y2={y2}
                    stroke="#8B4513"
                    strokeWidth="2"
                  />
                );
              })}

              <circle cx={110} cy={110} r="8" fill="#8B4513" />
            </svg>
            <p className="mt-2 text-xl font-bold text-center text-gray-700">
              {filledSlices1.length + filledSlices2.length}/{denom} slices
            </p>
          </div>
        </div>
      </div>

      {/* Calculation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 p-4 bg-white rounded-xl"
      >
        <p className="text-gray-600 text-center mb-3 font-medium">
          Add the eaten slices (same size pizza = same bottom):
        </p>
        <div className="flex items-center justify-center gap-4 text-2xl font-bold flex-wrap">
          <div className="flex flex-col items-center">
            <span className={filledSlices1.length === num1 ? 'text-blue-500' : 'text-gray-400'}>
              {filledSlices1.length}
            </span>
            <div className="w-10 h-1 bg-gray-400 my-1" />
            <span className="text-gray-600">{denom}</span>
          </div>
          <span className="text-gray-600">+</span>
          <div className="flex flex-col items-center">
            <span className={filledSlices2.length === num2 ? 'text-orange-500' : 'text-gray-400'}>
              {filledSlices2.length}
            </span>
            <div className="w-10 h-1 bg-gray-400 my-1" />
            <span className="text-gray-600">{denom}</span>
          </div>
          <span className="text-gray-600">=</span>
          <div className="flex flex-col items-center">
            <span className={allCorrect ? 'text-green-600' : 'text-gray-400'}>
              {filledSlices1.length + filledSlices2.length}
            </span>
            <div className="w-10 h-1 bg-gray-400 my-1" />
            <span className="text-gray-600">{denom}</span>
          </div>
        </div>
      </motion.div>

      {/* Success message */}
      {(showResult || allCorrect) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-4 bg-green-100 rounded-xl border-2 border-green-300"
        >
          <p className="text-center text-green-800 font-bold text-xl">
            🍕 {num1}/{denom} + {num2}/{denom} = {resultNum}/{denom} 🍕
          </p>
          <p className="text-center text-green-600 mt-1">
            Delicious! We ate {resultNum} slices out of {denom}!
          </p>
        </motion.div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-500" />
          <span className="text-gray-600">First pizza slices</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-orange-500" />
          <span className="text-gray-600">Second pizza slices</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-300" />
          <span className="text-gray-600">Not eaten yet</span>
        </div>
      </div>
    </div>
  );
}
