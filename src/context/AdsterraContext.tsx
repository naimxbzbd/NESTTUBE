import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AdsterraConfig, getAdsterraConfig, saveAdsterraConfig, resetAdsterraConfig } from '../config/adsterra';
import { useUserStore } from '../store/useUserStore';

interface AdsterraContextType {
  config: AdsterraConfig;
  updateConfig: (newConfig: AdsterraConfig) => void;
  resetConfig: () => void;
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  // Interstitial trigger logic
  isInterstitialActive: boolean;
  pendingNavigationPath: string | null;
  triggerInterstitialIfNeeded: (targetPath?: string) => boolean;
  closeInterstitial: () => void;
  // Popunder trigger
  isPopunderModalOpen: boolean;
  triggerPopunder: () => void;
  closePopunderModal: () => void;
  // Throttling and Counters
  videoWatchCount: number;
  incrementWatchCount: () => void;
  clicksSinceLastInterstitial: number;
  interstitialsShownInSession: number;
  resetSessionAdStats: () => void;
  // Premium Ad-Free State
  isPremium: boolean;
  togglePremium: () => void;
  isPremiumModalOpen: boolean;
  openPremiumModal: () => void;
  closePremiumModal: () => void;
}

const AdsterraContext = createContext<AdsterraContextType | undefined>(undefined);

export const AdsterraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isPremium, togglePremium } = useUserStore();
  const [config, setConfig] = useState<AdsterraConfig>(getAdsterraConfig);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInterstitialActive, setIsInterstitialActive] = useState(false);
  const [pendingNavigationPath, setPendingNavigationPath] = useState<string | null>(null);
  const [lastInterstitialTime, setLastInterstitialTime] = useState<number>(0);
  const [videoWatchCount, setVideoWatchCount] = useState<number>(0);
  const [clicksSinceLastInterstitial, setClicksSinceLastInterstitial] = useState<number>(0);
  const [interstitialsShownInSession, setInterstitialsShownInSession] = useState<number>(0);
  const [hasPopunderFired, setHasPopunderFired] = useState<boolean>(false);
  const [isPopunderModalOpen, setIsPopunderModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  const openPremiumModal = useCallback(() => setIsPremiumModalOpen(true), []);
  const closePremiumModal = useCallback(() => setIsPremiumModalOpen(false), []);

  useEffect(() => {
    const handleConfigUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<AdsterraConfig>;
      if (customEvent.detail) {
        setConfig(customEvent.detail);
      } else {
        setConfig(getAdsterraConfig());
      }
    };

    window.addEventListener('adsterra-config-updated', handleConfigUpdate);
    return () => window.removeEventListener('adsterra-config-updated', handleConfigUpdate);
  }, []);

  useEffect(() => {
    // Ensure any residual social bar script or elements are removed
    const socialScript = document.getElementById('adsterra-socialbar-script');
    if (socialScript) {
      socialScript.remove();
    }
  }, []);

  const updateConfig = useCallback((newConfig: AdsterraConfig) => {
    setConfig(newConfig);
    saveAdsterraConfig(newConfig);
  }, []);

  const resetConfigHandler = useCallback(() => {
    const defaultConfig = resetAdsterraConfig();
    setConfig(defaultConfig);
  }, []);

  const openSettings = useCallback(() => setIsSettingsOpen(true), []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

  const incrementWatchCount = useCallback(() => {
    setVideoWatchCount((prev) => prev + 1);
  }, []);

  const triggerPopunder = useCallback(() => {
    if (isPremium || !config.enabled || !config.popunder.enabled) return;
    if (isInterstitialActive) return; // Prevent popunder if interstitial popup is active
    setIsPopunderModalOpen(true);
  }, [isPremium, config, isInterstitialActive]);

  const closePopunderModal = useCallback(() => {
    setIsPopunderModalOpen(false);
  }, []);

  const resetSessionAdStats = useCallback(() => {
    setClicksSinceLastInterstitial(0);
    setInterstitialsShownInSession(0);
    setLastInterstitialTime(0);
  }, []);

  const triggerInterstitialIfNeeded = useCallback((targetPath?: string): boolean => {
    if (isPremium || !config.enabled || !config.interstitial.enabled) {
      return false;
    }

    // Check optional maximum ads per session cap
    const maxPerSession = config.interstitial.maxPerSession ?? 0;
    if (maxPerSession > 0 && interstitialsShownInSession >= maxPerSession) {
      return false;
    }

    const now = Date.now();
    const cooldownMs = Math.max(5, config.interstitial.cooldownSeconds || 30) * 1000;
    const isCooldownPassed = lastInterstitialTime === 0 || (now - lastInterstitialTime >= cooldownMs);

    const targetInterval = Math.max(1, config.interstitial.showAfterVideosCount || 2);
    const nextClicks = clicksSinceLastInterstitial + 1;
    setClicksSinceLastInterstitial(nextClicks);

    const isStrict = config.interstitial.throttleStrict ?? true;
    const isIntervalReached = nextClicks >= targetInterval;

    let shouldTrigger = false;
    if (isStrict) {
      // Strict throttling: must satisfy BOTH the click interval and the cooldown
      shouldTrigger = isIntervalReached && isCooldownPassed;
    } else {
      // Loose mode: trigger on target interval or if targetInterval is 1 on every cooldown pass
      if (targetInterval === 1) {
        shouldTrigger = isCooldownPassed;
      } else {
        shouldTrigger = isIntervalReached && isCooldownPassed;
      }
    }

    if (shouldTrigger) {
      setIsPopunderModalOpen(false); // Ensure only a single popup page is displayed
      setIsInterstitialActive(true);
      setPendingNavigationPath(targetPath || null);
      setLastInterstitialTime(now);
      setClicksSinceLastInterstitial(0);
      setInterstitialsShownInSession((prev) => prev + 1);
      return true;
    }
    return false;
  }, [
    isPremium,
    config,
    lastInterstitialTime,
    clicksSinceLastInterstitial,
    interstitialsShownInSession,
  ]);

  const closeInterstitial = useCallback(() => {
    setIsInterstitialActive(false);
  }, []);

  return (
    <AdsterraContext.Provider
      value={{
        config,
        updateConfig,
        resetConfig: resetConfigHandler,
        isSettingsOpen,
        openSettings,
        closeSettings,
        isInterstitialActive,
        pendingNavigationPath,
        triggerInterstitialIfNeeded,
        closeInterstitial,
        isPopunderModalOpen,
        triggerPopunder,
        closePopunderModal,
        videoWatchCount,
        incrementWatchCount,
        clicksSinceLastInterstitial,
        interstitialsShownInSession,
        resetSessionAdStats,
        isPremium,
        togglePremium,
        isPremiumModalOpen,
        openPremiumModal,
        closePremiumModal,
      }}
    >
      {children}
    </AdsterraContext.Provider>
  );
};

export const useAdsterra = () => {
  const context = useContext(AdsterraContext);
  if (!context) {
    throw new Error('useAdsterra must be used within an AdsterraProvider');
  }
  return context;
};
