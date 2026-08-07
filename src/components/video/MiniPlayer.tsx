import React, { useState } from 'react';
import { X, Maximize2, Minimize2, Move } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMiniPlayer } from '../../context/MiniPlayerContext';
import { cn } from '../../lib/utils';
import { Tooltip } from '../ui/Tooltip';

export function MiniPlayer() {
  const { activeVideo, isMiniPlayerOpen, closeMiniPlayer } = useMiniPlayer();
  const [isMinimized, setIsMinimized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!isMiniPlayerOpen || !activeVideo) return null;

  // Don't duplicate iframe if user is already on the watch page for this exact video
  const isCurrentWatchPage = location.pathname === `/watch/${activeVideo.id}`;

  const handleExpand = () => {
    navigate(`/watch/${activeVideo.id}`);
    closeMiniPlayer();
  };

  return (
    <div
      className={cn(
        "fixed z-50 transition-all duration-300 shadow-2xl rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/20 bg-white dark:bg-[#181818] text-neutral-900 dark:text-white flex flex-col group",
        isMinimized
          ? "bottom-20 md:bottom-8 right-4 md:right-8 w-64 h-16"
          : "bottom-20 md:bottom-8 right-4 md:right-8 w-72 sm:w-80 md:w-96"
      )}
    >
      {/* Header Bar with Control Buttons */}
      <div className="bg-neutral-100 dark:bg-[#212121] px-3 py-2 flex items-center justify-between border-b border-neutral-200 dark:border-white/10 select-none">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Tooltip content="Drag player" position="top">
            <Move className="w-3.5 h-3.5 text-neutral-400 shrink-0 cursor-grab" />
          </Tooltip>
          <span className="text-xs font-bold truncate text-neutral-800 dark:text-white/90">
            {activeVideo.title || 'Floating Video Player'}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <Tooltip content={isMinimized ? "Expand Miniplayer" : "Minimize Miniplayer"} position="top">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded-lg hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-600 dark:text-white/70 transition-colors cursor-pointer"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <Tooltip content="Open full watch view" position="top">
            <button
              onClick={handleExpand}
              className="p-1 rounded-lg hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-600 dark:text-white/70 transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <Tooltip content="Close Floating Player" position="top">
            <button
              onClick={closeMiniPlayer}
              className="p-1 rounded-lg hover:bg-red-500/20 hover:text-red-500 text-neutral-600 dark:text-white/70 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Video Content */}
      {!isMinimized && (
        <div className="w-full aspect-video bg-black relative">
          {!isCurrentWatchPage ? (
            <iframe
              src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0`}
              title={activeVideo.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900 text-white p-4 text-center">
              <p className="text-xs text-neutral-400 mb-2">Video is playing in the main player above</p>
              <button
                onClick={closeMiniPlayer}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Close Floating Overlay
              </button>
            </div>
          )}
        </div>
      )}

      {/* Video Info Footer */}
      <div className="p-2.5 px-3 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold truncate leading-snug">{activeVideo.title}</p>
          <p className="text-[11px] text-neutral-500 dark:text-white/60 truncate">{activeVideo.channelTitle}</p>
        </div>
      </div>
    </div>
  );
}
