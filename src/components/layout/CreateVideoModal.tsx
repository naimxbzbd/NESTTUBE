import React, { useState } from 'react';
import { X, Upload, Video, Image, FileText, CheckCircle2 } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';

interface CreateVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateVideoModal({ isOpen, onClose }: CreateVideoModalProps) {
  const { addCustomVideo } = useUserStore();

  const [title, setTitle] = useState('');
  const [channelName, setChannelName] = useState('My Studio Channel');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('10:45');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Default sample video URL if empty
    const finalVideoUrl = videoUrl.trim() || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    
    // Extract video ID if YouTube URL
    let youtubeId = 'dQw4w9WgXcQ';
    const match = finalVideoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) {
      youtubeId = match[1];
    }

    const finalThumbnail = thumbnailUrl.trim() || `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;

    addCustomVideo({
      videoUrl: finalVideoUrl,
      title: title.trim(),
      channelName: channelName.trim() || 'My Studio Channel',
      thumbnailUrl: finalThumbnail,
      description: description.trim() || 'Uploaded via NESTTUBE Studio Creator',
      duration: duration || '08:30',
      views: '1',
      publishedAt: new Date().toISOString(),
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setTitle('');
      setVideoUrl('');
      setThumbnailUrl('');
      setDescription('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#212121] text-neutral-900 dark:text-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-neutral-200 dark:border-white/10 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-bold">Upload Video</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-600 dark:text-white/70" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 flex flex-col items-center justify-center gap-3 text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce" />
            <h4 className="text-xl font-bold">Video Uploaded Successfully!</h4>
            <p className="text-sm text-neutral-500 dark:text-white/60">
              Your video is now live on NESTTUBE and available on your home feed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-white/80 mb-1">
                Video Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. My Epic Vlog #1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-300 dark:border-white/15 outline-none focus:border-blue-500 text-neutral-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-white/80 mb-1">
                YouTube / Video URL
              </label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-300 dark:border-white/15 outline-none focus:border-blue-500 text-neutral-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-white/80 mb-1">
                  Channel Name
                </label>
                <input
                  type="text"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-300 dark:border-white/15 outline-none focus:border-blue-500 text-neutral-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-white/80 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  placeholder="10:30"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-300 dark:border-white/15 outline-none focus:border-blue-500 text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-white/80 mb-1">
                Thumbnail Image URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-300 dark:border-white/15 outline-none focus:border-blue-500 text-neutral-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-white/80 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Tell viewers about your video..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm p-3 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-300 dark:border-white/15 outline-none focus:border-blue-500 text-neutral-900 dark:text-white resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-200 dark:border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold hover:bg-neutral-200 dark:hover:bg-white/10 rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-colors disabled:opacity-50 shadow-md"
              >
                <Upload className="w-4 h-4" />
                Publish Video
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
