import React, { useState } from 'react';
import { X, Save, RotateCcw, Megaphone, Zap, Key, ExternalLink, Check, AlertCircle, Info, Sparkles, ShieldCheck } from 'lucide-react';
import { useAdsterra } from '../../context/AdsterraContext';
import { AdsterraConfig } from '../../config/adsterra';

export const AdSettingsModal: React.FC = () => {
  const { isSettingsOpen, closeSettings, config, updateConfig, resetConfig, isPremium, togglePremium } = useAdsterra();
  const [formData, setFormData] = useState<AdsterraConfig>(config);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync form state when modal opens
  React.useEffect(() => {
    setFormData(config);
  }, [config, isSettingsOpen]);

  if (!isSettingsOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      closeSettings();
    }, 1200);
  };

  const handleReset = () => {
    resetConfig();
    setFormData(config);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white leading-tight">
                Adsterra Monetization Manager
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Configure your Adsterra Zone IDs, Banners & Interstitials
              </p>
            </div>
          </div>

          <button
            onClick={closeSettings}
            className="p-1.5 hover:bg-neutral-200 dark:hover:bg-white/10 rounded-full text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-sm text-neutral-800 dark:text-neutral-200">
          
          {/* Premium Ad-Free Setting Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-purple-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-neutral-900 dark:text-white">NESTTube Premium (Ad-Free)</span>
                  {isPremium && (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-500 text-white tracking-wider">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5">
                  When enabled, all Adsterra banners, native feed ads, interstitials, social bars, and popunders are completely hidden. Must redeem a coupon in your account menu.
                </p>
              </div>
            </div>

            <button
              type="button"
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all opacity-75 cursor-not-allowed shrink-0 ${
                isPremium
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white'
              }`}
            >
              {isPremium ? 'Ad-Free Enabled' : 'Apply Coupon'}
            </button>
          </div>

          {/* Global Toggles */}
          <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-sm block">Enable All Ads</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Master switch to enable or pause monetization across NESTTube.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            <hr className="border-neutral-200 dark:border-white/10" />

            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-sm block text-amber-600 dark:text-amber-400">
                  Simulation / Demo Ad Mode
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Displays polished NESTTube fallback ads when test keys are active or script is blocked.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.simulationMode}
                onChange={(e) => setFormData({ ...formData, simulationMode: e.target.checked })}
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            <hr className="border-neutral-200 dark:border-white/10" />

            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-sm block text-emerald-600 dark:text-emerald-400">
                  Allow Adult / 18+ Ads
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Currently turned OFF. Uncheck to filter out adult and sensitive ad content globally.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.allowAdultAds ?? false}
                onChange={(e) => setFormData({ ...formData, allowAdultAds: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Ad Placements Configuration */}
          <div className="space-y-4">
            <h4 className="font-bold text-xs uppercase text-neutral-400 tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-blue-500" />
              <span>Adsterra Zone Keys & Placements</span>
            </h4>

            {/* Header Banner */}
            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-neutral-900 dark:text-white">
                  Header Leaderboard Banner (728x90 / 468x60)
                </span>
                <input
                  type="checkbox"
                  checked={formData.placements.headerBanner.enabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      placements: {
                        ...formData.placements,
                        headerBanner: { ...formData.placements.headerBanner, enabled: e.target.checked },
                      },
                    })
                  }
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>
              <input
                type="text"
                placeholder="Adsterra Zone Key (e.g. 728x90_key)"
                value={formData.placements.headerBanner.key}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    placements: {
                      ...formData.placements,
                      headerBanner: { ...formData.placements.headerBanner, key: e.target.value },
                    },
                  })
                }
                className="w-full px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs outline-none focus:border-blue-500"
              />
            </div>

            {/* Watch Sidebar Ad */}
            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-neutral-900 dark:text-white">
                  Watch Page Sidebar Ad (300x250)
                </span>
                <input
                  type="checkbox"
                  checked={formData.placements.watchSidebar.enabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      placements: {
                        ...formData.placements,
                        watchSidebar: { ...formData.placements.watchSidebar, enabled: e.target.checked },
                      },
                    })
                  }
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>
              <input
                type="text"
                placeholder="Adsterra 300x250 Zone Key"
                value={formData.placements.watchSidebar.key}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    placements: {
                      ...formData.placements,
                      watchSidebar: { ...formData.placements.watchSidebar, key: e.target.value },
                    },
                  })
                }
                className="w-full px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs outline-none focus:border-blue-500"
              />
            </div>

            {/* Watch Below Video */}
            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-neutral-900 dark:text-white">
                  Watch Page Below Video Banner (728x90)
                </span>
                <input
                  type="checkbox"
                  checked={formData.placements.watchBelowVideo.enabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      placements: {
                        ...formData.placements,
                        watchBelowVideo: { ...formData.placements.watchBelowVideo, enabled: e.target.checked },
                      },
                    })
                  }
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>
              <input
                type="text"
                placeholder="Adsterra 728x90 Zone Key"
                value={formData.placements.watchBelowVideo.key}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    placements: {
                      ...formData.placements,
                      watchBelowVideo: { ...formData.placements.watchBelowVideo, key: e.target.value },
                    },
                  })
                }
                className="w-full px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs outline-none focus:border-blue-500"
              />
            </div>

            {/* In-Feed Native Ad */}
            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-neutral-900 dark:text-white">
                  Home Feed Native Cards
                </span>
                <input
                  type="checkbox"
                  checked={formData.placements.homeFeedNative.enabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      placements: {
                        ...formData.placements,
                        homeFeedNative: { ...formData.placements.homeFeedNative, enabled: e.target.checked },
                      },
                    })
                  }
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>
              <input
                type="text"
                placeholder="Native Adsterra Key"
                value={formData.placements.homeFeedNative.key}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    placements: {
                      ...formData.placements,
                      homeFeedNative: { ...formData.placements.homeFeedNative, key: e.target.value },
                    },
                  })
                }
                className="w-full px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs outline-none focus:border-blue-500"
              />
            </div>

            {/* Interstitial & Smartlink */}
            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-neutral-900 dark:text-white">
                  Interstitial Transition Ads & Smartlink URL
                </span>
                <input
                  type="checkbox"
                  checked={formData.interstitial.enabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      interstitial: { ...formData.interstitial, enabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>
              <input
                type="text"
                placeholder="Smartlink Direct URL (e.g. https://www.effectivecpmgate.com/...)"
                value={formData.interstitial.smartLinkUrl || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    interstitial: { ...formData.interstitial, smartLinkUrl: e.target.value },
                  })
                }
                className="w-full px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs outline-none focus:border-blue-500"
              />
              <div className="flex items-center justify-between text-xs text-neutral-500 pt-1">
                <span>Cooldown (seconds):</span>
                <input
                  type="number"
                  value={formData.interstitial.cooldownSeconds}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      interstitial: {
                        ...formData.interstitial,
                        cooldownSeconds: parseInt(e.target.value) || 30,
                      },
                    })
                  }
                  className="w-20 px-2 py-1 bg-white dark:bg-neutral-800 border rounded text-xs text-center"
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-2xl flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-300">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              Your settings are saved locally in your browser. Enter your real Adsterra Zone Keys from your Adsterra Publisher Dashboard to go live!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeSettings}
                className="px-4 py-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-white/10 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
