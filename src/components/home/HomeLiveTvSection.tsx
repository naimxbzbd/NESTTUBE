import React, { useEffect, useState } from 'react';
import { Radio, ChevronRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchM3uPlaylist, M3uChannel } from '../../services/m3uService';

export const HomeLiveTvSection: React.FC = () => {
  const [channels, setChannels] = useState<M3uChannel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    fetchM3uPlaylist()
      .then((data) => {
        if (isMounted) {
          // Curate top channels: Bangladeshi and Sports channels first
          const bangladeshi = data.filter((c) => c.group === 'Bangladeshi');
          const sports = data.filter((c) => c.group === 'Sports');
          const others = data.filter(
            (c) => c.group !== 'Bangladeshi' && c.group !== 'Sports'
          );
          const topList = [...bangladeshi, ...sports, ...others].slice(0, 16);
          setChannels(topList.length > 0 ? topList : data.slice(0, 16));
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="mb-10 glass-panel border border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Ambient glow background */}
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
              XBZ Prime TV প্লেলিস্টের সকল লাইভ টিভি চ্যানেল সরাসরি উপভোগ করুন
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
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 w-36 sm:w-44 p-3 rounded-2xl bg-[#161d27] border border-white/5 animate-pulse flex flex-col items-center"
            >
              <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl bg-white/5 mb-2.5" />
              <div className="w-24 h-3 bg-white/5 rounded mb-1.5" />
              <div className="w-16 h-2 bg-white/5 rounded" />
            </div>
          ))
        ) : (
          channels.map((channel) => (
            <Link
              key={channel.id}
              to={`/live-tv?channel=${channel.id}`}
              className="group shrink-0 w-36 sm:w-44 p-3 rounded-2xl glass-card transition-all hover:scale-[1.03] text-center flex flex-col items-center"
            >
              <div className="relative w-16 sm:w-20 h-16 sm:h-20 rounded-2xl overflow-hidden mb-2.5 p-1 bg-black/40 border border-white/10 flex items-center justify-center">
                <img
                  src={channel.logo}
                  alt={channel.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                  className="w-full h-full object-contain rounded-xl"
                />
                <div className="absolute top-1 right-1 px-1 rounded text-[8px] font-bold bg-red-600 text-white flex items-center gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                  LIVE
                </div>
              </div>

              <h3 className="text-xs sm:text-sm font-bold text-white truncate w-full group-hover:text-pink-400 transition-colors">
                {channel.name}
              </h3>
              <p className="text-[11px] text-gray-400 truncate w-full mt-0.5 font-medium">
                {channel.group}
              </p>

              <div className="mt-2 text-[10px] text-pink-400 font-medium flex items-center gap-1 group-hover:underline">
                <Play className="w-2.5 h-2.5 fill-pink-400" />
                <span>প্লে করুন</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};
