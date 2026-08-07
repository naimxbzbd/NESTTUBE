import React from 'react';
import { cn } from '../../lib/utils';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({ content, children, position = 'bottom', className }: TooltipProps) {
  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  return (
    <div className={cn('relative group inline-flex items-center justify-center', className)}>
      {children}
      <div
        role="tooltip"
        className={cn(
          'absolute z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 scale-95 group-hover:scale-100 whitespace-nowrap bg-neutral-900/90 dark:bg-neutral-100/95 text-white dark:text-neutral-900 text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-lg border border-white/10 dark:border-black/10 backdrop-blur-xs select-none',
          positionClasses[position]
        )}
      >
        {content}
      </div>
    </div>
  );
}
