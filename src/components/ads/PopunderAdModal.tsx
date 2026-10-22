import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Sparkles, ShieldCheck, Flame, Star, Zap } from 'lucide-react';
import { useAdsterra } from '../../context/AdsterraContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

const POPUNDER_PROMOS = [
  {
    title: 'NestCloud Pro - 10Gbps Video Streaming VPS',
    desc: 'Deploy ultra low-latency NVMe streaming servers with 99.99% uptime worldwide.',
    badge: 'Exclusive Deal • 70% Off',
    cta: 'Claim $100 Credits',
    icon: Zap,
    tag: 'Cloud Hosting',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop&q=70',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWpmOGQ0dzZ3aDhnZjF0N3dyNnMwbmlyNHRwbjFnMzE4NWgwdXUxbSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26tn33aiTi1jkl6H6/giphy.gif',
    gradient: 'from-blue-600 to-indigo-700',
    fallbackUrl: 'https://pl30753698.effectivecpmnetwork.com/',
  },
  {
    title: 'ShieldVPN - Stream 4K Videos With Zero Buffering',
    desc: 'Bypass ISP throttling and stream seamlessly with WireGuard speed & audited zero-logs.',
    badge: 'Special 82% Off',
    cta: 'Get 82% Off Deal',
    icon: ShieldCheck,
    tag: 'Security & VPN',
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&auto=format&fit=crop&q=70',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdW5md3dyMHBmNG14aG1hOG5md3BocnR5NGV3ZDN3Y3pvaTExNWltYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/L1R1tvI9svkIWwpVYr/giphy.gif',
    gradient: 'from-emerald-600 to-teal-700',
    fallbackUrl: 'https://pl30753698.effectivecpmnetwork.com/',
  },
  {
    title: 'GameVerse Pass - 500+ AAA Games in Browser',
    desc: 'Play Cyberpunk, GTA V, and Forza at 120 FPS on any device with zero downloads.',
    badge: 'Play for $1',
    cta: 'Start Playing Now',
    icon: Sparkles,
    tag: 'Cloud Gaming',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&auto=format&fit=crop&q=70',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZydW53dGk0amgza2ZtOWZ5cmc3eHl0dndrYnEwczdudXNqc25vYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/YnkMcHgNIMW4Yfmjxr/giphy.gif',
    gradient: 'from-amber-500 to-red-600',
    fallbackUrl: 'https://pl30753698.effectivecpmnetwork.com/',
  }
];

export const PopunderAdModal: React.FC = () => {
  const {
    isPopunderModalOpen,
    closePopunderModal,
    config,
    isPremium,
    videoWatchCount,
    openDirectLink,
  } = useAdsterra();

  const [countdown, setCountdown] = useState<number>(3);
  const [canSkip, setCanSkip] = useState<boolean>(false);

  const promoIndex = (videoWatchCount || 0) % POPUNDER_PROMOS.length;
  const promo = POPUNDER_PROMOS[promoIndex] || POPUNDER_PROMOS[0];

  useEffect(() => {
    if (!isPopunderModalOpen) {
      setCountdown(3);
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
  }, [isPopunderModalOpen]);

  const handleOpenAd = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    openDirectLink(config.directLink?.smartLinkUrl || promo.fallbackUrl);
  };

  if (isPremium || !isPopunderModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed bottom-4 right-4 z-[9999] p-2 animate-in fade-in duration-200 pointer-events-none flex justify-end">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="relative w-full max-w-sm sm:max-w-md bg-neutral-900 border border-neutral-700/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col text-white pointer-events-auto hover:shadow-amber-500/10 transition-shadow"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-950/95 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-black text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                Sponsored
              </span>
              <span className="text-[11px] text-neutral-400">
                {promo.tag}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Skip Button or Countdown */}
              {canSkip ? (
                <button
                  onClick={closePopunderModal}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-3 py-1 rounded-full text-[11px] flex items-center gap-1.5 transition-all cursor-pointer border border-neutral-700"
                >
                  <span>Close</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="bg-neutral-800/90 text-neutral-300 font-medium px-2.5 py-0.5 rounded-full text-[11px] flex items-center gap-1.5 opacity-90">
                  <span>Close in</span>
                  <span className="font-bold text-amber-400 text-xs">{countdown}s</span>
                </div>
              )}
            </div>
          </div>

          {/* Ad Creative Card */}
          <div 
            onClick={handleOpenAd}
            className="p-4 bg-gradient-to-b from-neutral-900 to-neutral-950 flex flex-col gap-3 group cursor-pointer hover:bg-neutral-800/50 transition-colors"
          >
            <div className="flex gap-3 items-center">
              <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0 bg-neutral-800 border border-neutral-700/80 relative">
                {config.bannerMediaType === 'gif_only' ? (
                  <img 
                    src={promo.gifUrl || promo.thumbnail} 
                    alt={promo.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="eager"
                  />
                ) : config.bannerMediaType !== 'classic' && promo.videoUrl ? (
                  <video
                    ref={(el) => {
                      if (el) {
                        el.muted = true;
                        el.play().catch(() => {});
                      }
                    }}
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster={promo.gifUrl || promo.thumbnail}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  >
                    <source src={promo.videoUrl} type="video/mp4" />
                    <img src={promo.gifUrl || promo.thumbnail} alt={promo.title} className="w-full h-full object-cover" />
                  </video>
                ) : (
                  <img 
                    src={promo.thumbnail} 
                    alt={promo.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="eager"
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                  {promo.badge}
                </span>
                <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-400 transition-colors line-clamp-1 mt-0.5">
                  {promo.title}
                </h4>
                <p className="text-[11px] text-neutral-300 line-clamp-2 mt-0.5 leading-snug">
                  {promo.desc}
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-neutral-400">
                Verified Adsterra Partner
              </span>
              <button
                type="button"
                onClick={handleOpenAd}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl font-bold text-xs text-white shadow-md flex items-center gap-1.5 transition-all group-hover:scale-105 active:scale-95 cursor-pointer bg-gradient-to-r",
                  promo.gradient
                )}
              >
                <span>{promo.cta}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
