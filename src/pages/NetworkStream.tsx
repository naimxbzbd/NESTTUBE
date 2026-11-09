import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe,
  Radio,
  Play,
  Clipboard,
  Trash2,
  Sparkles,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle,
  Tv,
  Film,
  Layers,
  Cloud,
  HardDrive,
  RefreshCw,
  Plus,
  History,
  Clock,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  detectStreamType,
  saveCustomStream,
  getCustomStreams,
  deleteCustomStream,
  SavedNetworkStream,
  SAMPLE_STREAMS,
} from '../services/networkStreamService';
import {
  saveRecentStreamUrl,
  getRecentStreamUrls,
  deleteRecentStreamUrl,
  clearRecentStreamUrls,
  RecentStreamEntry,
} from '../services/indexedDbStorage';
import { M3uChannel, parseM3u } from '../services/m3uService';
import { HlsLivePlayer } from '../components/video/HlsLivePlayer';
import { MediaImage } from '../components/ui/MediaImage';
import { InfiniteScrollSentinel } from '../components/ui/InfiniteScrollSentinel';
import { AdContainer } from '../components/ads/AdContainer';
import { useAdsterra } from '../context/AdsterraContext';

const BATCH_SIZE = 20;

function formatRelativeTime(timestamp: number): string {
  if (!timestamp) return 'অজানা';
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'এইমাত্র';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} মি. আগে`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} ঘণ্টা আগে`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return 'গতকাল';
  if (diffDay < 7) return `${diffDay} দিন আগে`;
  return new Date(timestamp).toLocaleDateString('bn-BD');
}

