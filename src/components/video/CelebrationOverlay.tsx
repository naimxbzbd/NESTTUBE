import React, { useEffect } from 'react';
import { useCoinStore } from '../../store/useCoinStore';

export const CelebrationOverlay: React.FC = () => {
  const { lastCelebration, clearCelebration } = useCoinStore();

  useEffect(() => {
    if (!lastCelebration) return;
    const timer = setTimeout(() => {
      clearCelebration();
    }, 3000);
    return () => clearTimeout(timer);
  }, [lastCelebration, clearCelebration]);

  if (!lastCelebration) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
      {/* Center banner */}
      <div className="animate-in zoom-in-75 fade-in slide-in-from-bottom-8 duration-300 flex flex-col items-center p-6 rounded-3xl bg-black/70 backdrop-blur-md border border-pink-500/30 shadow-2xl">
        <div className="text-7xl animate-bounce mb-2 filter drop-shadow-lg">
          {lastCelebration.gift.icon}
        </div>
        <div className="text-xl font-extrabold text-white bg-gradient-to-r from-[#ff2d6f] to-[#c026d3] bg-clip-text text-transparent">
          {lastCelebration.gift.banglaName} পাঠানো হয়েছে!
        </div>
        <div className="text-sm font-semibold text-amber-400 font-mono mt-1">
          -{lastCelebration.gift.coins} কয়েন
        </div>
      </div>
    </div>
  );
};
