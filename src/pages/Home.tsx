import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, RotateCw, Sparkles, Filter, X, Tv } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { VideoCard } from '../components/video/VideoCard';
import { NativeAdCard } from '../components/ads/NativeAdCard';
import { WatchHistorySection } from '../components/history/WatchHistorySection';
import { RecommendedPlaylistsSection } from '../components/home/RecommendedPlaylistsSection';
import { HomeHeroBanner } from '../components/home/HomeHeroBanner';
import { HomeLiveTvSection } from '../components/home/HomeLiveTvSection';
import { HomeBanglaDramasSection } from '../components/home/HomeBanglaDramasSection';
import { cn } from '../lib/utils';
import { fetchCategoryVideos } from '../services/youtube';
import { useChannelAvatars } from '../hooks/useChannelAvatars';
import { useYoutubeStore } from '../store/useYoutubeStore';
import { useUserStore } from '../store/useUserStore';
import { useAdsterra } from '../context/AdsterraContext';
import { Tooltip } from '../components/ui/Tooltip';

export const PIPRATUBE_CATEGORIES = [
  { id: 'All', label: 'সব (All)' },
  { id: 'Live TV', label: '🔴 লাইভ টিভি', isSpecial: true },
  { id: 'Bangla Natok', label: '🎭 বাংলা নাটক' },
  { id: 'Bangla Cinema', label: '🎬 বাংলা সিনেমা' },
  { id: 'Comedy', label: '😂 কমেডি' },
  { id: 'Bangla Music', label: '🎵 বাংলা গান' },
  { id: 'Action Movies', label: '🔥 অ্যাকশন' },
  { id: 'Shorts', label: '⚡ শর্টস' },
  { id: 'News', label: '📰 সংবাদ' },
  { id: 'Sports', label: '🏆 খেলাধুলা' },
  { id: 'Islamic', label: '🕌 ইসলামিক' },
  { id: 'Cooking', label: '🍳 রেসিপি' },
  { id: 'Tech', label: '📱 প্রযুক্তি' },
];

