import React, { useState, useEffect } from 'react';
import { Flame, Music, Gamepad2, Newspaper, Film, Radio, Sparkles } from 'lucide-react';
import { getVideos } from '../services/youtube';
import { VideoCard } from '../components/video/VideoCard';

export function Trending() {
  const [activeTab, setActiveTab] = useState('Now');
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const tabs = [
    { name: 'Now', categoryId: '', icon: <Flame className="w-4 h-4 text-amber-500" /> },
    { name: 'Music', categoryId: '10', icon: <Music className="w-4 h-4 text-purple-500" /> },
    { name: 'Gaming', categoryId: '20', icon: <Gamepad2 className="w-4 h-4 text-emerald-500" /> },
    { name: 'News', categoryId: '25', icon: <Newspaper className="w-4 h-4 text-blue-500" /> },
    { name: 'Movies', categoryId: '1', icon: <Film className="w-4 h-4 text-rose-500" /> },
  ];

  useEffect(() => {
    const fetchTrending = async () => {
      setIsLoading(true);
      try {
        const selected = tabs.find((t) => t.name === activeTab);
        const data = await getVideos(selected?.categoryId || '');
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
    <div className="p-4 lg:p-6 max-w-7xl mx-auto flex flex-col gap-6 text-neutral-900 dark:text-white transition-colors">
      
      {/* Hero Banner */}
      <div className="flex items-center gap-4 border-b border-neutral-200 dark:border-white/10 pb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
          <Flame className="w-9 h-9 fill-current" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Trending</h1>
          <p className="text-xs text-neutral-500 dark:text-white/60 mt-1">
            Discover the most popular and viral videos on YouTube today.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeTab === tab.name
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-md'
                : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10'
            }`}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      {/* Videos List */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
          {videos.map((v: any) => {
            const vid = typeof v.id === 'string' ? v.id : v.id?.videoId || String(Math.random());
            return (
              <VideoCard
                key={vid}
                id={vid}
                title={v.snippet?.title || ''}
                channelName={v.snippet?.channelTitle || ''}
                channelId={v.snippet?.channelId}
                views={v.statistics?.viewCount || '100K'}
                publishedAt={v.snippet?.publishedAt}
                duration={v.contentDetails?.duration || '10:00'}
                thumbnailUrl={v.snippet?.thumbnails?.medium?.url || v.snippet?.thumbnails?.default?.url}
              />
            );
          })}
        </div>
      )}

    </div>
  );
}
