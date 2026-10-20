import React, { useState } from 'react';
import { 
  X, 
  Save, 
  RotateCcw, 
  Megaphone, 
  Zap, 
  Key, 
  ExternalLink, 
  Check, 
  AlertCircle, 
  Info, 
  Sparkles, 
  ShieldCheck,
  Gauge,
  Sliders,
  Clock,
  Shield,
  Activity,
  RefreshCw,
  SlidersHorizontal,
  Layers,
  HeartHandshake,
  Film
} from 'lucide-react';
import { useAdsterra } from '../../context/AdsterraContext';
import { 
  AdsterraConfig, 
  INTERSTITIAL_THROTTLE_PRESETS, 
  InterstitialThrottlePreset 
} from '../../config/adsterra';
import { cn } from '../../lib/utils';

export const AdSettingsModal: React.FC = () => {
  const { 
    isSettingsOpen, 
    closeSettings, 
    config, 
    updateConfig, 
    resetConfig, 
    isPremium, 
    togglePremium,
    clicksSinceLastInterstitial,
    interstitialsShownInSession,
    resetSessionAdStats
  } = useAdsterra();
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
                  When enabled, all Adsterra banners, native feed ads, interstitials, and popunders are completely hidden. Must redeem a coupon in your account menu.
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

            {/* Banner Ad Creative Media Format (Video / GIF vs Static) */}
            <div className="p-4 rounded-2xl border border-cyan-500/25 bg-cyan-500/5 dark:bg-cyan-950/20 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                    <Film className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-neutral-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                      <span>Banner Creative Media: Video & GIF Ads</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        Exact Dimensions Preserved
                      </span>
                    </span>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Plays high-engagement looping video & animated GIF ads strictly inside standard card bounds (728x90, 300x250) without resizing.
                    </p>
                  </div>
                </div>

                {/* Switch button */}
                <div className="flex items-center gap-1 bg-neutral-200/80 dark:bg-neutral-800 p-1 rounded-xl shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, bannerMediaType: 'video_gif' })}
                    className={cn(
                      "px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1",
                      formData.bannerMediaType === 'video_gif' || !formData.bannerMediaType
                        ? "bg-cyan-500 text-white shadow-sm"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                    )}
                  >
                    <Film className="w-3 h-3" />
                    <span>Video & GIF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, bannerMediaType: 'gif_only' })}
                    className={cn(
                      "px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1",
                      formData.bannerMediaType === 'gif_only'
                        ? "bg-purple-600 text-white shadow-sm"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                    )}
                  >
                    <span>GIF Ads</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, bannerMediaType: 'classic' })}
                    className={cn(
                      "px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1",
                      formData.bannerMediaType === 'classic'
                        ? "bg-neutral-700 text-white shadow-sm"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                    )}
                  >
                    <span>Static</span>
                  </button>
                </div>
              </div>
            </div>

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

            {/* Interstitial & Smartlink with UX Frequency Throttling */}
            <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/70 space-y-4">
              {/* Header with Master Switch */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                    <Gauge className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-neutral-900 dark:text-white block">
                      Interstitial Ads & Frequency Throttling
                    </span>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Throttle transition ads on video clicks to protect viewer retention and prevent ad fatigue
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.interstitial.enabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      interstitial: { ...formData.interstitial, enabled: e.target.checked },
                    })
                  }
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer mt-0.5"
                />
              </div>

              {formData.interstitial.enabled && (
                <div className="space-y-4 pt-1">
                  {/* SmartLink Direct URL Input */}
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 block mb-1">
                      Smartlink / Direct Link URL
                    </label>
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
                      className="w-full px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs outline-none focus:border-blue-500 font-mono text-[11px]"
                    />
                  </div>

                  {/* Frequency Throttling Presets */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
                        UX Frequency Throttling Presets
                      </span>
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                        Select Mode
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(Object.keys(INTERSTITIAL_THROTTLE_PRESETS) as Array<Exclude<InterstitialThrottlePreset, 'custom'>>).map((presetKey) => {
                        const preset = INTERSTITIAL_THROTTLE_PRESETS[presetKey];
                        const isSelected = 
                          (formData.interstitial.frequencyThrottle === presetKey) ||
                          (formData.interstitial.showAfterVideosCount === preset.showAfterVideosCount &&
                           formData.interstitial.cooldownSeconds === preset.cooldownSeconds);

                        return (
                          <button
                            key={presetKey}
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                interstitial: {
                                  ...formData.interstitial,
                                  frequencyThrottle: presetKey,
                                  showAfterVideosCount: preset.showAfterVideosCount,
                                  cooldownSeconds: preset.cooldownSeconds,
                                  throttleStrict: preset.throttleStrict,
                                },
                              });
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                              isSelected
                                ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 shadow-sm'
                                : 'bg-white dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className={`text-xs font-bold ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-900 dark:text-white'}`}>
                                  {preset.name}
                                </span>
                                {isSelected && (
                                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                )}
                              </div>
                              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-tight">
                                {preset.description}
                              </p>
                            </div>
                            <div className="mt-2 pt-1 border-t border-neutral-100 dark:border-white/5 flex items-center justify-between text-[10px] font-semibold">
                              <span className="text-neutral-600 dark:text-neutral-300">
                                1 in {preset.showAfterVideosCount} vids
                              </span>
                              <span className="text-neutral-400 font-mono">
                                {preset.cooldownSeconds}s
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fine-Tuning Frequency Controls */}
                  <div className="p-3 bg-white dark:bg-neutral-800/80 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-3.5">
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
                      Custom Throttling Fine-Tuning
                    </span>

                    {/* Show After Every N Videos */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-purple-500" />
                          <span>Video Interval (Show ad every N video clicks):</span>
                        </span>
                        <div className="flex items-center gap-1.5 font-bold text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800">
                          <span>Every {formData.interstitial.showAfterVideosCount || 2} {Number(formData.interstitial.showAfterVideosCount) === 1 ? 'Video' : 'Videos'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="1"
                          value={formData.interstitial.showAfterVideosCount || 2}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              interstitial: {
                                ...formData.interstitial,
                                frequencyThrottle: 'custom',
                                showAfterVideosCount: parseInt(e.target.value) || 1,
                              },
                            })
                          }
                          className="flex-1 accent-blue-600 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg cursor-pointer"
                        />
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                interstitial: {
                                  ...formData.interstitial,
                                  frequencyThrottle: 'custom',
                                  showAfterVideosCount: Math.max(1, (formData.interstitial.showAfterVideosCount || 2) - 1),
                                },
                              })
                            }
                            className="w-6 h-6 rounded bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-xs font-bold flex items-center justify-center cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-bold text-xs font-mono">
                            {formData.interstitial.showAfterVideosCount || 2}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                interstitial: {
                                  ...formData.interstitial,
                                  frequencyThrottle: 'custom',
                                  showAfterVideosCount: Math.min(10, (formData.interstitial.showAfterVideosCount || 2) + 1),
                                },
                              })
                            }
                            className="w-6 h-6 rounded bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-xs font-bold flex items-center justify-center cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-neutral-500">
                        Higher numbers mean fewer ads and a much smoother viewing experience.
                      </p>
                    </div>

                    {/* Cooldown Seconds */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>Minimum Cooldown Between Ads:</span>
                        </span>
                        <div className="flex items-center gap-1 font-bold text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800">
                          <span>{formData.interstitial.cooldownSeconds || 30} seconds</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="10"
                          max="180"
                          step="5"
                          value={formData.interstitial.cooldownSeconds || 30}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              interstitial: {
                                ...formData.interstitial,
                                frequencyThrottle: 'custom',
                                cooldownSeconds: parseInt(e.target.value) || 30,
                              },
                            })
                          }
                          className="flex-1 accent-amber-500 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg cursor-pointer"
                        />
                        <input
                          type="number"
                          min="5"
                          max="600"
                          value={formData.interstitial.cooldownSeconds || 30}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              interstitial: {
                                ...formData.interstitial,
                                frequencyThrottle: 'custom',
                                cooldownSeconds: parseInt(e.target.value) || 30,
                              },
                            })
                          }
                          className="w-16 px-1.5 py-1 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded text-xs text-center font-mono font-bold"
                        />
                      </div>

                      {/* Quick cooldown chips */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-neutral-400">Quick set:</span>
                        {[15, 30, 60, 120].map((sec) => (
                          <button
                            key={sec}
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                interstitial: {
                                  ...formData.interstitial,
                                  frequencyThrottle: 'custom',
                                  cooldownSeconds: sec,
                                },
                              })
                            }
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border transition-all cursor-pointer ${
                              formData.interstitial.cooldownSeconds === sec
                                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                                : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-600 hover:bg-neutral-200'
                            }`}
                          >
                            {sec}s
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Strict Throttle Mode */}
                    <div className="pt-2 border-t border-neutral-100 dark:border-neutral-700/60 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-semibold text-neutral-900 dark:text-white block">
                          Strict UX Throttling
                        </span>
                        <p className="text-[10px] text-neutral-500">
                          Requires both the video count interval AND the cooldown timer before triggering another interstitial
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.interstitial.throttleStrict ?? true}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            interstitial: {
                              ...formData.interstitial,
                              throttleStrict: e.target.checked,
                            },
                          })
                        }
                        className="w-4 h-4 accent-blue-600 rounded cursor-pointer shrink-0"
                      />
                    </div>

                    {/* Session Ad Cap */}
                    <div className="pt-2 border-t border-neutral-100 dark:border-neutral-700/60 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-semibold text-neutral-900 dark:text-white block">
                          Session Limit (Max Interstitials per visit)
                        </span>
                        <p className="text-[10px] text-neutral-500">
                          Set a maximum number of interstitials a user can see in a single session (0 = unlimited)
                        </p>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={formData.interstitial.maxPerSession ?? 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            interstitial: {
                              ...formData.interstitial,
                              maxPerSession: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-16 px-1.5 py-1 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded text-xs text-center font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* UX Impact Health Meter */}
                  {(() => {
                    const count = formData.interstitial.showAfterVideosCount || 2;
                    const cd = formData.interstitial.cooldownSeconds || 30;
                    const isHighUX = count >= 3 || cd >= 60;
                    const isBalanced = count === 2 && cd >= 25;

                    return (
                      <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                        isHighUX
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                          : isBalanced
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300'
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300'
                      }`}>
                        {isHighUX ? (
                          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                        ) : isBalanced ? (
                          <HeartHandshake className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                        ) : (
                          <Zap className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                        )}
                        <div className="space-y-0.5 text-xs">
                          <span className="font-bold block">
                            {isHighUX
                              ? '🍃 High User Experience (Recommended for retention)'
                              : isBalanced
                              ? '⚖️ Balanced User Experience'
                              : '⚡ High Ad Frequency (Maximum Monetization)'}
                          </span>
                          <p className="text-[11px] opacity-90 leading-relaxed">
                            Active Rule: Shows at most once every <strong className="underline">{count} {count === 1 ? 'video' : 'videos'}</strong> with a minimum <strong className="underline">{cd}s</strong> cooldown between ads{formData.interstitial.maxPerSession ? ` (Capped at ${formData.interstitial.maxPerSession} ads per session)` : ''}.
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Live Session Diagnostics Bar */}
                  <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-blue-500" />
                        <span>Session Ads: <strong className="text-neutral-900 dark:text-white">{interstitialsShownInSession}</strong></span>
                      </div>
                      <div className="text-neutral-300 dark:text-neutral-700">•</div>
                      <div>
                        <span>Clicks since last ad: <strong className="text-neutral-900 dark:text-white">{clicksSinceLastInterstitial} / {formData.interstitial.showAfterVideosCount || 2}</strong></span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={resetSessionAdStats}
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                      title="Reset current session clicks and count"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reset Stats</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Popunder Floating Card Settings */}
            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-neutral-900 dark:text-white">
                  Popunder Corner Modal & Direct Link URL
                </span>
                <input
                  type="checkbox"
                  checked={formData.popunder.enabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      popunder: { ...formData.popunder, enabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>
              <input
                type="text"
                placeholder="Popunder Smartlink Direct URL (e.g. https://www.profitablecpmrate.com/...)"
                value={formData.popunder.smartLinkUrl || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    popunder: { ...formData.popunder, smartLinkUrl: e.target.value },
                  })
                }
                className="w-full px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs outline-none focus:border-blue-500"
              />
              <p className="text-[11px] text-neutral-500">
                Direct Links open automatically when users click &ldquo;Claim Offer&rdquo; on the sponsored ad card.
              </p>
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
