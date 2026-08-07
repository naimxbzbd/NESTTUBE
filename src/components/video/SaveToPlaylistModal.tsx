import React, { useState } from 'react';
import { X, Plus, Check, Lock } from 'lucide-react';
import { useUserStore, VideoItem } from '../../store/useUserStore';

interface SaveToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoItem;
}

export function SaveToPlaylistModal({ isOpen, onClose, video }: SaveToPlaylistModalProps) {
  const { playlists, watchLaterVideos, toggleWatchLater, isInWatchLater, addVideoToPlaylist, removeVideoFromPlaylist, isVideoInPlaylist, createPlaylist } = useUserStore();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  if (!isOpen) return null;

  const inWatchLater = isInWatchLater(video.id);

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createPlaylist(newTitle, newDescription, video);
    setNewTitle('');
    setNewDescription('');
    setShowCreateForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#212121] text-neutral-900 dark:text-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-neutral-200 dark:border-white/10 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-white/10">
          <h3 className="text-base font-bold">Save video to...</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-600 dark:text-white/70" />
          </button>
        </div>

        {/* Playlist Items */}
        <div className="p-4 max-h-60 overflow-y-auto space-y-3 custom-scrollbar">
          {/* Watch Later check item */}
          <label className="flex items-center gap-3 cursor-pointer p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors">
            <input
              type="checkbox"
              checked={inWatchLater}
              onChange={() => toggleWatchLater(video)}
              className="w-4 h-4 rounded border-neutral-300 dark:border-white/30 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm font-medium">Watch Later</span>
          </label>

          {/* User Playlists */}
          {playlists.map((pl) => {
            const isSaved = isVideoInPlaylist(pl.id, video.id);
            return (
              <label
                key={pl.id}
                className="flex items-center justify-between gap-3 cursor-pointer p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSaved}
                    onChange={() => {
                      if (isSaved) {
                        removeVideoFromPlaylist(pl.id, video.id);
                      } else {
                        addVideoToPlaylist(pl.id, video);
                      }
                    }}
                    className="w-4 h-4 rounded border-neutral-300 dark:border-white/30 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm font-medium line-clamp-1">{pl.title}</span>
                </div>
                <Lock className="w-3.5 h-3.5 text-neutral-400 dark:text-white/40 shrink-0" />
              </label>
            );
          })}
        </div>

        {/* Create Playlist Section */}
        <div className="p-4 border-t border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#181818]">
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <Plus className="w-4 h-4" />
              Create new playlist
            </button>
          ) : (
            <form onSubmit={handleCreatePlaylist} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Playlist title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg bg-white dark:bg-[#282828] border border-neutral-300 dark:border-white/20 outline-none focus:border-blue-500 text-neutral-900 dark:text-white"
                autoFocus
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-[#282828] border border-neutral-300 dark:border-white/20 outline-none focus:border-blue-500 text-neutral-900 dark:text-white"
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-3 py-1 text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-white/10 rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-3 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
