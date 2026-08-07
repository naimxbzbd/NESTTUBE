import React, { useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { cn } from '../lib/utils';
import { MoreVertical, ListFilter } from 'lucide-react';
import { searchVideos } from '../services/youtube';
import { formatPublishedAt } from '../lib/formatters';
import { useChannelAvatars } from '../hooks/useChannelAvatars';
import { getFallbackChannelAvatar } from '../lib/avatar';

export function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || 'React JS';
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteQuery({
    queryKey: ['search', query],
    queryFn: ({ pageParam = '' }) => searchVideos(query, 20, pageParam),
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
  const channelIds = videos.map((v: any) => v.snippet?.channelId).filter(Boolean);
  const channelAvatarMap = useChannelAvatars(channelIds);

  return (
    <div className="p-6 max-w-[1096px] mx-auto flex flex-col gap-4 text-neutral-900 dark:text-white transition-colors">
      
      {/* Filter Button */}
      <div className="flex justify-end pb-2 border-b border-neutral-200 dark:border-white/10">
         <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full transition-colors text-sm font-semibold text-neutral-800 dark:text-white cursor-pointer">
           <ListFilter className="w-5 h-5" />
           Filters
         </button>
      </div>

      <div className="flex flex-col gap-4 mt-2">
         {isLoading ? (
           <div className="flex justify-center items-center h-40">
             <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
           </div>
         ) : error ? (
           <div className="text-center text-red-500 p-8 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl">
             <h2 className="text-xl font-bold mb-2">Error Searching Videos</h2>
             <p>Please check your YouTube Data API Key in the environment configuration.</p>
          </div>
         ) : videos.length === 0 ? (
           <div className="text-center p-8 text-neutral-500 dark:text-white/60">No videos found for "{query}".</div>
         ) : (
           <>
             {videos.map((video: any, index: number) => {
               const id = typeof video.id === 'string' ? video.id : video.id.videoId;
               if (!id) return null;
               
               return (
                 <div key={`${id}-${index}`} className="flex flex-col sm:flex-row gap-4 group w-full">
                    <Link to={`/watch/${id}`} className="w-full sm:w-[360px] aspect-video sm:shrink-0 rounded-xl overflow-hidden relative cursor-pointer block bg-neutral-100 dark:bg-white/5">
                       <img 
                         src={video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url} 
                         alt={video.snippet.title} 
                         className="w-full h-full object-cover" 
                       />
                    </Link>
                    <div className="flex flex-col flex-1 py-1 pr-8 relative">
                       <Link to={`/watch/${id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                         <h3 className="text-lg font-bold leading-tight mb-1 text-neutral-900 dark:text-white" dangerouslySetInnerHTML={{ __html: video.snippet.title }}></h3>
                       </Link>
                       <div className="text-xs text-neutral-500 dark:text-white/60 mb-3">
                         {formatPublishedAt(video.snippet.publishedAt)}
                       </div>
                       <Link to={`/channel/${video.snippet.channelId}`} className="flex items-center gap-2 mb-3 w-fit group/channel">
                         <div className="w-6 h-6 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800 shrink-0 border border-neutral-200 dark:border-white/10 shadow-xs">
                           <img 
                             src={channelAvatarMap[video.snippet.channelId] || getFallbackChannelAvatar(video.snippet.channelTitle, video.snippet.channelId)} 
                             alt={video.snippet.channelTitle} 
                             className="w-full h-full object-cover group-hover/channel:scale-110 transition-transform" 
                           />
                         </div>
                         <div className="text-xs text-neutral-600 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1 font-medium">
                           {video.snippet.channelTitle}
                         </div>
                       </Link>
                       <p className="text-xs text-neutral-600 dark:text-white/60 line-clamp-2">
                         {video.snippet.description}
                       </p>
                       
                       <button className="absolute right-0 top-1 opacity-0 group-hover:opacity-100 p-1 cursor-pointer">
                         <MoreVertical className="w-5 h-5 text-neutral-600 dark:text-white/80" />
                       </button>
                    </div>
                 </div>
               );
             })}

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
      </div>
    </div>
  );
}
