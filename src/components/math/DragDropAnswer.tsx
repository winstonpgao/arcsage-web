'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DragDropAnswerProps {
  options: string[];
  correctAnswer: string;
  onAnswer: (answer: string, isCorrect: boolean) => void;
}

function DraggableOption({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
  });

  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl',
        'font-bold text-xl cursor-grab active:cursor-grabbing shadow-lg',
        'select-none touch-none',
        isDragging && 'opacity-50'
      )}
    >
      {children}
    </motion.div>
  );
}

function DropZone({ children, isOver }: { children?: React.ReactNode; isOver: boolean }) {
  const { setNodeRef } = useDroppable({
    id: 'answer-zone',
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'w-48 h-24 border-4 border-dashed rounded-2xl flex items-center justify-center',
        'transition-all duration-200',
        isOver
          ? 'border-green-500 bg-green-50 scale-105'
          : 'border-gray-300 bg-gray-50',
        children && 'border-solid border-purple-500 bg-purple-50'
      )}
    >
      {children || (
        <span className="text-gray-400 font-medium">Drop here!</span>
      )}
    </div>
  );
}

export function DragDropAnswer({ options, correctAnswer, onAnswer }: DragDropAnswerProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [droppedAnswer, setDroppedAnswer] = useState<string | null>(null);
  const [isOver, setIsOver] = useState(false);

  // Require a minimum distance before starting drag to prevent accidental triggers
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // 8px minimum drag distance
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 100, // 100ms delay for touch
      tolerance: 5,
    },
  });

  const sensors = useSensors(pointerSensor, touchSensor);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    setIsOver(false);

    if (event.over?.id === 'answer-zone') {
      const answer = event.active.id as string;
      setDroppedAnswer(answer);
      onAnswer(answer, answer === correctAnswer);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    setIsOver(event.over?.id === 'answer-zone');
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="space-y-8">
        {/* Drop zone */}
        <div className="flex justify-center">
          <DropZone isOver={isOver}>
            {droppedAnswer && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                  'px-6 py-4 rounded-xl font-bold text-xl text-white',
                  droppedAnswer === correctAnswer
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : 'bg-gradient-to-r from-red-500 to-pink-500'
                )}
              >
                {droppedAnswer}
              </motion.div>
            )}
          </DropZone>
        </div>

        {/* Options */}
        <div className="flex flex-wrap justify-center gap-4">
          {options.map((option) => (
            <DraggableOption key={option} id={option}>
              {option}
            </DraggableOption>
          ))}
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeId ? (
            <div className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-xl shadow-2xl">
              {activeId}
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
