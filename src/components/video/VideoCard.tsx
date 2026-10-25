import { useState, useRef, useEffect } from 'react';
import { CheckCircle2, MoreVertical, ListPlus, Clock, Sparkles, Gift } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn, handleThumbnailError } from '../../lib/utils';
import { formatDuration, formatPublishedAt, formatViewCount } from '../../lib/formatters';
import { getFallbackChannelAvatar } from '../../lib/avatar';
import { SaveToPlaylistModal } from './SaveToPlaylistModal';
import { useUserStore } from '../../store/useUserStore';
import { useCoinStore } from '../../store/useCoinStore';
import { useAdsterra } from '../../context/AdsterraContext';

export interface VideoCardProps {
  id: string;
  title: string;
  channelName: string;
  channelId?: string;
  views?: string | number;
  publishedAt?: string;
  duration?: string;
  thumbnailUrl?: string;
  thumbnailColor?: string;
  avatarColor?: string;
  channelAvatarUrl?: string;
  verified?: boolean;
  recommendationReason?: string;
  recommendationType?: 'search' | 'interest' | 'channel' | 'related' | 'trending';
}

export function VideoCard({
  id,
  title,
  channelName,
  channelId,
  views,
  publishedAt,
  duration,
  thumbnailUrl,
  thumbnailColor,
  channelAvatarUrl,
  verified,
  recommendationReason,
  recommendationType,
}: VideoCardProps) {
  const [avatarError, setAvatarError] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { triggerInterstitialIfNeeded, triggerPopunder } = useAdsterra();
  
  const { toggleWatchLater, isInWatchLater } = useUserStore();

  const handleVideoClick = (e: React.MouseEvent) => {
    const watchPath = `/watch/${id}`;
    const triggered = triggerInterstitialIfNeeded(watchPath);
    if (triggered) {
      e.preventDefault();
      return; // Only show 1 popup: do not trigger popunder when interstitial is already active
    }
    // Only trigger popunder if interstitial was not triggered
    triggerPopunder();
  };

  const channelLink = `/channel/${channelId || channelName.replace(/\s+/g, '')}`;
  const currentAvatarUrl = (!avatarError && channelAvatarUrl)
    ? channelAvatarUrl
    : getFallbackChannelAvatar(channelName, channelId);
    
  const videoObject = {
    id,
    title,
    channelName,
    channelId,
    views: String(views || '0'),
    publishedAt: publishedAt || new Date().toISOString(),
    duration: duration || '0:00',
    thumbnailUrl,
    thumbnailColor,
    avatarColor: 'bg-neutral-500',
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleSaveToPlaylist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    setIsSaveModalOpen(true);
  };
  
  const handleWatchLater = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    toggleWatchLater(videoObject);
  };

  return (
    <div className="flex flex-col gap-3 group glass-card p-2 sm:p-2.5 rounded-2xl transition-all duration-300">
      <Link to={`/watch/${id}`} onClick={handleVideoClick} className="relative aspect-video rounded-xl overflow-hidden bg-black/40 block cursor-pointer border border-white/[0.06] group-hover:border-white/20 transition-all">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
            onError={handleThumbnailError}
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        ) : (
          <div className={cn("w-full h-full bg-gradient-to-tr opacity-80", thumbnailColor || "from-blue-600 to-indigo-900")}></div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-md border border-white/10 text-white px-2 py-0.5 rounded-md text-[11px] font-mono tracking-tight font-medium shadow-md">
          {duration ? formatDuration(duration) : '0:00'}
        </div>
      </Link>
      <div className="flex gap-2.5 pr-6 relative px-0.5">
        <Link to={channelLink} className="w-9 h-9 rounded-full shrink-0 block overflow-hidden bg-white/5 border border-white/10 shadow-md hover:scale-105 transition-transform">
          <img 
            src={currentAvatarUrl} 
            alt={channelName} 
            className="w-full h-full object-cover" 
            onError={() => setAvatarError(true)}
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        </Link>
        <div className="flex flex-col flex-1 min-w-0">
          <Link to={`/watch/${id}`} onClick={handleVideoClick}>
            <h3 className="text-sm sm:text-base font-bold leading-snug line-clamp-2 text-white group-hover:text-cyan-300 transition-colors" dangerouslySetInnerHTML={{ __html: title }}></h3>
          </Link>
          <Link to={channelLink} className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-1 hover:text-white transition-colors truncate">
            <span className="truncate">{channelName}</span>
            {verified && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
          </Link>
          <div className="text-xs text-slate-400 mt-0.5 font-medium">
            {views ? formatViewCount(views) : '0'} views • {publishedAt ? formatPublishedAt(publishedAt) : ''}
          </div>
          {recommendationReason && (
            <div className="flex items-center gap-1 mt-1.5 text-[11px] font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-lg w-fit shadow-xs">
              <Sparkles className="w-3 h-3 shrink-0 text-pink-400" />
              <span className="truncate max-w-[200px]">{recommendationReason}</span>
            </div>
          )}
        </div>
        
        <div className="absolute right-0 top-0" ref={menuRef}>
          <button 
            className="opacity-100 sm:opacity-0 group-hover:opacity-100 p-1.5 cursor-pointer text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors" 
            onClick={(e) => { 
              e.preventDefault(); 
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen); 
            }}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 top-8 w-56 glass-panel rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-20 py-2 animate-in fade-in zoom-in-95 duration-100">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  useCoinStore.getState().openGiftModal({
                    id,
                    title,
                    channel: channelName,
                  });
                }}
                className="w-full px-4 py-2 text-xs sm:text-sm text-left flex items-center gap-3 hover:bg-white/10 text-amber-300 font-semibold transition-colors cursor-pointer"
              >
                <Gift className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
                উপহার পাঠান (Send Gift)
              </button>
              <button 
                onClick={handleWatchLater}
                className="w-full px-4 py-2 text-xs sm:text-sm text-left flex items-center gap-3 hover:bg-white/10 text-slate-200 transition-colors cursor-pointer"
              >
                <Clock className="w-4 h-4 text-slate-300" strokeWidth={1.5} />
                {isInWatchLater(id) ? 'Remove from Watch Later' : 'Save to Watch later'}
              </button>
              <button 
                onClick={handleSaveToPlaylist}
                className="w-full px-4 py-2 text-xs sm:text-sm text-left flex items-center gap-3 hover:bg-white/10 text-slate-200 transition-colors cursor-pointer"
              >
                <ListPlus className="w-4 h-4 text-slate-300" strokeWidth={1.5} />
                Save to playlist
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Save to Playlist Modal */}
      <SaveToPlaylistModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        video={videoObject}
      />
    </div>
  );
}
