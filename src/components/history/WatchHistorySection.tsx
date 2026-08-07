import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { History, Trash2, X, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { getWatchHistory, clearWatchHistory, removeFromWatchHistory, HistoryItem } from '../../lib/watchHistory';
import { formatDuration, formatPublishedAt, formatViewCount } from '../../lib/formatters';

export function WatchHistorySection() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadHistory = () => {
      setHistory(getWatchHistory());
    };
    loadHistory();

    window.addEventListener('nesttube_watch_history_updated', loadHistory);
    return () => {
      window.removeEventListener('nesttube_watch_history_updated', loadHistory);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const amount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  if (history.length === 0) return null;

  const sortedHistory = [...history].sort((a, b) => {
    if (sortOrder === 'recent') {
      return (b.watchedAt || 0) - (a.watchedAt || 0);
    } else {
      return (a.watchedAt || 0) - (b.watchedAt || 0);
    }
  });

  return (
    <div className="mb-8 border-b border-neutral-200 dark:border-white/10 pb-6 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">Watch History</h2>
          <span className="text-xs text-neutral-500 dark:text-white/50 font-normal">({history.length})</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-full px-3 py-1.5 text-xs text-neutral-700 dark:text-white/80">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500 dark:text-white/50 shrink-0" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'recent' | 'oldest')}
              className="bg-transparent text-xs font-semibold outline-none cursor-pointer text-neutral-800 dark:text-white pr-1"
            >
              <option value="recent" className="bg-white dark:bg-[#1f1f1f] text-neutral-800 dark:text-white">Recently Watched</option>
              <option value="oldest" className="bg-white dark:bg-[#1f1f1f] text-neutral-800 dark:text-white">Oldest</option>
            </select>
          </div>

          <button
            onClick={() => clearWatchHistory()}
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-white/60 hover:text-red-500 dark:hover:text-red-400 bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors"
            title="Clear all watch history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear History
          </button>
        </div>
      </div>

      <div className="relative group">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 dark:bg-black/80 hover:bg-white dark:hover:bg-black text-neutral-800 dark:text-white hidden group-hover:flex items-center justify-center border border-neutral-200 dark:border-white/10 shadow-lg transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1"
        >
          {sortedHistory.map((item) => (
            <div
              key={item.id}
              className="w-56 shrink-0 flex flex-col gap-2 group/card relative"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-100 dark:bg-white/5">
                <Link to={`/watch/${item.id}`} className="block w-full h-full">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-200 dark:bg-neutral-800" />
                  )}
                  {item.duration && (
                    <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {formatDuration(item.duration)}
                    </div>
                  )}
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeFromWatchHistory(item.id);
                  }}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 hover:bg-red-600 text-white opacity-0 group-hover/card:opacity-100 transition-opacity"
                  title="Remove from watch history"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-col gap-0.5">
                <Link
                  to={`/watch/${item.id}`}
                  className="text-xs font-semibold text-neutral-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 leading-tight"
                  title={item.title}
                >
                  {item.title}
                </Link>
                <span className="text-[11px] text-neutral-600 dark:text-white/60 line-clamp-1 mt-0.5">
                  {item.channelName}
                </span>
                <span className="text-[10px] text-neutral-500 dark:text-white/40">
                  {formatViewCount(item.views)} views
                </span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 dark:bg-black/80 hover:bg-white dark:hover:bg-black text-neutral-800 dark:text-white hidden group-hover:flex items-center justify-center border border-neutral-200 dark:border-white/10 shadow-lg transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
