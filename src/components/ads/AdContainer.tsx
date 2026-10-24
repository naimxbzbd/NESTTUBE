import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Sparkles, X, Info, Settings, ShieldCheck, Zap, Film, Play } from 'lucide-react';
import { useAdsterra } from '../../context/AdsterraContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

export interface AdContainerProps {
  placement?: 'headerBanner' | 'homeFeedNative' | 'watchSidebar' | 'watchBelowVideo' | 'custom';
  format?: '728x90' | '468x60' | '300x250' | '160x600' | 'native' | 'social-bar' | 'interstitial';
  customKey?: string;
  className?: string;
  showDismiss?: boolean;
  label?: string;
}

const DEMO_PROMOS = [
  {
    title: 'NestCloud Pro - High Speed Streaming VPS',
    desc: 'Deploy low-latency video streaming servers worldwide with 10Gbps unmetered bandwidth.',
    cta: 'Start 14-Day Free Trial',
    badge: 'Sponsored',
    bgGradient: 'from-blue-600/15 via-indigo-600/15 to-purple-600/15 dark:from-blue-950/60 dark:via-indigo-950/60 dark:to-purple-950/60',
    borderColor: 'border-blue-500/30 dark:border-blue-500/40',
    buttonBg: 'bg-blue-600 hover:bg-blue-700 text-white',
    icon: Zap,
    tag: 'Cloud Hosting',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWpmOGQ0dzZ3aDhnZjF0N3dyNnMwbmlyNHRwbjFnMzE4NWgwdXUxbSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26tn33aiTi1jkl6H6/giphy.gif',
    mediaTypeBadge: 'Video Ad',
  },
  {
    title: 'GameVerse Pass - 100+ AAA Games',
    desc: 'Stream full HD games directly in your browser on any device with zero downloads.',
    cta: 'Play Now - $1 First Month',
    badge: 'Promoted',
    bgGradient: 'from-amber-500/15 via-red-500/15 to-pink-500/15 dark:from-amber-950/60 dark:via-red-950/60 dark:to-pink-950/60',
    borderColor: 'border-amber-500/30 dark:border-amber-500/40',
    buttonBg: 'bg-amber-600 hover:bg-amber-700 text-white',
    icon: Sparkles,
    tag: 'Gaming',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZydW53dGk0amgza2ZtOWZ5cmc3eHl0dndrYnEwczdudXNqc25vYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/YnkMcHgNIMW4Yfmjxr/giphy.gif',
    mediaTypeBadge: 'Motion Ad',
  },
  {
    title: 'ShieldVPN - Stream Anything, Anywhere',
    desc: 'Ultra-fast encrypted VPN servers optimized for 4K video playback with zero logs.',
    cta: 'Get 82% Off + 3 Months Free',
    badge: 'Adsterra Network',
    bgGradient: 'from-emerald-500/15 via-teal-500/15 to-cyan-500/15 dark:from-emerald-950/60 dark:via-teal-950/60 dark:to-cyan-950/60',
    borderColor: 'border-emerald-500/30 dark:border-emerald-500/40',
    buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    icon: ShieldCheck,
    tag: 'Security',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdW5md3dyMHBmNG14aG1hOG5md3BocnR5NGV3ZDN3Y3pvaTExNWltYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/L1R1tvI9svkIWwpVYr/giphy.gif',
    mediaTypeBadge: 'Rich Media GIF',
  }
];

