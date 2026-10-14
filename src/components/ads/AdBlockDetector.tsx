import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Crown, Sparkles } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { useAdsterra } from '../../context/AdsterraContext';
import { cn } from '../../lib/utils';

export function AdBlockDetector() {
  const [adBlockDetected, setAdBlockDetected] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { isPremium } = useUserStore();
  const { openPremiumModal } = useAdsterra();

  useEffect(() => {
    if (isPremium) return;

    // Check for adblocker by creating a fake ad element
    const detectAdBlock = () => {
      const fakeAd = document.createElement('div');
      fakeAd.className = 'textads banner-ads banner_ads ad-unit ad-zone ad-space adsbox';
      fakeAd.style.height = '1px';
      fakeAd.style.width = '1px';
      fakeAd.style.position = 'absolute';
      fakeAd.style.left = '-10000px';
      fakeAd.style.top = '-10000px';
      
      document.body.appendChild(fakeAd);

      // Check after a small delay to allow adblockers to process
      setTimeout(() => {
        const isBlocked = 
          fakeAd.offsetHeight === 0 || 
          fakeAd.offsetWidth === 0 || 
          fakeAd.style.display === 'none' ||
          window.getComputedStyle(fakeAd).display === 'none';

        if (isBlocked) {
          setAdBlockDetected(true);
        }
        
        // Clean up
        if (fakeAd.parentNode) {
          fakeAd.parentNode.removeChild(fakeAd);
        }
      }, 300);
    };

    // Run on mount
    detectAdBlock();
  }, [isPremium]);

  if (isPremium || !adBlockDetected || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-white dark:bg-neutral-900 shadow-xl border border-red-500/30 rounded-xl p-4 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="flex items-start gap-3">
        <div className="bg-red-100 dark:bg-red-500/10 p-2 rounded-full shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-1 pt-0.5">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">
            Ad Blocker Detected
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed mb-3">
            It looks like you're using an ad blocker. You can support NESTTube by upgrading to our official Ad-Free Premium pass.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setDismissed(true);
                openPremiumModal();
              }}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 fill-black" />
              <span>Go Ad-Free Premium</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="px-2.5 py-1.5 text-xs text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
