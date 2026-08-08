import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Sparkles, X, Info, Settings, ShieldCheck, Zap } from 'lucide-react';
import { useAdsterra } from '../../context/AdsterraContext';
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
    bgGradient: 'from-blue-600/10 via-indigo-600/10 to-purple-600/10 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30',
    borderColor: 'border-blue-500/20 dark:border-blue-500/30',
    buttonBg: 'bg-blue-600 hover:bg-blue-700 text-white',
    icon: Zap,
    tag: 'Cloud Hosting'
  },
  {
    title: 'GameVerse Pass - 100+ AAA Games',
    desc: 'Stream full HD games directly in your browser on any device with zero downloads.',
    cta: 'Play Now - $1 First Month',
    badge: 'Promoted',
    bgGradient: 'from-amber-500/10 via-red-500/10 to-pink-500/10 dark:from-amber-900/30 dark:via-red-900/30 dark:to-pink-900/30',
    borderColor: 'border-amber-500/20 dark:border-amber-500/30',
    buttonBg: 'bg-amber-600 hover:bg-amber-700 text-white',
    icon: Sparkles,
    tag: 'Gaming'
  },
  {
    title: 'ShieldVPN - Stream Anything, Anywhere',
    desc: 'Ultra-fast encrypted VPN servers optimized for 4K video playback with zero logs.',
    cta: 'Get 82% Off + 3 Months Free',
    badge: 'Adsterra Network',
    bgGradient: 'from-emerald-500/10 via-teal-500/10 to-cyan-500/10 dark:from-emerald-900/30 dark:via-teal-900/30 dark:to-cyan-900/30',
    borderColor: 'border-emerald-500/20 dark:border-emerald-500/30',
    buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    icon: ShieldCheck,
    tag: 'Security'
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
  const { config, openSettings, triggerPopunder, isPremium } = useAdsterra();
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

    const handleMessage = (e: MessageEvent) => {
      if (e.data === 'adsterra-error') {
        setAdError(true);
      }
    };
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [dismissed, isPlacementEnabled, config.simulationMode, zoneKey, adFormat]);

  if (dismissed || !isPlacementEnabled) {
    return null;
  }

  const isLiveScriptActive = !config.simulationMode && zoneKey && !zoneKey.includes('demo') && !adError;

  const PromoIcon = promo.icon;

  return (
    <div className={cn("relative group my-3 transition-all duration-200", className)}>
      {/* Label & Admin Controls Bar */}
      <div className="flex items-center justify-between px-2 py-1 text-[11px] text-neutral-500 dark:text-neutral-400 font-medium tracking-wide border-b border-dashed border-neutral-200 dark:border-white/10 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-amber-500/20">
            {label}
          </span>
          <span className="text-xs text-neutral-400 dark:text-neutral-500">
            {config.simulationMode ? '(Adsterra Demo)' : `(Zone: ${zoneKey.slice(0, 8)}...)`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openSettings}
            className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors cursor-pointer"
            title="Configure Adsterra Zone Keys"
          >
            <Settings className="w-3 h-3" />
            <span className="hidden sm:inline text-[10px]">Ad Settings</span>
          </button>
          {showDismiss && (
            <button
              onClick={() => setDismissed(true)}
              className="p-0.5 hover:bg-neutral-200 dark:hover:bg-white/10 rounded transition-colors cursor-pointer"
              title="Hide Ad"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Live Script Iframe Render Box */}
      {isLiveScriptActive ? (
        <div ref={containerRef} className="min-h-[90px] flex justify-center items-center bg-neutral-50 dark:bg-neutral-900/50 rounded-xl p-2 border border-neutral-200 dark:border-white/10"></div>
      ) : (
        /* Sponsored Native / Display Ad Card (Fallback & Simulation Mode) */
        <div
          onClick={triggerPopunder}
          className={cn(
            "relative overflow-hidden rounded-2xl p-4 border transition-all duration-200 bg-gradient-to-r shadow-sm hover:shadow-md cursor-pointer",
            promo.bgGradient,
            promo.borderColor
          )}
        >
          {/* Format Specific Layouts */}
          {adFormat === '300x250' ? (
            /* Sidebar 300x250 Square Ad */
            <div className="flex flex-col gap-3 text-center items-center p-2">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-neutral-800 shadow-md flex items-center justify-center text-blue-600 dark:text-blue-400">
                <PromoIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                  {promo.tag}
                </span>
                <h4 className="font-bold text-sm text-neutral-900 dark:text-white leading-tight">
                  {promo.title}
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2">
                  {promo.desc}
                </p>
              </div>
              <a
                href={config.popunder.smartLinkUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={cn("w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5", promo.buttonBg)}
              >
                <span>{promo.cta}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            /* Horizontal Leaderboard / 728x90 Banner Ad */
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-800 shadow flex shrink-0 items-center justify-center text-blue-600 dark:text-blue-400">
                  <PromoIcon className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-neutral-900 dark:text-white leading-snug">
                      {promo.title}
                    </span>
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                      {promo.tag}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-1 mt-0.5">
                    {promo.desc}
                  </p>
                </div>
              </div>

              <a
                href={config.popunder.smartLinkUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={cn("px-4 py-2 rounded-xl font-semibold text-xs shrink-0 transition-all shadow-sm flex items-center gap-1.5 w-full sm:w-auto justify-center", promo.buttonBg)}
              >
                <span>{promo.cta}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
