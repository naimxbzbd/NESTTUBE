import React, { useState } from 'react';
import { User, Sun, Moon, Clock, PlaySquare, Bookmark, ThumbsUp, LogOut, Settings, ChevronRight, ShieldCheck, Code2, Sparkles, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore';

interface UserAccountPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWatchTime: () => void;
  onOpenContactDeveloper?: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export function UserAccountPopover({
  isOpen,
  onClose,
  onOpenWatchTime,
  onOpenContactDeveloper,
  isDarkMode,
  toggleDarkMode,
}: UserAccountPopoverProps) {
  const { subscribedChannels, watchLaterVideos, likedVideos, playlists, isPremium, togglePremium, currentUser, logout } = useUserStore();

  if (!isOpen || !currentUser) return null;

  const handleDeveloperProfileClick = () => {
    onClose();
    if (onOpenContactDeveloper) {
      onOpenContactDeveloper();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div className="absolute right-4 top-14 z-50 w-72 bg-white dark:bg-[#212121] text-neutral-900 dark:text-white rounded-2xl shadow-2xl border border-neutral-200 dark:border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 transition-colors">
        
        {/* User Card */}
        <div className="p-4 border-b border-neutral-200 dark:border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 shadow-md uppercase">
            {currentUser.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm line-clamp-1">{currentUser.name}</span>
            <span className="text-xs text-neutral-500 dark:text-white/60 line-clamp-1">{currentUser.email}</span>
            <button
              onClick={handleDeveloperProfileClick}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold mt-0.5 text-left cursor-pointer"
            >
              View Developer profile
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="py-2 border-b border-neutral-200 dark:border-white/10 space-y-0.5 text-xs font-medium">
          <button
            onClick={handleDeveloperProfileClick}
            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Code2 className="w-4 h-4 text-blue-500" />
              <span className="font-semibold text-blue-600 dark:text-blue-400">Developer Profile & Contact</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 dark:text-white/40" />
          </button>

          <Link
            to="/history"
            onClick={onClose}
            className="flex items-center justify-between px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-neutral-500 dark:text-white/70" />
              <span>Watch History</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 dark:text-white/40" />
          </Link>

          <Link
            to="/playlist/watch-later"
            onClick={onClose}
            className="flex items-center justify-between px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Bookmark className="w-4 h-4 text-neutral-500 dark:text-white/70" />
              <span>Watch Later ({watchLaterVideos.length})</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 dark:text-white/40" />
          </Link>

          <Link
            to="/playlist/liked"
            onClick={onClose}
            className="flex items-center justify-between px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ThumbsUp className="w-4 h-4 text-neutral-500 dark:text-white/70" />
              <span>Liked Videos ({likedVideos.length})</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 dark:text-white/40" />
          </Link>

          <Link
            to="/subscriptions"
            onClick={onClose}
            className="flex items-center justify-between px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <PlaySquare className="w-4 h-4 text-neutral-500 dark:text-white/70" />
              <span>Subscriptions ({subscribedChannels.length})</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 dark:text-white/40" />
          </Link>
        </div>

        {/* Controls */}
        <div className="py-2 border-b border-neutral-200 dark:border-white/10 space-y-0.5 text-xs font-medium">
          {isPremium ? (
            <div className="w-full flex items-center justify-between px-4 py-2.5 bg-amber-50 dark:bg-amber-900/10 text-left">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <div className="flex flex-col">
                  <span className="font-bold text-amber-600 dark:text-amber-400">NESTTube Premium</span>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    Ad-Free Mode Active
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between px-4 py-2.5 text-left opacity-75">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-neutral-400" />
                <div className="flex flex-col">
                  <span className="font-bold text-neutral-500 dark:text-neutral-400">NESTTube Free</span>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    Use coupon for premium
                  </span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              onOpenWatchTime();
              onClose();
            }}
            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Time Watched</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 dark:text-white/40" />
          </button>

          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
              <span>Appearance: {isDarkMode ? 'Dark' : 'Light'}</span>
            </div>
            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-neutral-300'}`}>
              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-4' : ''}`} />
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="p-2">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>

      </div>
    </>
  );
}