export function Home() {
  const navigate = useNavigate();
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

  const handleCategoryClick = (cat: { id: string; label: string; isSpecial?: boolean }, e?: React.MouseEvent<HTMLButtonElement>) => {
    if (cat.id === 'Live TV') {
      navigate('/live-tv');
      return;
    }
    if (cat.id === 'Shorts') {
      navigate('/shorts');
      return;
    }

    if (e?.currentTarget) {
      e.currentTarget.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
    setActiveCategory(cat.id);
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
      // Query videos tailored for PipraTube
      const queryTerm = activeCategory === 'All' ? 'Bangla Natok Cinema Entertainment' : activeCategory;
      return fetchCategoryVideos(queryTerm, 24, pageParam, refreshSeed);
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
    <div className="flex flex-col h-full bg-[#0b0f15] text-white transition-colors pb-bottom-nav">
      {/* Horizontal Category Filter Chips Bar */}
      <div className="sticky top-0 z-20 bg-[#0b0f15]/95 backdrop-blur-md px-3 sm:px-4 py-2.5 flex items-center border-b border-white/10 transition-colors relative">
        {/* Left Scroll Chevron with Gradient Mask */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 z-10 hidden sm:flex items-center pl-2 pr-6 bg-gradient-to-r from-[#0b0f15] via-[#0b0f15]/90 to-transparent">
            <button
              onClick={() => scrollCategories('left')}
              className="p-1.5 rounded-full hover:bg-white/15 text-white bg-[#181818]/90 shadow-md border border-white/10 transition-all cursor-pointer hover:scale-105"
              aria-label="Scroll categories left"
              title="পূর্ববর্তী ক্যাটাগরি"
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
          {PIPRATUBE_CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={isSelected}
                tabIndex={0}
                onClick={(e) => handleCategoryClick(cat, e)}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0 cursor-pointer select-none',
                  cat.isSpecial
                    ? 'bg-red-600/20 text-red-500 border border-red-500/30 hover:bg-red-600/30 font-bold'
                    : isSelected
                    ? 'bg-gradient-to-r from-[#ff2d6f] to-[#c026d3] text-white font-bold shadow-md shadow-pink-500/20'
                    : 'bg-[#161d27] text-gray-300 hover:text-white hover:bg-white/10'
                )}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Right Scroll Chevron with Gradient Mask */}
        {canScrollRight && (
          <div className="absolute right-14 sm:right-28 top-0 bottom-0 z-10 hidden sm:flex items-center pr-2 pl-6 bg-gradient-to-l from-[#0b0f15] via-[#0b0f15]/90 to-transparent">
            <button
              onClick={() => scrollCategories('right')}
              className="p-1.5 rounded-full hover:bg-white/15 text-white bg-[#181818]/90 shadow-md border border-white/10 transition-all cursor-pointer hover:scale-105"
              aria-label="Scroll categories right"
              title="পরবর্তী ক্যাটাগরি"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Refresh / Feed Shuffle Button */}
        <div className="border-l border-white/10 pl-2 sm:pl-3 shrink-0 flex items-center ml-1">
          <Tooltip content="ফিড রিফ্রেশ করুন" position="bottom">
            <button
              onClick={handleRefresh}
              disabled={isLoading || isRefetching}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-semibold transition-all cursor-pointer border border-white/10 active:scale-95 shrink-0"
              aria-label="Refresh video feed"
            >
              <RotateCw
                className={cn('w-3.5 h-3.5', (isRotating || isRefetching) && 'animate-spin text-[#ff2d6f]')}
              />
              <span className="hidden md:inline">রিফ্রেশ</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Active Filter Notice */}
      {activeCategory !== 'All' && (
        <div className="px-4 py-2 bg-[#121824] border-b border-white/10 flex items-center justify-between text-xs text-gray-300">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#ff2d6f]" />
            <span>
              ক্যাটাগরি: <strong className="text-white">{activeCategory}</strong>
            </span>
          </div>
          <button
            onClick={() => setActiveCategory('All')}
            className="flex items-center gap-1 text-xs font-semibold text-pink-400 hover:underline cursor-pointer"
          >
            <span>সব দেখুন (All)</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-3 sm:p-6 space-y-6">
        {/* Watch History Quick Row if user has history */}
        <WatchHistorySection />

        {/* 24/7 Bangla Live TV Channel Strip */}
        <HomeLiveTvSection />

        {/* Recommended Playlists */}
        {activeCategory === 'All' && <RecommendedPlaylistsSection />}

        {/* Curated Bangla Natok Section */}
        {activeCategory === 'All' && <HomeBanglaDramasSection />}

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
                  <div className="w-8 h-8 border-3 border-[#ff2d6f] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-gray-400">ভিডিও লোড হচ্ছে...</span>
                </div>
              </div>
            ) : error ? (
              <div className="text-center text-red-400 p-8 bg-[#121824] border border-red-500/20 rounded-2xl max-w-lg mx-auto my-8">
                <h2 className="text-lg font-bold mb-1">ভিডিও লোড করতে সমস্যা হয়েছে</h2>
                <p className="text-xs text-gray-400 mb-4">
                  অনুগ্রহ করে পুনরায় রিফ্রেশ করুন অথবা ইন্টারনেট সংযোগ যাচাই করুন।
                </p>
                <button
                  onClick={handleRefresh}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#ff2d6f] to-[#c026d3] text-white rounded-full text-xs font-bold hover:opacity-95 transition-opacity cursor-pointer shadow-lg shadow-pink-500/25"
                >
                  আবার চেষ্টা করুন
                </button>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-16 px-4 bg-[#121824] rounded-3xl border border-white/10 max-w-md mx-auto my-8 flex flex-col items-center">
                <Filter className="w-10 h-10 text-gray-500 mb-3" />
                <h3 className="text-base font-bold mb-1">কোনো ভিডিও পাওয়া যায়নি</h3>
                <p className="text-xs text-gray-400 mb-4">
                  অন্য কোনো ক্যাটাগরি নির্বাচন করুন অথবা সব ভিডিওতে ফিরে যান।
                </p>
                <button
                  onClick={() => setActiveCategory('All')}
                  className="px-5 py-2 bg-gradient-to-r from-[#ff2d6f] to-[#c026d3] text-white rounded-full text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  সব ভিডিও দেখুন
                </button>
              </div>
            ) : (
              <>
                {/* Featured Content Hero Banner */}
                {videos.length > 0 && activeCategory === 'All' && (
                  <HomeHeroBanner video={videos[0]} category={activeCategory} />
                )}

                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>আপনার জন্য সুপারিশকৃত ভিডিও (Recommended)</span>
                  </h2>
                </div>

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
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
                      <div className="w-5 h-5 border-3 border-[#ff2d6f] border-t-transparent rounded-full animate-spin" />
                      <span>আরও ভিডিও লোড হচ্ছে...</span>
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
