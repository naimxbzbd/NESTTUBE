import React, { useState, useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, RotateCw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoCard } from '../components/video/VideoCard';
import { NativeAdCard } from '../components/ads/NativeAdCard';
import { WatchHistorySection } from '../components/history/WatchHistorySection';
import { RecommendedPlaylistsSection } from '../components/home/RecommendedPlaylistsSection';
import { cn } from '../lib/utils';
import { fetchCategoryVideos } from '../services/youtube';
import { useChannelAvatars } from '../hooks/useChannelAvatars';
import { useYoutubeStore } from '../store/useYoutubeStore';
import { Tooltip } from '../components/ui/Tooltip';

const categories = [
  "All", "Music", "Gaming", "News", "Live", "Tech", "Podcasts", "Entertainment", "Sports", "Education", "Movies", "Fashion", "Coding", "Trending"
];

export function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [refreshSeed, setRefreshSeed] = useState(() => Date.now());
  const [isRotating, setIsRotating] = useState(false);

  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      categoriesRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    // Generate new seed to fetch fresh dynamic videos for this category
    setRefreshSeed(Date.now());
  };

  const handleRefresh = () => {
    setIsRotating(true);
    setRefreshSeed(Date.now());
    setTimeout(() => setIsRotating(false), 600);
  };

  useEffect(() => {
    const handleRefreshEvent = () => {
      handleRefresh();
      // Reset category to All on logo click if we want, but let's keep it simple
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
    isRefetching
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

  const channelIds = videos.map((v: any) => v.snippet?.channelId).filter(Boolean);
  const channelAvatarMap = useChannelAvatars(channelIds);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0f0f0f] text-neutral-900 dark:text-white transition-colors">
      {/* Category Filter Bar */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-sm px-3 sm:px-4 py-2.5 flex items-center border-b border-neutral-200 dark:border-white/5 group transition-colors gap-1 sm:gap-2">
        <button
          onClick={() => scrollCategories('left')}
          className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-800 dark:text-white shrink-0 hidden sm:flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div
          ref={categoriesRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full py-0.5"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-150 shrink-0 cursor-pointer",
                activeCategory === cat
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-black font-bold shadow-xs scale-102"
                  : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 active:scale-95"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={() => scrollCategories('right')}
          className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-800 dark:text-white shrink-0 hidden sm:flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Refresh / New Content Button */}
        <div className="border-l border-neutral-200 dark:border-white/10 pl-1.5 sm:pl-2 shrink-0 flex items-center">
          <Tooltip content="Get new content" position="bottom">
            <button
              onClick={handleRefresh}
              disabled={isLoading || isRefetching}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold transition-all cursor-pointer border border-red-200/60 dark:border-red-500/20 active:scale-95"
            >
              <RotateCw className={cn("w-3.5 h-3.5", (isRotating || isRefetching) && "animate-spin")} />
              <span className="hidden md:inline">Refresh</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Video Grid */}
      <div className="p-3 sm:p-6">
        <WatchHistorySection />
        {activeCategory === 'All' && <RecommendedPlaylistsSection />}

        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeCategory}_${refreshSeed}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 p-8 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl">
                <h2 className="text-xl font-bold mb-2">Error Loading Videos</h2>
                <p>Please check your YouTube Data API Key in the environment configuration.</p>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center p-8 text-neutral-500 dark:text-white/60">No videos found.</div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
                  {videos.map((video: any, index: number) => {
                    const id = typeof video.id === 'string' ? video.id : video.id.videoId;
                    if (!id) return null;
                    const showAdAfter = index > 0 && index % 8 === 0;
                    return (
                      <React.Fragment key={`${id}-${index}`}>
                        {showAdAfter && <NativeAdCard index={Math.floor(index / 8)} />}
                        <VideoCard
                          id={id}
                          title={video.snippet.title}
                          channelName={video.snippet.channelTitle}
                          channelId={video.snippet.channelId}
                          views={video.statistics?.viewCount}
                          publishedAt={video.snippet.publishedAt}
                          duration={video.contentDetails?.duration}
                          thumbnailUrl={video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url}
                          channelAvatarUrl={video.snippet.channelId ? channelAvatarMap[video.snippet.channelId] : undefined}
                        />
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Infinite scroll loader / target */}
                <div ref={loadMoreRef} className="py-8 flex items-center justify-center gap-2">
                  {isFetchingNextPage && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-neutral-500 dark:text-white/70">
                      <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading more videos...</span>
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
