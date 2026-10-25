import React, { useState, useRef } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Outlet, useLocation } from 'react-router-dom';
import { MiniPlayer } from '../video/MiniPlayer';
import { ScrollToTopButton } from '../ui/ScrollToTopButton';
import { OfflineBanner } from '../ui/OfflineBanner';
import { motion, AnimatePresence } from 'motion/react';

export function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);

  const isShorts = location.pathname.startsWith('/shorts');

  return (
    <div className="flex flex-col h-screen bg-[#06090e] text-white overflow-hidden font-sans relative pb-16 md:pb-0 transition-colors">
      {/* Dynamic Ambient Aurora Glow Meshes (Deep Obsidian Background) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-[620px] h-[620px] bg-cyan-500/[0.09] rounded-full blur-[140px] animate-aurora-1" />
        <div className="absolute top-1/3 -right-28 w-[580px] h-[580px] bg-pink-500/[0.08] rounded-full blur-[150px] animate-aurora-2" />
        <div className="absolute -bottom-36 left-1/4 w-[720px] h-[520px] bg-purple-600/[0.09] rounded-full blur-[160px]" />
        {/* Subtle grid mesh overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
      </div>

      <OfflineBanner />
      <Header onToggleMenu={() => setIsMobileMenuOpen((prev) => !prev)} />
      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar 
          isMobileOpen={isMobileMenuOpen} 
          onCloseMobile={() => setIsMobileMenuOpen(false)} 
        />
        <main 
          ref={mainRef} 
          className={`flex-1 relative ${isShorts ? 'overflow-hidden h-full flex flex-col' : 'overflow-y-auto custom-scrollbar'}`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className={isShorts ? "h-full w-full flex-1 flex flex-col overflow-hidden" : "min-h-full"}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
          <MiniPlayer />
          {!isShorts && <ScrollToTopButton scrollContainerRef={mainRef} />}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
