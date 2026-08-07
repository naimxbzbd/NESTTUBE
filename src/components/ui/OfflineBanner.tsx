import React, { useState, useEffect } from 'react';
import { WifiOff, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-amber-600 dark:bg-amber-700 text-white text-xs font-semibold px-4 py-2 flex items-center justify-center gap-2 shadow-sm z-50 sticky top-0"
        >
          <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
          <span>You are offline. Showing cached feeds and last viewed videos from local storage.</span>
          <span className="ml-1 inline-flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider">
            <Database className="w-3 h-3" /> Cached
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
