export interface AdPlacementConfig {
  enabled: boolean;
  format: '728x90' | '468x60' | '300x250' | '160x600' | 'native' | 'social-bar' | 'interstitial';
  key: string; // Adsterra Zone ID / Key
  width?: number;
  height?: number;
}

export interface InterstitialConfig {
  enabled: boolean;
  key: string;
  smartLinkUrl?: string;
  cooldownSeconds: number; // Minimum time between interstitials in seconds
  triggerOnWatchClick: boolean; // Trigger when user clicks to watch a video
  showAfterVideosCount: number; // Trigger every N video views
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

export interface AdsterraConfig {
  enabled: boolean;
  allowAdultAds: boolean; // Set to false to disable adult / 18+ ads
  simulationMode: boolean; // Shows sleek sponsored fallback ads if true or if no valid key is provided
  publisherId: string;
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
  allowAdultAds: false, // Default: Adult ads strictly turned off
  simulationMode: false,
  publisherId: 'adsterra-publisher',
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
  },
  popunder: {
    enabled: true,
    smartLinkUrl: 'https://pl30753698.effectivecpmnetwork.com/ae/f9/21/aef921faf99a1886dd69aeebe25360d1.js',
    key: 'popunder_live_key',
    triggerOnFirstClick: true,
  },
  socialBar: {
    enabled: false,
    key: 'a9e3bd5d92edf03e7a2106e5243a4490',
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
