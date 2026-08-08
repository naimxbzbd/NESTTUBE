import React, { useState, useEffect } from 'react';
import { History, Trash2, Search, ArrowUpDown, Pause, Play, X, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getWatchHistory, clearWatchHistory, removeFromWatchHistory, HistoryItem } from '../lib/watchHistory';
import { formatPublishedAt, formatViewCount } from '../lib/formatters';
import { handleThumbnailError } from '../lib/utils';

export function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setHistory(getWatchHistory());
  }, []);

  const handleClearAll = () => {
    clearWatchHistory();
    setHistory([]);
  };

  const handleRemoveItem = (id: string) => {
    removeFromWatchHistory(id);
    setHistory(getWatchHistory());
  };

  const filteredHistory = history
    .filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.channelName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === 'recent') {
        return (b.watchedAt || 0) - (a.watchedAt || 0);
      } else {
        return (a.watchedAt || 0) - (b.watchedAt || 0);
      }
    });

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 text-neutral-900 dark:text-white transition-colors">
      
      {/* Main Column - History List */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <History className="w-7 h-7 text-red-600" />
            <h1 className="text-2xl font-bold tracking-tight">Watch History</h1>
            <span className="text-xs px-2.5 py-1 bg-neutral-100 dark:bg-white/10 rounded-full font-semibold">
              {filteredHistory.length} videos
            </span>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center bg-neutral-50 dark:bg-white/5 rounded-2xl border border-neutral-200 dark:border-white/10 flex flex-col items-center justify-center gap-3">
            <History className="w-12 h-12 text-neutral-400 dark:text-white/40" />
            <h3 className="text-lg font-bold">No watch history found</h3>
            <p className="text-xs text-neutral-500 dark:text-white/60">
              {searchQuery ? `No videos matching "${searchQuery}"` : 'Videos you watch will show up here.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row gap-4 p-3 rounded-2xl hover:bg-neutral-100 dark:hover:bg-white/5 border border-transparent hover:border-neutral-200 dark:hover:border-white/10 transition-all group relative"
              >
                {/* Thumbnail */}
                <Link to={`/watch/${item.id}`} className="w-full sm:w-56 aspect-video rounded-xl overflow-hidden shrink-0 bg-neutral-800 relative block">
                  {item.thumbnailUrl && (
                    <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" onError={handleThumbnailError} />
                  )}
                  {item.duration && (
                    <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {item.duration}
                    </span>
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1 flex flex-col gap-1 pr-8">
                  <Link to={`/watch/${item.id}`} className="font-bold text-base line-clamp-2 hover:text-blue-500 transition-colors">
                    {item.title}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-white/60">
                    <span className="font-semibold text-neutral-800 dark:text-white/90">{item.channelName}</span>
                    <span>•</span>
                    <span>{formatViewCount(item.views)} views</span>
                  </div>
                  <span className="text-[11px] text-neutral-400 dark:text-white/40 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Watched {item.watchedAt ? new Date(item.watchedAt).toLocaleDateString() : 'recently'}
                  </span>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-red-500/10 text-neutral-400 hover:text-red-500 transition-colors"
                  title="Remove from watch history"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar Controls */}
      <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
        {/* Search in History */}
        <div className="flex items-center bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-full px-3 py-2 text-xs">
          <Search className="w-4 h-4 text-neutral-400 dark:text-white/50 mr-2" />
          <input
            type="text"
            placeholder="Search watch history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none flex-1 text-neutral-900 dark:text-white"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-neutral-200 dark:hover:bg-white/10 rounded-full">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Order */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <ArrowUpDown className="w-4 h-4 text-blue-500" /> Sort Order
            </span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'recent' | 'oldest')}
              className="bg-neutral-200 dark:bg-white/10 px-2 py-1 rounded-lg outline-none cursor-pointer text-xs"
            >
              <option value="recent" className="bg-white dark:bg-[#212121]">Recently Watched</option>
              <option value="oldest" className="bg-white dark:bg-[#212121]">Oldest</option>
            </select>
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-neutral-200 dark:hover:bg-white/10 text-xs font-semibold transition-colors text-left"
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-500" /> : <Pause className="w-4 h-4 text-amber-500" />}
            <span>{isPaused ? 'Turn on watch history' : 'Pause watch history'}</span>
          </button>

          <button
            onClick={handleClearAll}
            disabled={history.length === 0}
            className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-red-500/10 text-red-500 text-xs font-semibold transition-colors disabled:opacity-50 text-left"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear all watch history</span>
          </button>
        </div>
      </div>

    </div>
  );
}
