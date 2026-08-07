import React from 'react';
import { Link } from 'react-router-dom';
import { History, Clock, ThumbsUp, ListVideo, User, ChevronRight, PlaySquare, Plus } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { WatchHistorySection } from '../components/history/WatchHistorySection';

export function Library() {
  const { watchLaterVideos, likedVideos, playlists, subscribedChannels } = useUserStore();

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto flex flex-col gap-8 text-neutral-900 dark:text-white transition-colors">
      
      {/* Profile Header */}
      <div className="flex items-center gap-4 bg-gradient-to-r from-blue-600/10 via-neutral-100 dark:via-[#1e1e1e] to-neutral-50 dark:to-[#121212] p-6 rounded-3xl border border-neutral-200 dark:border-white/10 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-bold text-2xl flex items-center justify-center shadow-lg shrink-0">
          NX
        </div>
        <div className="flex flex-col">
          <h1 className="text-2xl font-extrabold tracking-tight">Naim Xbz</h1>
          <p className="text-xs text-neutral-500 dark:text-white/60">@naimxbz • {subscribedChannels.length} Subscriptions</p>
        </div>
      </div>

      {/* Watch History Horizontal Section */}
      <WatchHistorySection />

      {/* Quick Playlists Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ListVideo className="w-5 h-5 text-blue-500" /> Playlists
          </h2>
          <span className="text-xs text-neutral-500 dark:text-white/60">
            {playlists.length + 2} playlists
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          
          {/* Watch Later */}
          <Link
            to="/playlist/watch-later"
            className="p-5 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 hover:border-blue-500 transition-all flex flex-col justify-between h-36 group"
          >
            <div className="flex items-center justify-between">
              <Clock className="w-6 h-6 text-blue-500" />
              <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <h3 className="font-bold text-base">Watch Later</h3>
              <span className="text-xs text-neutral-500 dark:text-white/60">{watchLaterVideos.length} videos</span>
            </div>
          </Link>

          {/* Liked Videos */}
          <Link
            to="/playlist/liked"
            className="p-5 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 hover:border-blue-500 transition-all flex flex-col justify-between h-36 group"
          >
            <div className="flex items-center justify-between">
              <ThumbsUp className="w-6 h-6 text-blue-500" />
              <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <h3 className="font-bold text-base">Liked Videos</h3>
              <span className="text-xs text-neutral-500 dark:text-white/60">{likedVideos.length} videos</span>
            </div>
          </Link>

          {/* User Custom Playlists */}
          {playlists.map((pl) => (
            <Link
              key={pl.id}
              to={`/playlist/${pl.id}`}
              className="p-5 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 hover:border-blue-500 transition-all flex flex-col justify-between h-36 group"
            >
              <div className="flex items-center justify-between">
                <ListVideo className="w-6 h-6 text-indigo-500" />
                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <h3 className="font-bold text-base line-clamp-1">{pl.title}</h3>
                <span className="text-xs text-neutral-500 dark:text-white/60">{pl.videos.length} videos</span>
              </div>
            </Link>
          ))}

        </div>
      </div>

    </div>
  );
}
