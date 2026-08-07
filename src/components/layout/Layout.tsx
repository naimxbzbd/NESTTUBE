import React, { useState, useRef } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Outlet, useLocation } from 'react-router-dom';
import { MiniPlayer } from '../video/MiniPlayer';
import { ScrollToTopButton } from '../ui/ScrollToTopButton';
import { motion, AnimatePresence } from 'motion/react';

export function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-[#0f0f0f] text-neutral-900 dark:text-white overflow-hidden font-sans relative pb-14 md:pb-0 transition-colors">
      <Header onToggleMenu={() => setIsMobileMenuOpen((prev) => !prev)} />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          isMobileOpen={isMobileMenuOpen} 
          onCloseMobile={() => setIsMobileMenuOpen(false)} 
        />
        <main ref={mainRef} className="flex-1 overflow-y-auto relative custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="min-h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
          <MiniPlayer />
          <ScrollToTopButton scrollContainerRef={mainRef} />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
