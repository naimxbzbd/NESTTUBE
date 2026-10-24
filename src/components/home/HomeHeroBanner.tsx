import React, { useState } from 'react';
import { Play, Sparkles, Check, Gift, Radio, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDuration, formatPublishedAt, formatViewCount } from '../../lib/formatters';
import { handleThumbnailError } from '../../lib/utils';
import { useUserStore } from '../../store/useUserStore';
import { useCoinStore } from '../../store/useCoinStore';
import { useAdsterra } from '../../context/AdsterraContext';

interface HomeHeroBannerProps {
  video: any;
  category: string;
}

export const HomeHeroBanner: React.FC<HomeHeroBannerProps> = ({ video, category }) => {
  const { toggleWatchLater, isInWatchLater } = useUserStore();
  const { openGiftModal } = useCoinStore();
  const { triggerInterstitialIfNeeded, triggerPopunder } = useAdsterra();
  const [imgError, setImgError] = useState(false);

  if (!video || !video.snippet) return null;

  const id = typeof video.id === 'string' ? video.id : video.id?.videoId;
  if (!id) return null;

  const title = video.snippet.title || 'Featured Content';
  const channelName = video.snippet.channelTitle || 'PipraTube Creator';
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

  const handleGiftClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openGiftModal({
      id,
      title,
      channel: channelName,
    });
  };

  const isSaved = isInWatchLater(id);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden mb-8 shadow-2xl border border-white/10 group select-none bg-[#121824]">
      {/* Background Thumbnail Image with Cinematic Blur & Gradient */}
      <div className="absolute inset-0 bg-[#0b0f15] z-0 overflow-hidden">
        {!imgError ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700 opacity-25 filter blur-xs"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-pink-950 via-[#0b0f15] to-purple-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f15] via-[#0b0f15]/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f15]/95 via-[#0b0f15]/60 to-transparent z-10" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-20 p-5 sm:p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl flex flex-col gap-3">
          {/* PipraTube Spotlight Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/15 border border-[#ff2d6f]/30 text-[#ff2d6f] text-xs font-bold tracking-wide uppercase shadow-sm w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PipraTube Spotlight • {category === 'All' ? 'বিশেষ প্রদর্শনী' : category}</span>
          </div>

          {/* Title */}
          <Link to={`/watch/${id}`} onClick={handlePlayClick}>
            <h1
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight hover:text-[#ff2d6f] transition-colors line-clamp-2"
              dangerouslySetInnerHTML={{ __html: title }}
            />
          </Link>

          {/* Channel info & statistics */}
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-300 font-medium">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ff2d6f]" />
              {channelName}
            </span>
            <span>•</span>
            {views && <span>{formatViewCount(views)} ভিউজ</span>}
            {publishedAt && (
              <>
                <span>•</span>
                <span>{formatPublishedAt(publishedAt)}</span>
              </>
            )}
            {duration && (
              <>
                <span>•</span>
                <span className="px-2 py-0.5 rounded bg-black/60 text-white text-xs font-mono font-semibold">
                  {formatDuration(duration)}
                </span>
              </>
            )}
          </div>

          {/* Description */}
          {description && (
            <p className="text-xs sm:text-sm text-gray-400 line-clamp-2 leading-relaxed max-w-xl">
              {description}
            </p>
          )}

          {/* CTAs */}
          <div className="flex items-center flex-wrap gap-3 mt-2">
            <Link
              to={`/watch/${id}`}
              onClick={handlePlayClick}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#ff2d6f] to-[#c026d3] hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-pink-500/25 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>এখনই দেখুন</span>
            </Link>

            {/* Gift Coins Button */}
            <button
              onClick={handleGiftClick}
              className="flex items-center gap-2 px-4 py-3 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-semibold text-sm transition-all active:scale-95 cursor-pointer"
            >
              <Gift className="w-4 h-4 text-amber-400" />
              <span>উপহার পাঠান</span>
            </button>

            <button
              onClick={handleWatchLaterClick}
              className="flex items-center gap-2 px-4 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-all active:scale-95 cursor-pointer backdrop-blur-sm"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>সেভ করা হয়েছে</span>
                </>
              ) : (
                <span>পরে দেখুন</span>
              )}
            </button>
          </div>
        </div>

        {/* Right Thumbnail Preview Box with Glow */}
        <Link
          to={`/watch/${id}`}
          onClick={handlePlayClick}
          className="relative w-full md:w-[320px] lg:w-[360px] aspect-video rounded-2xl overflow-hidden shadow-2xl border-2 border-white/15 shrink-0 group/card block cursor-pointer"
        >
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
            onError={handleThumbnailError}
          />
          <div className="absolute inset-0 bg-black/30 group-hover/card:bg-black/50 transition-colors flex items-center justify-center">
            <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#ff2d6f] to-[#c026d3] text-white flex items-center justify-center shadow-lg shadow-pink-500/40 transform group-hover/card:scale-110 transition-transform">
              <Play className="w-6 h-6 fill-current ml-0.5" />
            </div>
          </div>
          {duration && (
            <div className="absolute bottom-2 right-2 bg-black/85 text-white text-xs font-mono font-bold px-2 py-0.5 rounded-md">
              {formatDuration(duration)}
            </div>
          )}
        </Link>
      </div>
    </div>
  );
};
