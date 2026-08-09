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
  // Counters
  videoWatchCount: number;
  incrementWatchCount: () => void;
  // Premium Ad-Free State
  isPremium: boolean;
  togglePremium: () => void;
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
  const [hasPopunderFired, setHasPopunderFired] = useState<boolean>(false);
  const [isPopunderModalOpen, setIsPopunderModalOpen] = useState(false);

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
    // Pop-under background script completely disabled as per requirements.
    // It will now only trigger as an in-page floating modal on navigation.
  }, [isPremium, config.enabled, config.popunder.enabled, config.simulationMode]);

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
    setIsPopunderModalOpen(true);
  }, [isPremium, config]);

  const closePopunderModal = useCallback(() => {
    setIsPopunderModalOpen(false);
  }, []);

  const triggerInterstitialIfNeeded = useCallback((targetPath?: string): boolean => {
    // We now use this floating modal for the pop-under functionality as requested
    if (isPremium || !config.enabled || !config.popunder.enabled) {
      return false;
    }

    const now = Date.now();
    const cooldownMs = (config.interstitial.cooldownSeconds || 30) * 1000;
    const isCooldownPassed = now - lastInterstitialTime >= cooldownMs;

    const nextWatchCount = videoWatchCount + 1;
    const isThresholdReached = nextWatchCount % (config.interstitial.showAfterVideosCount || 2) === 0;

    if (isCooldownPassed && (isThresholdReached || config.interstitial.triggerOnWatchClick)) {
      setIsInterstitialActive(true);
      setPendingNavigationPath(targetPath || null);
      setLastInterstitialTime(now);
      return true;
    }

    return false;
  }, [isPremium, config, lastInterstitialTime, videoWatchCount]);

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
        isPremium,
        togglePremium,
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
