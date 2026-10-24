import React, { useState, useEffect } from 'react';
import { Flame, Music, Film, Tv, Sparkles, Smile, Trophy } from 'lucide-react';
import { getVideos, searchVideos } from '../services/youtube';
import { VideoCard } from '../components/video/VideoCard';
import { CURATED_PIPRA_VIDEOS } from '../services/pipraCatalog';

export function Trending() {
  const [activeTab, setActiveTab] = useState('Natok');
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const tabs = [
    { name: 'Natok', label: '🎭 বাংলা নাটক', query: 'Bangla Natok 2026', icon: <Film className="w-4 h-4 text-[#ff2d6f]" /> },
    { name: 'Movies', label: '🎬 বাংলা সিনেমা', query: 'Bangla Full Movie', icon: <Flame className="w-4 h-4 text-amber-500" /> },
    { name: 'Music', label: '🎵 বাংলা গান', query: 'Bangla Hit Songs', icon: <Music className="w-4 h-4 text-purple-400" /> },
    { name: 'Comedy', label: '😂 কমেডি নাটক', query: 'Bangla Funny Comedy Natok', icon: <Smile className="w-4 h-4 text-emerald-400" /> },
    { name: 'Sports', label: '🏆 খেলাধুলা', query: 'Bangladesh Cricket Football Highlights', icon: <Trophy className="w-4 h-4 text-blue-400" /> },
  ];

  useEffect(() => {
    const fetchTrending = async () => {
      setIsLoading(true);
      try {
        const selected = tabs.find((t) => t.name === activeTab) || tabs[0];
        const data = await searchVideos(selected.query, 24);
        setVideos(data.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrending();
  }, [activeTab]);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto flex flex-col gap-6 text-white pb-bottom-nav">
      {/* Hero Banner */}
      <div className="flex items-center gap-4 border-b border-white/10 pb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#ff9a1f] via-[#ff2d6f] to-[#c026d3] text-white flex items-center justify-center shadow-lg shadow-pink-500/20 shrink-0">
          <Flame className="w-9 h-9 fill-current" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            ট্রেন্ডিং বাংলা নাটক ও সিনেমা (Trending)
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            বাংলাদেশের সর্বাধিক জনপ্রিয় ও আলোচিত নাটক, সিনেমা ও গান এক নজরে।
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeTab === tab.name
                ? 'bg-gradient-to-r from-[#ff2d6f] to-[#c026d3] text-white shadow-lg shadow-pink-500/20 scale-[1.02]'
                : 'bg-[#121824] border border-white/5 text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Videos List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-8 h-8 border-3 border-[#ff2d6f] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
          {videos.map((v: any, idx: number) => {
            const vid = typeof v.id === 'string' ? v.id : v.id?.videoId || String(idx);
            return (
              <VideoCard
                key={`trending-${vid}-${idx}`}
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
      )}
    </div>
  );
}
