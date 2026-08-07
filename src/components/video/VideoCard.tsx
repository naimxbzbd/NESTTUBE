import React, { useState } from 'react';
import { CheckCircle2, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { formatDuration, formatPublishedAt, formatViewCount } from '../../lib/formatters';
import { getFallbackChannelAvatar } from '../../lib/avatar';

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
  const channelLink = `/channel/${channelId || channelName.replace(/\s+/g, '')}`;

  const currentAvatarUrl = (!avatarError && channelAvatarUrl)
    ? channelAvatarUrl
    : getFallbackChannelAvatar(channelName, channelId);

  return (
    <div className="flex flex-col gap-3 group">
      <Link to={`/watch/${id}`} className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-100 dark:bg-white/5 block cursor-pointer">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className={cn("w-full h-full bg-gradient-to-tr opacity-80", thumbnailColor || "from-blue-600 to-indigo-900")}></div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white px-1.5 py-0.5 rounded text-[11px] font-bold">
          {duration ? formatDuration(duration) : '0:00'}
        </div>
        <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
           <button className="p-1 bg-black/80 text-white rounded hover:bg-black cursor-pointer" onClick={(e) => { e.preventDefault(); }}>
             <MoreVertical className="w-4 h-4" />
           </button>
        </div>
      </Link>
      <div className="flex gap-3 pr-6 relative">
        <Link to={channelLink} className="w-9 h-9 rounded-full shrink-0 block overflow-hidden bg-neutral-200 dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 shadow-xs">
          <img 
            src={currentAvatarUrl} 
            alt={channelName} 
            className="w-full h-full object-cover"
            onError={() => setAvatarError(true)}
          />
        </Link>
        <div className="flex flex-col">
          <Link to={`/watch/${id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
            <h3 className="text-[15px] font-bold leading-snug line-clamp-2 text-neutral-900 dark:text-white" dangerouslySetInnerHTML={{ __html: title }}></h3>
          </Link>
          <Link to={channelLink} className="text-[13px] text-neutral-600 dark:text-white/60 mt-1 flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white transition-colors">
            {channelName}
            {verified && <CheckCircle2 className="w-3.5 h-3.5 text-neutral-500 dark:text-white/80" />}
          </Link>
          <div className="text-[13px] text-neutral-500 dark:text-white/60">
            {views ? formatViewCount(views) : '0'} views • {publishedAt ? formatPublishedAt(publishedAt) : ''}
          </div>
        </div>
        <button className="absolute right-0 top-0 opacity-100 sm:opacity-0 group-hover:opacity-100 p-1 cursor-pointer text-neutral-600 dark:text-white/80" onClick={(e) => { e.preventDefault(); }}>
          <MoreVertical className="w-5 h-5 text-neutral-600 dark:text-white/80" />
        </button>
      </div>
    </div>
  );
}
