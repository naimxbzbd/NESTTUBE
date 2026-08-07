import React, { useState } from 'react';
import { Home, MonitorPlay, PlusCircle, PlaySquare, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { CreateVideoModal } from './CreateVideoModal';

export function MobileNav() {
  const location = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-md border-t border-neutral-200 dark:border-white/10 flex items-center justify-around z-40 text-neutral-900 dark:text-white transition-colors px-1">
        {/* Home */}
        <Link 
          to="/" 
          className="flex flex-col items-center justify-center gap-1 py-1 flex-1 text-center"
        >
          <Home 
            className="w-5 h-5" 
            fill={location.pathname === '/' ? "currentColor" : "none"} 
            strokeWidth={location.pathname === '/' ? 1.5 : 2}
          />
          <span className={cn("text-[10px]", location.pathname === '/' ? "font-bold text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-white/70")}>
            Home
          </span>
        </Link>

        {/* Shorts */}
        <Link 
          to="/shorts" 
          className="flex flex-col items-center justify-center gap-1 py-1 flex-1 text-center"
        >
          <MonitorPlay 
            className="w-5 h-5" 
            fill={location.pathname === '/shorts' ? "currentColor" : "none"} 
            strokeWidth={location.pathname === '/shorts' ? 1.5 : 2}
          />
          <span className={cn("text-[10px]", location.pathname === '/shorts' ? "font-bold text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-white/70")}>
            Shorts
          </span>
        </Link>

        {/* Create Video Button */}
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex flex-col items-center justify-center py-1 flex-1 cursor-pointer text-neutral-800 dark:text-white hover:scale-105 transition-transform"
          aria-label="Create Video"
        >
          <div className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-white/10 border border-neutral-300 dark:border-white/20 flex items-center justify-center shadow-xs">
            <PlusCircle className="w-6 h-6 text-red-600 dark:text-red-500" />
          </div>
        </button>

        {/* Subscriptions */}
        <Link 
          to="/subscriptions" 
          className="flex flex-col items-center justify-center gap-1 py-1 flex-1 text-center"
        >
          <PlaySquare 
            className="w-5 h-5" 
            fill={location.pathname === '/subscriptions' ? "currentColor" : "none"} 
            strokeWidth={location.pathname === '/subscriptions' ? 1.5 : 2}
          />
          <span className={cn("text-[10px]", location.pathname === '/subscriptions' ? "font-bold text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-white/70")}>
            Subscriptions
          </span>
        </Link>

        {/* You / Library */}
        <Link 
          to="/library" 
          className="flex flex-col items-center justify-center gap-1 py-1 flex-1 text-center"
        >
          <User 
            className="w-5 h-5" 
            fill={location.pathname === '/library' ? "currentColor" : "none"} 
            strokeWidth={location.pathname === '/library' ? 1.5 : 2}
          />
          <span className={cn("text-[10px]", location.pathname === '/library' ? "font-bold text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-white/70")}>
            You
          </span>
        </Link>
      </div>

      <CreateVideoModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </>
  );
}
