import React, { useEffect, useRef } from 'react';
import { CheckCircle2, MoreVertical } from 'lucide-react';
import { useAdsterra } from '../../context/AdsterraContext';

export interface NativeAdCardProps {
  index?: number;
}

const NATIVE_ADS = [
  {
    title: 'NestCloud 4K Ultra Video Streaming & Global Cloud Infrastructure',
    channel: 'NestCloud Official',
    views: '1.2M views',
    publishedAt: '3 hours ago',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop&q=70',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&auto=format&fit=crop&q=70',
    duration: '4:15',
    verified: true,
  },
  {
    title: 'ShieldVPN: Ultra Fast High-Speed Global Stream Security',
    channel: 'Shield Security Hub',
    views: '850K views',
    publishedAt: '1 day ago',
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&auto=format&fit=crop&q=70',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&auto=format&fit=crop&q=70',
    duration: '10:42',
    verified: true,
  },
  {
    title: 'GamePass Cloud: Play 500+ PC Games Directly on Any Browser',
    channel: 'GameVerse Gaming',
    views: '3.4M views',
    publishedAt: '5 hours ago',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&auto=format&fit=crop&q=70',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=64&auto=format&fit=crop&q=70',
    duration: '15:20',
    verified: true,
  }
];

export const NativeAdCard: React.FC<NativeAdCardProps> = ({ index = 0 }) => {
  const { config, triggerPopunder, isPremium } = useAdsterra();
  const containerRef = useRef<HTMLDivElement>(null);

  const key = config.placements.homeFeedNative.key || '38dfd65646bd181737e236178823161a';
  const containerId = `container-${key}`;

  useEffect(() => {
    if (isPremium || !config.enabled || !config.placements.homeFeedNative.enabled || config.simulationMode) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    try {
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.style.display = 'block';

      container.appendChild(iframe);

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; width: 100%; height: 100%; }
              </style>
            </head>
            <body>
              <div id="container-${key}"></div>
              <script async="async" data-cfasync="false" src="//pl30753583.effectivecpmnetwork.com/${key}/invoke.js"></script>
            </body>
          </html>
        `);
        doc.close();
      }
    } catch (err) {
      console.warn('Native ad injection failed', err);
    }

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [isPremium, config.enabled, config.placements.homeFeedNative.enabled, config.simulationMode, key]);

  if (isPremium || !config.enabled || !config.placements.homeFeedNative.enabled) {
    return null;
  }

  if (!config.simulationMode) {
    return (
      <div className="flex flex-col gap-3 group my-2">
        {/* Single 1:1 Native Ad Container */}
        <div className="relative w-full rounded-xl overflow-hidden bg-neutral-100 dark:bg-white/5 flex items-center justify-center min-h-[200px] h-[250px]">
          <div ref={containerRef} className="w-full h-full flex flex-col items-center justify-center"></div>
          <div className="absolute top-2 right-2 bg-black/80 text-white px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase z-10 pointer-events-none">
            Ad
          </div>
        </div>
      </div>
    );
  }

  const adData = NATIVE_ADS[index % NATIVE_ADS.length];

  const handleClick = () => {
    triggerPopunder();
    const url = config.interstitial.smartLinkUrl || 'https://pl30753698.effectivecpmnetwork.com/ae/f9/21/aef921faf99a1886dd69aeebe25360d1.js';
    try {
      window.open(url, '_blank');
    } catch (e) {
      console.warn('Native ad click popup error', e);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="flex flex-col gap-3 group cursor-pointer"
    >
      {/* Thumbnail matching YouTube video cards exactly */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-100 dark:bg-white/5 block cursor-pointer">
        <img
          src={adData.thumbnail}
          alt={adData.title}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />

        {/* Ad duration style badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white px-1.5 py-0.5 rounded text-[12px] font-medium">
          {adData.duration}
        </div>
      </div>

      {/* Channel info and title row matching YouTube video card structure */}
      <div className="flex gap-3 pr-6 relative">
        <div className="w-9 h-9 rounded-full shrink-0 block overflow-hidden bg-neutral-200 dark:bg-neutral-800">
          <img
            src={adData.avatar}
            alt={adData.channel}
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col">
          <h3 className="text-base font-semibold leading-snug line-clamp-2 text-[#0f0f0f] dark:text-[#f1f1f1] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {adData.title}
          </h3>

          <div className="text-sm text-[#606060] dark:text-[#aaaaaa] mt-1 flex items-center gap-1">
            <span>{adData.channel}</span>
            {adData.verified && <CheckCircle2 className="w-[14px] h-[14px] text-[#606060] dark:text-[#aaaaaa]" />}
          </div>

          <div className="text-sm text-[#606060] dark:text-[#aaaaaa]">
            <span>Ad</span> • <span>{adData.views}</span> • <span>{adData.publishedAt}</span>
          </div>
        </div>

        <button
          className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 p-1 cursor-pointer text-[#0f0f0f] dark:text-[#f1f1f1] hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

