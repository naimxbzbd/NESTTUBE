import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  MoreVertical,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  Music,
  Check,
  X,
  Send,
} from 'lucide-react';
import { cn, handleThumbnailError } from '../lib/utils';
import { searchVideos } from '../services/youtube';
import { Tooltip } from '../components/ui/Tooltip';

// Authentic vertical shorts and high-impact short-form videos for fallback
const CURATED_FALLBACK_SHORTS = [
  {
    id: 'hdI2bqOjy3c',
    snippet: {
      title: '100+ Computer Science Concepts in 100 Seconds',
      channelTitle: 'Fireship',
      channelId: 'UCsBjURrPoezykLs9EqgamOA',
      thumbnails: {
        high: { url: 'https://i.ytimg.com/vi/hdI2bqOjy3c/hqdefault.jpg' },
        default: { url: 'https://i.ytimg.com/vi/hdI2bqOjy3c/default.jpg' },
      },
    },
    statistics: { likeCount: '245000', commentCount: '3420' },
  },
  {
    id: 'kX3nB4PpJko',
    snippet: {
      title: 'I Spent 50 Hours In Solitary Confinement Challenge',
      channelTitle: 'MrBeast',
      channelId: 'UCX6OQ3DkcsbYNE6H8uQQuVA',
      thumbnails: {
        high: { url: 'https://i.ytimg.com/vi/kX3nB4PpJko/hqdefault.jpg' },
        default: { url: 'https://i.ytimg.com/vi/kX3nB4PpJko/default.jpg' },
      },
    },
    statistics: { likeCount: '1850000', commentCount: '14200' },
  },
  {
    id: '3nbjhpcZ9_g',
    snippet: {
      title: 'Usain Bolt 9.58s 100m World Record Final #Shorts',
      channelTitle: 'Olympics',
      channelId: 'UC2t5mEnvpT5nNC5XCZ4m3wg',
      thumbnails: {
        high: { url: 'https://i.ytimg.com/vi/3nbjhpcZ9_g/hqdefault.jpg' },
        default: { url: 'https://i.ytimg.com/vi/3nbjhpcZ9_g/default.jpg' },
      },
    },
    statistics: { likeCount: '890000', commentCount: '8100' },
  },
  {
    id: 'hFZFjoX2cGg',
    snippet: {
      title: 'Glitter Bomb 4.0 Trap Mechanism in Action',
      channelTitle: 'Mark Rober',
      channelId: 'UCY1kMZp36IQSyNx_9h4mpCg',
      thumbnails: {
        high: { url: 'https://i.ytimg.com/vi/hFZFjoX2cGg/hqdefault.jpg' },
        default: { url: 'https://i.ytimg.com/vi/hFZFjoX2cGg/default.jpg' },
      },
    },
    statistics: { likeCount: '1200000', commentCount: '15900' },
  },
  {
    id: '4pKly2JojMw',
    snippet: {
      title: 'Impossible Planche Pushup Calisthenics Challenge',
      channelTitle: 'Chris Heria',
      channelId: 'UC_SsdV_pP4eK3_G5_5h1A',
      thumbnails: {
        high: { url: 'https://i.ytimg.com/vi/4pKly2JojMw/hqdefault.jpg' },
        default: { url: 'https://i.ytimg.com/vi/4pKly2JojMw/default.jpg' },
      },
    },
    statistics: { likeCount: '412000', commentCount: '4890' },
  },
  {
    id: 'bJUiWdM__Qw',
    snippet: {
      title: 'Pixar Ratatouille Confit Byaldi in 60 Seconds',
      channelTitle: 'Babish Culinary Universe',
      channelId: 'UCJHA_jMfCvEnv-3kRjTCQXw',
      thumbnails: {
        high: { url: 'https://i.ytimg.com/vi/bJUiWdM__Qw/hqdefault.jpg' },
        default: { url: 'https://i.ytimg.com/vi/bJUiWdM__Qw/default.jpg' },
      },
    },
    statistics: { likeCount: '620000', commentCount: '7300' },
  },
  {
    id: '7wtfhZwyrcc',
    snippet: {
      title: 'Mr. Garvey Roll Call: A-A-Ron Moment',
      channelTitle: 'Comedy Central',
      channelId: 'UC4O_SsdV_pP4eK3_G5_5h1A',
      thumbnails: {
        high: { url: 'https://i.ytimg.com/vi/7wtfhZwyrcc/hqdefault.jpg' },
        default: { url: 'https://i.ytimg.com/vi/7wtfhZwyrcc/default.jpg' },
      },
    },
    statistics: { likeCount: '1400000', commentCount: '21000' },
  },
  {
    id: 'rIofV14c0tc',
    snippet: {
      title: 'World’s Largest Jello Pool Chemistry Experiment',
      channelTitle: 'Mark Rober',
      channelId: 'UCY1kMZp36IQSyNx_9h4mpCg',
      thumbnails: {
        high: { url: 'https://i.ytimg.com/vi/rIofV14c0tc/hqdefault.jpg' },
        default: { url: 'https://i.ytimg.com/vi/rIofV14c0tc/default.jpg' },
      },
    },
    statistics: { likeCount: '980000', commentCount: '9400' },
  },
];

