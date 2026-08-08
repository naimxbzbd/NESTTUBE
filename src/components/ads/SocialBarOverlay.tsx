import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Flame } from 'lucide-react';
import { useAdsterra } from '../../context/AdsterraContext';
import { cn } from '../../lib/utils';

export const SocialBarOverlay: React.FC = () => {
  const { config, triggerPopunder, isPremium } = useAdsterra();
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isPremium || !config.enabled || !config.socialBar.enabled || dismissed) {
      setIsVisible(false);
      const script = document.getElementById('adsterra-socialbar-script');
      if (script && isPremium) {
        script.remove();
      }
      return;
    }

    // Inject live script into page head if in live mode
    if (!config.simulationMode) {
      const scriptId = 'adsterra-socialbar-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://pl30753510.effectivecpmnetwork.com/a9/e3/bd/a9e3bd5d92edf03e7a2106e5243a4490.js';
        script.async = true;
        document.body.appendChild(script);
      }
      return;
    }

    // Delay simulation bar popup slightly for a realistic social bar feel
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [isPremium, config.enabled, config.socialBar.enabled, config.simulationMode, dismissed]);

  if (isPremium || !config.simulationMode || !isVisible || dismissed) return null;

  const handleBarClick = () => {
    triggerPopunder();
    if (config.popunder.smartLinkUrl) {
      try {
        window.open(config.popunder.smartLinkUrl, '_blank');
      } catch (e) {
        console.warn('Smartlink click error', e);
      }
    }
  };

  const positionClass =
    config.socialBar.position === 'bottom-center'
      ? 'bottom-16 md:bottom-6 left-1/2 -translate-x-1/2'
      : config.socialBar.position === 'bottom-left'
      ? 'bottom-16 md:bottom-6 left-4 md:left-6'
      : 'bottom-16 md:bottom-6 right-4 md:right-6';

  return (
    <div
      className={cn(
        "fixed z-40 max-w-sm w-[calc(100%-2rem)] animate-in slide-in-from-bottom-5 fade-in duration-300",
        positionClass
      )}
    >
      <div className="relative overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 group">
        {/* Adsterra Badge */}
        <div className="absolute top-1.5 right-8 text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
          Sponsored
        </div>

        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDismissed(true);
          }}
          className="absolute top-1.5 right-1.5 p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors cursor-pointer z-10"
          title="Dismiss Ad"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Icon */}
        <div
          onClick={handleBarClick}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-500 flex shrink-0 items-center justify-center text-white shadow-md cursor-pointer group-hover:scale-105 transition-transform"
        >
          <Flame className="w-5 h-5 fill-current" />
        </div>

        {/* Content */}
        <div onClick={handleBarClick} className="flex flex-col flex-1 cursor-pointer min-w-0 pr-4">
          <div className="flex items-center gap-1.5">
            <h5 className="font-bold text-xs text-neutral-900 dark:text-white truncate">
              Special Creator Promo
            </h5>
          </div>
          <p className="text-[11px] text-neutral-600 dark:text-neutral-300 line-clamp-1 mt-0.5">
            Get 90% OFF Premium VPN & Ultra Fast Cloud Node.
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={handleBarClick}
          className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] px-3 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
        >
          <span>Claim</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
