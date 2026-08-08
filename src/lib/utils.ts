import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const handleThumbnailError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.target as HTMLImageElement;
  const currentSrc = target.src;
  
  if (currentSrc.includes('maxresdefault.jpg')) {
    target.src = currentSrc.replace('maxresdefault.jpg', 'hqdefault.jpg');
  } else if (currentSrc.includes('hqdefault.jpg')) {
    target.src = currentSrc.replace('hqdefault.jpg', 'mqdefault.jpg');
  } else if (currentSrc.includes('mqdefault.jpg')) {
    target.src = currentSrc.replace('mqdefault.jpg', 'default.jpg');
  } else if (currentSrc.includes('sddefault.jpg')) {
    target.src = currentSrc.replace('sddefault.jpg', 'hqdefault.jpg');
  } else if (!currentSrc.includes('unsplash')) {
    target.src = 'https://images.unsplash.com/photo-1611162617263-4ec1bfb15b3e?w=640&q=80&auto=format&fit=crop';
  }
};
