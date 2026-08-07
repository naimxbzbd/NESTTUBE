import React, { useState } from 'react';
import { X, Copy, Check, Share2, Code, Send, MessageCircle } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoTitle: string;
  videoId: string;
}

export function ShareModal({ isOpen, onClose, videoTitle, videoId }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'share' | 'embed'>('share');

  if (!isOpen) return null;

  const videoUrl = `${window.location.origin}/watch/${videoId}`;
  const embedCode = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" title="${videoTitle}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socialLinks = [
    {
      name: 'WhatsApp',
      color: 'bg-emerald-600 hover:bg-emerald-700',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(videoTitle + ' ' + videoUrl)}`,
    },
    {
      name: 'X (Twitter)',
      color: 'bg-neutral-800 hover:bg-neutral-900 dark:bg-neutral-700 dark:hover:bg-neutral-600',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(videoTitle)}&url=${encodeURIComponent(videoUrl)}`,
    },
    {
      name: 'Facebook',
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`,
    },
    {
      name: 'Reddit',
      color: 'bg-orange-600 hover:bg-orange-700',
      url: `https://reddit.com/submit?url=${encodeURIComponent(videoUrl)}&title=${encodeURIComponent(videoTitle)}`,
    },
    {
      name: 'Email',
      color: 'bg-rose-600 hover:bg-rose-700',
      url: `mailto:?subject=${encodeURIComponent(videoTitle)}&body=${encodeURIComponent(videoUrl)}`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#212121] text-neutral-900 dark:text-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-neutral-200 dark:border-white/10 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTab('share')}
              className={`text-sm font-bold pb-0.5 border-b-2 transition-colors ${
                tab === 'share'
                  ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-neutral-500 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Share
            </button>
            <button
              onClick={() => setTab('embed')}
              className={`text-sm font-bold pb-0.5 border-b-2 transition-colors ${
                tab === 'embed'
                  ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-neutral-500 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Embed Code
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-600 dark:text-white/70" />
          </button>
        </div>

        <div className="p-5">
          {tab === 'share' ? (
            <div className="flex flex-col gap-5">
              {/* Social networks */}
              <div className="grid grid-cols-5 gap-2">
                {socialLinks.map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 text-center group"
                  >
                    <div className={`w-11 h-11 rounded-full ${s.color} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                      <Share2 className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-medium text-neutral-600 dark:text-white/70 truncate w-full">
                      {s.name}
                    </span>
                  </a>
                ))}
              </div>

              {/* Copy URL */}
              <div className="flex items-center gap-2 bg-neutral-100 dark:bg-white/5 p-2 rounded-xl border border-neutral-200 dark:border-white/10">
                <input
                  type="text"
                  readOnly
                  value={videoUrl}
                  className="bg-transparent text-xs text-neutral-800 dark:text-white/90 outline-none flex-1 font-mono px-2"
                />
                <button
                  onClick={() => handleCopy(videoUrl)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="text-xs text-neutral-600 dark:text-white/60">
                Copy and paste this HTML embed snippet into your website:
              </div>
              <textarea
                readOnly
                rows={4}
                value={embedCode}
                className="w-full text-xs font-mono p-3 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-white/90 outline-none resize-none"
              />
              <button
                onClick={() => handleCopy(embedCode)}
                className="self-end flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Code className="w-4 h-4" />}
                {copied ? 'Copied HTML!' : 'Copy HTML Code'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
