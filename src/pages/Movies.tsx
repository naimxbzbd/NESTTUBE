import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Film,
  Sparkles,
  Search,
  RefreshCw,
  Play,
  Share2,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { fetchMovies, MovieItem } from '../services/moviesService';
import { HlsLivePlayer } from '../components/video/HlsLivePlayer';
import { MediaImage } from '../components/ui/MediaImage';
import { InfiniteScrollSentinel } from '../components/ui/InfiniteScrollSentinel';
import { AdContainer } from '../components/ads/AdContainer';
import { useAdsterra } from '../context/AdsterraContext';
import { ContinueWatchingRow } from '../components/video/ContinueWatchingRow';
import { PlaybackProgress } from '../services/indexedDbStorage';

const BATCH_SIZE = 20;

export const Movies: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const movieParam = searchParams.get('id');

  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeMovie, setActiveMovie] = useState<MovieItem | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [resumeSeekTime, setResumeSeekTime] = useState<number | undefined>(undefined);

  const { isPremium } = useAdsterra();

  const loadData = async (force = false) => {
    if (force) setIsRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchMovies(force);
      setMovies(data);

      if (data.length > 0) {
        const matched = movieParam ? data.find((m) => m.id === movieParam) : null;
        setActiveMovie(matched || data[0]);
      }
    } catch (err) {
      console.error('Error fetching movies:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update active movie when param changes
  useEffect(() => {
    if (movieParam && movies.length > 0) {
      const found = movies.find((m) => m.id === movieParam);
      if (found && found.id !== activeMovie?.id) {
        setActiveMovie(found);
      }
    }
  }, [movieParam, movies]);

  // Extract categories
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    movies.forEach((m) => {
      const cat = m.category || 'Movies';
      map.set(cat, (map.get(cat) || 0) + 1);
    });

    const list: { id: string; name: string; count: number }[] = [
      { id: 'all', name: 'সব সিনেমা (All Movies)', count: movies.length },
    ];

    map.forEach((count, cat) => {
      list.push({ id: cat, name: cat, count });
    });

    return list;
  }, [movies]);

  // Filter movies
  const filteredMovies = useMemo(() => {
    let result = movies;

    if (selectedCategory !== 'all') {
      result = result.filter((m) => m.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.cleanTitle.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [movies, selectedCategory, searchQuery]);

  const handleSelectMovie = (movie: MovieItem, seekTime?: number) => {
    setActiveMovie(movie);
    setResumeSeekTime(seekTime);
    setSearchParams({ id: movie.id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectContinueWatching = (item: PlaybackProgress) => {
    const found = movies.find((m) => m.id === item.mediaId);
    if (found) {
      handleSelectMovie(found, item.currentTime);
    } else {
      const constructedMovie: MovieItem = {
        id: item.mediaId,
        title: item.title,
        cleanTitle: item.cleanTitle,
        category: item.category || 'Movies',
        rawCategory: item.category || 'Movies',
        poster: item.poster,
        streamUrl: item.streamUrl,
        cleanUrl: item.streamUrl,
      };
      handleSelectMovie(constructedMovie, item.currentTime);
    }
  };

  const handleLoadMore = () => {
    if (isLoadingMore || visibleCount >= filteredMovies.length) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + BATCH_SIZE);
      setIsLoadingMore(false);
    }, 250);
  };

  const currentIndex = activeMovie
    ? movies.findIndex((m) => m.id === activeMovie.id)
    : -1;

  const handleNextMovie = () => {
    if (movies.length === 0) return;
    const nextIdx = (currentIndex + 1) % movies.length;
    handleSelectMovie(movies[nextIdx]);
  };

  const handlePrevMovie = () => {
    if (movies.length === 0) return;
    const prevIdx = (currentIndex - 1 + movies.length) % movies.length;
    handleSelectMovie(movies[prevIdx]);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-bottom-nav">
      {/* Title & Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/25 text-xs font-bold mb-2 shadow-xs">
            <Film className="w-3.5 h-3.5 text-pink-400" />
            <span>মেটফ্লিক্স মুভি সংগ্রহ (Metflix Cinema)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <span className="text-brand-gradient">NestTube</span> <span className="text-aurora-gradient">সিনেমা ও মুভিজ</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            হাজারো বাংলা, বলিউড, হলিউড ও সাউথ মুভি উপভোগ করুন হাই-ডেফিনিশনে বাফারিং ছাড়া।
          </p>
        </div>

        {/* Total Movies & Refresh Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2.5 glass-card rounded-2xl text-xs font-medium text-slate-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
            title="মুভি প্লেলিস্ট রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-4 h-4 text-[#ff2d6f] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'আপডেট হচ্ছে...' : 'প্লেলিস্ট রিফ্রেশ'}</span>
          </button>

          <div className="flex items-center gap-3 glass-panel rounded-2xl px-4 py-2.5">
            <Film className="w-5 h-5 text-pink-400" />
            <div>
              <div className="text-[11px] text-slate-400">মোট মুভি</div>
              <div className="text-base font-bold text-white font-mono">
                {movies.length > 0 ? `${movies.length} টি` : 'লোড হচ্ছে...'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Watching Row from IndexedDB */}
      <ContinueWatchingRow
        type="movie"
        activeId={activeMovie?.id}
        onSelect={handleSelectContinueWatching}
      />

      {/* Main Movie Player & Quick Switcher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Video Player */}
        <div className="lg:col-span-2 space-y-4">
          {activeMovie ? (
            <HlsLivePlayer
              key={activeMovie.id}
              channel={{
                id: activeMovie.id,
                name: activeMovie.cleanTitle,
                streamUrl: activeMovie.streamUrl,
                cleanUrl: activeMovie.cleanUrl,
                logo: activeMovie.poster,
                group: activeMovie.category,
              }}
              autoPlay={true}
              isLive={false}
              mediaType="movie"
              mediaId={activeMovie.id}
              title={activeMovie.cleanTitle}
              poster={activeMovie.poster}
              initialSeekTime={resumeSeekTime}
              onNextChannel={handleNextMovie}
            />
          ) : (
            <div className="aspect-video w-full glass-panel rounded-2xl flex flex-col items-center justify-center p-6 text-center">
              <Film className="w-12 h-12 text-slate-500 mb-3 animate-pulse" />
              <p className="text-sm text-slate-400">সিনেমা লোড করা হচ্ছে...</p>
            </div>
          )}

          {/* Active Movie Details Bar */}
          {activeMovie && (
            <div className="p-4 md:p-5 glass-panel rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative w-14 h-20 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0 shadow-inner">
                  <MediaImage
                    src={activeMovie.poster}
                    alt={activeMovie.cleanTitle}
                    type="movie"
                    fallbackText={activeMovie.cleanTitle}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h2 className="text-lg font-bold text-white truncate">
                      {activeMovie.cleanTitle}
                    </h2>
                    {activeMovie.quality && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-600 text-white uppercase tracking-wider">
                        {activeMovie.quality}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium glass-pill text-cyan-300">
                      {activeMovie.category}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    {activeMovie.year && (
                      <span className="text-slate-300 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-pink-400" />
                        {activeMovie.year}
                      </span>
                    )}
                    <span>•</span>
                    <span className="text-slate-300">Metflix স্ট্রিমিং সার্ভার</span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                <button
                  onClick={handlePrevMovie}
                  className="p-2.5 rounded-xl glass-pill text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="পূর্ববর্তী মুভি"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMovie}
                  className="p-2.5 rounded-xl glass-pill text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="পরবর্তী মুভি"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleShare}
                  className="px-3.5 py-2.5 rounded-xl glass-pill text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copied ? 'কপি হয়েছে!' : 'শেয়ার'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Quick Movie Switcher */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-[#ff2d6f]" />
              <span>মুভি তালিকা</span>
            </h3>
            <span className="text-xs text-pink-400 font-mono font-bold">{filteredMovies.length} টি</span>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="মুভির নাম খুঁজুন..."
              className="w-full glass-input rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* List */}
          <div className="overflow-y-auto space-y-2 pr-1 custom-scrollbar flex-1">
            {filteredMovies.length > 0 ? (
              filteredMovies.slice(0, 50).map((movie) => {
                const isActive = activeMovie?.id === movie.id;
                return (
                  <button
                    key={`quick-movie-${movie.id}`}
                    onClick={() => handleSelectMovie(movie)}
                    className={`w-full p-2.5 rounded-xl border flex items-center gap-3 text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-pink-500/20 border-[#ff2d6f] shadow-lg shadow-pink-500/15'
                        : 'glass-card border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="relative w-10 h-14 shrink-0 rounded-lg overflow-hidden bg-black/50 border border-white/10">
                      <MediaImage
                        src={movie.poster}
                        alt={movie.cleanTitle}
                        type="movie"
                        fallbackText={movie.cleanTitle}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate">
                        {movie.cleanTitle}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {movie.year ? `${movie.year} · ` : ''}{movie.category}
                      </div>
                    </div>

                    {isActive ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff2d6f] animate-pulse shrink-0" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                কোনো মুভি পাওয়া যায়নি
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ads */}
      {!isPremium && (
        <div className="py-2">
          <AdContainer placement="watchBelowVideo" className="my-2" />
        </div>
      )}

      {/* Browse All Movies with 20-item Batch Infinite Scroll */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400 animate-pulse" />
            <span className="text-aurora-gradient font-extrabold">ক্যাটাগরি অনুযায়ী সকল সিনেমা</span>
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="মুভি ফিল্টার করুন..."
              className="w-full glass-input rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setVisibleCount(BATCH_SIZE);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-[#ff2d6f] to-[#e11d48] text-white shadow-lg shadow-pink-500/25 border border-pink-400/40 scale-[1.02]'
                  : 'glass-pill text-slate-300 hover:text-white'
              }`}
            >
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  selectedCategory === cat.id ? 'bg-white/20 text-white font-bold' : 'bg-white/10 text-slate-400'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Movies Grid (Poster Layout) */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={`movie-skel-${i}`}
                className="aspect-[2/3] rounded-2xl glass-card animate-pulse p-2 flex flex-col justify-end"
              >
                <div className="w-full h-4 bg-white/10 rounded mb-1" />
                <div className="w-1/2 h-3 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : filteredMovies.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
              {filteredMovies.slice(0, visibleCount).map((movie, idx) => {
                const isActive = activeMovie?.id === movie.id;
                return (
                  <button
                    key={`movie-card-${movie.id}-${idx}`}
                    onClick={() => handleSelectMovie(movie)}
                    className={`group relative rounded-2xl overflow-hidden border text-left transition-all cursor-pointer flex flex-col ${
                      isActive
                        ? 'border-[#ff2d6f] ring-2 ring-pink-500/40 shadow-xl shadow-pink-500/20 scale-[1.02]'
                        : 'glass-card border-white/5 hover:border-white/20 hover:scale-[1.02]'
                    }`}
                  >
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/50">
                      <MediaImage
                        src={movie.poster}
                        alt={movie.cleanTitle}
                        type="movie"
                        fallbackText={movie.cleanTitle}
                        className="group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                      {movie.quality && (
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-bold bg-pink-600 text-white shadow">
                          {movie.quality}
                        </div>
                      )}

                      <div className="absolute bottom-2 left-2 right-2">
                        <h4 className="text-xs font-bold text-white truncate drop-shadow">
                          {movie.cleanTitle}
                        </h4>
                        <div className="text-[10px] text-slate-300 flex items-center justify-between mt-0.5">
                          <span>{movie.year || 'Cinema'}</span>
                          <span className="text-pink-400 flex items-center gap-1 font-semibold">
                            <Play className="w-2.5 h-2.5 fill-pink-400" /> প্লে করুন
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 20-item Batch Sentinel */}
            <InfiniteScrollSentinel
              onLoadMore={handleLoadMore}
              hasMore={visibleCount < filteredMovies.length}
              isLoading={isLoadingMore}
              loadingText="আরও মুভি লোড হচ্ছে (২০টি করে)..."
              skeletonVariant="video-grid"
              skeletonCount={6}
            />
          </>
        ) : (
          <div className="glass-panel rounded-2xl p-12 text-center">
            <Filter className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">কোনো মুভি পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-400">
              অনুগ্রহ করে অন্য কোনো অনুসন্ধান শব্দ চেষ্টা করুন।
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
