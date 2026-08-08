import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ExternalLink, Play, Sparkles, Shield, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { useAdsterra } from '../../context/AdsterraContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export const InterstitialAdModal: React.FC = () => {
  const {
    isInterstitialActive,
    pendingNavigationPath,
    closeInterstitial,
    config,
    isPremium
  } = useAdsterra();

  const navigate = useNavigate();
  const [countdown, setCountdown] = useState<number>(5);
  const [canSkip, setCanSkip] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  useEffect(() => {
    if (!isInterstitialActive) {
      setCountdown(5);
      setCanSkip(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isInterstitialActive]);

  const handleSkipOrClose = () => {
    closeInterstitial();
    if (pendingNavigationPath) {
      navigate(pendingNavigationPath);
    }
  };

  const handleAdClick = () => {
    const targetUrl = config.interstitial.smartLinkUrl || 'https://www.effectivecpmgate.com/';
    try {
      window.open(targetUrl, '_blank');
    } catch (e) {
      console.warn('Ad link click prevented', e);
    }
    handleSkipOrClose();
  };

  if (isPremium || !isInterstitialActive) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-neutral-950/60 border-b border-neutral-800/80">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-black text-[11px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide">
                Adsterra Sponsored
              </span>
              <span className="text-xs text-neutral-400 hidden sm:inline">
                NESTTube Video Transition
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Skip Button or Countdown */}
              {canSkip ? (
                <button
                  onClick={handleSkipOrClose}
                  className="bg-white text-black hover:bg-neutral-200 font-bold px-4 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
                >
                  <span>Skip Ad</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="bg-neutral-800/80 text-neutral-300 font-medium px-3 py-1 rounded-full text-xs flex items-center gap-2">
                  <span>Ad ends in</span>
                  <span className="font-bold text-amber-400 text-sm">{countdown}s</span>
                </div>
              )}

              <button
                onClick={handleSkipOrClose}
                className="p-1.5 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Ad Main Content Body */}
          <div className="relative p-6 sm:p-8 flex flex-col items-center text-center gap-6 bg-gradient-to-b from-neutral-900 via-neutral-900 to-black">
            {/* Promo Video Placeholder / Visual Box */}
            <div
              onClick={handleAdClick}
              className="w-full aspect-video rounded-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-950 border border-indigo-500/30 flex flex-col items-center justify-center p-6 relative overflow-hidden group cursor-pointer shadow-xl"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.25)_0,transparent_70%)] group-hover:scale-105 transition-transform duration-500"></div>

              <div className="w-16 h-16 rounded-3xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 mb-3 shadow-lg group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-amber-300" />
              </div>

              <span className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-500/30 mb-2">
                Featured Partner
              </span>

              <h2 className="text-xl sm:text-2xl font-extrabold text-white max-w-lg leading-snug">
                Upgrade Your Gaming & Streaming Experience with NestPro
              </h2>

              <p className="text-xs sm:text-sm text-neutral-300 max-w-md mt-2 line-clamp-2">
                Zero buffering, 4K HDR playback, and unlimited cloud storage. Join over 500,000 creators today.
              </p>

              <div className="mt-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-extrabold px-6 py-2.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-xl transition-all group-hover:scale-105">
                <span>Visit Sponsor Site</span>
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>

            {/* Footer Notice */}
            <div className="flex items-center justify-between w-full text-xs text-neutral-500 border-t border-neutral-800/80 pt-4">
              <span className="text-[11px]">Monetized by Adsterra HighCPM Network</span>
              <button
                onClick={handleSkipOrClose}
                className="text-neutral-400 hover:text-white underline text-[11px] cursor-pointer"
              >
                Continue to Video
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
