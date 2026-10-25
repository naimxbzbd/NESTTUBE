import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { cn, handleThumbnailError } from '../lib/utils';
import { MoreVertical, ListFilter, Sparkles } from 'lucide-react';
import { searchVideos } from '../services/youtube';
import { formatPublishedAt } from '../lib/formatters';
import { useChannelAvatars } from '../hooks/useChannelAvatars';
import { getFallbackChannelAvatar } from '../lib/avatar';
import { InfiniteScrollSentinel } from '../components/ui/InfiniteScrollSentinel';

export function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || 'React JS';

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ['search', query],
    queryFn: ({ pageParam = '' }) => searchVideos(query, 20, pageParam),
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage?.nextPageToken || undefined,
  });

  const videos = data?.pages.flatMap((page) => page.items || []) || [];
  const channelIds = videos.map((v: any) => v.snippet?.channelId).filter(Boolean);
  const channelAvatarMap = useChannelAvatars(channelIds);

  return (
    <div className="p-4 sm:p-6 max-w-[1096px] mx-auto flex flex-col gap-5 text-white transition-colors bg-transparent pb-bottom-nav">
      {/* Search Header Banner */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 flex items-center justify-between border border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white">
              অনুসন্ধানের ফলাফল: <span className="text-aurora-gradient font-extrabold">"{query}"</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              {videos.length > 0 ? `${videos.length}+ টি ফলাফল প্রদর্শিত হচ্ছে` : 'অনুসন্ধান চলছে...'}
            </p>
          </div>
        </div>

        <button className="flex items-center gap-2 px-3.5 py-1.5 glass-pill rounded-full text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer">
          <ListFilter className="w-4 h-4 text-pink-400" />
          <span>ফিল্টার</span>
        </button>
      </div>

      <div className="flex flex-col gap-4 mt-1">
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`search-skel-${i}`} className="flex flex-col sm:flex-row gap-4 p-3 rounded-2xl glass-card">
                <div className="w-full sm:w-[320px] aspect-video rounded-xl skeleton-aurora shrink-0" />
                <div className="flex-1 space-y-3 py-2">
                  <div className="h-4 w-3/4 rounded skeleton-aurora" />
                  <div className="h-3 w-1/3 rounded skeleton-aurora" />
                  <div className="h-3 w-1/2 rounded skeleton-aurora" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-400 p-8 glass-panel border border-red-500/20 rounded-2xl">
            <h2 className="text-lg font-bold mb-2">ভিডিও অনুসন্ধান করতে সমস্যা হয়েছে</h2>
            <p className="text-xs text-slate-400">দয়া করে আপনার ইন্টারনেট সংযোগ অথবা কীওয়ার্ড পুনরায় পরীক্ষা করুন।</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center p-12 glass-panel rounded-2xl text-slate-400 text-sm">
            "{query}" এর জন্য কোনো ভিডিও পাওয়া যায়নি।
          </div>
        ) : (
          <>
            {videos.map((video: any, index: number) => {
              const id = typeof video.id === 'string' ? video.id : video.id?.videoId;
              if (!id) return null;
              const uniqueKey = video.feedKey || `search-${id}-${index}`;

              return (
                <div
                  key={uniqueKey}
                  className="flex flex-col sm:flex-row gap-4 group w-full glass-card p-3 sm:p-3.5 rounded-2xl transition-all duration-300"
                >
                  <Link
                    to={`/watch/${id}`}
                    className="w-full sm:w-[340px] aspect-video sm:shrink-0 rounded-xl overflow-hidden relative cursor-pointer block bg-black/40 border border-white/[0.06] group-hover:border-white/20 transition-all"
                  >
                    <img
                      src={video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url}
                      alt={video.snippet?.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={handleThumbnailError}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </Link>

                  <div className="flex flex-col flex-1 py-1 pr-6 relative min-w-0">
                    <Link to={`/watch/${id}`} className="group/title">
                      <h3
                        className="text-base font-bold leading-snug mb-1.5 text-white group-hover/title:text-cyan-300 transition-colors line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: video.snippet?.title || '' }}
                      />
                    </Link>

                    <div className="text-xs text-slate-400 mb-2 font-medium">
                      {formatPublishedAt(video.snippet?.publishedAt)}
                    </div>

                    <Link
                      to={`/channel/${video.snippet?.channelId}`}
                      className="flex items-center gap-2 mb-2 w-fit group/channel"
                    >
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-white/5 shrink-0 border border-white/10 shadow-xs">
                        <img
                          src={
                            channelAvatarMap[video.snippet?.channelId] ||
                            getFallbackChannelAvatar(video.snippet?.channelTitle, video.snippet?.channelId)
                          }
                          alt={video.snippet?.channelTitle}
                          className="w-full h-full object-cover group-hover/channel:scale-110 transition-transform"
                          onError={handleThumbnailError}
                        />
                      </div>
                      <span className="text-xs text-slate-300 group-hover/channel:text-white transition-colors font-medium truncate">
                        {video.snippet?.channelTitle}
                      </span>
                    </Link>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {video.snippet?.description}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Unlimited Infinite Scroll Sentinel */}
            <InfiniteScrollSentinel
              onLoadMore={() => fetchNextPage()}
              hasMore={hasNextPage ?? true}
              isLoading={isFetchingNextPage}
              loadingText="আরও ভিডিও ফলাফল লোড হচ্ছে..."
              skeletonVariant="list"
              skeletonCount={3}
            />
          </>
        )}
      </div>
    </div>
  );
}
