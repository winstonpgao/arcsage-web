'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Calendar } from 'lucide-react';

interface ClockVisualProps {
  hours: number;
  minutes: number;
  interactive?: boolean;
  onTimeChange?: (hours: number, minutes: number) => void;
}

// Month names for display
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];

export function ClockVisual({ hours, minutes, interactive = true, onTimeChange }: ClockVisualProps) {
  const [userHours, setUserHours] = useState(hours);
  const [userMinutes, setUserMinutes] = useState(minutes);
  const [prevMinutes, setPrevMinutes] = useState(minutes);
  const [prevHours, setPrevHours] = useState(hours % 12 || 12);
  const [draggingHand, setDraggingHand] = useState<'hour' | 'minute' | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const clockRef = useRef<HTMLDivElement>(null);

  // Date state
  const [day, setDay] = useState(15);
  const [month, setMonth] = useState(3); // April (0-indexed)
  const [year, setYear] = useState(2024);
  const [isPM, setIsPM] = useState(hours >= 12);

  // Calculate hand positions
  const hourAngle = (userHours % 12) * 30 + userMinutes * 0.5;
  const minuteAngle = userMinutes * 6;

  // Get days in current month
  const getDaysInMonth = (m: number, y: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  // Advance date by one day
  const advanceDay = () => {
    const daysInMonth = getDaysInMonth(month, year);
    if (day >= daysInMonth) {
      setDay(1);
      if (month >= 11) {
        setMonth(0);
        setYear(y => y + 1);
      } else {
        setMonth(m => m + 1);
      }
    } else {
      setDay(d => d + 1);
    }
  };

  // Go back one day
  const decreaseDay = () => {
    if (day <= 1) {
      // Go to previous month
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const daysInPrevMonth = getDaysInMonth(prevMonth, prevYear);
      setDay(daysInPrevMonth);
      setMonth(prevMonth);
      if (month === 0) {
        setYear(prevYear);
      }
    } else {
      setDay(d => d - 1);
    }
  };

  // Reset to initial state
  const resetClock = () => {
    setUserHours(hours);
    setUserMinutes(minutes);
    setPrevMinutes(minutes);
    setPrevHours(hours % 12 || 12);
    setDay(15);
    setMonth(3);
    setYear(2024);
    setIsPM(hours >= 12);
    onTimeChange?.(hours, minutes);
  };

  // Mark as animated after initial mount
  useEffect(() => {
    const timer = setTimeout(() => setHasAnimated(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Handle minute changes - advance hour when crossing 12
  useEffect(() => {
    if (draggingHand === 'minute') {
      // Detect crossing the 12 (from 59 to 0 or 0 to 59)
      const crossedForward = prevMinutes > 45 && userMinutes < 15;
      const crossedBackward = prevMinutes < 15 && userMinutes > 45;

      if (crossedForward) {
        // Hour advances
        const newHour = userHours === 12 ? 1 : userHours + 1;
        setUserHours(newHour);

        // Toggle AM/PM only when going from 11 to 12
        if (newHour === 12) {
          // Check if we're going from 11 PM to 12 AM (midnight) - advance day
          if (isPM) {
            advanceDay();
          }
          setIsPM(p => !p);
        }
        onTimeChange?.(newHour, userMinutes);
      } else if (crossedBackward) {
        // Hour goes back
        const newHour = userHours === 1 ? 12 : userHours - 1;
        setUserHours(newHour);

        // Toggle AM/PM when going from 12 back to 11
        if (userHours === 12) {
          // Check if we're going from 12 AM back to 11 PM (midnight backwards) - decrease day
          if (!isPM) {
            decreaseDay();
          }
          setIsPM(p => !p);
        }
        onTimeChange?.(newHour, userMinutes);
      }

      setPrevMinutes(userMinutes);
    }
  }, [userMinutes, draggingHand]);

  // Handle hour hand changes - toggle AM/PM and date when crossing 12/11
  useEffect(() => {
    if (draggingHand === 'hour') {
      // Detect crossing from 11 to 12 or 12 to 11
      const crossedTo12 = prevHours === 11 && userHours === 12;
      const crossedFrom12 = prevHours === 12 && userHours === 11;

      if (crossedTo12) {
        // Going from 11 to 12
        if (isPM) {
          // 11 PM -> 12 AM (midnight) - advance day
          advanceDay();
        }
        setIsPM(p => !p);
      } else if (crossedFrom12) {
        // Going from 12 to 11
        if (!isPM) {
          // 12 AM -> 11 PM (midnight backwards) - decrease day
          decreaseDay();
        }
        setIsPM(p => !p);
      }

      setPrevHours(userHours);
    }
  }, [userHours, draggingHand]);

  // Handle drag on clock face
  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!draggingHand || !clockRef.current) return;

    e.preventDefault();

    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI) + 90;
    const normalizedAngle = angle < 0 ? angle + 360 : angle;

    if (draggingHand === 'minute') {
      const newMinutes = Math.round(normalizedAngle / 6) % 60;
      setUserMinutes(newMinutes);
      onTimeChange?.(userHours, newMinutes);
    } else if (draggingHand === 'hour') {
      const newHours = Math.round(normalizedAngle / 30) % 12 || 12;
      setUserHours(newHours);
      onTimeChange?.(newHours, userMinutes);
    }
  }, [draggingHand, userHours, userMinutes, onTimeChange]);

  const handleMouseUp = useCallback(() => {
    setDraggingHand(null);
  }, []);

  // Attach document-level listeners
  useEffect(() => {
    if (draggingHand) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleMouseMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [draggingHand, handleMouseMove, handleMouseUp]);

  // Quick time buttons
  const setQuickTime = (h: number, m: number) => {
    setUserHours(h);
    setUserMinutes(m);
    setPrevMinutes(m);
    onTimeChange?.(h, m);
  };

  return (
    <div
      className="flex flex-col items-center p-6 rounded-2xl shadow-lg border-2"
      style={{
        background: 'linear-gradient(135deg, var(--visual-bg-from, #fff7ed) 0%, var(--visual-bg-to, #fef3c7) 100%)',
        borderColor: 'var(--visual-border, #fbbf24)',
      }}
    >
      {/* Date Display - above the clock */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 bg-white px-5 py-3 rounded-xl shadow-md border-2 border-amber-200"
      >
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-amber-600" />
          <div className="text-center">
            <p className="text-xs text-gray-500">Date</p>
            <p className="text-lg font-bold text-amber-700">
              {MONTHS[month]} {day}, {year}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Instruction */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-primary font-medium mb-3 text-center"
      >
        {interactive ? 'Drag the hands to set the time!' : 'Look at the clock hands!'}
      </motion.p>

      {/* Controls row */}
      {interactive && (
        <div className="flex items-center gap-2 mb-4 flex-wrap justify-center">
          {/* Quick time buttons */}
          <button
            onClick={() => setQuickTime(3, 0)}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
          >
            3:00
          </button>
          <button
            onClick={() => setQuickTime(6, 30)}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
          >
            6:30
          </button>
          <button
            onClick={() => setQuickTime(9, 0)}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
          >
            9:00
          </button>
          <button
            onClick={() => setQuickTime(12, 0)}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
          >
            12:00
          </button>
          {/* Reset button */}
          <button
            onClick={resetClock}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      )}

      {/* Clock container */}
      <div className="flex justify-center">
        <div
          ref={clockRef}
          className="relative w-56 h-56"
        >
          {/* Clock face */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className="absolute inset-0 rounded-full bg-white border-6 shadow-xl"
            style={{ borderColor: 'var(--primary, #8b5cf6)', borderWidth: '6px' }}
          >
          {/* Inner ring decoration */}
          <div className="absolute inset-3 rounded-full border-2 border-gray-200" />

          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-gray-800 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-30 shadow-lg" />

          {/* Hour numbers */}
          {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num) => {
            const angle = (num * 30 - 90) * (Math.PI / 180);
            const radius = 78;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const isCurrentHour = num === userHours % 12 || (num === 12 && userHours === 12);

            return (
              <motion.div
                key={num}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 + num * 0.03, type: 'spring' }}
                className={`absolute w-8 h-8 flex items-center justify-center ${
                  isCurrentHour
                    ? 'text-white bg-primary rounded-full'
                    : ''
                }`}
                style={{
                  left: `calc(50% + ${x}px - 16px)`,
                  top: `calc(50% + ${y}px - 16px)`,
                }}
              >
                <span className={`text-lg font-bold leading-none ${isCurrentHour ? 'text-white' : 'text-gray-700'}`}>
                  {num}
                </span>
              </motion.div>
            );
          })}

          {/* Tick marks for minutes */}
          {Array.from({ length: 60 }).map((_, i) => {
            const angle = i * 6;
            const isHour = i % 5 === 0;
            const isCurrentMinute = i === userMinutes;
            return (
              <div
                key={i}
                className={`absolute ${
                  isCurrentMinute
                    ? 'w-1.5 h-4 bg-red-500 rounded'
                    : isHour
                      ? 'w-1 h-3 bg-gray-500'
                      : 'w-0.5 h-1.5 bg-gray-300'
                }`}
                style={{
                  left: '50%',
                  top: isHour ? '8px' : '10px',
                  transformOrigin: `50% ${isHour ? '104px' : '102px'}`,
                  transform: `translateX(-50%) rotate(${angle}deg)`,
                }}
              />
            );
          })}

          {/* Hour hand (short, thick, blue) - DRAGGABLE */}
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              interactive && setDraggingHand('hour');
            }}
            onTouchStart={() => {
              interactive && setDraggingHand('hour');
            }}
            className={`absolute bg-gradient-to-t from-blue-700 to-blue-500 rounded-full shadow-lg z-20 ${
              interactive ? 'cursor-grab active:cursor-grabbing' : ''
            } ${draggingHand === 'hour' ? 'ring-4 ring-blue-300' : ''}`}
            style={{
              width: '8px',
              height: '50px',
              left: 'calc(50% - 4px)',
              top: 'calc(50% - 42px)',
              transformOrigin: '4px 42px',
              transform: `rotate(${hourAngle}deg)`,
              transition: draggingHand === 'hour' ? 'none' : 'transform 0.1s ease-out',
            }}
          />

          {/* Minute hand (long, thin, red) - DRAGGABLE */}
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              interactive && setDraggingHand('minute');
            }}
            onTouchStart={() => {
              interactive && setDraggingHand('minute');
            }}
            className={`absolute bg-gradient-to-t from-red-600 to-red-400 rounded-full shadow-lg z-10 ${
              interactive ? 'cursor-grab active:cursor-grabbing' : ''
            } ${draggingHand === 'minute' ? 'ring-4 ring-red-300' : ''}`}
            style={{
              width: '5px',
              height: '72px',
              left: 'calc(50% - 2.5px)',
              top: 'calc(50% - 65px)',
              transformOrigin: '2.5px 65px',
              transform: `rotate(${minuteAngle}deg)`,
              transition: draggingHand === 'minute' ? 'none' : 'transform 0.1s ease-out',
            }}
          />
        </motion.div>
        </div>
      </div>

      {/* Current time display with AM/PM */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-4 bg-white px-6 py-3 rounded-xl shadow-md border-2 border-gray-200"
      >
        <p className="text-center">
          <span className="text-gray-500 text-sm">You set: </span>
          <span className="text-2xl font-bold text-primary">
            {userHours}:{userMinutes.toString().padStart(2, '0')}
          </span>
          <span className={`ml-2 text-sm font-bold px-2 py-1 rounded ${
            isPM ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {isPM ? 'PM' : 'AM'}
          </span>
        </p>
      </motion.div>

      {/* Tip about hour advancement */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-2 text-xs text-gray-500 text-center"
      >
        Tip: Drag either hand past 11↔12 to change AM/PM. At midnight the date changes!
      </motion.p>

      {/* Legend with clear explanation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-3 bg-white/80 p-3 rounded-xl shadow text-sm"
      >
        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-3 bg-gradient-to-r from-blue-700 to-blue-500 rounded" />
            <span className="text-gray-600">Hour (short)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-2 bg-gradient-to-r from-red-600 to-red-400 rounded" />
            <span className="text-gray-600">Minute (long)</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
