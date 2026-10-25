import React, { useState, useEffect, useMemo } from 'react';
import { 
  History, 
  Trash2, 
  Search, 
  ArrowUpDown, 
  Pause, 
  Play, 
  X, 
  Clock, 
  CheckCircle2, 
  RotateCcw, 
  AlertCircle, 
  Film, 
  Compass, 
  BarChart3, 
  Sparkles,
  ExternalLink,
  SlidersHorizontal,
  Bookmark
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  getWatchHistory, 
  clearWatchHistory, 
  removeFromWatchHistory, 
  restoreWatchHistoryItem,
  restoreFullWatchHistory,
  isWatchHistoryPaused,
  toggleWatchHistoryPaused,
  getWatchHistoryStats,
  SAMPLE_INITIAL_HISTORY,
  addToWatchHistory,
  HistoryItem 
} from '../lib/watchHistory';
import { formatViewCount } from '../lib/formatters';
import { handleThumbnailError } from '../lib/utils';
import { useUserStore } from '../store/useUserStore';
import { Tooltip } from '../components/ui/Tooltip';

export function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');
  const [filterType, setFilterType] = useState<'all' | 'videos' | 'shorts'>('all');
  const [isPaused, setIsPaused] = useState(false);
  
  // Modals & Undo State
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [lastRemovedItem, setLastRemovedItem] = useState<HistoryItem | null>(null);
  const [lastClearedItems, setLastClearedItems] = useState<HistoryItem[] | null>(null);
  const [undoToastMessage, setUndoToastMessage] = useState<string | null>(null);

  const { watchLaterVideos, toggleWatchLater, isInWatchLater } = useUserStore();

  // Load history & paused state on mount and subscribe to updates
  useEffect(() => {
    const syncState = () => {
      setHistory(getWatchHistory());
      setIsPaused(isWatchHistoryPaused());
    };

    syncState();

    window.addEventListener('nesttube_watch_history_updated', syncState);
    window.addEventListener('nesttube_watch_history_paused_changed', syncState);
    window.addEventListener('storage', syncState);

    return () => {
      window.removeEventListener('nesttube_watch_history_updated', syncState);
      window.removeEventListener('nesttube_watch_history_paused_changed', syncState);
      window.removeEventListener('storage', syncState);
    };
  }, []);

  // Handle Pause Toggle
  const handleTogglePause = () => {
    const newState = toggleWatchHistoryPaused();
    setIsPaused(newState);
  };

  // Handle Remove Single Video
  const handleRemoveItem = (item: HistoryItem) => {
    const removed = removeFromWatchHistory(item.id);
    if (removed) {
      setLastRemovedItem(removed);
      setLastClearedItems(null);
      setUndoToastMessage(`Removed "${item.title.substring(0, 35)}..."`);
      setTimeout(() => setUndoToastMessage(null), 5000);
    }
  };

  // Handle Undo Remove
  const handleUndo = () => {
    if (lastRemovedItem) {
      restoreWatchHistoryItem(lastRemovedItem);
      setLastRemovedItem(null);
      setUndoToastMessage(null);
    } else if (lastClearedItems && lastClearedItems.length > 0) {
      restoreFullWatchHistory(lastClearedItems);
      setLastClearedItems(null);
      setUndoToastMessage(null);
    }
  };

  // Handle Clear All
  const handleConfirmClearAll = () => {
    const cleared = clearWatchHistory();
    setLastClearedItems(cleared);
    setLastRemovedItem(null);
    setIsConfirmClearOpen(false);
    setUndoToastMessage(`Cleared ${cleared.length} videos from watch history`);
    setTimeout(() => setUndoToastMessage(null), 6000);
  };

  // Load sample demo history if empty
  const handleLoadSampleHistory = () => {
    SAMPLE_INITIAL_HISTORY.forEach((item) => {
      addToWatchHistory(item);
    });
  };

  // Filter & Sort History
  const filteredHistory = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return history
      .filter((item) => {
        // Search filter
        if (query) {
          const titleMatch = item.title?.toLowerCase().includes(query);
          const channelMatch = item.channelName?.toLowerCase().includes(query);
          if (!titleMatch && !channelMatch) return false;
        }

        // Type filter (shorts vs regular videos)
        if (filterType === 'shorts') {
          // Duration < 60s or marked as live/short
          const isShort = item.duration?.startsWith('0:') && parseInt(item.duration.split(':')[1] || '0') <= 60;
          return isShort;
        }
        if (filterType === 'videos') {
          const isShort = item.duration?.startsWith('0:') && parseInt(item.duration.split(':')[1] || '0') <= 60;
          return !isShort;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'recent') {
          return (b.watchedAt || 0) - (a.watchedAt || 0);
        } else {
          return (a.watchedAt || 0) - (b.watchedAt || 0);
        }
      });
  }, [history, searchQuery, sortOrder, filterType]);

  // Group by Date: Today, Yesterday, This Week, This Month, Older
  const groupedHistory = useMemo(() => {
    const groups: { label: string; items: HistoryItem[] }[] = [];
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    const todayItems: HistoryItem[] = [];
    const yesterdayItems: HistoryItem[] = [];
    const thisWeekItems: HistoryItem[] = [];
    const thisMonthItems: HistoryItem[] = [];
    const olderItems: HistoryItem[] = [];

    filteredHistory.forEach((item) => {
      const diff = now - (item.watchedAt || 0);
      if (diff < oneDay) {
        todayItems.push(item);
      } else if (diff < oneDay * 2) {
        yesterdayItems.push(item);
      } else if (diff < oneDay * 7) {
        thisWeekItems.push(item);
      } else if (diff < oneDay * 30) {
        thisMonthItems.push(item);
      } else {
        olderItems.push(item);
      }
    });

    if (todayItems.length > 0) groups.push({ label: 'Today', items: todayItems });
    if (yesterdayItems.length > 0) groups.push({ label: 'Yesterday', items: yesterdayItems });
    if (thisWeekItems.length > 0) groups.push({ label: 'This week', items: thisWeekItems });
    if (thisMonthItems.length > 0) groups.push({ label: 'This month', items: thisMonthItems });
    if (olderItems.length > 0) groups.push({ label: 'Older', items: olderItems });

    return groups;
  }, [filteredHistory]);

  const stats = useMemo(() => getWatchHistoryStats(), [history]);

  // Format relative watch time
  const formatWatchedTime = (timestamp: number) => {
    if (!timestamp) return 'Recently';
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / (60 * 1000));
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 text-white transition-colors relative min-h-screen bg-transparent pb-bottom-nav">
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        
        {/* Header Banner */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ff2d6f] to-[#c026d3] text-white flex items-center justify-center shadow-lg shadow-pink-500/20 shrink-0">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                দেখা ভিডিওর ইতিহাস <span className="text-aurora-gradient">(History)</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {history.length} {history.length === 1 ? 'video' : 'videos'} saved locally on this device
              </p>
            </div>
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 glass-panel p-1 rounded-full border border-white/10 self-start sm:self-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'text-neutral-600 dark:text-white/70 hover:bg-neutral-200 dark:hover:bg-white/10'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('videos')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                filterType === 'videos'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'text-neutral-600 dark:text-white/70 hover:bg-neutral-200 dark:hover:bg-white/10'
              }`}
            >
              Videos
            </button>
            <button
              onClick={() => setFilterType('shorts')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                filterType === 'shorts'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'text-neutral-600 dark:text-white/70 hover:bg-neutral-200 dark:hover:bg-white/10'
              }`}
            >
              Shorts
            </button>
          </div>
        </div>

        {/* Watch History Paused Warning Banner */}
        {isPaused && (
          <div className="flex items-center justify-between p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-700 dark:text-amber-400 text-xs font-medium animate-in fade-in">
            <div className="flex items-center gap-2">
              <Pause className="w-4 h-4 shrink-0 text-amber-500" />
              <span>Watch history is paused. Videos you watch won't be saved until you resume.</span>
            </div>
            <button
              onClick={handleTogglePause}
              className="px-3 py-1 bg-amber-500 text-white dark:text-neutral-900 font-bold rounded-full hover:bg-amber-600 transition-colors shrink-0 cursor-pointer ml-2"
            >
              Turn on
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredHistory.length === 0 ? (
          <div className="py-16 px-6 text-center bg-neutral-50 dark:bg-white/5 rounded-3xl border border-neutral-200 dark:border-white/10 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-neutral-200/70 dark:bg-white/10 flex items-center justify-center text-neutral-400 dark:text-white/40">
              <History className="w-8 h-8" />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg sm:text-xl font-bold mb-1">
                {searchQuery ? 'No matching search results' : 'Keep track of what you watch'}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-white/60">
                {searchQuery
                  ? `We couldn't find any videos matching "${searchQuery}" in your watch history.`
                  : 'Videos you watch on NestTube will appear here so you can easily find and rewatch them anytime.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Clear search query
                </button>
              ) : (
                <>
                  <Link
                    to="/trending"
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-md"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Explore Trending Videos</span>
                  </Link>

                  <button
                    onClick={handleLoadSampleHistory}
                    className="px-4 py-2.5 bg-neutral-200 hover:bg-neutral-300 dark:bg-white/10 dark:hover:bg-white/20 text-neutral-800 dark:text-white rounded-full text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Load Demo History</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Grouped History List */
          <div className="flex flex-col gap-8">
            {groupedHistory.map((group) => (
              <div key={group.label} className="flex flex-col gap-3">
                {/* Date Group Heading */}
                <div className="flex items-center gap-2 text-sm font-bold text-neutral-700 dark:text-neutral-300 sticky top-14 bg-white/90 dark:bg-[#0f0f0f]/90 backdrop-blur-md py-1 z-10">
                  <span>{group.label}</span>
                  <span className="text-xs font-normal text-neutral-400 dark:text-white/40">
                    ({group.items.length})
                  </span>
                </div>

                {/* Video Cards in Group */}
                <div className="flex flex-col gap-3">
                  {group.items.map((item) => {
                    const inWatchLater = isInWatchLater(item.id);

                    return (
                      <div
                        key={`${item.id}-${item.watchedAt}`}
                        className="flex flex-col sm:flex-row gap-4 p-3.5 rounded-2xl glass-card transition-all duration-300 group relative"
                      >
                        {/* Video Thumbnail with Progress Bar */}
                        <Link
                          to={`/watch/${item.id}`}
                          className="w-full sm:w-60 md:w-64 aspect-video rounded-xl overflow-hidden shrink-0 bg-neutral-800 relative block group/thumb cursor-pointer shadow-sm"
                        >
                          <img
                            src={
                              item.thumbnailUrl ||
                              'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=640&q=80'
                            }
                            alt={item.title}
                            className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                            onError={handleThumbnailError}
                          />

                          {/* Duration Badge */}
                          {item.duration && (
                            <span className="absolute bottom-2 right-2 bg-black/85 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
                              {item.duration}
                            </span>
                          )}

                          {/* Red Watch Progress Bar (like YouTube) */}
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-600/60 overflow-hidden">
                            <div
                              className="h-full bg-red-600"
                              style={{ width: `${item.progressPercentage || 50}%` }}
                            />
                          </div>

                          {/* Hover Play Icon Overlay */}
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-black/70 text-white flex items-center justify-center pl-0.5 shadow-lg">
                              <Play className="w-5 h-5 fill-white" />
                            </div>
                          </div>
                        </Link>

                        {/* Video Metadata */}
                        <div className="flex-1 flex flex-col justify-between min-w-0 pr-10">
                          <div>
                            <Link
                              to={`/watch/${item.id}`}
                              className="font-bold text-sm sm:text-base line-clamp-2 hover:text-blue-500 dark:hover:text-blue-400 transition-colors leading-snug mb-1"
                              title={item.title}
                            >
                              {item.title}
                            </Link>

                            {/* Channel & Views */}
                            <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500 dark:text-white/60 mb-2">
                              {item.channelId ? (
                                <Link
                                  to={`/channel/${item.channelId}`}
                                  className="font-medium hover:text-neutral-900 dark:hover:text-white transition-colors"
                                >
                                  {item.channelName}
                                </Link>
                              ) : (
                                <span className="font-medium">{item.channelName}</span>
                              )}
                              <span>•</span>
                              <span>{formatViewCount(item.views)} views</span>
                              <span>•</span>
                              <span className="text-neutral-400 dark:text-white/40">
                                Watched {formatWatchedTime(item.watchedAt)}
                              </span>
                            </div>

                            {/* Description Snippet */}
                            {item.description && (
                              <p className="text-xs text-neutral-500 dark:text-white/50 line-clamp-2 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-neutral-100 dark:border-white/5 opacity-80 group-hover:opacity-100 transition-opacity">
                            {/* Watch Later toggle */}
                            <button
                              onClick={() =>
                                toggleWatchLater({
                                  id: item.id,
                                  title: item.title,
                                  channelName: item.channelName,
                                  channelId: item.channelId,
                                  thumbnailUrl: item.thumbnailUrl,
                                  duration: item.duration,
                                  views: item.views,
                                  publishedAt: item.publishedAt,
                                  description: item.description,
                                })
                              }
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                                inWatchLater
                                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20'
                                  : 'hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-600 dark:text-white/70'
                              }`}
                              title={inWatchLater ? 'In Watch Later' : 'Save to Watch Later'}
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>{inWatchLater ? 'Saved to Watch Later' : 'Watch Later'}</span>
                            </button>

                            {/* Play Now Link */}
                            <Link
                              to={`/watch/${item.id}`}
                              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-neutral-600 dark:text-white/70 hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Play</span>
                            </Link>
                          </div>
                        </div>

                        {/* Top-Right Remove Button */}
                        <Tooltip content="Remove from watch history" position="left">
                          <button
                            onClick={() => handleRemoveItem(item)}
                            className="absolute top-3 right-3 p-2 rounded-full hover:bg-red-500/10 text-neutral-400 hover:text-red-500 dark:text-white/40 dark:hover:text-red-400 transition-colors cursor-pointer"
                            aria-label="Remove video"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </Tooltip>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Column - Controls & History Management Sidebar */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col gap-5 lg:sticky lg:top-20 self-start">
        
        {/* Search Input Box */}
        <div className="flex items-center glass-input rounded-2xl px-3.5 py-2.5 text-xs group transition-colors shadow-xs">
          <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
          <input
            type="text"
            placeholder="Search watch history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none flex-1 text-white placeholder-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* History Action Panel */}
        <div className="p-5 rounded-3xl glass-panel border border-white/10 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              History Controls
            </h3>
            <span className="text-[11px] text-cyan-400 font-mono font-bold">
              {filteredHistory.length} of {history.length}
            </span>
          </div>

          {/* Sort Order Selector */}
          <div className="flex items-center justify-between text-xs font-semibold py-1 border-b border-neutral-200 dark:border-white/10 pb-3">
            <span className="flex items-center gap-2 text-neutral-700 dark:text-white/80">
              <ArrowUpDown className="w-4 h-4 text-blue-500" />
              <span>Sort Order</span>
            </span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'recent' | 'oldest')}
              className="bg-neutral-200 dark:bg-white/10 px-2.5 py-1 rounded-xl outline-none cursor-pointer text-xs font-medium text-neutral-900 dark:text-white"
            >
              <option value="recent" className="bg-white dark:bg-[#1f1f1f]">Recently watched</option>
              <option value="oldest" className="bg-white dark:bg-[#1f1f1f]">Oldest watched</option>
            </select>
          </div>

          {/* Pause / Resume History Button */}
          <button
            onClick={handleTogglePause}
            className={`flex items-center justify-between w-full p-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              isPaused
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 border border-amber-500/30'
                : 'hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-800 dark:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isPaused ? (
                <Play className="w-4 h-4 text-emerald-500 fill-emerald-500" />
              ) : (
                <Pause className="w-4 h-4 text-amber-500" />
              )}
              <span>{isPaused ? 'Resume watch history' : 'Pause watch history'}</span>
            </div>
            <span
              className={`w-2 h-2 rounded-full ${
                isPaused ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
              }`}
            />
          </button>

          {/* Clear All Watch History Button */}
          <button
            onClick={() => setIsConfirmClearOpen(true)}
            disabled={history.length === 0}
            className="flex items-center gap-2.5 w-full p-3 rounded-2xl hover:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            <span>Clear all watch history</span>
          </button>
        </div>

        {/* History Insights / Stats Card */}
        {stats.totalCount > 0 && (
          <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 flex flex-col gap-3 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-white/50 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
              <span>History Insights</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-center pt-1">
              <div className="bg-neutral-100 dark:bg-white/5 p-3 rounded-2xl border border-neutral-200 dark:border-white/10">
                <span className="text-lg font-extrabold text-neutral-900 dark:text-white block">
                  {stats.totalCount}
                </span>
                <span className="text-[10px] text-neutral-500 dark:text-white/50 font-medium">
                  Videos Watched
                </span>
              </div>
              <div className="bg-neutral-100 dark:bg-white/5 p-3 rounded-2xl border border-neutral-200 dark:border-white/10">
                <span className="text-lg font-extrabold text-neutral-900 dark:text-white block">
                  {stats.uniqueChannelsCount}
                </span>
                <span className="text-[10px] text-neutral-500 dark:text-white/50 font-medium">
                  Channels
                </span>
              </div>
            </div>

            {stats.mostWatchedChannel && (
              <div className="text-xs bg-neutral-100 dark:bg-white/5 p-2.5 rounded-xl border border-neutral-200 dark:border-white/10 flex items-center justify-between">
                <span className="text-neutral-500 dark:text-white/50 text-[11px]">Top Channel:</span>
                <span className="font-bold text-neutral-900 dark:text-white truncate max-w-[140px]">
                  {stats.mostWatchedChannel}
                </span>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Clear All Confirmation Modal */}
      {isConfirmClearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#1f1f1f] rounded-3xl p-6 max-w-sm w-full border border-neutral-200 dark:border-white/10 shadow-2xl text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Clear watch history?</h3>
            <p className="text-xs text-neutral-500 dark:text-white/60 mb-6 leading-relaxed">
              This will clear all {history.length} videos from your watch history on this browser. You can undo this immediately after clearing.
            </p>
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={() => setIsConfirmClearOpen(false)}
                className="flex-1 py-2.5 rounded-full border border-neutral-300 dark:border-white/20 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClearAll}
                className="flex-1 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-md cursor-pointer"
              >
                Clear all
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Undo Toast Notification */}
      {undoToastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-4 animate-in fade-in slide-in-from-bottom-3 duration-200 border border-white/20 max-w-md">
          <span className="truncate flex-1">{undoToastMessage}</span>
          <button
            onClick={handleUndo}
            className="flex items-center gap-1 text-blue-400 dark:text-blue-600 hover:underline shrink-0 font-bold uppercase tracking-wider text-[11px] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
        </div>
      )}

    </div>
  );
}
