import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Shuffle, Trash2, Clock, ThumbsUp, Lock, ListVideo, ArrowLeft } from 'lucide-react';
import { useUserStore, VideoItem } from '../store/useUserStore';

export function PlaylistView() {
  const { type } = useParams<{ type: string }>();
  const { watchLaterVideos, likedVideos, playlists, deletePlaylist, removeVideoFromPlaylist, toggleWatchLater, toggleLikeVideo } = useUserStore();

  let title = 'Playlist';
  let description = 'Saved videos list';
  let videos: VideoItem[] = [];
  let icon = <ListVideo className="w-8 h-8 text-blue-500" />;
  let isCustom = false;
  let customPlaylistId = '';

  if (type === 'watch-later') {
    title = 'Watch Later';
    description = 'Videos you saved to watch at a later time.';
    videos = watchLaterVideos;
    icon = <Clock className="w-8 h-8 text-blue-500" />;
  } else if (type === 'liked') {
    title = 'Liked Videos';
    description = 'Videos you liked across YouTube.';
    videos = likedVideos;
    icon = <ThumbsUp className="w-8 h-8 text-blue-500" />;
  } else if (type) {
    const pl = playlists.find((p) => p.id === type);
    if (pl) {
      title = pl.title;
      description = pl.description || 'Custom user playlist';
      videos = pl.videos;
      isCustom = true;
      customPlaylistId = pl.id;
    }
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 text-neutral-900 dark:text-white transition-colors">
      
      {/* Sidebar Playlist Hero Card */}
      <div className="w-full lg:w-80 shrink-0 bg-gradient-to-b from-blue-600/20 via-neutral-100 dark:via-[#1e1e1e] to-neutral-50 dark:to-[#121212] p-6 rounded-3xl border border-neutral-200 dark:border-white/10 flex flex-col gap-4 shadow-xl">
        <Link to="/" className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-2">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Thumbnail Preview Banner */}
        <div className="aspect-video w-full rounded-2xl bg-neutral-800 flex items-center justify-center overflow-hidden relative shadow-md">
          {videos.length > 0 && videos[0].thumbnailUrl ? (
            <img src={videos[0].thumbnailUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-neutral-400">
              {icon}
              <span className="text-xs font-bold">Empty Playlist</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center">
            {icon}
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
          <p className="text-xs text-neutral-500 dark:text-white/60 mt-1">{description}</p>
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-white/70 mt-3">
            <span>{videos.length} videos</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3" /> Private
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {videos.length > 0 && (
          <div className="flex items-center gap-3 mt-2">
            <Link
              to={`/watch/${videos[0].id}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-neutral-900 text-white dark:bg-white dark:text-black rounded-full text-xs font-bold hover:opacity-90 transition-opacity"
            >
              <Play className="w-4 h-4 fill-current" /> Play all
            </Link>
            {isCustom && (
              <button
                onClick={() => deletePlaylist(customPlaylistId)}
                className="p-2.5 rounded-full hover:bg-red-500/10 text-red-500 transition-colors"
                title="Delete Playlist"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Videos List */}
      <div className="flex-1 flex flex-col gap-3">
        {videos.length === 0 ? (
          <div className="p-12 text-center bg-neutral-50 dark:bg-white/5 rounded-2xl border border-neutral-200 dark:border-white/10 flex flex-col items-center justify-center gap-2">
            <ListVideo className="w-12 h-12 text-neutral-400 dark:text-white/40" />
            <h3 className="text-lg font-bold">No videos in this playlist</h3>
            <p className="text-xs text-neutral-500 dark:text-white/60">
              Save videos using the "+ Save" option on any video.
            </p>
          </div>
        ) : (
          videos.map((item, index) => (
            <div
              key={`${item.id}_${index}`}
              className="flex items-center gap-4 p-2.5 rounded-2xl hover:bg-neutral-100 dark:hover:bg-white/5 border border-transparent hover:border-neutral-200 dark:hover:border-white/10 transition-all group"
            >
              <span className="text-sm font-bold text-neutral-400 dark:text-white/40 w-6 text-center">
                {index + 1}
              </span>

              {/* Video Thumbnail */}
              <Link to={`/watch/${item.id}`} className="w-40 sm:w-48 aspect-video rounded-xl overflow-hidden shrink-0 bg-neutral-800 relative block">
                {item.thumbnailUrl && (
                  <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                )}
                {item.duration && (
                  <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    {item.duration}
                  </span>
                )}
              </Link>

              {/* Info */}
              <div className="flex-1 flex flex-col gap-1 pr-2">
                <Link to={`/watch/${item.id}`} className="font-bold text-sm line-clamp-2 hover:text-blue-500 transition-colors">
                  {item.title}
                </Link>
                <span className="text-xs text-neutral-500 dark:text-white/60 font-medium">
                  {item.channelName}
                </span>
              </div>

              {/* Remove button */}
              <button
                onClick={() => {
                  if (type === 'watch-later') toggleWatchLater(item);
                  else if (type === 'liked') toggleLikeVideo(item);
                  else if (customPlaylistId) removeVideoFromPlaylist(customPlaylistId, item.id);
                }}
                className="p-2 rounded-full hover:bg-red-500/10 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                title="Remove from list"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
