import React from 'react';
import { Radio, ChevronRight, Users, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BANGLA_LIVE_CHANNELS } from '../../services/liveTvData';

export const HomeLiveTvSection: React.FC = () => {
  return (
    <div className="mb-10 bg-[#121824] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-red-600/10 rounded-full filter blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                ২৪/৭ লাইভ টিভি চ্যানেল (Live TV)
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white uppercase tracking-wider">
                LIVE
              </span>
            </div>
            <p className="text-xs text-gray-400">
              বাংলাদেশের সকল স্যাটেলাইট টিভি চ্যানেল সরাসরি দেখুন
            </p>
          </div>
        </div>

        <Link
          to="/live-tv"
          className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#ff2d6f] hover:text-pink-400 transition-colors"
        >
          <span>সব দেখুন</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Horizontal Scroll Channels */}
      <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-2 relative z-10">
        {BANGLA_LIVE_CHANNELS.map((channel) => (
          <Link
            key={channel.id}
            to={`/live-tv?channel=${channel.id}`}
            className="group shrink-0 w-36 sm:w-44 p-3 rounded-2xl bg-[#161d27] border border-white/5 hover:border-[#ff2d6f] transition-all hover:scale-[1.03] text-center flex flex-col items-center"
          >
            <div className="relative w-16 sm:w-20 h-16 sm:h-20 rounded-2xl overflow-hidden mb-2.5 p-1 bg-black/40 border border-white/10">
              <img
                src={channel.logo}
                alt={channel.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-xl"
              />
              <div className="absolute top-1 right-1 px-1 rounded text-[8px] font-bold bg-red-600 text-white">
                LIVE
              </div>
            </div>

            <h3 className="text-xs sm:text-sm font-bold text-white truncate w-full">
              {channel.banglaName}
            </h3>
            <p className="text-[11px] text-gray-400 truncate w-full mt-0.5">
              {channel.currentShow}
            </p>

            <div className="mt-2 text-[10px] text-pink-400 font-mono font-semibold flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{channel.viewers}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
