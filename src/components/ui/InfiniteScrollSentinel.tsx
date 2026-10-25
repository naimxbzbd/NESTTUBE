import React, { useEffect, useRef } from 'react';
import { Sparkles, ArrowUp } from 'lucide-react';

interface InfiniteScrollSentinelProps {
  onLoadMore: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  endText?: string;
  skeletonVariant?: 'video-grid' | 'list' | 'channel-grid';
  skeletonCount?: number;
}

export const InfiniteScrollSentinel: React.FC<InfiniteScrollSentinelProps> = ({
  onLoadMore,
  hasMore = true,
  isLoading = false,
  loadingText = 'আরও কন্টেন্ট লোড হচ্ছে...',
  skeletonVariant = 'video-grid',
  skeletonCount = 4,
}) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '450px',
      }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [onLoadMore, hasMore, isLoading]);

  return (
    <div className="w-full flex flex-col items-center justify-center my-6">
      {/* Invisible Trigger Sentinel */}
      <div ref={sentinelRef} className="h-4 w-full pointer-events-none" />

      {/* Glowing Aurora Skeletons while loading */}
      {isLoading && (
        <div className="w-full">
          {skeletonVariant === 'video-grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 w-full mb-6">
              {Array.from({ length: skeletonCount }).map((_, i) => (
                <div key={`skel-vid-${i}`} className="flex flex-col gap-3 group">
                  <div className="aspect-video w-full rounded-2xl skeleton-aurora relative overflow-hidden" />
                  <div className="flex gap-3 pr-2">
                    <div className="w-9 h-9 rounded-full skeleton-aurora shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-4/5 rounded-md skeleton-aurora" />
                      <div className="h-3 w-1/2 rounded-md skeleton-aurora" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {skeletonVariant === 'channel-grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 w-full mb-6">
              {Array.from({ length: skeletonCount || 6 }).map((_, i) => (
                <div
                  key={`skel-chan-${i}`}
                  className="p-4 rounded-2xl glass-card flex flex-col items-center space-y-3"
                >
                  <div className="w-16 h-16 rounded-2xl skeleton-aurora" />
                  <div className="w-20 h-3 rounded skeleton-aurora" />
                  <div className="w-14 h-2.5 rounded skeleton-aurora" />
                </div>
              ))}
            </div>
          )}

          {skeletonVariant === 'list' && (
            <div className="flex flex-col gap-4 w-full mb-6">
              {Array.from({ length: skeletonCount || 3 }).map((_, i) => (
                <div key={`skel-list-${i}`} className="flex flex-col sm:flex-row gap-4 p-3 rounded-2xl glass-card">
                  <div className="w-full sm:w-[320px] aspect-video rounded-xl skeleton-aurora shrink-0" />
                  <div className="flex-1 space-y-3 py-2">
                    <div className="h-4 w-3/4 rounded skeleton-aurora" />
                    <div className="h-3 w-1/3 rounded skeleton-aurora" />
                    <div className="h-3 w-1/2 rounded skeleton-aurora" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Indicator text */}
          <div className="flex items-center justify-center gap-2.5 py-4 text-xs font-semibold text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
            <span className="text-aurora-gradient font-bold">{loadingText}</span>
          </div>
        </div>
      )}
    </div>
  );
};
