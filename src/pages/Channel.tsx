import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { VideoCard } from '../components/video/VideoCard';
import { CheckCircle2, Search as SearchIcon, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { getChannelDetails, searchVideos } from '../services/youtube';
import { formatViewCount, formatPublishedAt } from '../lib/formatters';

export function Channel() {
  const { id } = useParams<{ id: string }>();

  const { data: channelData, isLoading: channelLoading } = useQuery({
    queryKey: ['channel', id],
    queryFn: () => getChannelDetails(id || ''),
    enabled: !!id && id.startsWith('UC') // Only fetch if it looks like a channel ID
  });

  const { data: videosData, isLoading: videosLoading } = useQuery({
    queryKey: ['channelVideos', id],
    queryFn: () => searchVideos('', 12, '', id),
    enabled: !!id
  });

  const channel = channelData?.items?.[0];
  const videos = videosData?.items || [];

  if (channelLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If we couldn't fetch (e.g. no API key or invalid ID)
  if (!channel) {
    return <div className="p-6 text-center">Channel not found or API key not configured.</div>;
  }

  const { snippet, statistics, brandingSettings } = channel;

  return (
    <div className="flex flex-col min-h-full text-neutral-900 dark:text-white transition-colors">
      {/* Banner */}
      <div className="w-full h-32 md:h-48 lg:h-64 bg-gradient-to-r from-purple-900 via-indigo-800 to-blue-900 relative object-cover overflow-hidden">
        {brandingSettings?.image?.bannerExternalUrl && (
          <img src={brandingSettings.image.bannerExternalUrl} alt="Banner" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Channel Header */}
      <div className="px-6 md:px-16 lg:px-24 py-6 max-w-[1280px] mx-auto w-full">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-purple-600 shrink-0 overflow-hidden">
            {snippet.thumbnails?.medium?.url && (
              <img src={snippet.thumbnails.medium.url} alt={snippet.title} className="w-full h-full object-cover" />
            )}
          </div>
          
          <div className="flex flex-col flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-2 mb-2 text-neutral-900 dark:text-white">
              {snippet.title} <CheckCircle2 className="w-6 h-6 text-neutral-400 dark:text-gray-400" />
            </h1>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-neutral-600 dark:text-white/60 mb-2">
              <span className="font-semibold text-neutral-900 dark:text-white">{snippet.customUrl || `@${snippet.title.replace(/\s+/g, '')}`}</span>
              <span className="hidden sm:inline">•</span>
              <span>{formatViewCount(statistics.subscriberCount)} subscribers</span>
              <span className="hidden sm:inline">•</span>
              <span>{formatViewCount(statistics.videoCount)} videos</span>
            </div>
            
            <div className="text-sm text-neutral-600 dark:text-white/60 flex items-center gap-1 cursor-pointer hover:text-neutral-900 dark:hover:text-white transition-colors mb-4 line-clamp-1">
              {snippet.description || 'Welcome to my channel!'} <ChevronRight className="w-4 h-4" />
            </div>

            <div className="flex items-center gap-3">
              <button className="bg-neutral-900 text-white dark:bg-white dark:text-black px-4 py-2 rounded-full font-semibold text-sm hover:bg-neutral-800 dark:hover:bg-gray-200 transition-colors">
                Subscribe
              </button>
              <button className="bg-neutral-100 hover:bg-neutral-200 dark:bg-white/10 dark:hover:bg-white/20 text-neutral-800 dark:text-white px-4 py-2 rounded-full font-semibold text-sm transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 md:px-16 lg:px-24 border-b border-neutral-200 dark:border-white/10 max-w-[1280px] mx-auto w-full flex gap-8 overflow-x-auto no-scrollbar">
        {['Home', 'Videos', 'Shorts', 'Live', 'Podcasts', 'Playlists', 'Community'].map((tab, i) => (
          <button 
            key={tab} 
            className={cn(
              "py-3 font-medium text-sm transition-colors whitespace-nowrap border-b-2",
              i === 0 
                ? "text-neutral-900 border-neutral-900 dark:text-white dark:border-white" 
                : "text-neutral-500 border-transparent hover:text-neutral-900 dark:text-white/60 dark:hover:text-white"
            )}
          >
            {tab}
          </button>
        ))}
        <button className="py-3 text-neutral-500 hover:text-neutral-900 dark:text-white/60 dark:hover:text-white ml-auto">
          <SearchIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="px-6 md:px-16 lg:px-24 py-6 max-w-[1280px] mx-auto w-full flex flex-col gap-6">
         <h2 className="text-lg font-bold">Latest Videos</h2>
         {videosLoading ? (
           <div className="flex justify-center items-center h-40">
             <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
           </div>
         ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
            {videos.map((video: any) => {
               const vidId = typeof video.id === 'string' ? video.id : video.id.videoId;
               if (!vidId) return null;
               
               return (
                 <VideoCard
                    key={vidId}
                    id={vidId}
                    title={video.snippet.title}
                    channelName={video.snippet.channelTitle}
                    channelId={video.snippet.channelId}
                    publishedAt={video.snippet.publishedAt}
                    thumbnailUrl={video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url}
                    avatarColor="bg-blue-600"
                    channelAvatarUrl={snippet.thumbnails?.default?.url}
                  />
               );
            })}
          </div>
         )}
      </div>
    </div>
  );
}
