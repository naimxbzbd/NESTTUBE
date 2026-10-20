import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, RotateCw, Sparkles, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoCard } from '../components/video/VideoCard';
import { NativeAdCard } from '../components/ads/NativeAdCard';
import { WatchHistorySection } from '../components/history/WatchHistorySection';
import { RecommendedPlaylistsSection } from '../components/home/RecommendedPlaylistsSection';
import { cn } from '../lib/utils';
import { fetchCategoryVideos } from '../services/youtube';
import { useChannelAvatars } from '../hooks/useChannelAvatars';
import { useYoutubeStore } from '../store/useYoutubeStore';
import { useUserStore } from '../store/useUserStore';
import { useAdsterra } from '../context/AdsterraContext';
import { Tooltip } from '../components/ui/Tooltip';

export const HOME_CATEGORIES = [
  'All',
  'Music',
  'Gaming',
  'Podcasts',
  'AI & Tech',
  'Coding',
  'Live',
  'Comedy',
  'News',
  'Sports',
  'Science & Nature',
  'Cooking',
  'Travel',
  'Animation',
  'Movies',
  'Fitness',
  'Trending',
];

export function Home() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [refreshSeed, setRefreshSeed] = useState(() => Date.now());
  const [isRotating, setIsRotating] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Check scroll position to display left / right gradient chevrons
  const checkScroll = useCallback(() => {
    if (categoriesRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoriesRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
    }
  }, []);

  useEffect(() => {
    const el = categoriesRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      categoriesRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScroll, 320);
    }
  };

  const handleCategoryClick = (cat: string, e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e?.currentTarget) {
      e.currentTarget.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
    setActiveCategory(cat);
  };

  const handleRefresh = () => {
    setIsRotating(true);
    setRefreshSeed(Date.now());
    setTimeout(() => setIsRotating(false), 600);
  };

  useEffect(() => {
    const handleRefreshEvent = () => {
      handleRefresh();
      if (activeCategory !== 'All') {
        setActiveCategory('All');
      }
    };
    window.addEventListener('refresh-home', handleRefreshEvent);
    return () => window.removeEventListener('refresh-home', handleRefreshEvent);
  }, [activeCategory]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['videos', activeCategory, refreshSeed],
    queryFn: ({ pageParam = '' }) => {
      return fetchCategoryVideos(activeCategory, 24, pageParam, refreshSeed);
    },
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage?.nextPageToken || undefined,
  });

  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: '300px' }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const videos = data?.pages.flatMap((page) => page.items || []) || [];

  // Keep global store synced with loaded home videos for search suggestions & recommendations
  useEffect(() => {
    if (videos && videos.length > 0) {
      useYoutubeStore.setState({ videos });
    }
  }, [videos]);

  const { isPremium } = useUserStore();
  const { config } = useAdsterra();

  // Interleave ads into the videos array: 1 ad per row (every 3 videos)
  const interleavedItems = useMemo(() => {
    // Hide all native ads completely when user is Ad-Free Premium
    if (isPremium || !config.enabled || !config.placements.homeFeedNative?.enabled) {
      return videos;
    }

    const items = [];
    let adCounter = 0;
    for (let i = 0; i < videos.length; i += 3) {
      const chunk = videos.slice(i, i + 3);
      const seedVal = typeof refreshSeed === 'number' ? refreshSeed : 0;
      const adPosition = (adCounter * 17 + seedVal) % 4;

      const rowItems = [...chunk];
      rowItems.splice(adPosition, 0, { isAd: true, adIndex: adCounter });

      items.push(...rowItems);
      adCounter++;
    }
    return items;
  }, [videos, refreshSeed, isPremium, config.enabled, config.placements.homeFeedNative?.enabled]);

  const channelIds = videos.map((v: any) => v.snippet?.channelId).filter(Boolean);
  const channelAvatarMap = useChannelAvatars(channelIds);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0f0f0f] text-neutral-900 dark:text-white transition-colors">
      {/* Horizontal Category Filter Chips Bar */}
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-md px-3 sm:px-4 py-2 flex items-center border-b border-neutral-200/80 dark:border-white/10 transition-colors relative">
        {/* Left Scroll Chevron with Gradient Mask */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 z-10 hidden sm:flex items-center pl-2 pr-6 bg-gradient-to-r from-white dark:from-[#0f0f0f] via-white/90 dark:via-[#0f0f0f]/90 to-transparent">
            <button
              onClick={() => scrollCategories('left')}
              className="p-1.5 rounded-full hover:bg-neutral-200 dark:hover:bg-white/15 text-neutral-800 dark:text-white bg-white/80 dark:bg-[#181818]/90 shadow-md border border-neutral-200 dark:border-white/10 transition-all cursor-pointer hover:scale-105"
              aria-label="Scroll categories left"
              title="Previous categories"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Scrollable Chips Container */}
        <div
          ref={categoriesRef}
          role="tablist"
          aria-label="Video category filter chips"
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full py-1 px-1"
        >
          {HOME_CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat;

            return (
              <button
                key={cat}
                role="tab"
                aria-selected={isSelected}
                tabIndex={0}
                onClick={(e) => handleCategoryClick(cat, e)}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150 shrink-0 cursor-pointer select-none',
                  isSelected
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold shadow-xs'
                    : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200/80 dark:bg-white/10 dark:text-neutral-200 dark:hover:bg-white/15 active:scale-95'
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Right Scroll Chevron with Gradient Mask */}
        {canScrollRight && (
          <div className="absolute right-14 sm:right-28 top-0 bottom-0 z-10 hidden sm:flex items-center pr-2 pl-6 bg-gradient-to-l from-white dark:from-[#0f0f0f] via-white/90 dark:via-[#0f0f0f]/90 to-transparent">
            <button
              onClick={() => scrollCategories('right')}
              className="p-1.5 rounded-full hover:bg-neutral-200 dark:hover:bg-white/15 text-neutral-800 dark:text-white bg-white/80 dark:bg-[#181818]/90 shadow-md border border-neutral-200 dark:border-white/10 transition-all cursor-pointer hover:scale-105"
              aria-label="Scroll categories right"
              title="More categories"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Refresh / Feed Shuffle Button */}
        <div className="border-l border-neutral-200 dark:border-white/10 pl-2 sm:pl-3 shrink-0 flex items-center ml-1">
          <Tooltip content={`Refresh ${activeCategory} feed`} position="bottom">
            <button
              onClick={handleRefresh}
              disabled={isLoading || isRefetching}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-white/10 dark:hover:bg-white/15 text-neutral-700 dark:text-neutral-200 text-xs font-semibold transition-all cursor-pointer border border-neutral-200 dark:border-white/10 active:scale-95 shrink-0"
              aria-label="Refresh video feed"
            >
              <RotateCw
                className={cn('w-3.5 h-3.5', (isRotating || isRefetching) && 'animate-spin text-red-600 dark:text-red-400')}
              />
              <span className="hidden md:inline">Refresh</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Active Filter Notice (only shown when filtered beyond 'All') */}
      {activeCategory !== 'All' && (
        <div className="px-4 py-2 bg-neutral-50 dark:bg-white/5 border-b border-neutral-200 dark:border-white/5 flex items-center justify-between text-xs text-neutral-600 dark:text-white/70">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-red-500" />
            <span>
              Showing results for: <strong className="text-neutral-900 dark:text-white">{activeCategory}</strong>
            </span>
          </div>
          <button
            onClick={() => handleCategoryClick('All')}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            <span>Reset to All</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Video Grid & Content Area */}
      <div className="p-3 sm:p-6">
        <WatchHistorySection />
        {activeCategory === 'All' && <RecommendedPlaylistsSection />}

        {/* Personalized Recommendations Banner */}
        {(data?.pages?.[0] as any)?._isPersonalized && activeCategory === 'All' && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-600/10 via-amber-500/10 to-blue-600/10 border border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <Sparkles className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white">Recommended For You</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white uppercase tracking-wider">
                    Personalized Feed
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5">
                  Curated based on your searches & watch activity: <strong className="text-neutral-900 dark:text-white">{(data?.pages?.[0] as any)?._interestSummary || 'Your Top Topics'}</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeCategory}_${refreshSeed}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {isLoading ? (
              <div className="flex justify-center items-center h-48">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-neutral-500 dark:text-white/60">Loading {activeCategory} videos...</span>
                </div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 p-8 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-2xl max-w-lg mx-auto my-8">
                <h2 className="text-lg font-bold mb-1">Error Loading Videos</h2>
                <p className="text-xs text-neutral-600 dark:text-white/60 mb-4">
                  Failed to fetch {activeCategory} videos. Please try refreshing or check connection.
                </p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-red-600 text-white rounded-full text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-16 px-4 bg-neutral-50 dark:bg-white/5 rounded-3xl border border-neutral-200 dark:border-white/10 max-w-md mx-auto my-8 flex flex-col items-center">
                <Filter className="w-10 h-10 text-neutral-400 mb-3" />
                <h3 className="text-base font-bold mb-1">No {activeCategory} videos found</h3>
                <p className="text-xs text-neutral-500 dark:text-white/60 mb-4">
                  Try choosing another category chip or reset back to All.
                </p>
                <button
                  onClick={() => handleCategoryClick('All')}
                  className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  View All Videos
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
                  {interleavedItems.map((item: any, index: number) => {
                    if (item.isAd) {
                      return <NativeAdCard key={`ad-${index}-${item.adIndex}`} index={item.adIndex} />;
                    }

                    const video = item;
                    const id = typeof video.id === 'string' ? video.id : video.id.videoId;
                    if (!id) return null;

                    return (
                      <VideoCard
                        key={`video-${id}-${index}`}
                        id={id}
                        title={video.snippet.title}
                        channelName={video.snippet.channelTitle}
                        channelId={video.snippet.channelId}
                        views={video.statistics?.viewCount}
                        publishedAt={video.snippet.publishedAt}
                        duration={video.contentDetails?.duration}
                        thumbnailUrl={video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url}
                        channelAvatarUrl={video.snippet.channelId ? channelAvatarMap[video.snippet.channelId] : undefined}
                        recommendationReason={video.recommendationReason}
                        recommendationType={video.recommendationType}
                      />
                    );
                  })}
                </div>

                {/* Infinite scroll loader / target */}
                <div ref={loadMoreRef} className="py-8 flex items-center justify-center gap-2">
                  {isFetchingNextPage && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-neutral-500 dark:text-white/70">
                      <div className="w-5 h-5 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading more {activeCategory} videos...</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
