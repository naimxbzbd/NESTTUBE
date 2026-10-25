import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Tv,
  Radio,
  Share2,
  Sparkles,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Play,
  Layers,
  Filter,
} from 'lucide-react';
import {
  fetchM3uPlaylist,
  M3uChannel,
  getCategoryBanglaLabel,
  M3U_PLAYLIST_URL,
} from '../services/m3uService';
import { HlsLivePlayer } from '../components/video/HlsLivePlayer';
import { AdContainer } from '../components/ads/AdContainer';
import { useAdsterra } from '../context/AdsterraContext';
import { InfiniteScrollSentinel } from '../components/ui/InfiniteScrollSentinel';

export const LiveTv: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const channelParam = searchParams.get('channel');

  const [channels, setChannels] = useState<M3uChannel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeChannel, setActiveChannel] = useState<M3uChannel | null>(null);
  const [copied, setCopied] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number>(36);
  const [isChannelLoadingMore, setIsChannelLoadingMore] = useState<boolean>(false);

  const { isPremium } = useAdsterra();

  const handleLoadMoreChannels = () => {
    if (isChannelLoadingMore) return;
    setIsChannelLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 24);
      setIsChannelLoadingMore(false);
    }, 350);
  };

  // Load playlist from raw M3U URL
  const loadPlaylist = async (force = false) => {
    if (force) setIsRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchM3uPlaylist(force);
      setChannels(data);

      if (data.length > 0) {
        // Set active channel from search param or default to first channel
        const matched = channelParam ? data.find((c) => c.id === channelParam) : null;
        setActiveChannel(matched || data[0]);
      }
    } catch (err) {
      console.error('Error loading M3U channels:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadPlaylist();
  }, []);

  // Update active channel when searchParam changes
  useEffect(() => {
    if (channelParam && channels.length > 0) {
      const found = channels.find((c) => c.id === channelParam);
      if (found && found.id !== activeChannel?.id) {
        setActiveChannel(found);
      }
    }
  }, [channelParam, channels]);

  // Extract unique categories and calculate counts
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    channels.forEach((c) => {
      const g = c.group || 'Other';
      map.set(g, (map.get(g) || 0) + 1);
    });

    const list: { id: string; name: string; bangla: string; count: number }[] = [
      { id: 'all', name: 'All Channels', bangla: 'সব টিভি চ্যানেল', count: channels.length },
    ];

    // Priority ordering for popular categories
    const priority = ['Bangladeshi', 'Sports', 'Indian Bangla', 'Music', 'Kids', 'Islamic', 'Documentary', 'Indian Hindi', 'Indian News'];
    
    // Add priority categories first
    priority.forEach((p) => {
      if (map.has(p)) {
        list.push({
          id: p,
          name: p,
          bangla: getCategoryBanglaLabel(p),
          count: map.get(p) || 0,
        });
        map.delete(p);
      }
    });

    // Add remaining categories
    map.forEach((count, cat) => {
      list.push({
        id: cat,
        name: cat,
        bangla: getCategoryBanglaLabel(cat),
        count,
      });
    });

    return list;
  }, [channels]);

  // Filter channels based on selected category & search query
  const filteredChannels = useMemo(() => {
    let result = channels;

    if (selectedCategory !== 'all') {
      result = result.filter((c) => c.group === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.group.toLowerCase().includes(q) ||
          (c.cleanName && c.cleanName.toLowerCase().includes(q))
      );
    }

    return result;
  }, [channels, selectedCategory, searchQuery]);

  const handleSelectChannel = (channel: M3uChannel) => {
    setActiveChannel(channel);
    setSearchParams({ channel: channel.id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Channel surfing next / previous
  const currentIndex = activeChannel
    ? channels.findIndex((c) => c.id === activeChannel.id)
    : -1;

  const handleNextChannel = () => {
    if (channels.length === 0) return;
    const nextIdx = (currentIndex + 1) % channels.length;
    handleSelectChannel(channels[nextIdx]);
  };

  const handlePrevChannel = () => {
    if (channels.length === 0) return;
    const prevIdx = (currentIndex - 1 + channels.length) % channels.length;
    handleSelectChannel(channels[prevIdx]);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-bottom-nav">
      {/* Title & Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/25 text-xs font-bold mb-2 shadow-xs">
            <Radio className="w-3.5 h-3.5 animate-pulse text-red-400" />
            <span>২৪/৭ সরাসরি লাইভ টিভি (Live Broadcast)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <span className="text-brand-gradient">NestTube</span> <span className="text-aurora-gradient">লাইভ টিভি</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            বাংলাদেশ, ভারত এবং বিশ্বসেরা স্পোর্টস ও বিনোদন চ্যানেল সরাসরি দেখুন কোনো ঝামেলা ছাড়াই।
          </p>
        </div>

        {/* Total Channels & Refresh Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadPlaylist(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2.5 glass-card rounded-2xl text-xs font-medium text-slate-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
            title="প্লেলিস্ট রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-4 h-4 text-[#ff2d6f] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'আপডেট হচ্ছে...' : 'প্লেলিস্ট রিফ্রেশ'}</span>
          </button>

          <div className="flex items-center gap-3 glass-panel rounded-2xl px-4 py-2.5">
            <Tv className="w-5 h-5 text-cyan-400 animate-pulse" />
            <div>
              <div className="text-[11px] text-slate-400">মোট চ্যানেল</div>
              <div className="text-base font-bold text-white font-mono">
                {channels.length > 0 ? `${channels.length} টি চ্যানেল` : 'লোড হচ্ছে...'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Live Player & Quick Switcher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Video Player */}
        <div className="lg:col-span-2 space-y-4">
          {activeChannel ? (
            <HlsLivePlayer
              key={activeChannel.id}
              channel={activeChannel}
              autoPlay={true}
              onNextChannel={handleNextChannel}
            />
          ) : (
            <div className="aspect-video w-full glass-panel rounded-2xl flex flex-col items-center justify-center p-6 text-center">
              <Tv className="w-12 h-12 text-slate-500 mb-3 animate-pulse" />
              <p className="text-sm text-slate-400">চ্যানেল লোড করা হচ্ছে...</p>
            </div>
          )}

          {/* Active Channel Details Bar */}
          {activeChannel && (
            <div className="p-4 md:p-5 glass-panel rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0 p-1 shadow-inner">
                  <img
                    src={activeChannel.logo}
                    alt={activeChannel.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h2 className="text-lg font-bold text-white truncate">
                      {activeChannel.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white uppercase tracking-wider flex items-center gap-1 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      LIVE
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium glass-pill text-cyan-300">
                      {getCategoryBanglaLabel(activeChannel.group)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span className="text-slate-300">XBZ Prime TV লাইভ ব্রডকাস্ট</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-mono text-[11px]">HD কোয়ালিটি</span>
                  </div>
                </div>
              </div>

              {/* Channel Controls (Prev, Next, Share) */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                <button
                  onClick={handlePrevChannel}
                  className="p-2.5 rounded-xl glass-pill text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="পূর্ববর্তী চ্যানেল"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextChannel}
                  className="p-2.5 rounded-xl glass-pill text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="পরবর্তী চ্যানেল"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleShare}
                  className="px-3.5 py-2.5 rounded-xl glass-pill text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copied ? 'কপি হয়েছে!' : 'শেয়ার করুন'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Quick Channel Switcher Sidebar */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col h-[520px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#ff2d6f] animate-pulse" />
              <span>লাইভ চ্যানেল তালিকা</span>
            </h3>
            <span className="text-xs text-cyan-400 font-mono font-bold">{filteredChannels.length} টি</span>
          </div>

          {/* Search within sidebar */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="চ্যানেলের নাম লিখুন..."
              className="w-full glass-input rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Channel list */}
          <div className="overflow-y-auto space-y-2 pr-1 custom-scrollbar flex-1">
            {filteredChannels.length > 0 ? (
              filteredChannels.map((channel) => {
                const isActive = activeChannel?.id === channel.id;
                return (
                  <button
                    key={`quick-${channel.id}`}
                    onClick={() => handleSelectChannel(channel)}
                    className={`w-full p-2.5 rounded-xl border flex items-center gap-3 text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-pink-500/20 border-[#ff2d6f] shadow-lg shadow-pink-500/15'
                        : 'glass-card border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="relative w-11 h-11 shrink-0 rounded-lg overflow-hidden bg-black/50 p-0.5 border border-white/10">
                      <img
                        src={channel.logo}
                        alt={channel.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute top-0.5 left-0.5 px-1 rounded text-[7px] font-bold bg-red-600 text-white">
                        LIVE
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate flex items-center justify-between">
                        <span>{channel.name}</span>
                      </div>
                      <div className="text-[10px] text-cyan-400/90 truncate mt-0.5 font-medium">
                        {channel.group}
                      </div>
                    </div>

                    {isActive ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff2d6f] animate-pulse shrink-0" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                কোনো চ্যানেল পাওয়া যায়নি
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Adsterra Banner Container */}
      {!isPremium && (
        <div className="py-2">
          <AdContainer placement="watchBelowVideo" className="my-2" />
        </div>
      )}

      {/* Browse All Channels Section */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="text-aurora-gradient font-extrabold">ক্যাটাগরি অনুযায়ী সকল টিভি চ্যানেল</span>
          </h2>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="যেকোনো চ্যানেল খুঁজুন..."
              className="w-full glass-input rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setVisibleCount(36);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-[#ff2d6f] to-[#c026d3] text-white shadow-lg shadow-pink-500/25 border border-pink-400/40 scale-[1.02]'
                  : 'glass-pill text-slate-300 hover:text-white'
              }`}
            >
              <span>{cat.bangla}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  selectedCategory === cat.id ? 'bg-white/20 text-white font-bold' : 'bg-white/10 text-slate-400'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Channels Grid with Continuous Infinite Scroll */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={`chan-init-skel-${i}`}
                className="p-4 rounded-2xl glass-card flex flex-col items-center space-y-3"
              >
                <div className="w-16 h-16 rounded-xl skeleton-aurora" />
                <div className="w-20 h-3 rounded skeleton-aurora" />
                <div className="w-14 h-2.5 rounded skeleton-aurora" />
              </div>
            ))}
          </div>
        ) : filteredChannels.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
              {filteredChannels.slice(0, visibleCount).map((channel, idx) => {
                const isActive = activeChannel?.id === channel.id;
                return (
                  <button
                    key={`chan-card-${channel.id}-${idx}`}
                    onClick={() => handleSelectChannel(channel)}
                    className={`group relative p-3 rounded-2xl border text-center flex flex-col items-center justify-between transition-all cursor-pointer ${
                      isActive
                        ? 'bg-pink-500/20 border-[#ff2d6f] ring-2 ring-pink-500/30 shadow-xl shadow-pink-500/15 scale-[1.02]'
                        : 'glass-card border-white/5 hover:border-white/20 hover:scale-[1.02]'
                    }`}
                  >
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden mb-2.5 p-1.5 bg-black/40 border border-white/10 flex items-center justify-center shadow-inner">
                      <img
                        src={channel.logo}
                        alt={channel.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                        className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    </div>

                    <div className="w-full">
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                        {channel.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                        {channel.group}
                      </p>
                    </div>

                    <div className="mt-2 text-[10px] text-pink-400 font-semibold flex items-center gap-1">
                      <Radio className="w-3 h-3" />
                      <span>সরাসরি দেখুন</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Unlimited Channel Infinite Scroll Sentinel */}
            <InfiniteScrollSentinel
              onLoadMore={handleLoadMoreChannels}
              hasMore={true}
              isLoading={isChannelLoadingMore}
              loadingText="আরও লাইভ টিভি চ্যানেল লোড হচ্ছে..."
              skeletonVariant="channel-grid"
              skeletonCount={6}
            />
          </>
        ) : (
          <div className="glass-panel rounded-2xl p-12 text-center">
            <Filter className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">কোনো চ্যানেল পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-400">
              অনুগ্রহ করে অন্য কোনো ফিল্টার বা অনুসন্ধান শব্দ চেষ্টা করুন।
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
