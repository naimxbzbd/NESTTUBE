import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Star, 
  CheckCircle2, 
  ArrowRight, 
  Volume2, 
  VolumeX, 
  Flame, 
  Award,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useAdsterra } from '../../context/AdsterraContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface SponsoredCampaign {
  id: string;
  brand: string;
  title: string;
  tagline: string;
  badge: string;
  category: string;
  rating: string;
  reviews: string;
  ctaText: string;
  thumbnail: string;
  avatar: string;
  perks: string[];
  gradient: string;
  accentColor: string;
  fallbackUrl: string;
  videoUrl?: string;
  gifUrl?: string;
}

const SPONSORED_CAMPAIGNS: SponsoredCampaign[] = [
  {
    id: 'nestcloud-vps',
    brand: 'NestCloud Global Infrastructure',
    title: 'Ultra-Fast 10Gbps Video Streaming VPS & Edge Cloud',
    tagline: 'Deploy low-latency video streaming, transcoding, and web servers worldwide. Unmetered NVMe bandwidth with 99.99% uptime guarantee.',
    badge: 'Special Cloud Deal • $100 Free Credit',
    category: 'Cloud Infrastructure',
    rating: '4.9',
    reviews: '24,800+ developers',
    ctaText: 'Claim $100 Cloud Credit',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWpmOGQ0dzZ3aDhnZjF0N3dyNnMwbmlyNHRwbjFnMzE4NWgwdXUxbSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26tn33aiTi1jkl6H6/giphy.gif',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80',
    perks: ['10 Gbps Unmetered Uplink', 'Instant 1-Click Deploy', 'Free Anti-DDoS Pro Protection'],
    gradient: 'from-blue-600 via-indigo-600 to-purple-700',
    accentColor: 'text-blue-400',
    fallbackUrl: 'https://pl30753698.effectivecpmnetwork.com/',
  },
  {
    id: 'shieldvpn-pro',
    brand: 'ShieldVPN Global Security',
    title: 'Stream 4K & 8K Videos With Zero Buffering & Full Privacy',
    tagline: 'Bypass ISP speed throttling and stream HD videos worldwide with next-gen WireGuard speeds. Independently audited zero-logs policy.',
    badge: 'Exclusive Deal • 82% Off + 3 Months Free',
    category: 'Cybersecurity & Privacy',
    rating: '4.8',
    reviews: '95,000+ streamers',
    ctaText: 'Get 82% Off ShieldVPN',
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdW5md3dyMHBmNG14aG1hOG5md3BocnR5NGV3ZDN3Y3pvaTExNWltYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/L1R1tvI9svkIWwpVYr/giphy.gif',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&auto=format&fit=crop&q=80',
    perks: ['Zero Buffering WireGuard Protocol', 'Audited No-Logs Policy', 'Stream Unlimited Devices'],
    gradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    accentColor: 'text-emerald-400',
    fallbackUrl: 'https://pl30753698.effectivecpmnetwork.com/',
  },
  {
    id: 'gameverse-pass',
    brand: 'GameVerse Cloud Gaming',
    title: 'Play 500+ AAA PC Games Directly In Any Web Browser',
    tagline: 'Zero downloads or high-end graphics card needed. Play Cyberpunk, GTA V, and Forza at 120 FPS on your phone, tablet, or laptop.',
    badge: 'Play Today For Just $1',
    category: 'Next-Gen Cloud Gaming',
    rating: '4.9',
    reviews: '180,000+ gamers',
    ctaText: 'Start Playing For $1',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZydW53dGk0amgza2ZtOWZ5cmc3eHl0dndrYnEwczdudXNqc25vYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/YnkMcHgNIMW4Yfmjxr/giphy.gif',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=128&auto=format&fit=crop&q=80',
    perks: ['RTX 4080 Cloud Performance', 'Instant Browser Playback', 'Save States Synced Everywhere'],
    gradient: 'from-amber-500 via-rose-600 to-red-700',
    accentColor: 'text-amber-400',
    fallbackUrl: 'https://pl30753698.effectivecpmnetwork.com/',
  },
  {
    id: 'cybercraft-ai',
    brand: 'CyberCraft Creator AI',
    title: 'Turn Any Long Video into 10 Viral Shorts in 60 Seconds',
    tagline: 'Automate animated captions, AI face-tracking cuts, viral B-roll insertion, and multi-platform distribution with one click.',
    badge: 'Free Creator Starter Pack',
    category: 'Creator Studio AI',
    rating: '4.9',
    reviews: '42,000+ YouTubers',
    ctaText: 'Try Free Creator AI Tools',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdW5md3dyMHBmNG14aG1hOG5md3BocnR5NGV3ZDN3Y3pvaTExNWltYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/L1R1tvI9svkIWwpVYr/giphy.gif',
    avatar: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=128&auto=format&fit=crop&q=80',
    perks: ['AI Dynamic Subtitles & Captions', 'Viral Hook & B-Roll Generator', '4K 60FPS Video Export'],
    gradient: 'from-violet-600 via-fuchsia-600 to-pink-600',
    accentColor: 'text-fuchsia-400',
    fallbackUrl: 'https://pl30753698.effectivecpmnetwork.com/',
  }
];

