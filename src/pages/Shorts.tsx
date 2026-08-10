import React, { useState, useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, MoreHorizontal } from 'lucide-react';
import { cn, handleThumbnailError } from '../lib/utils';
import { searchVideos } from '../services/youtube';

export function Shorts() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = useInfiniteQuery({
    queryKey: ['shorts'],
    queryFn: ({ pageParam = '' }) => searchVideos('#shorts', 10, pageParam, '', 'relevance', 'short'),
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage?.nextPageToken || undefined,
  });

  const videos = data?.pages.flatMap((page) => page.items || []) || [];

  // Track currently visible video for autoplay optimization (if needed)
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            setActiveVideoIndex(index);
            // Fetch next page if we are near the end
            if (index >= videos.length - 3 && hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }
        });
      },
      { threshold: 0.6 }
    );

    const videoElements = document.querySelectorAll('.short-video-container');
    videoElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [videos, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading && videos.length === 0) {
    return (
      <div className="flex-1 h-full w-full flex items-center justify-center p-4 bg-white dark:bg-[#0f0f0f] transition-colors">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || videos.length === 0) {
    return (
      <div className="flex-1 h-full w-full flex items-center justify-center p-4 bg-white dark:bg-[#0f0f0f] transition-colors">
         <div className="text-center text-neutral-500 dark:text-white/60">No shorts found.</div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-[calc(100vh-64px)] sm:h-full w-full flex justify-center bg-white dark:bg-[#0f0f0f] overflow-hidden text-white transition-colors relative">
      <div 
        ref={containerRef}
        className="w-full max-w-[450px] h-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory hide-scrollbar relative"
        style={{ scrollBehavior: 'smooth' }}
      >
        {videos.map((video, index) => {
          const videoId = typeof video.id === 'string' ? video.id : video.id.videoId;
          if (!videoId) return null;
          const isActive = index === activeVideoIndex;

          return (
            <div 
              key={`${videoId}-${index}`} 
              data-index={index}
              className="short-video-container relative w-full h-full snap-start snap-always flex items-center justify-center p-2 sm:p-4 pb-[72px] sm:pb-4"
            >
              {/* Short Container */}
              <div className="relative w-full h-full max-h-[850px] rounded-2xl sm:rounded-3xl overflow-hidden bg-black flex group shadow-xl">
                {isActive ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&mute=0`}
                    title={video.snippet.title}
                    className="w-full h-full border-0 object-cover scale-[1.05]"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                    <img 
                      src={video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url} 
                      alt={video.snippet.title}
                      className="w-full h-full object-cover opacity-50"
                      onError={handleThumbnailError}
                    />
                  </div>
                )}
                
                {/* Overlay Info */}
                <div className="absolute bottom-0 left-0 right-16 p-4 pt-24 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col gap-3 pointer-events-none z-10">
                   <div className="flex items-center gap-3 pointer-events-auto">
                     <div className="w-9 h-9 rounded-full bg-neutral-700 shrink-0 overflow-hidden">
                       <img src={`https://picsum.photos/seed/${video.snippet.channelId}/100/100`} alt="Avatar" className="w-full h-full object-cover" />
                     </div>
                     <span className="font-bold text-sm line-clamp-1 text-white">{video.snippet.channelTitle}</span>
                     <button className="bg-white text-black px-3 py-1 rounded-full text-xs font-bold ml-1 active:scale-95 transition-transform">Subscribe</button>
                   </div>
                   <p className="text-sm font-semibold line-clamp-2 pointer-events-auto text-white" dangerouslySetInnerHTML={{ __html: video.snippet.title }}></p>
                   <div className="flex items-center gap-2 text-xs font-semibold pointer-events-auto">
                      <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-white backdrop-blur-sm">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                        Original sound
                      </span>
                   </div>
                </div>

                {/* Action Buttons */}
                <div className="absolute bottom-4 right-0 p-2 flex flex-col items-center gap-5 w-16 text-white z-10">
                  <div className="flex flex-col items-center gap-1.5">
                    <button className="p-2.5 bg-black/20 hover:bg-black/40 active:scale-90 rounded-full backdrop-blur-sm transition-all">
                      <ThumbsUp className="w-6 h-6 fill-white" />
                    </button>
                    <span className="text-xs font-semibold drop-shadow-md">Like</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <button className="p-2.5 bg-black/20 hover:bg-black/40 active:scale-90 rounded-full backdrop-blur-sm transition-all">
                      <ThumbsDown className="w-6 h-6" />
                    </button>
                    <span className="text-xs font-semibold drop-shadow-md">Dislike</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <button className="p-2.5 bg-black/20 hover:bg-black/40 active:scale-90 rounded-full backdrop-blur-sm transition-all">
                      <MessageSquare className="w-6 h-6 fill-white" />
                    </button>
                    <span className="text-xs font-semibold drop-shadow-md">423</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <button className="p-2.5 bg-black/20 hover:bg-black/40 active:scale-90 rounded-full backdrop-blur-sm transition-all">
                      <Share2 className="w-6 h-6 fill-white" />
                    </button>
                    <span className="text-xs font-semibold drop-shadow-md">Share</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 mt-2">
                    <button className="p-2.5 bg-black/20 hover:bg-black/40 active:scale-90 rounded-full backdrop-blur-sm transition-all">
                      <MoreHorizontal className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-md mt-4 shrink-0 border-2 border-white overflow-hidden animate-[spin_10s_linear_infinite]">
                     <img src={video.snippet.thumbnails?.default?.url} className="w-full h-full object-cover" alt="Thumbnail" onError={handleThumbnailError} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {isFetchingNextPage && (
          <div className="w-full h-24 flex items-center justify-center snap-start">
             <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
