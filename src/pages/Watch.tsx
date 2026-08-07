import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ThumbsUp, ThumbsDown, Share2, Download, Scissors, ListPlus, CheckCircle2, Bookmark, Send, Sparkles, Maximize2, Check, Play, Pause, PictureInPicture2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { getVideoDetails, getComments, getVideos, searchVideos, getChannelDetails } from '../services/youtube';
import { formatPublishedAt, formatViewCount, formatDuration } from '../lib/formatters';
import { addToWatchHistory } from '../lib/watchHistory';
import { useUserStore, VideoItem } from '../store/useUserStore';
import { SaveToPlaylistModal } from '../components/video/SaveToPlaylistModal';
import { ShareModal } from '../components/video/ShareModal';
import { useMiniPlayer } from '../context/MiniPlayerContext';
import { Tooltip } from '../components/ui/Tooltip';
import { getFallbackChannelAvatar } from '../lib/avatar';

export function Watch() {
  const { id } = useParams<{ id: string }>();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [downloadToast, setDownloadToast] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [autoplayToast, setAutoplayToast] = useState<string | null>(null);
  const [floatingToast, setFloatingToast] = useState(false);

  const { openMiniPlayer } = useMiniPlayer();

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

  const { data: relatedData } = useQuery({
    queryKey: ['relatedVideos', id],
    queryFn: () => searchVideos('programming technology', 15),
    enabled: !!id
  });

  const video = videoData?.items?.[0];
  const comments = commentsData?.items || [];
  const relatedVideos = relatedData?.items || [];

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
        duration: video.contentDetails?.duration,
        thumbnailUrl: video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url,
        avatarColor: 'bg-blue-600'
      });

      // Increment today's watch time by 2 minutes on video load
      addWatchTime(2);
    }
  }, [video, id, addWatchTime]);

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
    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 bg-white dark:bg-[#0f0f0f] text-neutral-900 dark:text-white min-h-full transition-colors relative">
      
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
      <div className={cn("flex-1 flex flex-col gap-4", isTheaterMode ? "w-full" : "lg:max-w-[calc(100%-400px)]")}>
        
        {/* Video Player Box */}
        <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden relative shadow-2xl group">
          <iframe
            src={`https://www.youtube.com/embed/${id}?autoplay=${isAutoplay ? '1' : '0'}&rel=0`}
            title={video.snippet.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
          <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <Tooltip content={isAutoplay ? 'Autoplay is ON' : 'Autoplay is OFF'} position="bottom">
              <button
                onClick={toggleAutoplay}
                className={cn(
                  "px-3 py-2 rounded-xl backdrop-blur-md flex items-center gap-2 text-xs font-bold transition-all shadow-lg hover:scale-105 cursor-pointer",
                  isAutoplay 
                    ? "bg-black/80 hover:bg-black/95 text-white" 
                    : "bg-black/60 hover:bg-black/80 text-white/70"
                )}
              >
                <span className="text-[11px] font-semibold">Autoplay</span>
                <div className={cn(
                  "w-7 h-4 rounded-full p-0.5 transition-colors relative flex items-center",
                  isAutoplay ? "bg-blue-600" : "bg-neutral-600"
                )}>
                  <div className={cn(
                    "w-3 h-3 rounded-full bg-white transition-transform flex items-center justify-center shadow-xs",
                    isAutoplay ? "translate-x-3" : "translate-x-0"
                  )}>
                    {isAutoplay ? <Play className="w-1.5 h-1.5 text-blue-600 fill-blue-600 ml-0.5" /> : <Pause className="w-1.5 h-1.5 text-neutral-600 fill-neutral-600" />}
                  </div>
                </div>
              </button>
            </Tooltip>

            <Tooltip content="Open Floating Player" position="bottom">
              <button
                onClick={() => {
                  if (video && id) {
                    openMiniPlayer({
                      id,
                      title: video.snippet.title,
                      channelTitle: video.snippet.channelTitle,
                    });
                    setFloatingToast(true);
                    setTimeout(() => setFloatingToast(false), 2500);
                  }
                }}
                className="p-2 rounded-xl bg-black/70 hover:bg-black/90 text-white backdrop-blur-md flex items-center gap-1.5 text-xs font-bold transition-all shadow-lg hover:scale-105 cursor-pointer"
              >
                <PictureInPicture2 className="w-4 h-4" />
                <span className="hidden sm:inline">Floating Player</span>
              </button>
            </Tooltip>

            <Tooltip content="Share video" position="bottom">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="p-2 rounded-xl bg-black/70 hover:bg-black/90 text-white backdrop-blur-md flex items-center gap-1.5 text-xs font-bold transition-all shadow-lg hover:scale-105 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </Tooltip>

            <Tooltip content={isTheaterMode ? 'Exit Theater Mode' : 'Theater Mode'} position="bottom">
              <button
                onClick={() => setIsTheaterMode(!isTheaterMode)}
                className="p-2 rounded-xl bg-black/70 hover:bg-black/90 text-white backdrop-blur-md transition-all shadow-lg hover:scale-105 cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Video Title */}
        <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white leading-tight">
          {video.snippet.title}
        </h1>

        {/* Video Actions & Channel Info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-200 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Link to={`/channel/${video.snippet.channelId}`} className="w-11 h-11 rounded-full shrink-0 overflow-hidden bg-neutral-200 dark:bg-neutral-800 shadow-md border border-neutral-200 dark:border-white/10 group">
              <img
                src={
                  channelData?.items?.[0]?.snippet?.thumbnails?.medium?.url ||
                  channelData?.items?.[0]?.snippet?.thumbnails?.default?.url ||
                  getFallbackChannelAvatar(video.snippet.channelTitle, video.snippet.channelId)
                }
                alt={video.snippet.channelTitle}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </Link>
            <div className="flex flex-col">
              <Link to={`/channel/${video.snippet.channelId}`} className="font-bold flex items-center gap-1 hover:text-blue-500 text-neutral-900 dark:text-white text-sm">
                {video.snippet.channelTitle}
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              </Link>
              <div className="text-xs text-neutral-500 dark:text-white/60">1.25M subscribers</div>
            </div>

            {/* Subscribe Button */}
            <Tooltip content={isSubscribed ? 'Unsubscribe from channel' : 'Subscribe to channel'} position="top">
              <button
                onClick={handleSubscribeToggle}
                className={`px-5 py-2 rounded-full font-bold text-xs transition-all ml-2 shadow-sm cursor-pointer ${
                  isSubscribed
                    ? 'bg-neutral-200 text-neutral-800 dark:bg-white/20 dark:text-white hover:bg-red-600 hover:text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </Tooltip>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
            {/* Like & Dislike */}
            <div className="flex items-center bg-neutral-100 dark:bg-white/10 text-neutral-800 dark:text-white rounded-full h-9">
              <Tooltip content={isLiked ? 'Unlike' : 'I like this'} position="top">
                <button
                  onClick={() => toggleLikeVideo(currentVideoItem)}
                  className={`flex items-center gap-2 px-4 h-full hover:bg-neutral-200 dark:hover:bg-white/20 rounded-l-full border-r border-neutral-300 dark:border-white/20 transition-colors cursor-pointer ${
                    isLiked ? 'text-blue-600 dark:text-blue-400 font-bold' : ''
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-xs font-bold">{formatViewCount(video.statistics.likeCount)}</span>
                </button>
              </Tooltip>

              <Tooltip content={isDisliked ? 'Remove Dislike' : 'I dislike this'} position="top">
                <button
                  onClick={() => toggleDislikeVideo(id || '')}
                  className={`px-4 h-full hover:bg-neutral-200 dark:hover:bg-white/20 rounded-r-full transition-colors cursor-pointer ${
                    isDisliked ? 'text-red-500 font-bold' : ''
                  }`}
                >
                  <ThumbsDown className={`w-4 h-4 ${isDisliked ? 'fill-current' : ''}`} />
                </button>
              </Tooltip>
            </div>

            {/* Share */}
            <Tooltip content="Share video link" position="top">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-2 px-4 h-9 bg-neutral-100 hover:bg-neutral-200 dark:bg-white/10 dark:hover:bg-white/20 text-neutral-800 dark:text-white rounded-full transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-xs font-bold">Share</span>
              </button>
            </Tooltip>

            {/* Save to Playlist */}
            <Tooltip content="Save to playlist" position="top">
              <button
                onClick={() => setIsSaveModalOpen(true)}
                className="flex items-center gap-2 px-4 h-9 bg-neutral-100 hover:bg-neutral-200 dark:bg-white/10 dark:hover:bg-white/20 text-neutral-800 dark:text-white rounded-full transition-colors cursor-pointer"
              >
                <Bookmark className="w-4 h-4" />
                <span className="text-xs font-bold">Save</span>
              </button>
            </Tooltip>

            {/* Download */}
            <Tooltip content="Download video" position="top">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 h-9 bg-neutral-100 hover:bg-neutral-200 dark:bg-white/10 dark:hover:bg-white/20 text-neutral-800 dark:text-white rounded-full transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span className="text-xs font-bold hidden sm:inline">Download</span>
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Description Box */}
        <div className="bg-neutral-100 dark:bg-white/5 p-4 rounded-2xl text-sm text-neutral-800 dark:text-white border border-neutral-200 dark:border-white/10">
          <div className="font-bold text-xs text-neutral-600 dark:text-white/70 mb-2">
            {formatViewCount(video.statistics.viewCount)} views • {formatPublishedAt(video.snippet.publishedAt)}
          </div>
          <div className={cn("text-neutral-800 dark:text-white/90 whitespace-pre-wrap leading-relaxed text-xs", !showFullDescription && "line-clamp-3")}>
            {video.snippet.description}
          </div>
          <button 
            className="mt-2 text-blue-600 dark:text-blue-400 font-bold hover:underline text-xs"
            onClick={() => setShowFullDescription(!showFullDescription)}
          >
            {showFullDescription ? 'Show less' : 'Show more'}
          </button>
        </div>

        {/* Comments Section */}
        <div className="mt-6 flex flex-col gap-6">
           <h2 className="text-lg font-extrabold flex items-center gap-2">
             {formatViewCount((video.statistics.commentCount || 0) + videoCustomComments.length)} Comments
           </h2>

           {/* Add New Comment */}
           <form onSubmit={handlePostComment} className="flex gap-3 items-start">
             <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-md">
               JD
             </div>
             <div className="flex-1 flex flex-col gap-2">
               <input
                 type="text"
                 placeholder="Add a comment..."
                 value={newCommentText}
                 onChange={(e) => setNewCommentText(e.target.value)}
                 className="w-full bg-transparent border-b border-neutral-300 dark:border-white/20 focus:border-blue-500 outline-none pb-2 text-xs transition-colors text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-white/40"
               />
               <div className="flex items-center justify-end gap-2">
                 {newCommentText && (
                   <button
                     type="button"
                     onClick={() => setNewCommentText('')}
                     className="px-3 py-1.5 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full"
                   >
                     Cancel
                   </button>
                 )}
                 <button
                   type="submit"
                   disabled={!newCommentText.trim()}
                   className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full disabled:opacity-50 transition-colors shadow-sm"
                 >
                   <Send className="w-3.5 h-3.5" />
                   Comment
                 </button>
               </div>
             </div>
           </form>
           
           {/* Newly Posted User Comments */}
           {videoCustomComments.map((c) => (
             <div key={c.id} className="flex gap-3 items-start bg-blue-50/50 dark:bg-blue-950/10 p-3 rounded-2xl border border-blue-200/50 dark:border-blue-800/30">
               <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                 JD
               </div>
               <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-2">
                   <span className="font-bold text-xs">{c.author}</span>
                   <span className="text-[10px] text-neutral-500 dark:text-white/50">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                   <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-extrabold uppercase">You</span>
                 </div>
                 <p className="text-xs text-neutral-800 dark:text-white/90">{c.text}</p>
               </div>
             </div>
           ))}

           {/* API Comments List */}
           {comments.map((comment: any) => {
             const snippet = comment.snippet.topLevelComment.snippet;
             return (
               <div key={comment.id} className="flex gap-3 items-start">
                  <img src={snippet.authorProfileImageUrl} alt={snippet.authorDisplayName} className="w-9 h-9 rounded-full shrink-0 object-cover" />
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-neutral-900 dark:text-white">{snippet.authorDisplayName}</span>
                      <span className="text-[10px] text-neutral-500 dark:text-white/50">{formatPublishedAt(snippet.publishedAt)}</span>
                    </div>
                    <p className="text-xs whitespace-pre-wrap text-neutral-800 dark:text-white/90" dangerouslySetInnerHTML={{ __html: snippet.textDisplay }}></p>
                    <div className="flex items-center gap-3 mt-1 text-neutral-500 dark:text-white/60 text-xs">
                      <button className="hover:text-blue-500 transition-colors"><ThumbsUp className="w-3.5 h-3.5" /></button>
                      <span>{formatViewCount(snippet.likeCount)}</span>
                      <button className="hover:text-red-500 transition-colors"><ThumbsDown className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
               </div>
             );
           })}
        </div>
      </div>

      {/* Secondary Column - Suggested Videos */}
      {!isTheaterMode && (
        <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-4">
           <div className="flex items-center justify-between">
             <h3 className="font-bold text-sm text-neutral-700 dark:text-white/80 uppercase tracking-wider">Up Next</h3>
             <button
               onClick={toggleAutoplay}
               className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
               title={isAutoplay ? 'Autoplay is ON' : 'Autoplay is OFF'}
             >
               <span>Autoplay</span>
               <div className={cn(
                 "w-9 h-5 rounded-full p-0.5 transition-colors relative flex items-center shadow-inner",
                 isAutoplay ? "bg-blue-600" : "bg-neutral-300 dark:bg-neutral-700"
               )}>
                 <div className={cn(
                   "w-4 h-4 rounded-full bg-white shadow-md transition-transform flex items-center justify-center",
                   isAutoplay ? "translate-x-4" : "translate-x-0"
                 )}>
                   {isAutoplay ? <Play className="w-2.5 h-2.5 text-blue-600 fill-blue-600 ml-0.5" /> : <Pause className="w-2.5 h-2.5 text-neutral-600 fill-neutral-600" />}
                 </div>
               </div>
             </button>
           </div>
           <div className="flex flex-col gap-3">
              {relatedVideos.map((v: any) => {
                 const vid = typeof v.id === 'string' ? v.id : v.id.videoId;
                 if (!vid) return null;
                 
                 return (
                   <div key={vid} className="flex gap-3 group cursor-pointer p-1.5 rounded-2xl hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors">
                      <Link to={`/watch/${vid}`} className="w-36 aspect-video rounded-xl shrink-0 overflow-hidden relative block bg-neutral-800">
                        <img src={v.snippet.thumbnails?.medium?.url} alt={v.snippet.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </Link>
                      <div className="flex flex-col flex-1 pr-1">
                         <Link to={`/watch/${vid}`}>
                           <h4 className="text-xs font-bold leading-snug line-clamp-2 mb-1 group-hover:text-blue-500 transition-colors" dangerouslySetInnerHTML={{ __html: v.snippet.title }}></h4>
                         </Link>
                         <Link to={`/channel/${v.snippet.channelId}`} className="text-[11px] text-neutral-500 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white transition-colors">{v.snippet.channelTitle}</Link>
                         <div className="text-[10px] text-neutral-400 dark:text-white/40">{formatPublishedAt(v.snippet.publishedAt)}</div>
                      </div>
                   </div>
                 );
              })}
           </div>
        </div>
      )}

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

    </div>
  );
}

