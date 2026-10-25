import React, { useState } from 'react';
import { PlaySquare, Check, Sparkles, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { VideoCard } from '../components/video/VideoCard';
import { getFallbackChannelAvatar } from '../lib/avatar';
import { handleThumbnailError } from '../lib/utils';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchCategoryVideos } from '../services/youtube';
import { InfiniteScrollSentinel } from '../components/ui/InfiniteScrollSentinel';

export function Subscriptions() {
  const { subscribedChannels, toggleSubscribe } = useUserStore();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['subscriptions-feed'],
    queryFn: ({ pageParam = '' }) => fetchCategoryVideos('Entertainment', 20, pageParam, 42),
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage?.nextPageToken || undefined,
  });

  const videos = data?.pages.flatMap((page) => page.items || []) || [];

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto flex flex-col gap-6 text-white transition-colors bg-transparent pb-bottom-nav">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 flex items-center justify-between border border-white/[0.08]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ff2d6f] to-[#c026d3] flex items-center justify-center shadow-lg shadow-pink-500/20 shrink-0">
            <PlaySquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              সাবস্ক্রিপশন <span className="text-aurora-gradient">(Subscriptions)</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              আপনার পছন্দের চ্যানেল ও নির্মাতাদের সাম্প্রতিক ভিডিও প্রবাহ।
            </p>
          </div>
        </div>

        <span className="glass-pill px-3.5 py-1.5 rounded-full font-bold text-xs text-cyan-300">
          {subscribedChannels.length} টি চ্যানেল
        </span>
      </div>

      {subscribedChannels.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-3xl border border-white/10 flex flex-col items-center gap-4 max-w-md mx-auto my-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <PlaySquare className="w-8 h-8 text-pink-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">কোনো চ্যানেল সাবস্ক্রাইব করা নেই</h3>
            <p className="text-xs text-slate-400">
              আপনার পছন্দের চ্যানেলগুলোকে সাবস্ক্রাইব করুন যাতে তাদের নতুন ভিডিও সবার আগে এখানে দেখতে পান।
            </p>
          </div>
          <Link
            to="/"
            className="px-6 py-2.5 bg-gradient-to-r from-[#ff2d6f] to-[#c026d3] text-white rounded-full text-xs font-bold shadow-lg shadow-pink-500/25 hover:opacity-95 transition-opacity"
          >
            জনপ্রিয় ভিডিও ও চ্যানেল খুঁজুন
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Channel Row Bar */}
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
            {subscribedChannels.map((ch) => (
              <div
                key={ch.id}
                className="flex flex-col items-center gap-2 p-3.5 rounded-2xl glass-card shrink-0 w-32 group"
              >
                <Link to={`/channel/${ch.id}`} className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-black/40 shadow-md group-hover:scale-105 transition-transform border border-white/10">
                    <img
                      src={ch.avatarUrl || getFallbackChannelAvatar(ch.title, ch.id)}
                      alt={ch.title}
                      className="w-full h-full object-cover"
                      onError={handleThumbnailError}
                    />
                  </div>
                  <span className="text-xs font-bold line-clamp-1 mt-2 text-center text-white group-hover:text-cyan-300 transition-colors">
                    {ch.title}
                  </span>
                </Link>
                <button
                  onClick={() => toggleSubscribe(ch)}
                  className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 glass-pill hover:bg-red-500/80 hover:text-white rounded-full transition-colors cursor-pointer"
                  title="Unsubscribe"
                >
                  <Check className="w-3 h-3 text-cyan-400 group-hover:text-white" />
                  <span>যুক্ত আছেন</span>
                </button>
              </div>
            ))}
          </div>

          {/* Subscribed Channels Feed with Infinite Scroll */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-cyan-400 animate-pulse" />
                <span className="text-aurora-gradient font-extrabold">সাম্প্রতিক সাবস্ক্রাইবড ভিডিও প্রবাহ</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
              {videos.map((video: any, index: number) => {
                const id = typeof video.id === 'string' ? video.id : video.id?.videoId;
                if (!id) return null;
                const uniqueKey = video.feedKey || `sub-${id}-${index}`;

                return (
                  <VideoCard
                    key={uniqueKey}
                    id={id}
                    title={video.snippet?.title || ''}
                    channelName={video.snippet?.channelTitle || ''}
                    channelId={video.snippet?.channelId}
                    views={video.statistics?.viewCount}
                    publishedAt={video.snippet?.publishedAt}
                    duration={video.contentDetails?.duration}
                    thumbnailUrl={video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url}
                  />
                );
              })}
            </div>

            {/* Unlimited Infinite Scroll Sentinel */}
            <InfiniteScrollSentinel
              onLoadMore={() => fetchNextPage()}
              hasMore={hasNextPage ?? true}
              isLoading={isFetchingNextPage}
              loadingText="আরও সাবস্ক্রিপশন ভিডিও লোড হচ্ছে..."
              skeletonVariant="video-grid"
              skeletonCount={4}
            />
          </div>
        </div>
      )}
    </div>
  );
}
