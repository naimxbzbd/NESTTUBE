import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlaySquare, Play } from 'lucide-react';
import { getWatchHistory } from '../../lib/watchHistory';
import { fetchCategoryVideos } from '../../services/youtube';
import { handleThumbnailError } from '../../lib/utils';

export function RecommendedPlaylistsSection() {
  const [playlists, setPlaylists] = useState<any[]>([]);

  useEffect(() => {
    const loadRecommendations = async () => {
      const history = getWatchHistory();
      if (!history || history.length === 0) return;

      // Extract some topics/channels from history
      const topChannels = [...new Set(history.map(h => h.channelName))].slice(0, 3);
      
      const promises = topChannels.map(async (channel) => {
        if (!channel) return null;
        try {
          const res = await fetchCategoryVideos(channel, 15);
          if (res?.items?.length > 1) {
            const videoIds = res.items.map((v: any) => typeof v.id === 'string' ? v.id : v.id?.videoId).filter(Boolean);
            if (videoIds.length > 0) {
              return {
                id: `mix_${channel.replace(/\s+/g, '')}`,
                title: `Mix - ${channel}`,
                description: `Based on your recent activity`,
                videos: res.items,
                videoIds: videoIds,
                thumbnailUrl: res.items[0].snippet?.thumbnails?.medium?.url || res.items[0].snippet?.thumbnails?.default?.url
              };
            }
          }
        } catch (e) {
          console.warn('Failed to load recommendation for', channel, e);
        }
        return null;
      });

      const results = await Promise.all(promises);
      setPlaylists(results.filter(Boolean));
    };

    loadRecommendations();
  }, []);

  if (playlists.length === 0) return null;

  return (
    <div className="mb-8 border-b border-neutral-200 dark:border-white/10 pb-6 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <PlaySquare className="w-5 h-5 text-blue-500" />
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">Recommended Mixes</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto no-scrollbar py-1">
        {playlists.map((pl) => {
          const firstId = pl.videoIds[0];
          const restIds = pl.videoIds.slice(1).join(',');
          const url = `/watch/${firstId}?playlistIds=${restIds}`;
          
          return (
            <div key={pl.id} className="w-64 shrink-0 group">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 mb-2 cursor-pointer shadow-sm border border-neutral-200 dark:border-white/5">
                <img src={pl.thumbnailUrl} alt={pl.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={handleThumbnailError} />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Link to={url} className="bg-white/20 hover:bg-white/40 p-3 rounded-full backdrop-blur-sm transition-colors">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </Link>
                </div>
                <div className="absolute right-1.5 bottom-1.5 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-white flex items-center gap-1">
                  <PlaySquare className="w-3 h-3" />
                  {pl.videoIds.length}
                </div>
              </div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white line-clamp-1 group-hover:text-blue-500 transition-colors">{pl.title}</h3>
              <p className="text-[11px] text-neutral-500 dark:text-white/60">{pl.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