export const NetworkStream: React.FC = () => {
  const { user } = useAuth();
  const { isPremium } = useAdsterra();

  // Input states
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [streamTitle, setStreamTitle] = useState<string>('');
  const [isSniffing, setIsSniffing] = useState<boolean>(false);
  const [detectedType, setDetectedType] = useState<'single' | 'm3u' | null>(null);

  // Active Playback State
  const [activeStreamUrl, setActiveStreamUrl] = useState<string>('');
  const [activeStreamTitle, setActiveStreamTitle] = useState<string>('');
  const [activeStreamType, setActiveStreamType] = useState<'single' | 'm3u'>('single');

  // M3U Playlist parsed channels
  const [playlistChannels, setPlaylistChannels] = useState<M3uChannel[]>([]);
  const [activeChannel, setActiveChannel] = useState<M3uChannel | null>(null);
  const [channelSearchQuery, setChannelSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Saved streams library
  const [savedStreams, setSavedStreams] = useState<SavedNetworkStream[]>([]);
  const [loadingSaved, setLoadingSaved] = useState<boolean>(true);
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);

  // Recent streams cached in IndexedDB (Last 10 URLs)
  const [recentStreams, setRecentStreams] = useState<RecentStreamEntry[]>([]);
  const [loadingRecent, setLoadingRecent] = useState<boolean>(true);

  // Load recent streams from IndexedDB
  const loadRecentStreams = async () => {
    setLoadingRecent(true);
    try {
      const data = await getRecentStreamUrls();
      setRecentStreams(data);
    } finally {
      setLoadingRecent(false);
    }
  };

  // Load saved streams on mount and when user auth changes
  const loadSavedStreams = async () => {
    setLoadingSaved(true);
    try {
      const data = await getCustomStreams(user?.uid);
      setSavedStreams(data);
    } finally {
      setLoadingSaved(false);
    }
  };

  useEffect(() => {
    loadSavedStreams();
    loadRecentStreams();
  }, [user?.uid]);

  const handleDeleteRecent = async (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    await deleteRecentStreamUrl(url);
    setRecentStreams((prev) => prev.filter((item) => item.url !== url));
  };

  const handleClearRecent = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await clearRecentStreamUrls();
    setRecentStreams([]);
  };

  // Handle URL change & sniffer
  const handleUrlChange = (val: string) => {
    setStreamUrl(val);
    const lower = val.toLowerCase().trim();
    if (lower.includes('.m3u') && !lower.includes('.m3u8')) {
      setDetectedType('m3u');
    } else if (lower.includes('.m3u8') || lower.includes('.mp4')) {
      setDetectedType('single');
    } else {
      setDetectedType(null);
    }
  };

  // Paste from clipboard
  const handlePaste = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          handleUrlChange(text);
          setPasteNotice('লিঙ্ক পেস্ট করা হয়েছে!');
          setTimeout(() => setPasteNotice(null), 2500);
        }
      }
    } catch {
      setPasteNotice('ক্লিপবোর্ড পারমিশন পাওয়া যায়নি।');
      setTimeout(() => setPasteNotice(null), 2500);
    }
  };

  // Start Playing Stream
  const handlePlayStream = async (overrideUrl?: string, overrideTitle?: string) => {
    const targetUrl = (overrideUrl || streamUrl).trim();
    if (!targetUrl) return;

    setIsSniffing(true);
    try {
      const { type, channels } = await detectStreamType(targetUrl);
      const computedTitle =
        overrideTitle ||
        streamTitle.trim() ||
        (type === 'm3u' ? 'কাস্টম M3U প্লেলিস্ট' : 'লাইভ নেটওয়ার্ক ফিড');

      setActiveStreamUrl(targetUrl);
      setActiveStreamTitle(computedTitle);
      setActiveStreamType(type);

      if (type === 'm3u' && channels && channels.length > 0) {
        setPlaylistChannels(channels);
        setActiveChannel(channels[0]);
        setVisibleCount(BATCH_SIZE);
      } else {
        setPlaylistChannels([]);
        setActiveChannel(null);
      }

      // Save to IndexedDB recent streams (caches last 10 input URLs)
      await saveRecentStreamUrl({
        url: targetUrl,
        title: computedTitle,
        type,
        channelCount: channels ? channels.length : 1,
      });
      loadRecentStreams();

      // Save to library
      const newStreamItem: SavedNetworkStream = {
        id: `stream-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: computedTitle,
        url: targetUrl,
        type,
        ownerUid: user?.uid,
        channelCount: channels ? channels.length : 1,
        lastPlayedAt: Date.now(),
        createdAt: Date.now(),
      };

      await saveCustomStream(newStreamItem, user?.uid);
      loadSavedStreams();

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSniffing(false);
    }
  };

  const handleDeleteSavedStream = async (e: React.MouseEvent, streamId: string) => {
    e.stopPropagation();
    await deleteCustomStream(streamId, user?.uid);
    setSavedStreams((prev) => prev.filter((s) => s.id !== streamId));
  };

  // Channel filtering for M3U playlist mode
  const filteredChannels = useMemo(() => {
    if (!channelSearchQuery.trim()) return playlistChannels;
    const q = channelSearchQuery.toLowerCase().trim();
    return playlistChannels.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q) ||
        (c.cleanName && c.cleanName.toLowerCase().includes(q))
    );
  }, [playlistChannels, channelSearchQuery]);

  const handleLoadMoreChannels = () => {
    if (isLoadingMore || visibleCount >= filteredChannels.length) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + BATCH_SIZE);
      setIsLoadingMore(false);
    }, 250);
  };

  return (
    <div className="min-h-screen bg-transparent text-white p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-bottom-nav">
      {/* Title & Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 text-xs font-bold mb-2 shadow-xs">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>সরাসরি নেটওয়ার্ক স্ট্রিমিং (Custom Network Stream)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <span className="text-brand-gradient">NestTube</span> <span className="text-aurora-gradient">নেটওয়ার্ক স্ট্রিম</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            যেকোনো লাইভ HLS (.m3u8), MP4 অথবা মাল্টি-চ্যানেল M3U প্লেলিস্ট URL পেস্ট করে দ্রুত ও বাফারিং ছাড়া উপভোগ করুন।
          </p>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center gap-2.5 glass-panel rounded-2xl px-4 py-2.5 text-xs">
          {user ? (
            <>
              <Cloud className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold text-white">ক্লাউড সিঙ্ক চালু</span>
                <p className="text-[10px] text-emerald-300/80">সব ডিভাইসে স্ট্রিম সংরক্ষিত থাকবে</p>
              </div>
            </>
          ) : (
            <>
              <HardDrive className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-semibold text-white">গেস্ট মোড (লোকাল)</span>
                <p className="text-[10px] text-amber-300/80">লগইন করলে সব ডিভাইসে সিঙ্ক হবে</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* URL Input Bar & Action Controls */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/10 space-y-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Main Stream URL Input */}
          <div className="relative flex-1">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <input
              type="url"
              value={streamUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePlayStream()}
              placeholder="https://example.com/live/stream.m3u8 বা M3U লিঙ্ক পেস্ট করুন..."
              className="w-full glass-input rounded-2xl pl-11 pr-24 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />

            {/* Quick Paste Button inside input */}
            <button
              onClick={handlePaste}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-cyan-300 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>পেস্ট</span>
            </button>
          </div>

          {/* Optional Title Input */}
          <div className="w-full sm:w-60">
            <input
              type="text"
              value={streamTitle}
              onChange={(e) => setStreamTitle(e.target.value)}
              placeholder="স্ট্রিমের নাম (ঐচ্ছিক)"
              className="w-full glass-input rounded-2xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
          </div>

          {/* Start Stream CTA */}
          <button
            onClick={() => handlePlayStream()}
            disabled={!streamUrl.trim() || isSniffing}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-[#ff2d6f] to-purple-600 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            {isSniffing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>লোড হচ্ছে...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>স্ট্রিম শুরু করুন</span>
              </>
            )}
          </button>
        </div>

        {/* Sniffer Badge & Feedback Note */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            {detectedType ? (
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                {detectedType === 'm3u' ? 'M3U মাল্টি-চ্যানেল প্লেলিস্ট ডিটেক্টেড' : 'সরাসরি HLS স্ট্রিম ডিটেক্টেড'}
              </span>
            ) : (
              <span>সমর্থিত ফরম্যাট: HLS (.m3u8), MP4, WebM এবং যেকোনো র M3U প্লেলিস্ট</span>
            )}
          </div>

          {pasteNotice && (
            <span className="text-emerald-400 text-xs font-semibold animate-in fade-in">
              {pasteNotice}
            </span>
          )}
        </div>

        {/* Recent Streams Cached in IndexedDB (Last 10 URLs) */}
        <div className="pt-3 border-t border-white/5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                সাম্প্রতিক স্ট্রিমসমূহ (Recent Streams)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 font-mono">
                {recentStreams.length}/10
              </span>
            </div>

            {recentStreams.length > 0 && (
              <button
                onClick={handleClearRecent}
                className="text-[10px] text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                title="সকল সাম্প্রতিক ইতিহাস মুছুন"
              >
                <Trash2 className="w-3 h-3" />
                <span>ইতিহাস মুছুন</span>
              </button>
            )}
          </div>

          {loadingRecent ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-2xl glass-card animate-pulse" />
              ))}
            </div>
          ) : recentStreams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {recentStreams.map((item, idx) => {
                const isSelected = activeStreamUrl === item.url;
                return (
                  <div
                    key={`recent-${item.url}-${idx}`}
                    onClick={() => {
                      setStreamUrl(item.url);
                      setStreamTitle(item.title);
                      handlePlayStream(item.url, item.title);
                    }}
                    className={`group relative p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-400 ring-2 ring-cyan-500/20 shadow-lg shadow-cyan-500/10'
                        : 'glass-card border-white/5 hover:border-cyan-400/40 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Play className="w-3 h-3 fill-cyan-400" />
                        </div>
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                          {item.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 font-bold uppercase tracking-wider">
                          {item.type === 'm3u' ? 'M3U' : 'LIVE'}
                        </span>
                        <button
                          onClick={(e) => handleDeleteRecent(e, item.url)}
                          className="p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 font-mono truncate mb-2">
                      {item.url}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-white/5">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-2.5 h-2.5 text-slate-500" />
                        {formatRelativeTime(item.updatedAt)}
                      </span>
                      <span className="text-cyan-400 group-hover:underline text-[10px] font-medium flex items-center gap-0.5">
                        চালান <Play className="w-2.5 h-2.5 fill-cyan-400" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-2.5 text-xs text-slate-400">
              <Clock className="w-4 h-4 text-slate-500 shrink-0" />
              <span>
                কোনো সাম্প্রতিক স্ট্রিম নেই — আপনি যেকোনো স্ট্রিম বা M3U লিঙ্ক দিয়ে চালানো শুরু করলে শেষ ১০টি স্ট্রিম এখানে স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকবে।
              </span>
            </div>
          )}
        </div>

        {/* Quick Sample Test Stream Buttons */}
        <div className="pt-2 border-t border-white/5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>কুইক টেস্ট স্ট্রিম (১-ক্লিকে চালিয়ে পরীক্ষা করুন):</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {SAMPLE_STREAMS.map((sample, idx) => (
              <button
                key={`sample-stream-${idx}`}
                onClick={() => {
                  setStreamUrl(sample.url);
                  setStreamTitle(sample.name);
                  handlePlayStream(sample.url, sample.name);
                }}
                className="px-3 py-1.5 rounded-xl glass-card border-white/10 hover:border-cyan-400/40 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 shrink-0 cursor-pointer group"
              >
                <Play className="w-3 h-3 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>{sample.name}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-slate-400 uppercase">
                  {sample.type}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Video Player View */}
      {activeStreamUrl && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Player Container */}
            <div className={`${activeStreamType === 'm3u' ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
              <HlsLivePlayer
                channel={{
                  id: activeChannel ? activeChannel.id : 'custom-network-stream',
                  name: activeChannel ? activeChannel.name : activeStreamTitle,
                  streamUrl: activeChannel ? (activeChannel.cleanUrl || activeChannel.streamUrl) : activeStreamUrl,
                  cleanUrl: activeChannel ? (activeChannel.cleanUrl || activeChannel.streamUrl) : activeStreamUrl,
                  logo: activeChannel?.logo,
                  group: activeChannel?.group || 'Network Stream',
                }}
                autoPlay={true}
                isLive={true}
              />

              {/* Active Stream Metadata Card */}
              <div className="p-4 md:p-5 glass-panel rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h2 className="text-lg font-bold text-white">
                      {activeChannel ? activeChannel.name : activeStreamTitle}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-600 text-white uppercase tracking-wider">
                      {activeStreamType === 'm3u' ? 'M3U PLAYLIST' : 'LIVE FEED'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate max-w-xl font-mono">
                    {activeChannel ? (activeChannel.cleanUrl || activeChannel.streamUrl) : activeStreamUrl}
                  </p>
                </div>

                <a
                  href={activeChannel ? (activeChannel.cleanUrl || activeChannel.streamUrl) : activeStreamUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl glass-pill text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 shrink-0 self-start md:self-auto cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>সরাসরি লিঙ্ক</span>
                </a>
              </div>
            </div>

            {/* M3U Playlist Quick Channel Switcher */}
            {activeStreamType === 'm3u' && playlistChannels.length > 0 && (
              <div className="glass-panel rounded-2xl p-4 flex flex-col h-[520px]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Tv className="w-4 h-4 text-cyan-400" />
                    <span>প্লেলিস্ট চ্যানেল তালিকা</span>
                  </h3>
                  <span className="text-xs text-cyan-400 font-mono font-bold">
                    {filteredChannels.length} টি
                  </span>
                </div>

                {/* Channel Search */}
                <div className="relative mb-3">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={channelSearchQuery}
                    onChange={(e) => setChannelSearchQuery(e.target.value)}
                    placeholder="চ্যানেলের নাম খুঁজুন..."
                    className="w-full glass-input rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                {/* Channel List */}
                <div className="overflow-y-auto space-y-2 pr-1 custom-scrollbar flex-1">
                  {filteredChannels.slice(0, 50).map((chan) => {
                    const isSelected = activeChannel?.id === chan.id;
                    return (
                      <button
                        key={`chan-quick-${chan.id}`}
                        onClick={() => {
                          setActiveChannel(chan);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-full p-2 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-400 shadow-md shadow-cyan-500/15'
                            : 'glass-card border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-black/50 shrink-0 p-0.5 border border-white/10">
                          <MediaImage
                            src={chan.logo}
                            alt={chan.name}
                            type="channel"
                            fallbackText={chan.name}
                            className="rounded"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-bold text-white truncate">{chan.name}</h5>
                          <p className="text-[10px] text-slate-400 truncate">{chan.group}</p>
                        </div>
                        {isSelected ? (
                          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                        ) : (
                          <Play className="w-3 h-3 text-slate-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* M3U Full Channels Grid (Batch loaded 20 at a time) */}
          {activeStreamType === 'm3u' && playlistChannels.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  <span>প্লেলিস্টের সকল চ্যানেল ({filteredChannels.length} টি)</span>
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {filteredChannels.slice(0, visibleCount).map((chan, idx) => {
                  const isSelected = activeChannel?.id === chan.id;
                  return (
                    <button
                      key={`grid-chan-${chan.id}-${idx}`}
                      onClick={() => {
                        setActiveChannel(chan);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`group p-3 rounded-2xl border text-center flex flex-col items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 ring-2 ring-cyan-500/30 shadow-xl'
                          : 'glass-card border-white/5 hover:border-white/20 hover:scale-[1.02]'
                      }`}
                    >
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden mb-2 p-1 bg-black/40 border border-white/10 flex items-center justify-center">
                        <MediaImage
                          src={chan.logo}
                          alt={chan.name}
                          type="channel"
                          fallbackText={chan.name}
                          className="rounded-lg group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="w-full">
                        <h4 className="text-xs font-bold text-white truncate">{chan.name}</h4>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{chan.group}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <InfiniteScrollSentinel
                onLoadMore={handleLoadMoreChannels}
                hasMore={visibleCount < filteredChannels.length}
                isLoading={isLoadingMore}
                loadingText="আরও চ্যানেল লোড হচ্ছে (২০টি করে)..."
                skeletonVariant="channel-grid"
                skeletonCount={6}
              />
            </div>
          )}
        </div>
      )}

      {/* Ads */}
      {!isPremium && (
        <div className="py-2">
          <AdContainer placement="watchBelowVideo" className="my-2" />
        </div>
      )}

      {/* Saved Network Streams Library Section */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              <span>সংরক্ষিত নেটওয়ার্ক স্ট্রিম তালিকা (Saved Streams Library)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              পূর্বে যোগ করা স্ট্রিমগুলো এক ক্লিকে সরাসরি পুনরায় চালু করুন
            </p>
          </div>
          <span className="text-xs text-cyan-400 font-mono font-bold">
            {savedStreams.length} টি সংরক্ষিত
          </span>
        </div>

        {loadingSaved ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl glass-card animate-pulse" />
            ))}
          </div>
        ) : savedStreams.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {savedStreams.map((item) => {
              const isActive = activeStreamUrl === item.url;
              return (
                <div
                  key={`saved-${item.id}`}
                  onClick={() => {
                    setStreamUrl(item.url);
                    setStreamTitle(item.title);
                    handlePlayStream(item.url, item.title);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                    isActive
                      ? 'bg-cyan-500/15 border-cyan-400 ring-2 ring-cyan-500/20 shadow-xl'
                      : 'glass-card border-white/10 hover:border-white/20 hover:scale-[1.01]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
                        {item.type === 'm3u' ? <Layers className="w-4 h-4" /> : <Radio className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.type === 'm3u' ? `${item.channelCount || 'মাল্টি'} চ্যানেল` : 'লাইভ ফিড'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteSavedStream(e, item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 font-mono truncate mb-3">
                    {item.url}
                  </p>

                  <div className="flex items-center justify-between text-[10px] pt-2 border-t border-white/5">
                    <span className="text-cyan-400 font-semibold flex items-center gap-1">
                      <Play className="w-3 h-3 fill-cyan-400" /> পুনরায় চালান
                    </span>
                    <span className="text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString('bn-BD')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-8 text-center">
            <Radio className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
            <h4 className="text-sm font-bold text-white mb-1">কোনো সংরক্ষিত স্ট্রিম নেই</h4>
            <p className="text-xs text-slate-400">
              উপরের ইনপুট বারে যেকোনো স্ট্রিম বা M3U লিঙ্ক দিয়ে চালানো শুরু করলে এখানে স্বয়ংক্রিয়ভাবে সংরক্ষিত হবে।
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
