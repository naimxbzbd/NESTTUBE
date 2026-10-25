import React, { useState } from 'react';
import { Flame, Music, Film, Tv, Sparkles, Smile, Trophy } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { searchVideos } from '../services/youtube';
import { VideoCard } from '../components/video/VideoCard';
import { InfiniteScrollSentinel } from '../components/ui/InfiniteScrollSentinel';

export function Trending() {
  const [activeTab, setActiveTab] = useState('Natok');

  const tabs = [
    { name: 'Natok', label: '🎭 বাংলা নাটক', query: 'Bangla Natok 2026', icon: <Film className="w-4 h-4 text-[#ff2d6f]" /> },
    { name: 'Movies', label: '🎬 বাংলা সিনেমা', query: 'Bangla Full Movie', icon: <Flame className="w-4 h-4 text-amber-400" /> },
    { name: 'Music', label: '🎵 বাংলা গান', query: 'Bangla Hit Songs', icon: <Music className="w-4 h-4 text-purple-400" /> },
    { name: 'Comedy', label: '😂 কমেডি নাটক', query: 'Bangla Funny Comedy Natok', icon: <Smile className="w-4 h-4 text-emerald-400" /> },
    { name: 'Sports', label: '🏆 খেলাধুলা', query: 'Bangladesh Cricket Football Highlights', icon: <Trophy className="w-4 h-4 text-cyan-400" /> },
  ];

  const selectedTab = tabs.find((t) => t.name === activeTab) || tabs[0];

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['trending-feed', activeTab],
    queryFn: ({ pageParam = '' }) => searchVideos(selectedTab.query, 24, pageParam),
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage?.nextPageToken || undefined,
  });

  const videos = data?.pages.flatMap((page) => page.items || []) || [];

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto flex flex-col gap-6 text-white pb-bottom-nav bg-transparent">
      {/* Hero Banner with Deep Obsidian Glass & Radiant Aurora */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 flex items-center gap-5 border border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#ff9a1f] via-[#ff2d6f] to-[#c026d3] text-white flex items-center justify-center shadow-lg shadow-pink-500/25 shrink-0">
          <Flame className="w-9 h-9 sm:w-11 sm:h-11 fill-current" />
        </div>
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full glass-pill text-cyan-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>লাইভ ট্রেন্ডিং বিশ্লেষণ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            ট্রেন্ডিং <span className="text-aurora-gradient">বাংলা নাটক ও সিনেমা</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            বাংলাদেশের সর্বাধিক জনপ্রিয় ও আলোচিত নাটক, সিনেমা, গান এবং স্পোর্টস মুহূর্তগুলো আনলিমিটেড স্ক্রোল করুন।
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === tab.name
                ? 'bg-gradient-to-r from-[#ff2d6f] to-[#c026d3] text-white shadow-lg shadow-pink-500/25 border border-pink-400/40 scale-[1.02]'
                : 'glass-pill text-slate-300 hover:text-white'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Videos List */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 my-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`trend-skel-${i}`} className="flex flex-col gap-3 glass-card p-2.5 rounded-2xl">
              <div className="aspect-video w-full rounded-xl skeleton-aurora" />
              <div className="flex gap-2.5 px-0.5">
                <div className="w-9 h-9 rounded-full skeleton-aurora shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-4/5 rounded skeleton-aurora" />
                  <div className="h-3 w-1/2 rounded skeleton-aurora" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {videos.map((v: any, idx: number) => {
              const vid = typeof v.id === 'string' ? v.id : v.id?.videoId || String(idx);
              const uniqueKey = v.feedKey || `trend-${vid}-${idx}`;
              return (
                <VideoCard
                  key={uniqueKey}
                  id={vid}
                  title={v.snippet?.title || ''}
                  channelName={v.snippet?.channelTitle || ''}
                  channelId={v.snippet?.channelId}
                  views={v.statistics?.viewCount || '250K'}
                  publishedAt={v.snippet?.publishedAt}
                  duration={v.contentDetails?.duration || '35:20'}
                  thumbnailUrl={v.snippet?.thumbnails?.medium?.url || v.snippet?.thumbnails?.default?.url}
                />
              );
            })}
          </div>

          {/* Continuous Infinite Scroll Sentinel */}
          <InfiniteScrollSentinel
            onLoadMore={() => fetchNextPage()}
            hasMore={hasNextPage ?? true}
            isLoading={isFetchingNextPage}
            loadingText="আরও ট্রেন্ডিং ভিডিও লোড হচ্ছে..."
            skeletonVariant="video-grid"
            skeletonCount={4}
          />
        </>
      )}
    </div>
  );
}
