import React, { useState } from 'react';
import { Play, Clock, Sparkles, CheckCircle2, Check, Flame } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDuration, formatPublishedAt, formatViewCount } from '../../lib/formatters';
import { handleThumbnailError } from '../../lib/utils';
import { useUserStore } from '../../store/useUserStore';
import { useAdsterra } from '../../context/AdsterraContext';

interface HomeHeroBannerProps {
  video: any;
  category: string;
}

export const HomeHeroBanner: React.FC<HomeHeroBannerProps> = ({ video, category }) => {
  const navigate = useNavigate();
  const { toggleWatchLater, isInWatchLater } = useUserStore();
  const { triggerInterstitialIfNeeded, triggerPopunder } = useAdsterra();
  const [imgError, setImgError] = useState(false);

  if (!video || !video.snippet) return null;

  const id = typeof video.id === 'string' ? video.id : video.id?.videoId;
  if (!id) return null;

  const title = video.snippet.title || 'Featured Content';
  const channelName = video.snippet.channelTitle || 'YouTube Creator';
  const description = video.snippet.description || '';
  const views = video.statistics?.viewCount;
  const publishedAt = video.snippet.publishedAt;
  const duration = video.contentDetails?.duration;
  const thumbnailUrl =
    video.snippet.thumbnails?.high?.url ||
    video.snippet.thumbnails?.medium?.url ||
    `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  const handlePlayClick = (e: React.MouseEvent) => {
    const watchPath = `/watch/${id}`;
    const triggered = triggerInterstitialIfNeeded(watchPath);
    if (triggered) {
      e.preventDefault();
      return;
    }
    triggerPopunder();
  };

  const handleWatchLaterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchLater({
      id,
      title,
      channelName,
      channelId: video.snippet.channelId,
      views,
      publishedAt,
      duration,
      thumbnailUrl,
    });
  };

  const isSaved = isInWatchLater(id);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden mb-8 shadow-xl border border-neutral-200/60 dark:border-white/10 group select-none">
      {/* Background Thumbnail Image with Cinematic Blur & Gradient */}
      <div className="absolute inset-0 bg-neutral-900 z-0 overflow-hidden">
        {!imgError ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700 opacity-40 dark:opacity-30 filter blur-xs"
            referrerPolicy="no-referrer"
            onError={() => {
              setImgError(true);
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-red-950 via-neutral-900 to-indigo-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 dark:from-[#0f0f0f] dark:via-[#0f0f0f]/85 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 dark:from-[#0f0f0f]/95 dark:via-[#0f0f0f]/60 to-transparent z-10" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-20 p-5 sm:p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl flex flex-col gap-3">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold tracking-wide uppercase shadow-sm w-fit">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>Spotlight • {category === 'All' ? 'Trending Featured' : category}</span>
          </div>

          {/* Title */}
          <Link to={`/watch/${id}`} onClick={handlePlayClick}>
            <h1
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-neutral-900 dark:text-white leading-tight hover:text-red-600 dark:hover:text-red-400 transition-colors line-clamp-2"
              dangerouslySetInnerHTML={{ __html: title }}
            />
          </Link>

          {/* Channel info & statistics */}
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 font-medium">
            <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1">
              {channelName}
              <CheckCircle2 className="w-4 h-4 text-blue-500 fill-current inline" />
            </span>
            <span>•</span>
            {views && <span>{formatViewCount(views)} views</span>}
            {publishedAt && (
              <>
                <span>•</span>
                <span>{formatPublishedAt(publishedAt)}</span>
              </>
            )}
            {duration && (
              <>
                <span>•</span>
                <span className="px-1.5 py-0.5 rounded bg-black/60 text-white text-xs font-semibold">
                  {formatDuration(duration)}
                </span>
              </>
            )}
          </div>

          {/* Description */}
          {description && (
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed max-w-xl">
              {description}
            </p>
          )}

          {/* CTAs */}
          <div className="flex items-center gap-3 mt-2">
            <Link
              to={`/watch/${id}`}
              onClick={handlePlayClick}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Watch Now</span>
            </Link>

            <button
              onClick={handleWatchLaterClick}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-neutral-200/80 hover:bg-neutral-300/80 dark:bg-white/10 dark:hover:bg-white/20 text-neutral-900 dark:text-white font-semibold text-sm transition-all active:scale-95 cursor-pointer backdrop-blur-sm"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Watch Later</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Thumbnail Preview Box */}
        <Link
          to={`/watch/${id}`}
          onClick={handlePlayClick}
          className="relative w-full md:w-[320px] lg:w-[360px] aspect-video rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 dark:border-white/10 shrink-0 group/card block cursor-pointer"
        >
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
            onError={handleThumbnailError}
          />
          <div className="absolute inset-0 bg-black/20 group-hover/card:bg-black/40 transition-colors flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg transform group-hover/card:scale-110 transition-transform">
              <Play className="w-6 h-6 fill-current ml-0.5" />
            </div>
          </div>
          {duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-0.5 rounded-md">
              {formatDuration(duration)}
            </div>
          )}
        </Link>
      </div>
    </div>
  );
};
