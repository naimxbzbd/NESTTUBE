export interface AdPlacementConfig {
  enabled: boolean;
  format: '728x90' | '468x60' | '300x250' | '160x600' | 'native' | 'social-bar' | 'interstitial';
  key: string; // Adsterra Zone ID / Key
  width?: number;
  height?: number;
}

export type InterstitialThrottlePreset = 'aggressive' | 'balanced' | 'relaxed' | 'minimal' | 'custom';

export const INTERSTITIAL_THROTTLE_PRESETS: Record<
  Exclude<InterstitialThrottlePreset, 'custom'>,
  {
    name: string;
    description: string;
    showAfterVideosCount: number;
    cooldownSeconds: number;
    throttleStrict: boolean;
    badge: string;
    color: string;
  }
> = {
  aggressive: {
    name: 'Aggressive',
    description: 'High frequency — triggers on every video with a fast 15s cooldown',
    showAfterVideosCount: 1,
    cooldownSeconds: 15,
    throttleStrict: false,
    badge: 'High Monetization',
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/30',
  },
  balanced: {
    name: 'Balanced',
    description: 'Standard balance — triggers once every 2 videos with a 30s cooldown',
    showAfterVideosCount: 2,
    cooldownSeconds: 30,
    throttleStrict: true,
    badge: 'Recommended',
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
  },
  relaxed: {
    name: 'Relaxed (High UX)',
    description: 'User-friendly — limits ads to once every 3 videos and 60s cooldown',
    showAfterVideosCount: 3,
    cooldownSeconds: 60,
    throttleStrict: true,
    badge: 'High User Retention',
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
  },
  minimal: {
    name: 'Minimal Interruption',
    description: 'Ultra light — triggers only once every 5 videos with a 2-minute cooldown',
    showAfterVideosCount: 5,
    cooldownSeconds: 120,
    throttleStrict: true,
    badge: 'Maximum UX',
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
  },
};

export interface InterstitialConfig {
  enabled: boolean;
  key: string;
  smartLinkUrl?: string;
  cooldownSeconds: number; // Minimum time between interstitials in seconds
  triggerOnWatchClick: boolean; // Trigger when user clicks to watch a video
  showAfterVideosCount: number; // Trigger every N video views
  frequencyThrottle?: InterstitialThrottlePreset; // Throttle frequency mode
  throttleStrict?: boolean; // When true, both count and cooldown interval must be satisfied
  maxPerSession?: number; // Max ads per user session (0 = unlimited)
}

export interface PopunderConfig {
  enabled: boolean;
  smartLinkUrl: string;
  key: string;
  triggerOnFirstClick: boolean;
}

export interface SocialBarConfig {
  enabled: boolean;
  key: string;
  position: 'bottom-right' | 'bottom-center' | 'bottom-left';
}

export type BannerMediaType = 'video_gif' | 'gif_only' | 'classic';

export interface AdsterraConfig {
  enabled: boolean;
  allowAdultAds: boolean; // Set to false to disable adult / 18+ ads
  simulationMode: boolean; // Shows sleek sponsored fallback ads if true or if no valid key is provided
  publisherId: string;
  bannerMediaType?: BannerMediaType; // Support looping video / animated GIF in banners
  placements: {
    headerBanner: AdPlacementConfig;
    homeFeedNative: AdPlacementConfig;
    watchSidebar: AdPlacementConfig;
    watchBelowVideo: AdPlacementConfig;
  };
  interstitial: InterstitialConfig;
  popunder: PopunderConfig;
  socialBar: SocialBarConfig;
}

export const DEFAULT_ADSTERRA_CONFIG: AdsterraConfig = {
  enabled: true,
  allowAdultAds: true, // Enabled
  simulationMode: false,
  publisherId: 'adsterra-publisher',
  bannerMediaType: 'video_gif',
  placements: {
    headerBanner: {
      enabled: true,
      format: '728x90',
      key: 'db598ba68e8016b24923e193cccc2a32',
      width: 728,
      height: 90,
    },
    homeFeedNative: {
      enabled: true,
      format: 'native',
      key: '38dfd65646bd181737e236178823161a',
    },
    watchSidebar: {
      enabled: true,
      format: '300x250',
      key: '39d58d0dded1f717197d4d4c45ddeff9',
      width: 300,
      height: 250,
    },
    watchBelowVideo: {
      enabled: true,
      format: '728x90',
      key: 'db598ba68e8016b24923e193cccc2a32',
      width: 728,
      height: 90,
    },
  },
  interstitial: {
    enabled: true,
    key: 'interstitial_live_key',
    smartLinkUrl: 'https://pl30753698.effectivecpmnetwork.com/ae/f9/21/aef921faf99a1886dd69aeebe25360d1.js',
    cooldownSeconds: 30,
    triggerOnWatchClick: true,
    showAfterVideosCount: 2,
    frequencyThrottle: 'balanced',
    throttleStrict: true,
    maxPerSession: 0,
  },
  popunder: {
    enabled: true,
    smartLinkUrl: 'https://pl30753698.effectivecpmnetwork.com/ae/f9/21/aef921faf99a1886dd69aeebe25360d1.js',
    key: 'popunder_live_key',
    triggerOnFirstClick: true,
  },
  socialBar: {
    enabled: false,
    key: '',
    position: 'bottom-right',
  },
};

const STORAGE_KEY = 'nesttube_adsterra_config_v1';

export function getAdsterraConfig(): AdsterraConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_ADSTERRA_CONFIG,
        ...parsed,
        bannerMediaType: (parsed.bannerMediaType as BannerMediaType) || 'video_gif',
        placements: {
          ...DEFAULT_ADSTERRA_CONFIG.placements,
          ...(parsed.placements || {}),
        },
        interstitial: {
          ...DEFAULT_ADSTERRA_CONFIG.interstitial,
          ...(parsed.interstitial || {}),
        },
        popunder: {
          ...DEFAULT_ADSTERRA_CONFIG.popunder,
          ...(parsed.popunder || {}),
        },
        socialBar: {
          ...DEFAULT_ADSTERRA_CONFIG.socialBar,
          ...(parsed.socialBar || {}),
          enabled: false,
        },
      };
    }
  } catch (e) {
    console.warn('Failed to load Adsterra config from localStorage', e);
  }
  return DEFAULT_ADSTERRA_CONFIG;
}

export function saveAdsterraConfig(config: AdsterraConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('adsterra-config-updated', { detail: config }));
  } catch (e) {
    console.error('Failed to save Adsterra config', e);
  }
}

export function resetAdsterraConfig(): AdsterraConfig {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('adsterra-config-updated', { detail: DEFAULT_ADSTERRA_CONFIG }));
  } catch (e) {
    console.error('Failed to reset Adsterra config', e);
  }
  return DEFAULT_ADSTERRA_CONFIG;
}
