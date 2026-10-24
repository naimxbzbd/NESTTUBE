import React from 'react';
import { Film, Play, Sparkles, ChevronRight, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CURATED_PIPRA_VIDEOS } from '../../services/pipraCatalog';
import { useCoinStore } from '../../store/useCoinStore';

export const HomeBanglaDramasSection: React.FC = () => {
  const { openGiftModal } = useCoinStore();

  const natoks = CURATED_PIPRA_VIDEOS.filter(
    (v) => v.category === 'natok' || v.category === 'comedy' || v.category === 'drama'
  );

  return (
    <div className="mb-10 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-[#ff2d6f] flex items-center justify-center">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              জনপ্রিয় বাংলা নাটক (Popular Bengali Dramas)
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ff2d6f]/20 text-[#ff2d6f] border border-[#ff2d6f]/30">
                Natok
              </span>
            </h2>
          </div>
        </div>

        <Link
          to="/trending"
          className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#ff2d6f] hover:text-pink-400 transition-colors"
        >
          <span>আরও দেখুন</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid of Natok Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {natoks.slice(0, 4).map((item, index) => (
          <div
            key={`natok-${item.id}-${index}`}
            className="group relative bg-[#121824] border border-white/5 hover:border-white/20 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/5 flex flex-col"
          >
            {/* Thumbnail */}
            <Link to={`/watch/${item.id}`} className="relative aspect-video w-full overflow-hidden block">
              <img
                src={item.thumbnail}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="w-11 h-11 rounded-full bg-gradient-to-r from-[#ff2d6f] to-[#c026d3] text-white flex items-center justify-center shadow-lg">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </div>
              <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white font-mono text-[11px] font-bold">
                {item.duration}
              </span>
            </Link>

            {/* Info */}
            <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
              <div>
                <Link to={`/watch/${item.id}`}>
                  <h3 className="text-sm font-bold text-white line-clamp-2 hover:text-[#ff2d6f] transition-colors">
                    {item.title}
                  </h3>
                </Link>
                <div className="text-xs text-gray-400 mt-1 flex items-center justify-between">
                  <span>{item.channelTitle}</span>
                  <span className="font-mono">{item.views} ভিউ</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="text-[11px] text-pink-400 font-medium">
                  {item.publishedAt}
                </span>

                <button
                  type="button"
                  onClick={() => openGiftModal({ id: item.id, title: item.title, channel: item.channelTitle })}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] font-bold flex items-center gap-1 border border-amber-500/20 transition-colors"
                >
                  <Gift className="w-3 h-3 text-amber-400" />
                  <span>গিফট</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
