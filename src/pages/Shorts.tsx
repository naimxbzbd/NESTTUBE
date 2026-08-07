import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, MoreHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';
import { searchVideos } from '../services/youtube';

export function Shorts() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['shorts'],
    queryFn: () => searchVideos('#shorts', 10),
  });

  const videos = data?.items || [];

  if (isLoading) {
    return (
      <div className="flex-1 h-full w-full flex items-center justify-center p-4 bg-white dark:bg-[#0f0f0f] transition-colors">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || videos.length === 0) {
    return (
      <div className="flex-1 h-full w-full flex items-center justify-center p-4 bg-white dark:bg-[#0f0f0f] transition-colors">
         <div className="text-center text-neutral-500 dark:text-white/60">No shorts found.</div>
      </div>
    );
  }

  const currentVideo = videos[currentIndex];
  const videoId = typeof currentVideo.id === 'string' ? currentVideo.id : currentVideo.id.videoId;

  return (
    <div className="flex-1 h-full w-full flex items-center justify-center p-4 bg-white dark:bg-[#0f0f0f] overflow-hidden text-white transition-colors">
      <div className="relative w-full max-w-[400px] h-[calc(100vh-80px)] max-h-[800px] flex items-center justify-center">
        
        {/* Short Container */}
        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black flex group">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=1&modestbranding=1&rel=0`}
            title={currentVideo.snippet.title}
            className="w-full h-full border-0 object-cover"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
          
          {/* Overlay Info */}
          <div className="absolute bottom-0 left-0 right-16 p-4 pt-16 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-3 pointer-events-none">
             <div className="flex items-center gap-3 pointer-events-auto">
               <div className="w-9 h-9 rounded-full bg-blue-600 shrink-0"></div>
               <span className="font-bold text-sm line-clamp-1 text-white">{currentVideo.snippet.channelTitle}</span>
               <button className="bg-white text-black px-3 py-1 rounded-full text-xs font-bold ml-1">Subscribe</button>
             </div>
             <p className="text-sm font-semibold line-clamp-2 pointer-events-auto text-white" dangerouslySetInnerHTML={{ __html: currentVideo.snippet.title }}></p>
             <div className="flex items-center gap-2 text-xs font-semibold pointer-events-auto">
                <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-white">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                  Original sound
                </span>
             </div>
          </div>

          {/* Action Buttons */}
          <div className="absolute bottom-0 right-0 p-4 flex flex-col items-center gap-4 w-16 text-white">
            <div className="flex flex-col items-center gap-1">
              <button className="p-3 bg-black/40 hover:bg-black/60 rounded-full transition-colors"><ThumbsUp className="w-6 h-6 fill-white" /></button>
              <span className="text-xs font-semibold">Like</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <button className="p-3 bg-black/40 hover:bg-black/60 rounded-full transition-colors"><ThumbsDown className="w-6 h-6" /></button>
              <span className="text-xs font-semibold">Dislike</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <button className="p-3 bg-black/40 hover:bg-black/60 rounded-full transition-colors"><MessageSquare className="w-6 h-6 fill-white" /></button>
              <span className="text-xs font-semibold">Comment</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <button className="p-3 bg-black/40 hover:bg-black/60 rounded-full transition-colors"><Share2 className="w-6 h-6" /></button>
              <span className="text-xs font-semibold">Share</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <button className="p-3 bg-black/40 hover:bg-black/60 rounded-full transition-colors"><MoreHorizontal className="w-6 h-6" /></button>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-md mt-2 shrink-0 border border-white/20 overflow-hidden">
               <img src={currentVideo.snippet.thumbnails?.default?.url} className="w-full h-full object-cover" alt="Thumbnail" />
            </div>
          </div>
        </div>

        {/* Scroll controls */}
        <div className="absolute right-[-60px] top-1/2 -translate-y-1/2 flex flex-col gap-4 hidden md:flex">
           <button 
             className="p-3 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white rounded-full transition-colors disabled:opacity-50"
             disabled={currentIndex === 0}
             onClick={() => setCurrentIndex(prev => prev - 1)}
           >
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/></svg>
           </button>
           <button 
             className="p-3 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white rounded-full transition-colors disabled:opacity-50"
             disabled={currentIndex === videos.length - 1}
             onClick={() => setCurrentIndex(prev => prev + 1)}
           >
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
           </button>
        </div>
      </div>
    </div>
  );
}
