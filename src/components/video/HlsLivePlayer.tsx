import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  PictureInPicture2,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Radio,
} from 'lucide-react';
import { M3uChannel } from '../../services/m3uService';

interface HlsLivePlayerProps {
  channel: M3uChannel;
  autoPlay?: boolean;
  onNextChannel?: () => void;
}

export const HlsLivePlayer: React.FC<HlsLivePlayerProps> = ({
  channel,
  autoPlay = true,
  onNextChannel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset controls timer
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3500);
  }, [isPlaying]);

  // Load stream
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setError(null);
    setIsBuffering(true);

    // Destroy existing Hls instance if any
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const streamUrl = channel.cleanUrl || channel.streamUrl;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        startLevel: -1, // Auto quality
      });

      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsBuffering(false);
        if (autoPlay) {
          video.play().catch(() => {
            // Autoplay was blocked (usually due to sound policy), mute and retry
            video.muted = true;
            setIsMuted(true);
            video.play().catch((e) => console.log('Autoplay muted attempt error:', e));
          });
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          console.warn('Fatal HLS error encountered:', data.type, data.details);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // Try to recover network error
              console.log('Attempting to recover from network error...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Attempting to recover from media error...');
              hls.recoverMediaError();
              break;
            default:
              // Cannot recover
              hls.destroy();
              setError(
                'এই চ্যানেলের লাইভ ফিড সাময়িকভাবে লোড করা সম্ভব হচ্ছে না (Stream offline or CORS restricted).'
              );
              setIsBuffering(false);
              break;
          }
        }
      });

      hls.on(Hls.Events.FRAG_LOADED, () => {
        setIsBuffering(false);
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari/iOS)
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsBuffering(false);
        if (autoPlay) {
          video.play().catch(() => {
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => {});
          });
        }
      });

      video.addEventListener('error', () => {
        setError('ব্রাউজারে লাইভ স্ট্রিম লোড করতে সমস্যা হয়েছে।');
        setIsBuffering(false);
      });
    } else {
      setError('আপনার ব্রাউজার HLS লাইভ স্ট্রিমিং সমর্থন করে না।');
      setIsBuffering(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel, retryCount, autoPlay]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
    };
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch((err) => console.log('Play failed:', err));
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.muted = false;
      setIsMuted(false);
      if (volume === 0) {
        setVolume(0.5);
        video.volume = 0.5;
      }
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    const video = videoRef.current;
    if (video) {
      video.volume = val;
      if (val === 0) {
        video.muted = true;
        setIsMuted(true);
      } else if (isMuted) {
        video.muted = false;
        setIsMuted(false);
      }
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => console.log('Fullscreen error:', err));
    } else {
      document.exitFullscreen().catch((err) => console.log('Exit fullscreen error:', err));
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.log('PiP error:', err);
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsBuffering(true);
    setRetryCount((prev) => prev + 1);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl group select-none flex items-center justify-center"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain bg-black cursor-pointer"
        onClick={togglePlay}
        playsInline
      />

      {/* Buffering Indicator */}
      {isBuffering && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-none transition-opacity">
          <Loader2 className="w-12 h-12 text-[#ff2d6f] animate-spin mb-3" />
          <div className="text-white text-xs font-semibold px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span>লাইভ স্ট্রিম সংযোগ করা হচ্ছে...</span>
          </div>
        </div>
      )}

      {/* Error Fallback Overlay */}
      {error && (
        <div className="absolute inset-0 bg-[#0d131f]/95 p-6 flex flex-col items-center justify-center text-center z-30 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="max-w-md">
            <h4 className="text-base font-bold text-white mb-1.5">{channel.name}</h4>
            <p className="text-xs text-gray-300 leading-relaxed mb-1">{error}</p>
            <p className="text-[11px] text-gray-500">
              কিছু টেলিভিশন চ্যানেল তাদের সার্ভার থেকে নির্দিষ্ট অঞ্চলের আইপি বা ব্রাউজার সীমাবদ্ধ করে রাখতে পারে।
            </p>
          </div>

          <div className="flex items-center flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={handleRetry}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff2d6f] to-[#e11d48] text-white text-xs font-bold shadow-lg shadow-pink-500/20 hover:opacity-95 transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>পুনরায় লোড করুন (Retry)</span>
            </button>

            {onNextChannel && (
              <button
                onClick={onNextChannel}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold transition-all"
              >
                পরবর্তী চ্যানেল চালান
              </button>
            )}

            <a
              href={channel.cleanUrl || channel.streamUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>সরাসরি লিঙ্ক</span>
            </a>
          </div>
        </div>
      )}

      {/* Top Header Overlay (Channel Name + Live Badge) */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 pointer-events-none flex items-center justify-between ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white/10 border border-white/20 p-0.5">
            <img
              src={channel.logo}
              alt={channel.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded"
            />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight drop-shadow-md">
              {channel.name}
            </h3>
            <span className="text-[10px] text-gray-300 font-medium">{channel.group}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-red-600/90 text-white text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5 shadow-lg shadow-red-600/30">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            LIVE
          </span>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 flex items-center justify-between gap-3 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Play/Pause & Volume */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white flex items-center justify-center transition-all hover:scale-105"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
          </button>

          <button
            onClick={handleRetry}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-gray-300 hover:text-white flex items-center justify-center transition-all"
            title="Reload Stream"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 group/vol">
            <button
              onClick={toggleMute}
              className="w-8 h-8 rounded-lg text-gray-300 hover:text-white flex items-center justify-center transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 sm:w-24 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#ff2d6f]"
            />
          </div>
        </div>

        {/* Right Tools (PiP, Fullscreen) */}
        <div className="flex items-center gap-2">
          {document.pictureInPictureEnabled && (
            <button
              onClick={togglePiP}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-all"
              title="Picture-in-Picture"
            >
              <PictureInPicture2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-all"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
