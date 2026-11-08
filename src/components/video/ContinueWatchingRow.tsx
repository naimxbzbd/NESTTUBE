import React, { useEffect, useState } from 'react';
import { History, Play, X, Clock, Clapperboard, Film } from 'lucide-react';
import {
  getContinueWatchingList,
  removePlaybackProgress,
  PlaybackProgress,
} from '../../services/indexedDbStorage';
import { MediaImage } from '../ui/MediaImage';

interface ContinueWatchingRowProps {
  type: 'movie' | 'series';
  onSelect: (item: PlaybackProgress) => void;
  activeId?: string;
}

function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m`;
  }
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const ContinueWatchingRow: React.FC<ContinueWatchingRowProps> = ({
  type,
  onSelect,
  activeId,
}) => {
  const [items, setItems] = useState<PlaybackProgress[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadProgress = async () => {
    try {
      const data = await getContinueWatchingList(type);
      setItems(data);
    } catch (e) {
      console.warn('Error loading continue watching:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();

    // Listen for storage changes or page visibility
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadProgress();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [type]);

  const handleDismiss = async (e: React.MouseEvent, mediaId: string) => {
    e.stopPropagation();
    await removePlaybackProgress(mediaId);
    setItems((prev) => prev.filter((i) => i.mediaId !== mediaId));
  };

  if (loading || items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 pt-2 pb-1">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <History className="w-4 h-4 text-pink-400" />
          <span>যেখানে রেখেছিলেন সেখান থেকে দেখুন (Continue Watching)</span>
        </h3>
        <span className="text-xs text-slate-400 font-mono">
          {items.length} টি বাকি আছে
        </span>
      </div>

      <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1">
        {items.map((item) => {
          const isActive = activeId === item.mediaId;
          return (
            <div
              key={`continue-${item.mediaId}`}
              onClick={() => onSelect(item)}
              className={`group relative shrink-0 w-44 sm:w-52 rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 flex flex-col ${
                isActive
                  ? 'border-pink-500 shadow-xl shadow-pink-500/20 ring-2 ring-pink-500/30 scale-[1.02]'
                  : 'glass-card border-white/10 hover:border-white/25 hover:scale-[1.02]'
              }`}
            >
              {/* Media Poster Container */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/60">
                <MediaImage
                  src={item.poster}
                  alt={item.cleanTitle}
                  type={item.type === 'movie' ? 'movie' : 'series'}
                  fallbackText={item.cleanTitle}
                  className="group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

                {/* Dismiss X Button */}
                <button
                  onClick={(e) => handleDismiss(e, item.mediaId)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white/70 hover:text-white hover:bg-black/90 flex items-center justify-center transition-colors z-20"
                  title="তালিকা থেকে সরান"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Season / Episode Badge for series */}
                {item.type === 'series' && item.seasonNumber && item.episodeNumber && (
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-600/90 text-white shadow">
                    S{item.seasonNumber} E{item.episodeNumber}
                  </div>
                )}

                {/* Center Play Icon on Hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-pink-500/90 text-white flex items-center justify-center shadow-lg shadow-pink-500/30">
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Bottom Duration Tag */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-slate-300 font-mono">
                  <span>{formatDuration(item.currentTime)}</span>
                  <span className="text-slate-400">{formatDuration(item.duration)}</span>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-r"
                    style={{ width: `${Math.min(100, Math.max(3, item.percentage))}%` }}
                  />
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white truncate group-hover:text-pink-400 transition-colors">
                    {item.cleanTitle}
                  </h4>
                  {item.episodeTitle && (
                    <p className="text-[10px] text-purple-300/90 truncate mt-0.5">
                      {item.episodeTitle}
                    </p>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-pink-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Play className="w-2.5 h-2.5 fill-pink-400" /> দেখা শুরু করুন
                  </span>
                  <span className="text-slate-400 font-mono text-[9px]">
                    {item.percentage}% সম্পন্ন
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