export const InterstitialAdModal: React.FC = () => {
  const {
    isInterstitialActive,
    pendingNavigationPath,
    closeInterstitial,
    config,
    isPremium,
    videoWatchCount
  } = useAdsterra();

  const navigate = useNavigate();
  const [countdown, setCountdown] = useState<number>(5);
  const [canSkip, setCanSkip] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'featured' | 'adsterra'>('featured');
  const bannerContainerRef = useRef<HTMLDivElement>(null);

  // Pick a campaign deterministically or based on watch count
  const campaignIndex = (videoWatchCount || 0) % SPONSORED_CAMPAIGNS.length;
  const campaign = SPONSORED_CAMPAIGNS[campaignIndex] || SPONSORED_CAMPAIGNS[0];

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

  // Live Adsterra banner injection inside modal if available
  useEffect(() => {
    if (!isInterstitialActive || activeTab !== 'adsterra') return;
    const container = bannerContainerRef.current;
    if (!container) return;

    const zoneKey = config.placements.watchSidebar.key || '39d58d0dded1f717197d4d4c45ddeff9';
    try {
      container.innerHTML = '';
      const iframe = document.createElement('iframe');
      iframe.style.width = '300px';
      iframe.style.height = '250px';
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.style.display = 'block';
      iframe.style.margin = '0 auto';
      container.appendChild(iframe);

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; height: 100vh; }
              </style>
            </head>
            <body>
              <script type="text/javascript">
                atOptions = {
                  'key' : '${zoneKey}',
                  'format' : 'iframe',
                  'height' : 250,
                  'width' : 300,
                  'params' : {}
                };
              </script>
              <script type="text/javascript" src="//www.highperformanceformat.com/${zoneKey}/invoke.js"></script>
            </body>
          </html>
        `);
        doc.close();
      }
    } catch (e) {
      console.warn('Adsterra interstitial banner injection error', e);
    }
  }, [isInterstitialActive, activeTab, config]);

  const handleSkipOrClose = () => {
    closeInterstitial();
    if (pendingNavigationPath) {
      navigate(pendingNavigationPath);
    }
  };

  const handleOpenAd = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let targetUrl = config.interstitial.smartLinkUrl || config.popunder.smartLinkUrl || '';
    
    // If empty or ends with .js (like a raw script tag), open the fallback advertiser page
    if (!targetUrl || targetUrl.trim().endsWith('.js')) {
      targetUrl = campaign.fallbackUrl;
    }
    
    try {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.warn('Could not open ad destination URL', err);
    }
  };

  if (isPremium || !isInterstitialActive) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white"
        >
          {/* Top Countdown & Status Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-neutral-950/95 border-b border-neutral-800/80">
            <div className="flex items-center gap-2.5">
              <span className="bg-amber-500 text-black text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Advertisement
              </span>
              <span className="text-xs text-neutral-400 hidden sm:inline flex items-center gap-1">
                • <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" /> Verified Partner
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Skip / Continue Button */}
              {canSkip ? (
                <button
                  onClick={handleSkipOrClose}
                  className="bg-white hover:bg-neutral-200 text-black font-extrabold px-4 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition-all shadow-lg hover:shadow-xl cursor-pointer group active:scale-95"
                >
                  <span>Skip Ad & Play Video</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ) : (
                <div className="bg-neutral-800/90 border border-neutral-700/60 text-neutral-300 font-semibold px-4 py-1.5 rounded-full text-xs flex items-center gap-2 opacity-95">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>Video starts in</span>
                  <span className="font-extrabold text-amber-400 text-sm">{countdown}s</span>
                </div>
              )}

              {canSkip && (
                <button
                  onClick={handleSkipOrClose}
                  className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors cursor-pointer"
                  title="Close Ad"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Linear Progress Bar for Countdown */}
          <div className="w-full bg-neutral-800/50 h-1 overflow-hidden">
            <motion.div 
              initial={{ width: '0%' }}
              animate={{ width: canSkip ? '100%' : `${((5 - countdown) / 5) * 100}%` }}
              transition={{ ease: "linear", duration: 1 }}
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
            />
          </div>

          {/* Ad Creative Main Content Body */}
          <div className="relative w-full p-4 sm:p-6 bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 flex flex-col gap-5">
            {/* Sponsored Campaign Card */}
            <div 
              onClick={handleOpenAd}
              className="relative group overflow-hidden rounded-2xl border border-neutral-800 hover:border-neutral-700 bg-neutral-950/60 p-4 sm:p-6 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] cursor-pointer"
            >
              {/* Glow Accent */}
              <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />

              <div className="flex flex-col md:flex-row gap-5 items-center">
                {/* Media Hero Showcase */}
                <div className="relative w-full md:w-5/12 aspect-video md:aspect-[4/3] rounded-xl overflow-hidden shrink-0 bg-neutral-900 border border-neutral-800/80 shadow-md">
                  {config.bannerMediaType === 'gif_only' ? (
                    <img
                      src={campaign.gifUrl || campaign.thumbnail}
                      alt={campaign.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="eager"
                    />
                  ) : config.bannerMediaType !== 'classic' && campaign.videoUrl ? (
                    <video
                      key={campaign.id}
                      ref={(el) => {
                        if (el) {
                          el.muted = isMuted;
                          el.play().catch(() => {});
                        }
                      }}
                      autoPlay
                      loop
                      muted={isMuted}
                      playsInline
                      poster={campaign.gifUrl || campaign.thumbnail}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    >
                      <source src={campaign.videoUrl} type="video/mp4" />
                      <img
                        src={campaign.gifUrl || campaign.thumbnail}
                        alt={campaign.title}
                        className="w-full h-full object-cover"
                      />
                    </video>
                  ) : (
                    <img
                      src={campaign.thumbnail}
                      alt={campaign.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="eager"
                    />
                  )}

                  {/* Overlay Badges */}
                  <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-white/10">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{config.bannerMediaType === 'gif_only' ? 'GIF Ad' : config.bannerMediaType !== 'classic' ? 'Motion Ad' : 'HD Ad'}</span>
                  </div>

                  {config.bannerMediaType !== 'classic' && campaign.videoUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMuted(!isMuted);
                      }}
                      className="absolute bottom-2.5 right-2.5 bg-black/75 hover:bg-black text-white p-1.5 rounded-full transition-colors cursor-pointer"
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  )}
                </div>

                {/* Content & Value Proposition */}
                <div className="flex flex-col flex-1 min-w-0 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      {campaign.badge}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {campaign.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-lg sm:text-xl text-white group-hover:text-amber-400 transition-colors leading-snug">
                      {campaign.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-300 mt-1.5 line-clamp-2 leading-relaxed">
                      {campaign.tagline}
                    </p>
                  </div>

                  {/* Bullet Perks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                    {campaign.perks.map((perk, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-neutral-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{perk}</span>
                      </div>
                    ))}
                  </div>

                  {/* Rating & Advertiser details */}
                  <div className="flex items-center gap-2 pt-1 text-xs text-neutral-400">
                    <div className="flex items-center text-amber-400 font-bold gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{campaign.rating}</span>
                    </div>
                    <span>•</span>
                    <span>{campaign.reviews}</span>
                    <span>•</span>
                    <span className="text-neutral-400 truncate">{campaign.brand}</span>
                  </div>

                  {/* Action CTA Bar */}
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleOpenAd}
                      className={cn(
                        "py-2.5 px-5 rounded-xl font-extrabold text-xs text-white transition-all shadow-lg flex items-center gap-2 group-hover:shadow-amber-500/20 active:scale-95 cursor-pointer bg-gradient-to-r",
                        campaign.gradient
                      )}
                    >
                      <span>{campaign.ctaText}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-[11px] text-neutral-400 hidden sm:inline">
                      Click to open official sponsor site
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Adsterra Banner Slot / Tab */}
            {config.placements.watchSidebar.key && (
              <div className="border-t border-neutral-800/80 pt-3 flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-2 text-[11px] text-neutral-400 px-1">
                  <span className="uppercase font-semibold tracking-wider text-[10px] text-neutral-500">
                    Network Ad Unit (Adsterra 300x250)
                  </span>
                  <button 
                    onClick={() => setActiveTab(activeTab === 'adsterra' ? 'featured' : 'adsterra')}
                    className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 text-xs cursor-pointer"
                  >
                    <span>{activeTab === 'adsterra' ? 'Hide Banner Unit' : 'View Banner Unit'}</span>
                    <ChevronRight className={cn("w-3 h-3 transition-transform", activeTab === 'adsterra' && "rotate-90")} />
                  </button>
                </div>

                {activeTab === 'adsterra' && (
                  <div 
                    ref={bannerContainerRef}
                    className="w-[300px] h-[250px] bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden flex items-center justify-center my-2 shadow-inner"
                  >
                    <span className="text-xs text-neutral-500 animate-pulse">Loading Adsterra Banner...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Footer Info Bar */}
          <div className="px-5 py-3 bg-neutral-950/90 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
            <span className="truncate">
              Adsterra Verified Sponsor • Ads keep NestTube 100% free for everyone
            </span>
            <button
              onClick={handleSkipOrClose}
              className="text-neutral-300 hover:text-white font-medium hover:underline cursor-pointer shrink-0 ml-2"
            >
              {canSkip ? 'Continue to Video →' : `Waiting ${countdown}s`}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
