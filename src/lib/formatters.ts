import numeral from 'numeral';
import { formatDistanceToNow } from 'date-fns';

export function formatViewCount(views: string | number | undefined): string {
  if (!views) return '0';
  const num = typeof views === 'string' ? parseInt(views, 10) : views;
  if (isNaN(num)) return '0';
  return numeral(num).format('0.a').toUpperCase();
}

export function formatPublishedAt(dateString: string | undefined): string {
  if (!dateString) return '';
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (e) {
    return '';
  }
}

export function formatDuration(duration: string | undefined): string {
  if (!duration) return '0:00';
  
  // Format is usually PT#M#S or PT#H#M#S
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return duration;
  
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;
  
  let formatted = '';
  
  if (hours > 0) {
    formatted += `${hours}:`;
    formatted += `${minutes.toString().padStart(2, '0')}:`;
  } else {
    formatted += `${minutes}:`;
  }
  
  formatted += `${seconds.toString().padStart(2, '0')}`;
  
  return formatted;
}
