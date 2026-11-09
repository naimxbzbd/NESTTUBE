import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls, { type HlsConfig } from 'hls.js';
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
  Film,
  Layers,
  ChevronDown,
  Check,
  WifiOff,
  SkipForward,
  Clock,
} from 'lucide-react';
import { M3uChannel } from '../../services/m3uService';
import { SeriesItem, SeasonGroup, EpisodeItem } from '../../services/seriesService';
import {
  savePlaybackProgress,
  getPlaybackProgress,
  PlaybackProgress,
} from '../../services/indexedDbStorage';

interface HlsLivePlayerProps {
  channel: M3uChannel | {
    id: string;
    name: string;
    streamUrl: string;
    cleanUrl?: string;
    logo?: string;
    group?: string;
  };
  autoPlay?: boolean;
  isLive?: boolean;
  mediaType?: 'live' | 'movie' | 'series';
  mediaId?: string;
  title?: string;
  poster?: string;
  initialSeekTime?: number;
  onNextChannel?: () => void;
  // Series-specific props
  seriesData?: SeriesItem;
  currentSeasonNumber?: number;
  currentEpisodeNumber?: number;
  onSelectEpisode?: (seasonNum: number, episodeNum: number, streamUrl: string) => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const HlsLivePlayer: React.FC<HlsLivePlayerProps> = ({
  channel,
  autoPlay = true,
  isLive = true,
  mediaType = isLive ? 'live' : 'movie',
  mediaId,
  title,
  poster,
  initialSeekTime,
  onNextChannel,
  seriesData,
  currentSeasonNumber = 1,
  currentEpisodeNumber = 1,
  onSelectEpisode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const prevStreamUrlRef = useRef<string>('');

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  // VOD Playback Progress
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [resumedToast, setResumedToast] = useState<{ show: boolean; time: number } | null>(null);
  const lastProgressSavedRef = useRef<number>(0);

  // Dropdown states for Season and Episode selection
  const [showSeasonDropdown, setShowSeasonDropdown] = useState<boolean>(false);
  const [showEpisodeDropdown, setShowEpisodeDropdown] = useState<boolean>(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Identification key for IndexedDB playback progress
  const activeMediaId = mediaId || (seriesData ? seriesData.id : channel.id);
  const isSeries = mediaType === 'series' || Boolean(seriesData);

  // Reset controls timer
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showSeasonDropdown && !showEpisodeDropdown) {
        setShowControls(false);
      }
    }, 3500);
  }, [isPlaying, showSeasonDropdown, showEpisodeDropdown]);

  // Load stream with specialized HLS configuration and seamless episode transitions
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const streamUrl = channel.cleanUrl || channel.streamUrl;
    if (!streamUrl) {
      setError('স্ট্রিম লিঙ্ক পাওয়া যায়নি।');
      setIsBuffering(false);
      return;
    }

    let isMounted = true;
    setError(null);

    const startInitialPlayback = () => {
      if (!video) return;
      if (autoPlay) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Browser autoplay policy blocked unmuted video: auto-mute and play immediately
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => {});
          });
        }
      }
    };

    // If HLS instance already exists on this video element, switch source IMMEDIATELY (Zero Delay)
    if (hlsRef.current && prevStreamUrlRef.current && prevStreamUrlRef.current !== streamUrl) {
      prevStreamUrlRef.current = streamUrl;
      const hls = hlsRef.current;
      hls.stopLoad();
      hls.startLevel = 0;
      hls.loadSource(streamUrl);
      hls.startLoad(initialSeekTime && initialSeekTime > 0 ? initialSeekTime : 0);
      startInitialPlayback();
    } else {
      // First time initialization or full reload
      prevStreamUrlRef.current = streamUrl;

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      if (Hls.isSupported()) {
        const hlsConfig: Partial<HlsConfig> = {
          enableWorker: true,
          lowLatencyMode: isLive,
          startLevel: 0, // Starts at lowest level for instant first frame (<100ms), ABR scales up immediately
          initialLiveManifestSize: 1, // Only wait for 1 manifest segment to begin playing
          maxBufferLength: isLive ? 10 : 20,
          maxMaxBufferLength: isLive ? 20 : 40,
          maxBufferSize: 30 * 1000 * 1000,
          backBufferLength: 15,
          startFragPrefetch: true, // Prefetch next fragment immediately in parallel
          testBandwidth: false, // Do not waste time probing bandwidth before playing
          fpsDroppedMonitoringPeriod: 500,
          fragLoadingTimeOut: 10000,
          manifestLoadingTimeOut: 10000,
          levelLoadingTimeOut: 10000,
          progressive: true,
          autoStartLoad: true,
        };

        const hls = new Hls(hlsConfig);
        hlsRef.current = hls;

        hls.loadSource(streamUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsBuffering(false);
          startInitialPlayback();
        });

        hls.on(Hls.Events.FRAG_LOADED, () => {
          setIsBuffering(false);
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            console.warn('Fatal HLS error encountered:', data.type, data.details);
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                if (typeof navigator !== 'undefined' && !navigator.onLine) {
                  setError('আপনার ইন্টারনেট সংযোগ বিচ্ছিন্ন রয়েছে। অনুগ্রহ করে সংযোগ পরীক্ষা করুন।');
                  setIsBuffering(false);
                } else {
                  hls.startLoad();
                }
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                if (typeof navigator !== 'undefined' && !navigator.onLine) {
                  setError('ইন্টারনেট সংযোগ না থাকায় স্ট্রিম চালানো সম্ভব হচ্ছে না।');
                } else {
                  setError('এই স্ট্রিমটি সাময়িকভাবে লোড করা সম্ভব হচ্ছে না (Stream offline or CORS restricted).');
                }
                setIsBuffering(false);
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.load();
        startInitialPlayback();
      } else {
        setError('আপনার ব্রাউজার HLS স্ট্রিমিং সমর্থন করে না।');
        setIsBuffering(false);
      }
    }

    // In parallel (background detached check), inspect if saved progress exists without delaying initial start
    if (!isLive && activeMediaId && (!initialSeekTime || initialSeekTime <= 0)) {
      getPlaybackProgress(activeMediaId).then((savedProgress) => {
        if (!isMounted || !video) return;
        if (savedProgress && savedProgress.currentTime > 5 && savedProgress.percentage < 95) {
          let seekSec = savedProgress.currentTime;
          if (isSeries && savedProgress.episodeNumber) {
            if (
              savedProgress.seasonNumber === currentSeasonNumber &&
              savedProgress.episodeNumber === currentEpisodeNumber
            ) {
              video.currentTime = seekSec;
              setResumedToast({ show: true, time: seekSec });
              setTimeout(() => { if (isMounted) setResumedToast(null); }, 4000);
            }
          } else {
            video.currentTime = seekSec;
            setResumedToast({ show: true, time: seekSec });
            setTimeout(() => { if (isMounted) setResumedToast(null); }, 4000);
          }
        }
      }).catch(() => {});
    } else if (initialSeekTime && initialSeekTime > 0) {
      video.currentTime = initialSeekTime;
    }

    return () => {
      isMounted = false;
    };
  }, [
    channel.cleanUrl,
    channel.streamUrl,
    retryCount,
    autoPlay,
    isLive,
    currentSeasonNumber,
    currentEpisodeNumber,
  ]);

  // Clean up HLS when the entire component unmounts
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  // Video playback events & IndexedDB progress tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => {
      setIsPlaying(false);
      saveCurrentProgress();
    };
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onCanPlay = () => setIsBuffering(false);
    const onLoadedData = () => setIsBuffering(false);

    const onTimeUpdate = () => {
      const cur = video.currentTime;
      const dur = video.duration || 0;
      setCurrentTime(cur);
      if (dur > 0) setDuration(dur);

      // Throttle saving progress to IndexedDB every 4 seconds for non-live content
      if (!isLive && dur > 15 && Math.abs(cur - lastProgressSavedRef.current) >= 4) {
        lastProgressSavedRef.current = cur;
        saveCurrentProgress();
      }
    };

    const saveCurrentProgress = () => {
      const cur = video.currentTime;
      const dur = video.duration || 0;
      if (isLive || dur <= 10) return;

      const percentage = Math.round((cur / dur) * 100);
      const activeEp = seriesData?.seasons
        ?.find((s) => s.seasonNumber === currentSeasonNumber)
        ?.episodes?.find((e) => e.episodeNumber === currentEpisodeNumber);

      savePlaybackProgress({
        mediaId: activeMediaId,
        type: isSeries ? 'series' : 'movie',
        title: title || (seriesData ? seriesData.title : channel.name),
        cleanTitle: title || (seriesData ? seriesData.cleanTitle : channel.name),
        poster: poster || (seriesData ? seriesData.poster : channel.logo) || '',
        streamUrl: channel.cleanUrl || channel.streamUrl,
        currentTime: Math.floor(cur),
        duration: Math.floor(dur),
        percentage,
        updatedAt: Date.now(),
        seasonNumber: isSeries ? currentSeasonNumber : undefined,
        episodeNumber: isSeries ? currentEpisodeNumber : undefined,
        episodeTitle: activeEp?.cleanTitle,
        category: channel.group,
      });
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('loadeddata', onLoadedData);
    video.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('timeupdate', onTimeUpdate);
      saveCurrentProgress();
    };
  }, [
    isLive,
    isSeries,
    activeMediaId,
    title,
    poster,
    channel,
    seriesData,
    currentSeasonNumber,
    currentEpisodeNumber,
  ]);

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

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    const video = videoRef.current;
    if (video && duration > 0) {
      video.currentTime = target;
      setCurrentTime(target);
    }
  };

  const handleResetToBeginning = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      setCurrentTime(0);
      setResumedToast(null);
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

  // Find next episode in series if available
  const activeSeason = seriesData?.seasons.find((s) => s.seasonNumber === currentSeasonNumber) || seriesData?.seasons[0];
  const activeEpisode = activeSeason?.episodes.find((e) => e.episodeNumber === currentEpisodeNumber) || activeSeason?.episodes[0];
  const nextEpisode = activeSeason?.episodes.find((e) => e.episodeNumber === currentEpisodeNumber + 1);

  const handleNextEpisodeClick = () => {
    if (nextEpisode && onSelectEpisode) {
      onSelectEpisode(currentSeasonNumber, nextEpisode.episodeNumber, nextEpisode.cleanUrl || nextEpisode.streamUrl);
    } else if (onNextChannel) {
      onNextChannel();
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && !showSeasonDropdown && !showEpisodeDropdown && setShowControls(false)}
      className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl group select-none flex items-center justify-center"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain bg-black cursor-pointer"
        onClick={togglePlay}
        playsInline
        preload="auto"
        autoPlay
      />

      {/* Buffering Indicator */}
      {isBuffering && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-none transition-opacity">
          <Loader2 className="w-12 h-12 text-[#ff2d6f] animate-spin mb-3" />
          <div className="text-white text-xs font-semibold px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md flex items-center gap-2">
            {isLive ? (
              <>
                <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                <span>লাইভ সংযোগ করা হচ্ছে...</span>
              </>
            ) : isSeries ? (
              <>
                <Layers className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span>পর্বটি লোড হচ্ছে (Seamless HLS)...</span>
              </>
            ) : (
              <>
                <Film className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                <span>ভিডিও বাফার হচ্ছে...</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Resumed from saved progress Toast */}
      {resumedToast?.show && (
        <div className="absolute top-16 left-4 z-40 bg-slate-900/90 border border-purple-500/40 text-white rounded-xl px-3 py-2 flex items-center gap-2.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300 pointer-events-auto">
          <Clock className="w-4 h-4 text-purple-400 shrink-0" />
          <div className="text-xs">
            <span className="font-medium text-slate-200">
              {formatTime(resumedToast.time)} থেকে শুরু হয়েছে
            </span>
          </div>
          <button
            onClick={handleResetToBeginning}
            className="text-[11px] font-bold text-pink-400 hover:text-pink-300 ml-1 underline cursor-pointer"
          >
            শুরু থেকে
          </button>
        </div>
      )}

      {/* Error Fallback Overlay */}
      {error && (
        <div className="absolute inset-0 bg-[#0d131f]/95 p-6 flex flex-col items-center justify-center text-center z-30 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            {typeof navigator !== 'undefined' && !navigator.onLine ? (
              <WifiOff className="w-7 h-7 text-red-400" />
            ) : (
              <AlertTriangle className="w-7 h-7" />
            )}
          </div>
          <div className="max-w-md">
            <h4 className="text-base font-bold text-white mb-1.5">{channel.name}</h4>
            <p className="text-xs text-gray-300 leading-relaxed mb-1">{error}</p>
            <p className="text-[11px] text-gray-500">
              ইন্টারনেট গতি ধীর হলে অথবা স্ট্রিম সার্ভার ব্যস্ত থাকলে পুনরায় চেষ্টা করুন।
            </p>
          </div>

          <div className="flex items-center flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={handleRetry}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff2d6f] to-[#e11d48] text-white text-xs font-bold shadow-lg shadow-pink-500/20 hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>পুনরায় লোড করুন (Retry)</span>
            </button>

            {(nextEpisode || onNextChannel) && (
              <button
                onClick={handleNextEpisodeClick}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>পরবর্তী {isSeries ? 'পর্ব' : 'আইটেম'}</span>
                <SkipForward className="w-3.5 h-3.5" />
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

      {/* Top Header Overlay */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/85 via-black/45 to-transparent transition-opacity duration-300 pointer-events-none flex items-center justify-between ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {channel.logo && (
            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white/10 border border-white/20 p-0.5">
              <img
                src={channel.logo}
                alt={channel.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}
          <div>
            <h3 className="text-sm font-bold text-white leading-tight drop-shadow-md">
              {seriesData ? seriesData.title : channel.name}
            </h3>
            <span className="text-[10px] text-gray-300 font-medium">
              {seriesData && activeEpisode
                ? `Season ${currentSeasonNumber} · Episode ${currentEpisodeNumber}: ${activeEpisode.cleanTitle}`
                : channel.group || 'NestTube'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLive ? (
            <span className="px-2.5 py-1 rounded-full bg-red-600/90 text-white text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5 shadow-lg shadow-red-600/30">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              LIVE
            </span>
          ) : isSeries ? (
            <span className="px-2.5 py-1 rounded-full bg-purple-600/90 text-white text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5 shadow-lg shadow-purple-600/30">
              SERIES
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-pink-600/90 text-white text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5 shadow-lg shadow-pink-600/30">
              HD VOD
            </span>
          )}
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/75 to-transparent transition-opacity duration-300 flex flex-col gap-2 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Interactive Scrubber / Seekbar for non-live content */}
        {!isLive && duration > 0 && (
          <div className="flex items-center gap-3 w-full pointer-events-auto">
            <span className="text-[11px] font-mono text-gray-300 select-none tabular-nums">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="1"
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#ff2d6f] hover:h-2 transition-all"
            />
            <span className="text-[11px] font-mono text-gray-400 select-none tabular-nums">
              {formatTime(duration)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          {/* Left: Play/Pause, Volume */}
          <div className="flex items-center gap-2.5 sm:gap-3 pointer-events-auto">
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            </button>

            {nextEpisode && (
              <button
                onClick={handleNextEpisodeClick}
                className="w-9 h-9 rounded-xl bg-purple-500/20 hover:bg-purple-500/35 border border-purple-500/30 text-purple-200 flex items-center justify-center transition-all cursor-pointer"
                title={`পরবর্তী পর্ব চালান: পর্ব ${nextEpisode.episodeNumber}`}
              >
                <SkipForward className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleRetry}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title="Reload Stream"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 group/vol">
              <button
                onClick={toggleMute}
                className="w-8 h-8 rounded-lg text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
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
                className="w-14 sm:w-20 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#ff2d6f]"
              />
            </div>
          </div>

          {/* Series Season & Episode Dropdowns (Beside control bar) */}
          {seriesData && seriesData.seasons.length > 0 && (
            <div className="relative flex items-center gap-2 pointer-events-auto">
              {/* Season Selector Pill */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSeasonDropdown((prev) => !prev);
                    setShowEpisodeDropdown(false);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-pink-500/25 hover:bg-pink-500/35 border border-pink-500/40 text-pink-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="সিজন পরিবর্তন করুন"
                >
                  <span>সিজন {currentSeasonNumber}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-pink-300" />
                </button>

                {/* Season Dropdown */}
                {showSeasonDropdown && (
                  <div className="absolute bottom-full mb-2 right-0 w-44 max-h-56 overflow-y-auto custom-scrollbar bg-slate-900/95 border border-white/20 rounded-xl p-1.5 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95">
                    <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 mb-1">
                      সিজন নির্বাচন করুন
                    </div>
                    {seriesData.seasons.map((season) => {
                      const isSelected = season.seasonNumber === currentSeasonNumber;
                      return (
                        <button
                          key={`season-opt-${season.seasonNumber}`}
                          onClick={() => {
                            const firstEp = season.episodes[0];
                            if (firstEp && onSelectEpisode) {
                              onSelectEpisode(
                                season.seasonNumber,
                                firstEp.episodeNumber,
                                firstEp.cleanUrl || firstEp.streamUrl
                              );
                            }
                            setShowSeasonDropdown(false);
                          }}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-left flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-pink-500 text-white font-bold'
                              : 'text-gray-300 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span>সিজন {season.seasonNumber}</span>
                          <span className="text-[10px] text-gray-400">{season.episodes.length} পর্ব</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Episode Selector Pill */}
              {activeSeason && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowEpisodeDropdown((prev) => !prev);
                      setShowSeasonDropdown(false);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-purple-500/25 hover:bg-purple-500/35 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    title="পর্ব নির্বাচন করুন"
                  >
                    <span>পর্ব {currentEpisodeNumber}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-purple-300" />
                  </button>

                  {/* Episode Dropdown */}
                  {showEpisodeDropdown && (
                    <div className="absolute bottom-full mb-2 right-0 w-52 max-h-60 overflow-y-auto custom-scrollbar bg-slate-900/95 border border-white/20 rounded-xl p-1.5 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95">
                      <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 mb-1">
                        সিজন {currentSeasonNumber} এর পর্বসমূহ
                      </div>
                      {activeSeason.episodes.map((ep) => {
                        const isSelected = ep.episodeNumber === currentEpisodeNumber;
                        return (
                          <button
                            key={`ep-opt-${ep.episodeNumber}`}
                            onClick={() => {
                              if (onSelectEpisode) {
                                onSelectEpisode(
                                  currentSeasonNumber,
                                  ep.episodeNumber,
                                  ep.cleanUrl || ep.streamUrl
                                );
                              }
                              setShowEpisodeDropdown(false);
                            }}
                            className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-purple-500 text-white font-bold'
                                : 'text-gray-300 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <span className="truncate">পর্ব {ep.episodeNumber}: {ep.cleanTitle}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Right Tools (PiP, Fullscreen) */}
          <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
            {typeof document !== 'undefined' && document.pictureInPictureEnabled && (
              <button
                onClick={togglePiP}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Picture-in-Picture"
              >
                <PictureInPicture2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={toggleFullscreen}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
