import React, { useEffect, useState } from 'react';
import { Sparkles, Video, Play, ExternalLink, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPublicVideos } from '../../services/videoFirestore';
import { FirestoreVideo } from '../../types/auth';

export function HomeCreatorSection() {
  const [videos, setVideos] = useState<FirestoreVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getPublicVideos(8)
      .then((data) => {
        if (isMounted) {
          setVideos(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Firestore creator videos load warning:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading || videos.length === 0) {
    return null;
  }

  return (
    <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-pink-500/10 via-purple-500/5 to-transparent pointer-events-none" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>কমিউনিটি ক্রিয়েটরদের নতুন ভিডিও</span>
              <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 text-[10px] font-bold uppercase tracking-wider">
                Community
              </span>
            </h3>
            <p className="text-xs text-neutral-400">সদস্য ও ক্রিয়েটরদের আপলোড করা ভিডিও</p>
          </div>
        </div>

        <Link
          to="/studio"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/15 text-pink-300 border border-white/10 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>আপনার ভিডিও আপলোড করুন</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {videos.map((vid) => (
          <Link
            key={vid.id}
            to={`/watch/${vid.id}`}
            className="group block rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-pink-500/40 transition-all hover:scale-[1.02] shadow-lg"
          >
            <div className="aspect-video w-full relative bg-neutral-900 overflow-hidden">
              <img
                src={vid.thumbnailUrl}
                alt={vid.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                {vid.duration || '12:00'}
              </span>
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-pink-600/90 text-white flex items-center justify-center shadow-lg">
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </div>
              </div>
            </div>

            <div className="p-3 space-y-1">
              <h4 className="text-xs font-bold text-white line-clamp-2 group-hover:text-pink-400 transition-colors">
                {vid.title}
              </h4>
              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <span className="font-medium truncate max-w-[120px]">{vid.channelName}</span>
                <span>{vid.views || 0} ভিউ</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