export function Shorts() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [dislikedMap, setDislikedMap] = useState<Record<string, boolean>>({});
  const [subscribedMap, setSubscribedMap] = useState<Record<string, boolean>>({});
  const [showToast, setShowToast] = useState<string | null>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentsList, setCommentsList] = useState<Record<string, Array<{ user: string; text: string; time: string }>>>({
    default: [
      { user: 'Alex Walker', text: 'This edit is ridiculously clean! 🔥', time: '2 hours ago' },
      { user: 'Sarah Jenkins', text: 'Watching this on repeat haha', time: '5 hours ago' },
      { user: 'Tech Enthusiast', text: 'YouTube shorts format done right!', time: '1 day ago' },
    ],
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['shorts'],
    queryFn: ({ pageParam = '' }) => searchVideos('#shorts', 15, pageParam, '', 'relevance', 'short'),
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage?.nextPageToken || undefined,
  });

  const apiVideos = data?.pages.flatMap((page) => page.items || []) || [];
  const videos = apiVideos.length > 0 ? apiVideos : CURATED_FALLBACK_SHORTS;

  // IntersectionObserver to detect which short is currently active in viewport
  useEffect(() => {
    const options = {
      root: containerRef.current,
      threshold: 0.6,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.getAttribute('data-index'));
          if (!isNaN(index)) {
            setActiveVideoIndex(index);
            // Fetch next batch when approaching end
            if (index >= videos.length - 3 && hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }
        }
      });
    }, options);

    const videoElements = containerRef.current?.querySelectorAll('.short-video-container');
    videoElements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [videos, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Smooth scroll to a specific index
  const scrollToIndex = useCallback((index: number) => {
    if (!containerRef.current) return;
    const targetElement = containerRef.current.querySelector(`[data-index="${index}"]`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleScrollUp = () => {
    if (activeVideoIndex > 0) {
      scrollToIndex(activeVideoIndex - 1);
    }
  };

  const handleScrollDown = () => {
    if (activeVideoIndex < videos.length - 1) {
      scrollToIndex(activeVideoIndex + 1);
    }
  };

  // Keyboard Navigation: ArrowUp / ArrowDown / Space / M
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'j' || e.key === 'J' || e.key === 'PageDown') {
        e.preventDefault();
        handleScrollDown();
      } else if (e.key === 'ArrowUp' || e.key === 'k' || e.key === 'K' || e.key === 'PageUp') {
        e.preventDefault();
        handleScrollUp();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsMuted((prev) => !prev);
      } else if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeVideoIndex, videos.length]);

  const handleToggleLike = (vidId: string) => {
    setLikedMap((prev) => {
      const isCurrentlyLiked = !!prev[vidId];
      if (!isCurrentlyLiked) {
        // Clear dislike if liking
        setDislikedMap((d) => ({ ...d, [vidId]: false }));
      }
      return { ...prev, [vidId]: !isCurrentlyLiked };
    });
  };

  const handleToggleDislike = (vidId: string) => {
    setDislikedMap((prev) => {
      const isCurrentlyDisliked = !!prev[vidId];
      if (!isCurrentlyDisliked) {
        setLikedMap((l) => ({ ...l, [vidId]: false }));
      }
      return { ...prev, [vidId]: !isCurrentlyDisliked };
    });
  };

  const handleToggleSubscribe = (channelId: string) => {
    setSubscribedMap((prev) => ({
      ...prev,
      [channelId]: !prev[channelId],
    }));
  };

  const handleShare = async (vidId: string, title: string) => {
    const url = `${window.location.origin}/shorts?id=${vidId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setShowToast('Link copied to clipboard!');
      setTimeout(() => setShowToast(null), 2500);
    } catch {
      setShowToast('Share link ready!');
      setTimeout(() => setShowToast(null), 2500);
    }
  };

  const handleAddComment = (vidId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentsList((prev) => {
      const existing = prev[vidId] || prev['default'] || [];
      return {
        ...prev,
        [vidId]: [{ user: 'You', text: newComment.trim(), time: 'Just now' }, ...existing],
      };
    });
    setNewComment('');
  };

  if (isLoading && videos.length === 0) {
    return (
      <div className="flex-1 h-full w-full flex items-center justify-center bg-white dark:bg-[#0f0f0f] transition-colors">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Loading Shorts...</span>
        </div>
      </div>
    );
  }

  const currentActiveVideo = videos[activeVideoIndex];
  const activeVidId = currentActiveVideo
    ? typeof currentActiveVideo.id === 'string'
      ? currentActiveVideo.id
      : currentActiveVideo.id?.videoId
    : '';

  return (
    <div className="flex-1 h-full w-full flex justify-center bg-white dark:bg-[#0f0f0f] overflow-hidden text-neutral-900 dark:text-white select-none relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-neutral-900/90 dark:bg-white/90 text-white dark:text-neutral-900 px-4 py-2 rounded-full shadow-2xl text-xs font-semibold backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150">
          {showToast}
        </div>
      )}

      {/* Snap Scroll Container */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory hide-scrollbar relative flex flex-col items-center"
      >
        {videos.map((video, index) => {
          const videoId = typeof video.id === 'string' ? video.id : video.id?.videoId;
          if (!videoId) return null;
          const isActive = index === activeVideoIndex;
          const isLiked = !!likedMap[videoId];
          const isDisliked = !!dislikedMap[videoId];
          const channelId = video.snippet?.channelId || 'channel';
          const isSubscribed = !!subscribedMap[channelId];
          const title = video.snippet?.title || '';
          const channelTitle = video.snippet?.channelTitle || 'Creator';
          const baseLikes = parseInt((video as any).statistics?.likeCount || '45000', 10);
          const displayLikes = isLiked ? (baseLikes + 1).toLocaleString() : baseLikes.toLocaleString();
          const commentsCount = (video as any).statistics?.commentCount || '1.2K';

          return (
            <div
              key={`${videoId}-${index}`}
              data-index={index}
              className="short-video-container relative w-full h-full snap-start snap-always shrink-0 flex items-center justify-center p-0 sm:p-3 md:p-4"
            >
              {/* Short Card Wrapper: Responsive 9:16 Aspect Ratio Container */}
              <div className="flex items-center justify-center h-full w-full max-w-full relative">
                {/* 
                  The Video Frame:
                  - Mobile (< 640px): Edge-to-edge full viewport height (w-full h-full rounded-none)
                  - Desktop (>= 640px): Standard YouTube Shorts dimensions (strict 9:16 aspect ratio, max-h-[720px], centered rounded-2xl)
                */}
                <div
                  className={cn(
                    'relative overflow-hidden bg-black flex group shadow-2xl transition-all duration-200',
                    // Mobile: Full container height & edge-to-edge
                    'w-full h-full rounded-none',
                    // Desktop: Exact YouTube Shorts 9:16 aspect ratio (height-driven up to 720px max)
                    'sm:w-auto sm:h-[calc(100vh-90px)] sm:max-h-[720px] sm:aspect-[9/16] sm:rounded-2xl border border-transparent dark:sm:border-white/10'
                  )}
                >
                  {/* YouTube Player / Poster */}
                  {isActive && isPlaying ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=${
                        isMuted ? 1 : 0
                      }&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&playsinline=1&enablejsapi=1${
                        typeof window !== 'undefined' && window.location.origin ? `&origin=${encodeURIComponent(window.location.origin)}` : ''
                      }`}
                      title={title}
                      className="w-full h-full border-0 object-cover scale-[1.01]"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <div 
                      onClick={() => setIsPlaying(true)}
                      className="w-full h-full bg-neutral-900 flex items-center justify-center relative cursor-pointer"
                    >
                      <img
                        src={video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.medium?.url}
                        alt={title}
                        className="w-full h-full object-cover opacity-70"
                        onError={handleThumbnailError}
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white shadow-xl hover:scale-105 transition-transform">
                          <Play className="w-7 h-7 fill-white ml-1" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Top Bar Controls (Mute & Play Pause) */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-auto">
                    {/* Play / Pause toggle */}
                    <button
                      onClick={() => setIsPlaying((prev) => !prev)}
                      className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all active:scale-90"
                      aria-label={isPlaying ? 'Pause video' : 'Play video'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                    </button>

                    {/* Mute / Unmute audio toggle */}
                    <button
                      onClick={() => setIsMuted((prev) => !prev)}
                      className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all active:scale-90"
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
                    </button>
                  </div>

                  {/* Bottom Gradient & Video Details Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 pb-4 sm:pb-4 pt-28 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex flex-col gap-2.5 z-10 text-white pointer-events-none">
                    {/* Creator Row */}
                    <div className="flex items-center gap-2.5 pointer-events-auto">
                      <div className="w-9 h-9 rounded-full bg-neutral-800 ring-2 ring-white/20 shrink-0 overflow-hidden">
                        <img
                          src={`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(channelTitle)}`}
                          alt={channelTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-bold text-sm truncate drop-shadow-md text-white">{channelTitle}</span>
                      <button
                        onClick={() => handleToggleSubscribe(channelId)}
                        className={cn(
                          'px-3 py-1 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer ml-1 shadow-sm shrink-0',
                          isSubscribed
                            ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                            : 'bg-white text-black hover:bg-neutral-200'
                        )}
                      >
                        {isSubscribed ? 'Subscribed' : 'Subscribe'}
                      </button>
                    </div>

                    {/* Video Title */}
                    <p
                      className="text-sm font-medium line-clamp-2 drop-shadow-md pointer-events-auto text-white leading-snug"
                      dangerouslySetInnerHTML={{ __html: title }}
                    />

                    {/* Audio Sound Pill */}
                    <div className="flex items-center gap-2 text-xs font-medium pointer-events-auto w-fit">
                      <span className="flex items-center gap-1.5 bg-black/40 hover:bg-black/60 px-2.5 py-1 rounded-full text-white/90 backdrop-blur-md border border-white/10 transition-colors">
                        <Music className="w-3 h-3 animate-pulse text-amber-400" />
                        <span className="truncate max-w-[200px]">Original audio · {channelTitle}</span>
                      </span>
                    </div>
                  </div>

                  {/* 
                    MOBILE ACTIONS OVERLAY:
                    Visible only on mobile (< sm), stacked vertically on bottom-right of the video
                  */}
                  <div className="flex sm:hidden absolute right-2.5 bottom-16 z-20 flex-col items-center gap-4 text-white">
                    {/* Like */}
                    <button
                      onClick={() => handleToggleLike(videoId)}
                      className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
                    >
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-colors',
                          isLiked ? 'bg-red-600 text-white' : 'bg-black/40 text-white'
                        )}
                      >
                        <ThumbsUp className={cn('w-5 h-5', isLiked && 'fill-white')} />
                      </div>
                      <span className="text-[11px] font-semibold drop-shadow">{displayLikes}</span>
                    </button>

                    {/* Dislike */}
                    <button
                      onClick={() => handleToggleDislike(videoId)}
                      className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
                    >
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-colors',
                          isDisliked ? 'bg-neutral-800 text-white' : 'bg-black/40 text-white'
                        )}
                      >
                        <ThumbsDown className={cn('w-5 h-5', isDisliked && 'fill-white')} />
                      </div>
                      <span className="text-[11px] font-semibold drop-shadow">Dislike</span>
                    </button>

                    {/* Comments */}
                    <button
                      onClick={() => setIsCommentsOpen(true)}
                      className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
                    >
                      <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-md">
                        <MessageSquare className="w-5 h-5 fill-white" />
                      </div>
                      <span className="text-[11px] font-semibold drop-shadow">{commentsCount}</span>
                    </button>

                    {/* Share */}
                    <button
                      onClick={() => handleShare(videoId, title)}
                      className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
                    >
                      <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-md">
                        <Share2 className="w-5 h-5 fill-white" />
                      </div>
                      <span className="text-[11px] font-semibold drop-shadow">Share</span>
                    </button>
                  </div>
                </div>

                {/* 
                  DESKTOP ACTION SIDEBAR:
                  Visible on sm, md, lg screens, positioned directly outside the 9:16 frame on the right side
                  matching official YouTube Desktop layout!
                */}
                <div className="hidden sm:flex flex-col justify-end gap-4 ml-4 pb-2 shrink-0">
                  {/* Like Button */}
                  <div className="flex flex-col items-center gap-1">
                    <Tooltip content="Like" position="right">
                      <button
                        onClick={() => handleToggleLike(videoId)}
                        className={cn(
                          'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-90 shadow-sm',
                          isLiked
                            ? 'bg-red-600 text-white shadow-md'
                            : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-[#272727] dark:hover:bg-[#3f3f3f] text-neutral-800 dark:text-neutral-200'
                        )}
                        aria-label="Like this short"
                      >
                        <ThumbsUp className={cn('w-5 h-5', isLiked && 'fill-white')} />
                      </button>
                    </Tooltip>
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      {displayLikes}
                    </span>
                  </div>

                  {/* Dislike Button */}
                  <div className="flex flex-col items-center gap-1">
                    <Tooltip content="Dislike" position="right">
                      <button
                        onClick={() => handleToggleDislike(videoId)}
                        className={cn(
                          'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-90 shadow-sm',
                          isDisliked
                            ? 'bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 shadow-md'
                            : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-[#272727] dark:hover:bg-[#3f3f3f] text-neutral-800 dark:text-neutral-200'
                        )}
                        aria-label="Dislike this short"
                      >
                        <ThumbsDown className={cn('w-5 h-5', isDisliked && 'fill-current')} />
                      </button>
                    </Tooltip>
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      Dislike
                    </span>
                  </div>

                  {/* Comments Button */}
                  <div className="flex flex-col items-center gap-1">
                    <Tooltip content="Comments" position="right">
                      <button
                        onClick={() => setIsCommentsOpen(true)}
                        className="w-12 h-12 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-[#272727] dark:hover:bg-[#3f3f3f] text-neutral-800 dark:text-neutral-200 flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-90 shadow-sm"
                        aria-label="Open comments"
                      >
                        <MessageSquare className="w-5 h-5 fill-current" />
                      </button>
                    </Tooltip>
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      {commentsCount}
                    </span>
                  </div>

                  {/* Share Button */}
                  <div className="flex flex-col items-center gap-1">
                    <Tooltip content="Share" position="right">
                      <button
                        onClick={() => handleShare(videoId, title)}
                        className="w-12 h-12 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-[#272727] dark:hover:bg-[#3f3f3f] text-neutral-800 dark:text-neutral-200 flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-90 shadow-sm"
                        aria-label="Share short"
                      >
                        <Share2 className="w-5 h-5 fill-current" />
                      </button>
                    </Tooltip>
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      Share
                    </span>
                  </div>

                  {/* More Options */}
                  <div className="flex flex-col items-center gap-1">
                    <Tooltip content="More actions" position="right">
                      <button
                        onClick={() => setShowToast('Shorts options')}
                        className="w-12 h-12 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-[#272727] dark:hover:bg-[#3f3f3f] text-neutral-800 dark:text-neutral-200 flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-90 shadow-sm"
                        aria-label="More options"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </Tooltip>
                  </div>

                  {/* Audio Sound Disc */}
                  <div className="w-11 h-11 rounded-lg bg-neutral-900 border-2 border-neutral-300 dark:border-white/20 overflow-hidden shadow-md mt-1 animate-[spin_8s_linear_infinite] cursor-pointer">
                    <img
                      src={video.snippet?.thumbnails?.default?.url}
                      alt="Audio Cover"
                      className="w-full h-full object-cover"
                      onError={handleThumbnailError}
                    />
                  </div>
                </div>

                {/* 
                  DESKTOP UP/DOWN NAVIGATION BUTTONS:
                  Floating beside the actions column on wide screens
                */}
                <div className="hidden lg:flex flex-col gap-3 ml-6 self-center z-10">
                  <Tooltip content="Previous (↑ / K)" position="right">
                    <button
                      onClick={handleScrollUp}
                      disabled={index === 0}
                      className={cn(
                        'w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer border',
                        index === 0
                          ? 'opacity-30 cursor-not-allowed bg-neutral-200 dark:bg-white/5 text-neutral-400 border-transparent'
                          : 'bg-white hover:bg-neutral-100 dark:bg-[#212121] dark:hover:bg-[#303030] text-neutral-800 dark:text-white border-neutral-200 dark:border-white/10 active:scale-90 hover:scale-105'
                      )}
                      aria-label="Previous video"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>
                  </Tooltip>

                  <Tooltip content="Next (↓ / J)" position="right">
                    <button
                      onClick={handleScrollDown}
                      disabled={index === videos.length - 1}
                      className={cn(
                        'w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer border',
                        index === videos.length - 1
                          ? 'opacity-30 cursor-not-allowed bg-neutral-200 dark:bg-white/5 text-neutral-400 border-transparent'
                          : 'bg-white hover:bg-neutral-100 dark:bg-[#212121] dark:hover:bg-[#303030] text-neutral-800 dark:text-white border-neutral-200 dark:border-white/10 active:scale-90 hover:scale-105'
                      )}
                      aria-label="Next video"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Spinner for Infinite Scroll */}
        {isFetchingNextPage && (
          <div className="w-full h-20 flex items-center justify-center snap-start">
            <div className="w-7 h-7 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Slide-over Comments Drawer */}
      {isCommentsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md h-full bg-white dark:bg-[#1f1f1f] shadow-2xl flex flex-col text-neutral-900 dark:text-white border-l border-neutral-200 dark:border-white/10 animate-in slide-in-from-right duration-200"
          >
            {/* Header */}
            <div className="p-4 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Comments</h3>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {(commentsList[activeVidId] || commentsList['default']).length}
                </span>
              </div>
              <button
                onClick={() => setIsCommentsOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
              {(commentsList[activeVidId] || commentsList['default']).map((comment, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 shrink-0 overflow-hidden">
                    <img
                      src={`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(comment.user)}`}
                      alt={comment.user}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-neutral-900 dark:text-white truncate">
                        {comment.user}
                      </span>
                      <span className="text-[11px] text-neutral-400">{comment.time}</span>
                    </div>
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-1 leading-relaxed">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment Input */}
            <form
              onSubmit={(e) => handleAddComment(activeVidId, e)}
              className="p-3 border-t border-neutral-200 dark:border-white/10 flex items-center gap-2 bg-neutral-50 dark:bg-[#181818]"
            >
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 bg-white dark:bg-[#282828] border border-neutral-300 dark:border-white/10 rounded-full px-4 py-2 text-xs outline-none focus:border-red-500 text-neutral-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="p-2 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Hide Scrollbar Style Helper */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `,
        }}
      />
    </div>
  );
}
