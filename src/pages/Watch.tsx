import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ThumbsUp, ThumbsDown, Share2, Download, Scissors, ListPlus, CheckCircle2, Bookmark, Send, Sparkles, Maximize2, Check, Play, Pause, PictureInPicture2, RotateCcw, ExternalLink, RefreshCw, AlertCircle, Gift, Flag } from 'lucide-react';
import { cn, handleThumbnailError } from '../lib/utils';
import { getVideoDetails, getComments, getVideos, searchVideos, getChannelDetails, getPlayerRecommendations } from '../services/youtube';
import { formatPublishedAt, formatViewCount, formatDuration } from '../lib/formatters';
import { addToWatchHistory } from '../lib/watchHistory';
import { useUserStore, VideoItem } from '../store/useUserStore';
import { useCoinStore } from '../store/useCoinStore';
import { SaveToPlaylistModal } from '../components/video/SaveToPlaylistModal';
import { ShareModal } from '../components/video/ShareModal';
import { useMiniPlayer } from '../context/MiniPlayerContext';
import { Tooltip } from '../components/ui/Tooltip';
import { getFallbackChannelAvatar } from '../lib/avatar';
import { AdContainer } from '../components/ads/AdContainer';
import { useAdsterra } from '../context/AdsterraContext';
import { useAuth } from '../context/AuthContext';
import { reportVideo, incrementVideoViews } from '../services/videoFirestore';