export const AdContainer: React.FC<AdContainerProps> = ({
  placement = 'custom',
  format,
  customKey,
  className,
  showDismiss = true,
  label = 'Advertisement'
}) => {
  const { config, openSettings, triggerPopunder, isPremium, openDirectLink } = useAdsterra();
  const { theme } = useTheme();
  const [dismissed, setDismissed] = useState(false);
  const [adError, setAdError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Determine key & format from placement or props
  let zoneKey = customKey || '';
  let adFormat = format || '728x90';
  let isPlacementEnabled = !isPremium && config.enabled;

  if (placement !== 'custom' && config.placements[placement]) {
    const pConfig = config.placements[placement];
    isPlacementEnabled = !isPremium && config.enabled && pConfig.enabled;
    zoneKey = zoneKey || pConfig.key || '';
    adFormat = format || pConfig.format || '728x90';
  }

  // Pick a random/stable demo promo index based on zoneKey or placement name
  const promoIndex = Math.abs(
    (placement + zoneKey).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % DEMO_PROMOS.length;
  const promo = DEMO_PROMOS[promoIndex];

  // Adsterra script injection
  useEffect(() => {
    if (dismissed || !isPlacementEnabled) return;
    if (config.simulationMode || !zoneKey || zoneKey.includes('demo')) {
      return; // Use simulation fallback card
    }

    // Live Adsterra script embedding via iframe document
    const container = containerRef.current;
    if (!container) return;

    let width = 728;
    let height = 90;
    if (adFormat === '300x250') {
      width = 300;
      height = 250;
    } else if (adFormat === '468x60') {
      width = 468;
      height = 60;
    } else if (adFormat === '160x600') {
      width = 160;
      height = 600;
    }

    const textColor = theme === 'dark' ? '#ffffff' : '#000000';

    try {
      const iframe = document.createElement('iframe');
      iframe.style.width = `${width}px`;
      iframe.style.height = `${height}px`;
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.style.display = 'block';
      iframe.style.margin = '0 auto';
      iframe.style.maxWidth = '100%';

      container.innerHTML = '';
      container.appendChild(iframe);

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <link rel="preload" href="//www.highperformanceformat.com/${zoneKey}/invoke.js" as="script">
              <style>
                body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
                /* Force text color for all nested elements */
                body * { color: ${textColor} !important; }
              </style>
            </head>
            <body>
              <script type="text/javascript">
                atOptions = {
                  'key' : '${zoneKey}',
                  'format' : 'iframe',
                  'height' : ${height},
                  'width' : ${width},
                  'params' : {}
                };
              </script>
              <script type="text/javascript" src="//www.highperformanceformat.com/${zoneKey}/invoke.js" onerror="window.parent.postMessage('adsterra-error', '*')"></script>
            </body>
          </html>
        `);
        doc.close();
      }
    } catch (err) {
      console.warn('Adsterra live script injection fallback', err);
      setAdError(true);
    }

    // Safety fallback: if after 1000ms the iframe has 0 height or failed to load an ad, trigger fallback promo
    const fallbackTimer = setTimeout(() => {
      try {
        const containerEl = containerRef.current;
        const ifr = containerEl?.querySelector('iframe');
        const doc = ifr?.contentWindow?.document;
        // If iframe is empty or has not populated content, show rich promo banner
        if (doc && doc.body.offsetHeight < 20) {
          setAdError(true);
        }
      } catch (e) {
        // Cross origin redirection indicates an ad might have loaded
      }
    }, 1000);

    const handleMessage = (e: MessageEvent) => {
      if (e.data === 'adsterra-error') {
        setAdError(true);
      }
    };
    window.addEventListener('message', handleMessage);

    return () => {
      clearTimeout(fallbackTimer);
      window.removeEventListener('message', handleMessage);
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [dismissed, isPlacementEnabled, config.simulationMode, zoneKey, adFormat, theme]);

  if (dismissed || !isPlacementEnabled) {
    return null;
  }

  const isLiveScriptActive = !config.simulationMode && zoneKey && !zoneKey.includes('demo') && !adError;

  const PromoIcon = promo.icon;

  const handleCardClick = () => {
    if (config.directLink?.enabled && config.directLink.triggerMode === 'new_tab') {
      openDirectLink();
    } else {
      triggerPopunder();
    }
  };

  return (
    <div className={cn("relative group my-2 transition-all duration-200", className)}>
      {/* Live Script Iframe Render Box */}
      {isLiveScriptActive ? (
        <div ref={containerRef} className="min-h-[90px] flex justify-center items-center bg-neutral-50 dark:bg-neutral-900/50 rounded-xl p-2 border border-neutral-200 dark:border-white/10 hover:scale-[1.01] transition-transform duration-200"></div>
      ) : (
        /* Sponsored Native / Display Ad Card (Fallback & Simulation Mode with Video / GIF Support) */
        <div
          onClick={handleCardClick}
          className={cn(
            "relative overflow-hidden rounded-2xl border transition-all duration-200 bg-gradient-to-r shadow-sm hover:shadow-md cursor-pointer hover:scale-[1.005]",
            adFormat === '300x250' ? "w-full max-w-[300px] h-[250px] p-2.5 flex flex-col justify-between" : "p-2.5 sm:p-3 min-h-[76px] sm:h-[84px] max-h-[90px] flex flex-col justify-center",
            promo.bgGradient,
            promo.borderColor
          )}
        >
          {/* Ambient Video Background for subtle motion effect */}
          {config.bannerMediaType === 'video_gif' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10 dark:opacity-20 z-0">
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
                className="w-full h-full object-cover filter blur-sm scale-110"
              >
                <source src={promo.videoUrl} type="video/mp4" />
              </video>
            </div>
          )}

          {/* Format Specific Layouts */}
          {adFormat === '300x250' ? (
            /* Sidebar 300x250 Square Ad with Live Video / GIF Creative (Fixed 300x250) */
            <div className="relative z-10 flex flex-col justify-between h-full">
              {/* Media Creative Window */}
              {config.bannerMediaType === 'gif_only' ? (
                <div className="relative w-full h-[118px] rounded-xl overflow-hidden bg-black/80 shrink-0 border border-white/10 shadow-inner group/media">
                  <img
                    src={promo.gifUrl}
                    alt={promo.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/media:scale-105"
                  />
                  {/* Top Badges */}
                  <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-bold text-purple-300 border border-purple-500/30">
                    <Film className="w-2.5 h-2.5 text-purple-400" />
                    <span>GIF Ad</span>
                  </div>
                  <div className="absolute top-1.5 right-1.5 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-semibold text-emerald-400 border border-emerald-500/30">
                    Animated
                  </div>
                </div>
              ) : config.bannerMediaType !== 'classic' ? (
                <div className="relative w-full h-[118px] rounded-xl overflow-hidden bg-black/80 shrink-0 border border-white/10 shadow-inner group/media">
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
                    poster={promo.gifUrl}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/media:scale-105"
                  >
                    <source src={promo.videoUrl} type="video/mp4" />
                    <img src={promo.gifUrl} alt={promo.title} className="w-full h-full object-cover" />
                  </video>
                  {/* Top Badges */}
                  <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-bold text-cyan-300 border border-cyan-500/30">
                    <Film className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
                    <span>{promo.mediaTypeBadge || 'Video Ad'}</span>
                  </div>
                  <div className="absolute top-1.5 right-1.5 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-semibold text-emerald-400 border border-emerald-500/30">
                    Auto-Loop
                  </div>
                </div>
              ) : (
                <div className="w-12 h-12 mx-auto rounded-2xl bg-white dark:bg-neutral-800 shadow-md flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <PromoIcon className="w-6 h-6" />
                </div>
              )}

              {/* Title, Tag and Description */}
              <div className="space-y-0.5 text-center mt-1">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                    {promo.tag}
                  </span>
                  <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium">Sponsored</span>
                </div>
                <h4 className={cn("font-bold text-xs leading-tight line-clamp-1", placement === 'headerBanner' ? "text-white" : "text-neutral-900 dark:text-white")}>
                  {promo.title}
                </h4>
                <p className={cn("text-[10px] line-clamp-1", placement === 'headerBanner' ? "text-white/80" : "text-neutral-600 dark:text-neutral-300")}>
                  {promo.desc}
                </p>
              </div>

              {/* CTA Action Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openDirectLink();
                }}
                className={cn("w-full py-1.5 px-3 rounded-xl font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0 mt-1 cursor-pointer", promo.buttonBg)}
              >
                <span>{promo.cta}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Horizontal Leaderboard / 728x90 Banner Ad with Video/GIF Preview (Fixed 728x90) */
            <div className="relative z-10 flex items-center justify-between gap-3 h-full">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                {/* Compact Video / GIF Preview Window */}
                {config.bannerMediaType === 'gif_only' ? (
                  <div className="w-16 h-11 sm:w-20 sm:h-13 rounded-lg overflow-hidden shrink-0 relative bg-black/80 border border-white/10 shadow-sm group/thumb">
                    <img
                      src={promo.gifUrl}
                      alt={promo.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0.5 right-0.5 bg-black/85 text-[7px] sm:text-[8px] font-bold text-purple-300 px-1 py-0.2 rounded flex items-center gap-0.5">
                      <Film className="w-2 h-2 text-purple-400" />
                      GIF
                    </span>
                  </div>
                ) : config.bannerMediaType !== 'classic' ? (
                  <div className="w-16 h-11 sm:w-20 sm:h-13 rounded-lg overflow-hidden shrink-0 relative bg-black/80 border border-white/10 shadow-sm group/thumb">
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
                      poster={promo.gifUrl}
                      className="w-full h-full object-cover"
                    >
                      <source src={promo.videoUrl} type="video/mp4" />
                      <img src={promo.gifUrl} alt={promo.title} className="w-full h-full object-cover" />
                    </video>
                    <span className="absolute bottom-0.5 right-0.5 bg-black/85 text-[7px] sm:text-[8px] font-bold text-cyan-300 px-1 py-0.2 rounded flex items-center gap-0.5">
                      <Film className="w-2 h-2 text-cyan-400" />
                      Motion
                    </span>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-800 shadow flex shrink-0 items-center justify-center text-blue-600 dark:text-blue-400">
                    <PromoIcon className="w-5 h-5" />
                  </div>
                )}

                <div className="flex flex-col min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("font-bold text-xs sm:text-sm leading-snug truncate", placement === 'headerBanner' ? "text-white" : "text-neutral-900 dark:text-white")}>
                      {promo.title}
                    </span>
                    <span className="text-[9px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded shrink-0">
                      {promo.tag}
                    </span>
                  </div>
                  <p className={cn("text-[11px] line-clamp-1 mt-0.5", placement === 'headerBanner' ? "text-white/80" : "text-neutral-600 dark:text-neutral-300")}>
                    {promo.desc}
                  </p>
                </div>
              </div>

              {/* Leaderboard CTA Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openDirectLink();
                }}
                className={cn("px-3.5 py-1.5 sm:py-2 rounded-xl font-semibold text-xs shrink-0 transition-all shadow-sm flex items-center gap-1.5 w-auto justify-center cursor-pointer", promo.buttonBg)}
              >
                <span>{promo.cta}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
