import React, { useState, useEffect } from 'react';
import { Film, Tv, Radio, Clapperboard } from 'lucide-react';
import { getCachedImageUrl } from '../../services/imageAssetCache';

interface MediaImageProps {
  src: string;
  alt: string;
  className?: string;
  type?: 'tv' | 'movie' | 'series' | 'channel';
  fallbackText?: string;
  aspectRatio?: 'square' | 'poster' | 'video';
}

export const MediaImage: React.FC<MediaImageProps> = ({
  src,
  alt,
  className = '',
  type = 'tv',
  fallbackText,
  aspectRatio = 'square',
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [hasError, setHasError] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setHasError(false);
    setLoaded(false);

    if (src) {
      getCachedImageUrl(src).then((cached) => {
        if (isMounted) {
          setCurrentSrc(cached);
        }
      });
    } else {
      setHasError(true);
    }

    return () => {
      isMounted = false;
    };
  }, [src]);

  const renderIcon = () => {
    switch (type) {
      case 'movie':
        return <Film className="w-6 h-6 text-pink-400 opacity-60" />;
      case 'series':
        return <Clapperboard className="w-6 h-6 text-purple-400 opacity-60" />;
      case 'channel':
      case 'tv':
      default:
        return <Tv className="w-6 h-6 text-cyan-400 opacity-60" />;
    }
  };

  if (hasError || !src) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] rounded-xl select-none ${className}`}
      >
        {renderIcon()}
        {fallbackText && (
          <span className="text-[10px] text-slate-400 font-semibold mt-1.5 line-clamp-1 max-w-[90%]">
            {fallbackText}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden bg-black/40 ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-white/[0.04] animate-pulse flex items-center justify-center">
          {renderIcon()}
        </div>
      )}
      <img
        src={currentSrc}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
