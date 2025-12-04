'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  variant?: 'default' | 'gradient' | 'success' | 'error';
  animate?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', animate = true, children, ...props }, ref) => {
    const variants = {
      default: 'bg-white border border-gray-200',
      gradient: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white',
      success: 'bg-gradient-to-br from-green-400 to-emerald-500 text-white',
      error: 'bg-gradient-to-br from-red-400 to-pink-500 text-white',
    };

    if (animate) {
      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'rounded-2xl shadow-lg p-6',
            variants[variant],
            className
          )}
          {...props}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl shadow-lg p-6',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
