import React from 'react';
import { PlaySquare, Bell, Check, UserMinus, Plus, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { VideoCard } from '../components/video/VideoCard';
import { getFallbackChannelAvatar } from '../lib/avatar';

export function Subscriptions() {
  const { subscribedChannels, toggleSubscribe } = useUserStore();

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto flex flex-col gap-6 text-neutral-900 dark:text-white transition-colors">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <PlaySquare className="w-7 h-7 text-red-600" />
          <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
          <span className="text-xs px-2.5 py-1 bg-neutral-100 dark:bg-white/10 rounded-full font-semibold">
            {subscribedChannels.length} channels
          </span>
        </div>
      </div>

      {subscribedChannels.length === 0 ? (
        <div className="p-12 text-center bg-neutral-50 dark:bg-white/5 rounded-2xl border border-neutral-200 dark:border-white/10 flex flex-col items-center gap-3">
          <PlaySquare className="w-12 h-12 text-neutral-400 dark:text-white/40" />
          <h3 className="text-lg font-bold">No subscriptions yet</h3>
          <p className="text-xs text-neutral-500 dark:text-white/60 max-w-md">
            Subscribe to your favorite creators to see their newest videos right here.
          </p>
          <Link
            to="/"
            className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-colors"
          >
            Explore Trending Channels
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          
          {/* Channel Row Bar */}
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
            {subscribedChannels.map((ch) => (
              <div
                key={ch.id}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 shrink-0 hover:border-blue-500 transition-all w-32 group"
              >
                <Link to={`/channel/${ch.id}`} className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800 shadow-md group-hover:scale-105 transition-transform border border-neutral-200 dark:border-white/10">
                    <img 
                      src={ch.avatarUrl || getFallbackChannelAvatar(ch.title, ch.id)} 
                      alt={ch.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <span className="text-xs font-bold line-clamp-1 mt-2 text-center">{ch.title}</span>
                </Link>
                <button
                  onClick={() => toggleSubscribe(ch)}
                  className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-neutral-200 dark:bg-white/10 hover:bg-red-500 hover:text-white rounded-full transition-colors"
                  title="Unsubscribe"
                >
                  <Check className="w-3 h-3 text-blue-500 group-hover:text-white" />
                  Subscribed
                </button>
              </div>
            ))}
          </div>

          {/* Subscribed Channels Feed Info */}
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-500" />
              Latest Videos from Subscriptions
            </h2>
            <div className="p-8 text-center bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-2xl">
              <p className="text-sm font-semibold text-neutral-700 dark:text-white/80">
                You're all caught up! Check back later for new uploads from your subscribed creators.
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
