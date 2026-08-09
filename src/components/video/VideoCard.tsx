import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, MoreVertical, ListPlus, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn, handleThumbnailError } from '../../lib/utils';
import { formatDuration, formatPublishedAt, formatViewCount } from '../../lib/formatters';
import { getFallbackChannelAvatar } from '../../lib/avatar';
import { SaveToPlaylistModal } from './SaveToPlaylistModal';
import { useUserStore } from '../../store/useUserStore';
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
  verified
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
    }
    // Also trigger popunder modal on content click
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
    <div className="flex flex-col gap-3 group">
      <Link to={`/watch/${id}`} onClick={handleVideoClick} className="relative aspect-video rounded-xl overflow-hidden bg-neutral-100 dark:bg-white/5 block cursor-pointer">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" onError={handleThumbnailError} />
        ) : (
          <div className={cn("w-full h-full bg-gradient-to-tr opacity-80", thumbnailColor || "from-blue-600 to-indigo-900")}></div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white px-1.5 py-0.5 rounded text-[12px] font-medium">
          {duration ? formatDuration(duration) : '0:00'}
        </div>
      </Link>
      <div className="flex gap-3 pr-6 relative">
        <Link to={channelLink} className="w-9 h-9 rounded-full shrink-0 block overflow-hidden bg-neutral-200 dark:bg-neutral-800">
          <img 
            src={currentAvatarUrl} 
            alt={channelName} 
            className="w-full h-full object-cover"
            onError={() => setAvatarError(true)}
          />
        </Link>
        <div className="flex flex-col">
          <Link to={`/watch/${id}`} onClick={handleVideoClick}>
            <h3 className="text-base font-semibold leading-snug line-clamp-2 text-[#0f0f0f] dark:text-[#f1f1f1]" dangerouslySetInnerHTML={{ __html: title }}></h3>
          </Link>
          <Link to={channelLink} className="text-sm text-[#606060] dark:text-[#aaaaaa] mt-1 flex items-center gap-1 hover:text-[#0f0f0f] dark:hover:text-[#f1f1f1] transition-colors">
            {channelName}
            {verified && <CheckCircle2 className="w-[14px] h-[14px] text-[#606060] dark:text-[#aaaaaa]" />}
          </Link>
          <div className="text-sm text-[#606060] dark:text-[#aaaaaa]">
            {views ? formatViewCount(views) : '0'} views • {publishedAt ? formatPublishedAt(publishedAt) : ''}
          </div>
        </div>
        
        <div className="absolute right-0 top-0" ref={menuRef}>
          <button 
            className="opacity-100 sm:opacity-0 group-hover:opacity-100 p-1 cursor-pointer text-[#0f0f0f] dark:text-[#f1f1f1] hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full" 
            onClick={(e) => { 
              e.preventDefault(); 
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen); 
            }}
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 top-8 w-56 bg-white dark:bg-[#282828] rounded-xl shadow-lg border border-neutral-200 dark:border-white/10 overflow-hidden z-20 py-2 animate-in fade-in zoom-in-95 duration-100">
              <button 
                onClick={handleWatchLater}
                className="w-full px-4 py-2 text-sm text-left flex items-center gap-3 hover:bg-neutral-100 dark:hover:bg-white/10 text-[#0f0f0f] dark:text-[#f1f1f1] transition-colors cursor-pointer"
              >
                <Clock className="w-5 h-5 text-[#0f0f0f] dark:text-[#f1f1f1]" strokeWidth={1.5} />
                {isInWatchLater(id) ? 'Remove from Watch Later' : 'Save to Watch later'}
              </button>
              <button 
                onClick={handleSaveToPlaylist}
                className="w-full px-4 py-2 text-sm text-left flex items-center gap-3 hover:bg-neutral-100 dark:hover:bg-white/10 text-[#0f0f0f] dark:text-[#f1f1f1] transition-colors cursor-pointer"
              >
                <ListPlus className="w-5 h-5 text-[#0f0f0f] dark:text-[#f1f1f1]" strokeWidth={1.5} />
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
