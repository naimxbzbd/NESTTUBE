import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Clean SVG Fallback data-url thumbnail with YouTube play button
const SVG_FALLBACK_THUMBNAIL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e293b"/><stop offset="50%" stop-color="%230f172a"/><stop offset="100%" stop-color="%23020617"/></linearGradient></defs><rect width="640" height="360" fill="url(%23g)"/><circle cx="320" cy="180" r="44" fill="%23dc2626" opacity="0.95"/><polygon points="310,162 338,180 310,198" fill="%23ffffff"/><text x="320" y="255" font-family="system-ui,sans-serif" font-size="16" font-weight="600" fill="%2394a3b8" text-anchor="middle">NESTTUBE Video</text></svg>`;

export const handleThumbnailError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.target as HTMLImageElement;
  target.referrerPolicy = 'no-referrer';
  const currentSrc = target.src || '';

  // Extract video ID if it's a YouTube thumbnail
  const ytMatch = currentSrc.match(/\/vi\/([a-zA-Z0-9_-]+)\//);
  const videoId = ytMatch ? ytMatch[1] : '';

  if (currentSrc.includes('i.ytimg.com') && videoId) {
    // Try alternate YouTube image CDN host
    target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  } else if (currentSrc.includes('maxresdefault.jpg')) {
    target.src = currentSrc.replace('maxresdefault.jpg', 'hqdefault.jpg');
  } else if (currentSrc.includes('hqdefault.jpg')) {
    target.src = currentSrc.replace('hqdefault.jpg', 'mqdefault.jpg');
  } else if (currentSrc.includes('mqdefault.jpg')) {
    target.src = currentSrc.replace('mqdefault.jpg', 'default.jpg');
  } else if (!currentSrc.startsWith('data:image/svg+xml')) {
    target.src = SVG_FALLBACK_THUMBNAIL;
  }
};
