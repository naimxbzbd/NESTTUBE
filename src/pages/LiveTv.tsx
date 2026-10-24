import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BANGLA_LIVE_CHANNELS, LIVE_CATEGORIES, LiveTvChannel } from '../services/liveTvData';
import { Tv, Radio, Users, Share2, Sparkles, AlertCircle, Play } from 'lucide-react';
import { AdContainer } from '../components/ads/AdContainer';
import { useAdsterra } from '../context/AdsterraContext';

export const LiveTv: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const channelParam = searchParams.get('channel');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Find initially selected channel or default to first
  const initialChannel = BANGLA_LIVE_CHANNELS.find((c) => c.id === channelParam) || BANGLA_LIVE_CHANNELS[0];
  const [activeChannel, setActiveChannel] = useState<LiveTvChannel>(initialChannel);
  const [copied, setCopied] = useState(false);
  const { isPremium } = useAdsterra();

  useEffect(() => {
    if (channelParam) {
      const found = BANGLA_LIVE_CHANNELS.find((c) => c.id === channelParam);
      if (found) setActiveChannel(found);
    }
  }, [channelParam]);

  const handleSelectChannel = (channel: LiveTvChannel) => {
    setActiveChannel(channel);
    setSearchParams({ channel: channel.id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredChannels = selectedCategory === 'all'
    ? BANGLA_LIVE_CHANNELS
    : BANGLA_LIVE_CHANNELS.filter((c) => c.category === selectedCategory);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f15] text-white p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 pb-bottom-nav">
      {/* Title & Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>২৪/৭ সরাসরি সম্প্রচার (Live Broadcast)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <span className="text-brand-gradient">PipraTube</span> লাইভ টিভি
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            বাংলাদেশের শীর্ষস্থানীয় সংবাদ, নাটক, সিনেমা ও খেলাধুলার স্যাটেলাইট চ্যানেল দেখুন ফ্রিতে।
          </p>
        </div>

        {/* Total Channels Stat */}
        <div className="flex items-center gap-3 bg-[#121824] border border-white/10 rounded-2xl px-4 py-2.5 self-start md:self-auto">
          <Tv className="w-5 h-5 text-[#ff2d6f]" />
          <div>
            <div className="text-xs text-gray-400">মোট লাইভ চ্যানেল</div>
            <div className="text-base font-bold text-white font-mono">{BANGLA_LIVE_CHANNELS.length} টি চ্যানেল</div>
          </div>
        </div>
      </div>

      {/* Main Live Player Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Video Player */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activeChannel.liveVideoId}?autoplay=1&mute=0&rel=0&playsinline=1`}
              title={`${activeChannel.name} Live Stream`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Player Metadata & Controls */}
          <div className="p-4 md:p-5 bg-[#121824] rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={activeChannel.logo}
                alt={activeChannel.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-xl object-cover border border-white/10 shadow-md"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-white">
                    {activeChannel.banglaName} ({activeChannel.name})
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    LIVE
                  </span>
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-3">
                  <span className="text-pink-400 font-semibold">{activeChannel.currentShow}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono text-gray-300">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    {activeChannel.viewers} দর্শক দেখছেন
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                onClick={handleShare}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 flex items-center gap-1.5 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>{copied ? 'কপি হয়েছে!' : 'শেয়ার করুন'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Quick Channel Switcher Sidebar */}
        <div className="bg-[#121824] border border-white/10 rounded-2xl p-4 flex flex-col h-[520px]">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#ff2d6f]" />
              অন্যান্য লাইভ চ্যানেল
            </span>
            <span className="text-xs text-gray-400">{filteredChannels.length} টি</span>
          </h3>

          <div className="overflow-y-auto space-y-2 pr-1 custom-scrollbar flex-1">
            {filteredChannels.map((channel) => {
              const isActive = activeChannel.id === channel.id;
              return (
                <button
                  key={channel.id}
                  onClick={() => handleSelectChannel(channel)}
                  className={`w-full p-2.5 rounded-xl border flex items-center gap-3 text-left transition-all ${
                    isActive
                      ? 'bg-pink-500/15 border-[#ff2d6f] shadow-lg shadow-pink-500/10'
                      : 'bg-[#161d27] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-black/40">
                    <img
                      src={channel.logo}
                      alt={channel.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1 px-1 rounded text-[8px] font-bold bg-red-600 text-white">
                      LIVE
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate flex items-center justify-between">
                      <span>{channel.banglaName}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{channel.viewers}</span>
                    </div>
                    <div className="text-[11px] text-gray-400 truncate mt-0.5">
                      {channel.currentShow}
                    </div>
                  </div>

                  {isActive ? (
                    <div className="w-2 h-2 rounded-full bg-[#ff2d6f] animate-pulse shrink-0" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Adsterra Banner Container */}
      {!isPremium && (
        <div className="py-2">
          <AdContainer placement="watchBelowVideo" className="my-2" />
        </div>
      )}

      {/* All Channels Grid by Category */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            সকল টিভি চ্যানেল ব্রাউজ করুন
          </h2>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {LIVE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-[#ff2d6f] to-[#c026d3] text-white shadow-md shadow-pink-500/20'
                    : 'bg-[#161d27] text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Channel Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {filteredChannels.map((channel) => {
            const isActive = activeChannel.id === channel.id;
            return (
              <button
                key={channel.id}
                onClick={() => handleSelectChannel(channel)}
                className={`group relative p-3 rounded-2xl border text-center flex flex-col items-center justify-between transition-all ${
                  isActive
                    ? 'bg-gradient-to-b from-[#1c2436] to-[#121824] border-[#ff2d6f] ring-2 ring-pink-500/30'
                    : 'bg-[#121824] border-white/5 hover:border-white/20 hover:scale-[1.02]'
                }`}
              >
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden mb-2.5 p-1 bg-white/5 border border-white/10">
                  <img
                    src={channel.logo}
                    alt={channel.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                </div>

                <div className="w-full">
                  <h4 className="text-xs font-bold text-white truncate">{channel.banglaName}</h4>
                  <p className="text-[11px] text-gray-400 truncate">{channel.name}</p>
                </div>

                <div className="mt-2 text-[10px] text-pink-400 font-mono font-semibold flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{channel.viewers}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
