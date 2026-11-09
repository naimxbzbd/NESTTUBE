import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Clapperboard,
  Sparkles,
  Search,
  RefreshCw,
  Play,
  Share2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  Check,
} from 'lucide-react';
import { fetchSeries, SeriesItem, SeasonGroup, EpisodeItem } from '../services/seriesService';
import { HlsLivePlayer } from '../components/video/HlsLivePlayer';
import { MediaImage } from '../components/ui/MediaImage';
import { InfiniteScrollSentinel } from '../components/ui/InfiniteScrollSentinel';
import { AdContainer } from '../components/ads/AdContainer';
import { useAdsterra } from '../context/AdsterraContext';
import { ContinueWatchingRow } from '../components/video/ContinueWatchingRow';
import { PlaybackProgress } from '../services/indexedDbStorage';

const BATCH_SIZE = 20;

export const Series: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const seriesParam = searchParams.get('id');

  const [seriesList, setSeriesList] = useState<SeriesItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSeries, setActiveSeries] = useState<SeriesItem | null>(null);

  // Active Season and Episode tracking
  const [activeSeasonNum, setActiveSeasonNum] = useState<number>(1);
  const [activeEpisodeNum, setActiveEpisodeNum] = useState<number>(1);
  const [currentStreamUrl, setCurrentStreamUrl] = useState<string>('');

  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [resumeSeekTime, setResumeSeekTime] = useState<number | undefined>(undefined);

  const { isPremium } = useAdsterra();

  const loadData = async (force = false) => {
    if (force) setIsRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchSeries(force);
      setSeriesList(data);

      if (data.length > 0) {
        const matched = seriesParam ? data.find((s) => s.id === seriesParam) : null;
        const initialSeries = matched || data[0];
        setActiveSeries(initialSeries);

        const firstSeason = initialSeries.seasons[0];
        const firstEp = firstSeason?.episodes[0];
        if (firstSeason && firstEp) {
          setActiveSeasonNum(firstSeason.seasonNumber);
          setActiveEpisodeNum(firstEp.episodeNumber);
          setCurrentStreamUrl(firstEp.cleanUrl || firstEp.streamUrl);
        }
      }
    } catch (err) {
      console.error('Error fetching series:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update active series when URL search param changes
  useEffect(() => {
    if (seriesParam && seriesList.length > 0) {
      const found = seriesList.find((s) => s.id === seriesParam);
      if (found && found.id !== activeSeries?.id) {
        setActiveSeries(found);
        const s1 = found.seasons[0];
        const e1 = s1?.episodes[0];
        if (s1 && e1) {
          setActiveSeasonNum(s1.seasonNumber);
          setActiveEpisodeNum(e1.episodeNumber);
          setCurrentStreamUrl(e1.cleanUrl || e1.streamUrl);
        }
      }
    }
  }, [seriesParam, seriesList]);

  // Filter series based on search query
  const filteredSeries = useMemo(() => {
    if (!searchQuery.trim()) return seriesList;
    const q = searchQuery.toLowerCase().trim();
    return seriesList.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.cleanTitle.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }, [seriesList, searchQuery]);

  const handleSelectSeries = (series: SeriesItem, seasonNum?: number, episodeNum?: number, seekTime?: number) => {
    setActiveSeries(series);
    setResumeSeekTime(seekTime);
    setSearchParams({ id: series.id });

    const targetSeason = seasonNum
      ? series.seasons.find((s) => s.seasonNumber === seasonNum) || series.seasons[0]
      : series.seasons[0];

    const targetEpisode = episodeNum
      ? targetSeason?.episodes.find((e) => e.episodeNumber === episodeNum) || targetSeason?.episodes[0]
      : targetSeason?.episodes[0];

    if (targetSeason && targetEpisode) {
      setActiveSeasonNum(targetSeason.seasonNumber);
      setActiveEpisodeNum(targetEpisode.episodeNumber);
      setCurrentStreamUrl(targetEpisode.cleanUrl || targetEpisode.streamUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectEpisode = (seasonNum: number, episodeNum: number, streamUrl: string, seekTime?: number) => {
    setActiveSeasonNum(seasonNum);
    setActiveEpisodeNum(episodeNum);
    setCurrentStreamUrl(streamUrl);
    setResumeSeekTime(seekTime);
  };

  const handleSelectContinueWatching = (item: PlaybackProgress) => {
    const found = seriesList.find((s) => s.id === item.mediaId);
    if (found) {
      handleSelectSeries(found, item.seasonNumber, item.episodeNumber, item.currentTime);
    }
  };

  const handleLoadMore = () => {
    if (isLoadingMore || visibleCount >= filteredSeries.length) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + BATCH_SIZE);
      setIsLoadingMore(false);
    }, 250);
  };

  const activeSeason = activeSeries?.seasons.find((s) => s.seasonNumber === activeSeasonNum) || activeSeries?.seasons[0];
  const activeEpisode = activeSeason?.episodes.find((e) => e.episodeNumber === activeEpisodeNum) || activeSeason?.episodes[0];

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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/25 text-xs font-bold mb-2 shadow-xs">
            <Clapperboard className="w-3.5 h-3.5 text-purple-400" />
            <span>ওয়েব সিরিজ ও ড্রামা (Web Series Portal)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <span className="text-brand-gradient">NestTube</span> <span className="text-aurora-gradient">ওয়েব সিরিজ</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            জনপ্রিয় সব বাংলা, হিন্দি ও আন্তর্জাতিক ওয়েব সিরিজ সিজন এবং পর্ব অনুসারে সহজে উপভোগ করুন।
          </p>
        </div>

        {/* Total Series & Refresh Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2.5 glass-card rounded-2xl text-xs font-medium text-slate-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
            title="সিরিজ প্লেলিস্ট রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-4 h-4 text-[#ff2d6f] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'আপডেট হচ্ছে...' : 'প্লেলিস্ট রিফ্রেশ'}</span>
          </button>

          <div className="flex items-center gap-3 glass-panel rounded-2xl px-4 py-2.5">
            <Clapperboard className="w-5 h-5 text-purple-400" />
            <div>
              <div className="text-[11px] text-slate-400">মোট সিরিজ</div>
              <div className="text-base font-bold text-white font-mono">
                {seriesList.length > 0 ? `${seriesList.length} টি সিরিজ` : 'লোড হচ্ছে...'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Watching Row from IndexedDB */}
      <ContinueWatchingRow
        type="series"
        activeId={activeSeries?.id}
        onSelect={handleSelectContinueWatching}
      />

      {/* Main Series Player & Episode Selector Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Video Player */}
        <div className="lg:col-span-2 space-y-4">
          {activeSeries && currentStreamUrl ? (
            <HlsLivePlayer
              channel={{
                id: `${activeSeries.id}-s${activeSeasonNum}-e${activeEpisodeNum}`,
                name: `${activeSeries.title} · S${activeSeasonNum}E${activeEpisodeNum}`,
                streamUrl: currentStreamUrl,
                cleanUrl: currentStreamUrl,
                logo: activeSeries.poster,
                group: activeSeries.category,
              }}
              autoPlay={true}
              isLive={false}
              mediaType="series"
              mediaId={activeSeries.id}
              title={activeSeries.cleanTitle}
              poster={activeSeries.poster}
              initialSeekTime={resumeSeekTime}
              seriesData={activeSeries}
              currentSeasonNumber={activeSeasonNum}
              currentEpisodeNumber={activeEpisodeNum}
              onSelectEpisode={handleSelectEpisode}
            />
          ) : (
            <div className="aspect-video w-full glass-panel rounded-2xl flex flex-col items-center justify-center p-6 text-center">
              <Clapperboard className="w-12 h-12 text-slate-500 mb-3 animate-pulse" />
              <p className="text-sm text-slate-400">সিরিজ লোড করা হচ্ছে...</p>
            </div>
          )}

          {/* Active Series Details Bar */}
          {activeSeries && (
            <div className="p-4 md:p-5 glass-panel rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative w-14 h-20 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0 shadow-inner">
                  <MediaImage
                    src={activeSeries.poster}
                    alt={activeSeries.cleanTitle}
                    type="series"
                    fallbackText={activeSeries.cleanTitle}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h2 className="text-lg font-bold text-white truncate">
                      {activeSeries.cleanTitle}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-600 text-white uppercase tracking-wider">
                      সিজন {activeSeasonNum} · পর্ব {activeEpisodeNum}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium glass-pill text-cyan-300">
                      {activeSeries.category}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span className="text-slate-300">
                      {activeEpisode ? activeEpisode.cleanTitle : `Episode ${activeEpisodeNum}`}
                    </span>
                    <span>•</span>
                    <span className="text-slate-400">মোট {activeSeries.totalEpisodes} টি পর্ব</span>
                  </div>
                </div>
              </div>

              {/* Share & Season Controls */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
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

          {/* Season & Episodes Inline Picker Strip */}
          {activeSeries && activeSeries.seasons.length > 0 && (
            <div className="glass-panel rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>সিজন ও পর্বসমূহ (Episodes List)</span>
                </div>

                {/* Season tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {activeSeries.seasons.map((s) => (
                    <button
                      key={`strip-season-${s.seasonNumber}`}
                      onClick={() => {
                        setActiveSeasonNum(s.seasonNumber);
                        const firstEp = s.episodes[0];
                        if (firstEp) {
                          handleSelectEpisode(s.seasonNumber, firstEp.episodeNumber, firstEp.cleanUrl || firstEp.streamUrl);
                        }
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        activeSeasonNum === s.seasonNumber
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      সিজন {s.seasonNumber}
                    </button>
                  ))}
                </div>
              </div>

              {/* Episode Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                {activeSeason?.episodes.map((ep) => {
                  const isCurrent = ep.episodeNumber === activeEpisodeNum;
                  return (
                    <button
                      key={`strip-ep-${ep.id}`}
                      onClick={() => handleSelectEpisode(activeSeasonNum, ep.episodeNumber, ep.cleanUrl || ep.streamUrl)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isCurrent
                          ? 'bg-purple-600/30 border-purple-500 text-white font-bold'
                          : 'glass-card border-white/5 hover:border-white/20 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs truncate font-semibold">
                          পর্ব {ep.episodeNumber}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {ep.cleanTitle}
                        </div>
                      </div>
                      {isCurrent ? (
                        <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shrink-0" />
                      ) : (
                        <Play className="w-3 h-3 text-slate-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Series Quick Switcher Sidebar */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col h-[580px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clapperboard className="w-4 h-4 text-purple-400" />
              <span>সিরিজ তালিকা</span>
            </h3>
            <span className="text-xs text-purple-400 font-mono font-bold">{filteredSeries.length} টি</span>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="সিরিজের নাম লিখুন..."
              className="w-full glass-input rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* List */}
          <div className="overflow-y-auto space-y-2 pr-1 custom-scrollbar flex-1">
            {filteredSeries.length > 0 ? (
              filteredSeries.slice(0, 50).map((series) => {
                const isActive = activeSeries?.id === series.id;
                return (
                  <button
                    key={`quick-series-${series.id}`}
                    onClick={() => handleSelectSeries(series)}
                    className={`w-full p-2.5 rounded-xl border flex items-center gap-3 text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/15'
                        : 'glass-card border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="relative w-10 h-14 shrink-0 rounded-lg overflow-hidden bg-black/50 border border-white/10">
                      <MediaImage
                        src={series.poster}
                        alt={series.cleanTitle}
                        type="series"
                        fallbackText={series.cleanTitle}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate">
                        {series.cleanTitle}
                      </div>
                      <div className="text-[10px] text-purple-300/80 truncate mt-0.5">
                        {series.seasons.length} সিজন · {series.totalEpisodes} পর্ব
                      </div>
                    </div>

                    {isActive ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse shrink-0" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                কোনো সিরিজ পাওয়া যায়নি
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

      {/* Browse All Series with 20-item Batch Infinite Scroll */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            <span className="text-aurora-gradient font-extrabold">সকল ওয়েব সিরিজ ও ড্রামা</span>
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="যেকোনো সিরিজ খুঁজুন..."
              className="w-full glass-input rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Series Poster Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={`series-skel-${i}`}
                className="aspect-[2/3] rounded-2xl glass-card animate-pulse p-2 flex flex-col justify-end"
              >
                <div className="w-full h-4 bg-white/10 rounded mb-1" />
                <div className="w-1/2 h-3 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : filteredSeries.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
              {filteredSeries.slice(0, visibleCount).map((series, idx) => {
                const isActive = activeSeries?.id === series.id;
                return (
                  <button
                    key={`series-card-${series.id}-${idx}`}
                    onClick={() => handleSelectSeries(series)}
                    className={`group relative rounded-2xl overflow-hidden border text-left transition-all cursor-pointer flex flex-col ${
                      isActive
                        ? 'border-purple-500 ring-2 ring-purple-500/40 shadow-xl shadow-purple-500/20 scale-[1.02]'
                        : 'glass-card border-white/5 hover:border-white/20 hover:scale-[1.02]'
                    }`}
                  >
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/50">
                      <MediaImage
                        src={series.poster}
                        alt={series.cleanTitle}
                        type="series"
                        fallbackText={series.cleanTitle}
                        className="group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-bold bg-purple-600 text-white shadow">
                        {series.seasons.length} Seasons
                      </div>

                      <div className="absolute bottom-2 left-2 right-2">
                        <h4 className="text-xs font-bold text-white truncate drop-shadow">
                          {series.cleanTitle}
                        </h4>
                        <div className="text-[10px] text-slate-300 flex items-center justify-between mt-0.5">
                          <span>{series.totalEpisodes} Episodes</span>
                          <span className="text-purple-400 flex items-center gap-1 font-semibold">
                            <Play className="w-2.5 h-2.5 fill-purple-400" /> শুরু করুন
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
              hasMore={visibleCount < filteredSeries.length}
              isLoading={isLoadingMore}
              loadingText="আরও ওয়েব সিরিজ লোড হচ্ছে (২০টি করে)..."
              skeletonVariant="video-grid"
              skeletonCount={6}
            />
          </>
        ) : (
          <div className="glass-panel rounded-2xl p-12 text-center">
            <Filter className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">কোনো সিরিজ পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-400">
              অনুগ্রহ করে অন্য কোনো অনুসন্ধান শব্দ চেষ্টা করুন।
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
