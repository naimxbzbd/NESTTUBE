import React, { useEffect, useRef } from 'react';
import { CheckCircle2, MoreVertical, Film } from 'lucide-react';
import { useAdsterra } from '../../context/AdsterraContext';
import { useTheme } from '../../context/ThemeContext';

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
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWpmOGQ0dzZ3aDhnZjF0N3dyNnMwbmlyNHRwbjFnMzE4NWgwdXUxbSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26tn33aiTi1jkl6H6/giphy.gif',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&auto=format&fit=crop&q=70',
    duration: '0:30',
    badgeText: 'Video Ad',
    verified: true,
  },
  {
    title: 'ShieldVPN: Ultra Fast High-Speed Global Stream Security',
    channel: 'Shield Security Hub',
    views: '850K views',
    publishedAt: '1 day ago',
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&auto=format&fit=crop&q=70',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdW5md3dyMHBmNG14aG1hOG5md3BocnR5NGV3ZDN3Y3pvaTExNWltYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/L1R1tvI9svkIWwpVYr/giphy.gif',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&auto=format&fit=crop&q=70',
    duration: '0:15',
    badgeText: 'Motion Ad',
    verified: true,
  },
  {
    title: 'GamePass Cloud: Play 500+ PC Games Directly on Any Browser',
    channel: 'GameVerse Gaming',
    views: '3.4M views',
    publishedAt: '5 hours ago',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&auto=format&fit=crop&q=70',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZydW53dGk0amgza2ZtOWZ5cmc3eHl0dndrYnEwczdudXNqc25vYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/YnkMcHgNIMW4Yfmjxr/giphy.gif',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=64&auto=format&fit=crop&q=70',
    duration: '0:45',
    badgeText: 'Video Ad',
    verified: true,
  }
];

export const NativeAdCard: React.FC<NativeAdCardProps> = ({ index = 0 }) => {
  const { config, triggerPopunder, isPremium } = useAdsterra();
  const { theme } = useTheme();
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
    const textColor = theme === 'dark' ? '#ffffff' : '#000000';

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
                /* Force text color for all nested elements */
                body * { color: ${textColor} !important; }
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
  }, [isPremium, config.enabled, config.placements.homeFeedNative.enabled, config.simulationMode, key, theme]);

  if (isPremium || !config.enabled || !config.placements.homeFeedNative.enabled) {
    return null;
  }

  if (!config.simulationMode) {
    return (
      <div className="flex flex-col gap-3 group my-2">
        {/* Single 1:1 Native Ad Container */}
        <div className="relative w-full rounded-xl overflow-hidden bg-neutral-100 dark:bg-white/5 flex items-center justify-center min-h-[200px] h-[250px] hover:scale-[1.01] transition-transform duration-200">
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
      {/* Thumbnail matching YouTube video cards exactly with Video/GIF creative */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-100 dark:bg-white/5 block cursor-pointer">
        {config.bannerMediaType === 'gif_only' ? (
          <img
            src={adData.gifUrl || adData.thumbnail}
            alt={adData.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : config.bannerMediaType !== 'classic' ? (
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
            poster={adData.thumbnail}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          >
            <source src={adData.videoUrl} type="video/mp4" />
            <img
              src={adData.gifUrl || adData.thumbnail}
              alt={adData.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </video>
        ) : (
          <img
            src={adData.thumbnail}
            alt={adData.title}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        )}

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/80 backdrop-blur-md text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase z-10 pointer-events-none">
          <Film className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
          <span>{config.bannerMediaType === 'gif_only' ? 'GIF Ad' : (adData.badgeText || 'Video Ad')}</span>
        </div>

        <div className="absolute top-2 right-2 bg-black/80 text-white px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase z-10 pointer-events-none">Ad</div>
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