export function Watch() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const playlistIds = searchParams.get('playlistIds');

  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [downloadToast, setDownloadToast] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [autoplayToast, setAutoplayToast] = useState<string | null>(null);
  const [floatingToast, setFloatingToast] = useState(false);
  const [recommendationFilter, setRecommendationFilter] = useState<'All' | 'Related' | 'For You' | 'From Channel' | 'From Searches'>('All');
  const [playerKey, setPlayerKey] = useState(0);
  const [useNoCookie, setUseNoCookie] = useState(true);
  const [showPlayerHelp, setShowPlayerHelp] = useState(false);

  const { user } = useAuth();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('অনুচিত বা আপত্তিকর কনটেন্ট');
  const [reportCustomReason, setReportCustomReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportToast, setReportToast] = useState('');

  // Increment views for custom Firestore videos
  useEffect(() => {
    if (id && id.startsWith('vid_')) {
      incrementVideoViews(id);
    }
  }, [id]);

  const { openMiniPlayer } = useMiniPlayer();
  const { incrementWatchCount, triggerInterstitialIfNeeded } = useAdsterra();

  const handleRelatedVideoClick = (e: React.MouseEvent, vid: string) => {
    const watchPath = `/watch/${vid}`;
    const triggered = triggerInterstitialIfNeeded(watchPath);
    if (triggered) {
      e.preventDefault();
    }
  };

  const toggleAutoplay = () => {
    setIsAutoplay((prev) => {
      const nextVal = !prev;
      setAutoplayToast(nextVal ? 'Autoplay is turned ON' : 'Autoplay is turned OFF');
      setTimeout(() => setAutoplayToast(null), 2500);
      return nextVal;
    });
  };

  const {
    likedVideos,
    dislikedVideoIds,
    subscribedChannels,
    customComments,
    toggleLikeVideo,
    toggleDislikeVideo,
    toggleSubscribe,
    addComment,
    addWatchTime,
  } = useUserStore();

  const { data: videoData, isLoading: videoLoading } = useQuery({
    queryKey: ['video', id],
    queryFn: () => getVideoDetails(id || ''),
    enabled: !!id
  });

  const { data: commentsData } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => getComments(id || '', 20),
    enabled: !!id
  });

  const video = videoData?.items?.[0];

  const { data: relatedVideos = [] } = useQuery({
    queryKey: [
      'playerRecommendations',
      id,
      video?.snippet?.title,
      video?.snippet?.channelTitle,
      recommendationFilter,
    ],
    queryFn: () => {
      return getPlayerRecommendations(
        id,
        video?.snippet?.title,
        video?.snippet?.channelTitle,
        (video as any)?.category,
        recommendationFilter,
        30
      );
    },
    enabled: !!id,
  });

  const comments = commentsData?.items || [];

  const { data: channelData } = useQuery({
    queryKey: ['channel', video?.snippet?.channelId],
    queryFn: () => getChannelDetails(video?.snippet?.channelId || ''),
    enabled: !!video?.snippet?.channelId
  });

  // Track watch time and history
  useEffect(() => {
    if (video && id) {
      addToWatchHistory({
        id,
        title: video.snippet?.title || '',
        channelName: video.snippet?.channelTitle || '',
        channelId: video.snippet?.channelId || '',
        views: video.statistics?.viewCount,
        publishedAt: video.snippet?.publishedAt,
        duration: formatDuration(video.contentDetails?.duration),
        thumbnailUrl: video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url,
        description: video.snippet?.description || '',
        avatarColor: 'bg-blue-600',
        progressPercentage: 55,
      });

      // Increment today's watch time by 2 minutes on video load
      addWatchTime(2);
      incrementWatchCount();
    }
  }, [video, id, addWatchTime, incrementWatchCount]);


  if (videoLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!video) {
    return <div className="p-6 text-center">Video not found.</div>;
  }

  const currentVideoItem: VideoItem = {
    id: id || '',
    title: video.snippet?.title || '',
    channelName: video.snippet?.channelTitle || '',
    channelId: video.snippet?.channelId || '',
    thumbnailUrl: video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url,
    duration: video.contentDetails?.duration,
    views: video.statistics?.viewCount,
    publishedAt: video.snippet?.publishedAt,
    description: video.snippet?.description,
  };

  const isLiked = likedVideos.some((v) => v.id === id);
  const isDisliked = dislikedVideoIds.includes(id || '');
  const isSubscribed = subscribedChannels.some((c) => c.id === video.snippet?.channelId);

  const handleSubscribeToggle = () => {
    toggleSubscribe({
      id: video.snippet?.channelId || 'UC_default',
      title: video.snippet?.channelTitle || 'Creator Channel',
      subscribedAt: Date.now(),
    });
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !id) return;

    addComment(id, newCommentText.trim());
    setNewCommentText('');
  };

  const handleDownload = () => {
    setDownloadToast(true);
    setTimeout(() => setDownloadToast(false), 2500);
  };

  const videoCustomComments = (id && customComments[id]) || [];

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 bg-transparent text-white min-h-full transition-colors relative pb-bottom-nav">
      
      {/* Toast popups */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4" />
          Offline download started for high-quality playback!
        </div>
      )}
      {autoplayToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200 border border-white/20">
          {isAutoplay ? <Play className="w-4 h-4 text-blue-500 fill-blue-500" /> : <Pause className="w-4 h-4 text-amber-500 fill-amber-500" />}
          {autoplayToast}
        </div>
      )}
      {floatingToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200 border border-white/20">
          <PictureInPicture2 className="w-4 h-4 text-blue-500" />
          Floating player enabled!
        </div>
      )}

      {/* Primary Column - Video & Details */}
      <div className={cn("flex-1 flex flex-col gap-4", "lg:max-w-[calc(100%-400px)]")}>
        
        {/* Video Player Box */}
        <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden relative shadow-2xl group">
          {(video as any)?._videoUrl ? (
            <video
              key={`${id}-${playerKey}`}
              src={(video as any)._videoUrl}
              controls
              autoPlay={isAutoplay}
              playsInline
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <iframe
              key={`${id}-${playerKey}-${useNoCookie ? 'nocookie' : 'standard'}`}
              src={`${useNoCookie ? 'https://www.youtube-nocookie.com' : 'https://www.youtube.com'}/embed/${id}?autoplay=${
                isAutoplay ? '1' : '0'
              }&rel=0&enablejsapi=1&playsinline=1${playlistIds ? `&playlist=${playlistIds}` : ''}${
                typeof window !== 'undefined' && window.location.origin ? `&origin=${encodeURIComponent(window.location.origin)}` : ''
              }`}
              title={video.snippet.title}
              className="w-full h-full border-0"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>

        {/* Player Options & Troubleshooting Toolbar */}
        <div className="flex items-center justify-between text-xs px-1 text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPlayerKey((k) => k + 1)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300 font-medium transition-colors cursor-pointer"
              title="Reload the video player without refreshing the whole page"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Player</span>
            </button>

            <button
              onClick={() => {
                setUseNoCookie((prev) => !prev);
                setPlayerKey((k) => k + 1);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300 font-medium transition-colors cursor-pointer"
              title="Toggle between privacy-enhanced youtube-nocookie and standard youtube domain"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Engine: {useNoCookie ? 'NoCookie' : 'Standard'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://www.youtube.com/watch?v=${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Open this video directly on YouTube"
            >
              <span>Watch on YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>


        {/* Video Title */}
        <h1 className="text-xl font-bold text-[#0f0f0f] dark:text-[#f1f1f1] leading-tight mt-3">
          {video.snippet.title}
        </h1>

        {/* Video Actions & Channel Info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-2">
          <div className="flex items-center gap-3">
            <Link to={`/channel/${video.snippet.channelId}`} className="w-10 h-10 rounded-full shrink-0 overflow-hidden bg-neutral-200 dark:bg-neutral-800 group">
              <img
                src={
                  channelData?.items?.[0]?.snippet?.thumbnails?.medium?.url ||
                  channelData?.items?.[0]?.snippet?.thumbnails?.default?.url ||
                  getFallbackChannelAvatar(video.snippet.channelTitle, video.snippet.channelId)
                }
                alt={video.snippet.channelTitle}
                className="w-full h-full object-cover"
                onError={handleThumbnailError}
              />
            </Link>
            <div className="flex flex-col mr-3">
              <Link to={`/channel/${video.snippet.channelId}`} className="font-semibold flex items-center gap-1 text-[#0f0f0f] dark:text-[#f1f1f1] text-base">
                {video.snippet.channelTitle}
                <CheckCircle2 className="w-[14px] h-[14px] text-[#606060] dark:text-[#aaaaaa]" />
              </Link>
              <div className="text-xs text-[#606060] dark:text-[#aaaaaa]">
                {channelData?.items?.[0]?.statistics?.subscriberCount ? `${formatViewCount(channelData.items[0].statistics.subscriberCount)} subscribers` : ''}
              </div>
            </div>

            {/* Subscribe Button */}
            <button
              onClick={handleSubscribeToggle}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-all cursor-pointer ${
                isSubscribed
                  ? 'bg-neutral-100 text-[#0f0f0f] dark:bg-white/10 dark:text-white hover:bg-neutral-200 dark:hover:bg-white/20'
                  : 'bg-[#0f0f0f] text-white dark:bg-[#f1f1f1] dark:text-[#0f0f0f] hover:bg-neutral-800 dark:hover:bg-neutral-200'
              }`}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
            {/* Like & Dislike */}
            <div className="flex items-center bg-neutral-100 dark:bg-white/10 text-[#0f0f0f] dark:text-white rounded-full h-9">
              <button
                onClick={() => toggleLikeVideo(currentVideoItem)}
                className={`flex items-center gap-2 px-4 h-full hover:bg-neutral-200 dark:hover:bg-white/20 rounded-l-full relative cursor-pointer ${
                  isLiked ? 'text-blue-600 dark:text-blue-400 font-medium' : 'font-medium'
                }`}
              >
                <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} strokeWidth={1.5} />
                <span className="text-sm">{formatViewCount(video.statistics.likeCount)}</span>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-6 bg-neutral-300 dark:bg-white/20"></div>
              </button>

              <button
                onClick={() => toggleDislikeVideo(id || '')}
                className={`px-4 h-full hover:bg-neutral-200 dark:hover:bg-white/20 rounded-r-full transition-colors cursor-pointer ${
                  isDisliked ? 'text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                <ThumbsDown className={`w-5 h-5 ${isDisliked ? 'fill-current' : ''}`} strokeWidth={1.5} />
              </button>
            </div>

            {/* PipraTube Gift Coins Action */}
            <button
              onClick={() => useCoinStore.getState().openGiftModal({
                id: id || '',
                title: video.snippet?.title || '',
                channel: video.snippet?.channelTitle || '',
              })}
              className="flex items-center gap-1.5 px-4 h-9 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-full transition-all cursor-pointer font-bold text-xs"
              title="ক্রিয়েটরকে উপহার পাঠান"
            >
              <Gift className="w-4 h-4 text-amber-400" />
              <span>উপহার পাঠান</span>
            </button>

            {/* Share */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-2 px-4 h-9 bg-neutral-100 hover:bg-neutral-200 dark:bg-white/10 dark:hover:bg-white/20 text-[#0f0f0f] dark:text-white rounded-full transition-colors cursor-pointer"
            >
              <Share2 className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-sm font-medium">Share</span>
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 h-9 bg-neutral-100 hover:bg-neutral-200 dark:bg-white/10 dark:hover:bg-white/20 text-[#0f0f0f] dark:text-white rounded-full transition-colors cursor-pointer"
            >
              <Download className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-sm font-medium hidden sm:inline">Download</span>
            </button>

            {/* More Menu (Save) */}
            <button
              onClick={() => setIsSaveModalOpen(true)}
              className="w-9 h-9 flex justify-center items-center bg-neutral-100 hover:bg-neutral-200 dark:bg-white/10 dark:hover:bg-white/20 text-[#0f0f0f] dark:text-white rounded-full transition-colors cursor-pointer shrink-0"
              title="Save to playlist"
            >
              <ListPlus className="w-5 h-5" strokeWidth={1.5} />
            </button>

            {/* Flag / Report Video button */}
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="w-9 h-9 flex justify-center items-center bg-neutral-100 hover:bg-red-500/20 dark:bg-white/10 dark:hover:bg-red-500/20 text-neutral-500 hover:text-red-400 dark:text-white/60 dark:hover:text-red-400 rounded-full transition-colors cursor-pointer shrink-0"
              title="রিপোর্ট বা অভিযোগ করুন"
            >
              <Flag className="w-4 h-4" strokeWidth={1.5} />
            </button>

          </div>
        </div>

        {/* Description Box */}
        <div 
          className="glass-panel p-4 rounded-2xl text-sm text-slate-200 cursor-pointer mt-2 transition-all hover:border-white/20"
          onClick={() => setShowFullDescription(!showFullDescription)}
        >
          <div className="font-bold text-sm mb-1.5 text-white flex items-center gap-2">
            <span>{formatViewCount(video.statistics.viewCount)} views</span>
            <span>•</span>
            <span className="text-slate-400">{formatPublishedAt(video.snippet.publishedAt)}</span>
          </div>
          <div className={cn("whitespace-pre-wrap leading-relaxed text-xs sm:text-sm text-slate-300", !showFullDescription && "line-clamp-2")}>
            {video.snippet.description}
          </div>
          <button 
            className="mt-2.5 font-bold text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {showFullDescription ? 'সংক্ষিপ্ত করুন (Show less)' : 'আরও বিবরণ দেখুন (Show more)'}
          </button>
        </div>

        {/* Adsterra Below Video Banner */}
        <AdContainer placement="watchBelowVideo" format="728x90" className="my-2" />

        {/* Comments Section */}
        <div className="mt-6 flex flex-col gap-6">
           <h2 className="text-xl font-bold text-[#0f0f0f] dark:text-[#f1f1f1]">
             {formatViewCount((video.statistics.commentCount || 0) + videoCustomComments.length)} Comments
           </h2>

           {/* Add New Comment */}
           <form onSubmit={handlePostComment} className="flex gap-4 items-start">
             <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-medium text-sm flex items-center justify-center shrink-0">
               JD
             </div>
             <div className="flex-1 flex flex-col gap-2 pt-1">
               <input
                 type="text"
                 placeholder="Add a comment..."
                 value={newCommentText}
                 onChange={(e) => setNewCommentText(e.target.value)}
                 className="w-full bg-transparent border-b border-neutral-300 dark:border-white/20 focus:border-[#0f0f0f] dark:focus:border-white outline-none pb-1 text-sm transition-colors text-[#0f0f0f] dark:text-[#f1f1f1] placeholder-neutral-500"
               />
               <div className="flex items-center justify-end gap-2 mt-1">
                 {newCommentText && (
                   <button
                     type="button"
                     onClick={() => setNewCommentText('')}
                     className="px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full cursor-pointer text-[#0f0f0f] dark:text-[#f1f1f1]"
                   >
                     Cancel
                   </button>
                 )}
                 <button
                   type="submit"
                   disabled={!newCommentText.trim()}
                   className="px-4 py-2 bg-blue-600 disabled:bg-neutral-100 disabled:dark:bg-white/10 disabled:text-neutral-500 text-white text-sm font-medium rounded-full transition-colors cursor-pointer"
                 >
                   Comment
                 </button>
               </div>
             </div>
           </form>
           
           {/* Newly Posted User Comments */}
           {videoCustomComments.map((c) => (
             <div key={c.id} className="flex gap-4 items-start">
               <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-medium text-sm flex items-center justify-center shrink-0">
                 JD
               </div>
               <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-2">
                   <span className="font-semibold text-[13px] text-[#0f0f0f] dark:text-[#f1f1f1]">{c.author}</span>
                   <span className="text-[12px] text-[#606060] dark:text-[#aaaaaa]">Just now</span>
                 </div>
                 <p className="text-sm text-[#0f0f0f] dark:text-[#f1f1f1] whitespace-pre-wrap">{c.text}</p>
                 <div className="flex items-center gap-4 mt-1 text-[#0f0f0f] dark:text-[#f1f1f1]">
                   <button className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 cursor-pointer"><ThumbsUp className="w-4 h-4" strokeWidth={1.5} /></button>
                   <button className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 cursor-pointer"><ThumbsDown className="w-4 h-4" strokeWidth={1.5} /></button>
                   <button className="text-xs font-semibold px-3 py-2 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 cursor-pointer">Reply</button>
                 </div>
               </div>
             </div>
           ))}

           {/* API Comments List */}
           {comments.map((comment: any) => {
             const snippet = comment.snippet.topLevelComment.snippet;
             return (
               <div key={comment.id} className="flex gap-4 items-start">
                  <img src={snippet.authorProfileImageUrl} alt={snippet.authorDisplayName} className="w-10 h-10 rounded-full shrink-0 object-cover" onError={handleThumbnailError} />
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[13px] text-[#0f0f0f] dark:text-[#f1f1f1]">{snippet.authorDisplayName}</span>
                      <span className="text-[12px] text-[#606060] dark:text-[#aaaaaa]">{formatPublishedAt(snippet.publishedAt)}</span>
                    </div>
                    <p className="text-sm text-[#0f0f0f] dark:text-[#f1f1f1] whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: snippet.textDisplay }}></p>
                    <div className="flex items-center gap-1 mt-1 text-[#0f0f0f] dark:text-[#f1f1f1]">
                      <button className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 cursor-pointer"><ThumbsUp className="w-4 h-4" strokeWidth={1.5} /></button>
                      <span className="text-xs text-[#606060] dark:text-[#aaaaaa] mr-2">{formatViewCount(snippet.likeCount)}</span>
                      <button className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 cursor-pointer"><ThumbsDown className="w-4 h-4" strokeWidth={1.5} /></button>
                      <button className="text-xs font-semibold px-3 py-2 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 cursor-pointer">Reply</button>
                    </div>
                  </div>
               </div>
             );
           })}
        </div>
      </div>

      {/* Secondary Column - Suggested Videos & Recommendations */}
      <div className="w-full lg:w-[400px] shrink-0 flex flex-col gap-3">
        {/* Adsterra Sidebar 300x250 Ad */}
        <AdContainer placement="watchSidebar" format="300x250" className="mb-2" />

        {/* Dynamic Recommendation Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {(['All', 'For You', 'Related', 'From Channel', 'From Searches'] as const).map((tab) => {
            const isActive = recommendationFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => setRecommendationFilter(tab)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-1',
                  isActive
                    ? 'bg-gradient-to-r from-[#ff2d6f] to-[#c026d3] text-white shadow-md shadow-pink-500/20 font-bold'
                    : 'glass-pill text-slate-300 hover:text-white'
                )}
              >
                {tab === 'For You' && <Sparkles className="w-3 h-3 fill-current text-pink-400" />}
                <span>{tab}</span>
              </button>
            );
          })}
        </div>

        {relatedVideos.map((v: any, index: number) => {
          const vid = typeof v.id === 'string' ? v.id : v.id?.videoId;
          if (!vid) return null;

          return (
            <div key={`rec-${vid}-${index}`} className="flex gap-2.5 group cursor-pointer rounded-2xl glass-card transition-all p-2">
              <Link 
                to={`/watch/${vid}`} 
                onClick={(e) => handleRelatedVideoClick(e, vid)}
                className="w-[160px] aspect-video rounded-xl shrink-0 overflow-hidden relative block bg-black/40 border border-white/5"
              >
                <img
                  src={v.snippet?.thumbnails?.medium?.url || v.snippet?.thumbnails?.default?.url}
                  alt={v.snippet?.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={handleThumbnailError}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                {v.contentDetails?.duration && (
                  <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-xs text-white px-1.5 py-0.5 rounded text-[10px] font-mono font-medium">
                    {formatDuration(v.contentDetails.duration)}
                  </div>
                )}
              </Link>
              <div className="flex flex-col flex-1 min-w-0 justify-center">
                <Link 
                  to={`/watch/${vid}`}
                  onClick={(e) => handleRelatedVideoClick(e, vid)}
                >
                  <h4 className="text-xs sm:text-sm font-bold leading-snug line-clamp-2 text-white group-hover:text-cyan-300 transition-colors" dangerouslySetInnerHTML={{ __html: v.snippet?.title || '' }}></h4>
                </Link>
                <Link to={`/channel/${v.snippet?.channelId}`} className="text-xs text-slate-400 mt-1 hover:text-white transition-colors truncate font-medium">
                  {v.snippet?.channelTitle}
                </Link>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {v.statistics?.viewCount ? `${formatViewCount(v.statistics.viewCount)} views • ` : ''}{formatPublishedAt(v.snippet?.publishedAt)}
                </div>
                {v.recommendationReason && (
                  <div className="flex items-center gap-1 mt-1 text-[10px] font-medium text-cyan-300 glass-pill px-1.5 py-0.2 rounded w-fit max-w-full">
                    <Sparkles className="w-2.5 h-2.5 shrink-0 text-pink-400" />
                    <span className="truncate">{v.recommendationReason}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save to Playlist Modal */}
      <SaveToPlaylistModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        video={currentVideoItem}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        videoTitle={video.snippet.title}
        videoId={id || ''}
      />

      {/* Video Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md p-6 rounded-3xl bg-neutral-900 border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">ভিডিও রিপোর্ট করুন</h3>
                <p className="text-xs text-neutral-400">এডমিন প্যানেলে মডারেশনের জন্য অভিযোগ জমা দিন</p>
              </div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!id || !video) return;
                setIsSubmittingReport(true);
                try {
                  const finalReason = reportCustomReason ? `${reportReason}: ${reportCustomReason}` : reportReason;
                  await reportVideo(
                    id,
                    video.snippet.title,
                    finalReason,
                    user?.uid || 'anonymous',
                    user?.email || 'viewer@nesttube.local'
                  );
                  setReportToast('রিপোর্টটি এডমিন মডারেশন প্যানেলে পাঠানো হয়েছে। ধন্যবাদ!');
                  setIsReportModalOpen(false);
                  setReportCustomReason('');
                  setTimeout(() => setReportToast(''), 3500);
                } catch (err) {
                  console.error(err);
                  alert('রিপোর্ট পাঠানো সম্ভব হয়নি।');
                } finally {
                  setIsSubmittingReport(false);
                }
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">অভিযোগের কারণ</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/10 text-white text-xs focus:outline-none"
                >
                  <option value="অনুচিত বা আপত্তিকর কনটেন্ট">অনুচিত বা আপত্তিকর কনটেন্ট</option>
                  <option value="ভুল তথ্য বা বিভ্রান্তিকর শিরোনাম">ভুল তথ্য বা বিভ্রান্তিকর শিরোনাম</option>
                  <option value="কপিরাইট লঙ্ঘন">কপিরাইট লঙ্ঘন (Copyright Infringement)</option>
                  <option value="স্প্যাম বা ক্ষতিকর লিঙ্ক">স্প্যাম বা ক্ষতিকর লিঙ্ক</option>
                  <option value="অন্যান্য কারণ">অন্যান্য কারণ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">বিস্তারিত বিবরণ (ঐচ্ছিক)</label>
                <textarea
                  rows={3}
                  value={reportCustomReason}
                  onChange={(e) => setReportCustomReason(e.target.value)}
                  placeholder="সমস্যা সম্পর্কে লিখুন..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs resize-none placeholder-neutral-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:bg-white/5 text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  {isSubmittingReport ? 'পাঠানো হচ্ছে...' : 'রিপোর্ট জমা দিন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Toast Notification */}
      {reportToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4" />
          <span>{reportToast}</span>
        </div>
      )}

    </div>
  );
}

