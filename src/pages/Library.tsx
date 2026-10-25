import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ThumbsUp, ListVideo, ChevronRight, Sparkles, UserCheck } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { WatchHistorySection } from '../components/history/WatchHistorySection';

export function Library() {
  const { watchLaterVideos, likedVideos, playlists, subscribedChannels, currentUser } = useUserStore();

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto flex flex-col gap-8 text-white transition-colors bg-transparent pb-bottom-nav">
      {/* Profile Header Banner */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/[0.08] flex items-center gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#ff9a1f] via-[#ff2d6f] to-[#c026d3] text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-pink-500/25 shrink-0">
          {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'NX'}
        </div>
        <div className="flex flex-col">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full glass-pill text-cyan-300 text-[11px] font-semibold w-fit mb-1.5">
            <UserCheck className="w-3.5 h-3.5 text-pink-400" />
            <span>সক্রিয় সদস্য (Active Member)</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            {currentUser?.name || 'Naim Xbz'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            @{currentUser?.email ? currentUser.email.split('@')[0] : 'naimxbz'} • {subscribedChannels.length} টি চ্যানেল সাবস্ক্রাইবড
          </p>
        </div>
      </div>

      {/* Watch History Horizontal Section */}
      <WatchHistorySection />

      {/* Quick Playlists Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ListVideo className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="text-aurora-gradient font-extrabold">আপনার প্লেলিস্ট সমূহ (Playlists)</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {playlists.length + 2} টি সংরক্ষিত সংগ্রহ
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Watch Later */}
          <Link
            to="/playlist/watch-later"
            className="p-5 rounded-2xl glass-card flex flex-col justify-between h-36 group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Clock className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-cyan-300 transition-all" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white group-hover:text-cyan-300 transition-colors">পরে দেখুন (Watch Later)</h3>
              <span className="text-xs text-slate-400 font-mono">{watchLaterVideos.length} টি ভিডিও</span>
            </div>
          </Link>

          {/* Liked Videos */}
          <Link
            to="/playlist/liked"
            className="p-5 rounded-2xl glass-card flex flex-col justify-between h-36 group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400">
                <ThumbsUp className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-pink-300 transition-all" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white group-hover:text-pink-300 transition-colors">পছন্দকৃত ভিডিও (Liked)</h3>
              <span className="text-xs text-slate-400 font-mono">{likedVideos.length} টি ভিডিও</span>
            </div>
          </Link>

          {/* User Custom Playlists */}
          {playlists.map((pl) => (
            <Link
              key={pl.id}
              to={`/playlist/${pl.id}`}
              className="p-5 rounded-2xl glass-card flex flex-col justify-between h-36 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <ListVideo className="w-5 h-5" />
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-purple-300 transition-all" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white group-hover:text-purple-300 transition-colors line-clamp-1">{pl.title}</h3>
                <span className="text-xs text-slate-400 font-mono">{pl.videos.length} টি ভিডিও</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
