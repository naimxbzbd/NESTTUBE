/**
 * Watch History Local Storage Service
 * Manages persisting, retrieving, pausing, removing, and clearing user's watch history.
 */

export interface HistoryItem {
  id: string;
  title: string;
  channelName: string;
  channelId?: string;
  views?: string | number;
  publishedAt?: string;
  duration?: string;
  thumbnailUrl?: string;
  avatarColor?: string;
  description?: string;
  watchedAt: number; // Unix timestamp in milliseconds
  progressPercentage?: number; // 0 to 100 for YouTube-like red watch progress bar
}

export interface WatchHistoryStats {
  totalCount: number;
  uniqueChannelsCount: number;
  mostWatchedChannel: string | null;
  latestWatchedAt: number | null;
}

const STORAGE_KEY = 'nesttube_watch_history';
const PAUSED_STORAGE_KEY = 'nesttube_watch_history_paused';
const MAX_HISTORY_ITEMS = 250;

/**
 * Retrieve the current watch history from Local Storage
 */
export function getWatchHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Ensure valid structure & sorted by watchedAt descending
    return parsed
      .filter((item): item is HistoryItem => Boolean(item && typeof item.id === 'string'))
      .sort((a, b) => (b.watchedAt || 0) - (a.watchedAt || 0));
  } catch (e) {
    console.error('Failed to parse watch history from localStorage:', e);
    return [];
  }
}

/**
 * Check if watch history recording is paused
 */
export function isWatchHistoryPaused(): boolean {
  try {
    return localStorage.getItem(PAUSED_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Set watch history paused state
 */
export function setWatchHistoryPaused(paused: boolean): void {
  try {
    localStorage.setItem(PAUSED_STORAGE_KEY, String(paused));
    window.dispatchEvent(new CustomEvent('nesttube_watch_history_paused_changed', { detail: { paused } }));
  } catch (e) {
    console.error('Failed to set watch history paused state:', e);
  }
}

/**
 * Toggle watch history paused state
 */
export function toggleWatchHistoryPaused(): boolean {
  const current = isWatchHistoryPaused();
  const next = !current;
  setWatchHistoryPaused(next);
  return next;
}

/**
 * Add or update a video in the watch history.
 * If watch history is paused, additions are skipped.
 */
export function addToWatchHistory(item: Omit<HistoryItem, 'watchedAt'> & { watchedAt?: number }): void {
  try {
    if (!item.id) return;

    // Check if recording is paused
    if (isWatchHistoryPaused()) {
      return;
    }

    const current = getWatchHistory();
    // Remove existing entry for the same video ID so we don't have duplicates
    const filtered = current.filter((v) => v.id !== item.id);

    const newItem: HistoryItem = {
      ...item,
      watchedAt: item.watchedAt || Date.now(),
      progressPercentage: typeof item.progressPercentage === 'number' ? item.progressPercentage : 65,
    };

    // Prepend new item and cap at maximum items
    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('nesttube_watch_history_updated'));
  } catch (e) {
    console.error('Failed to add item to watch history:', e);
  }
}

/**
 * Update the playback progress percentage of a video in watch history
 */
export function updateWatchProgress(id: string, progressPercentage: number): void {
  try {
    const current = getWatchHistory();
    const index = current.findIndex((item) => item.id === id);
    if (index === -1) return;

    current[index].progressPercentage = Math.max(0, Math.min(100, progressPercentage));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    window.dispatchEvent(new Event('nesttube_watch_history_updated'));
  } catch (e) {
    console.error('Failed to update watch progress:', e);
  }
}

/**
 * Remove a specific video by ID from watch history.
 * Returns the removed item so it can be restored if needed.
 */
export function removeFromWatchHistory(id: string): HistoryItem | null {
  try {
    const current = getWatchHistory();
    const removedItem = current.find((v) => v.id === id) || null;
    const updated = current.filter((v) => v.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('nesttube_watch_history_updated'));
    return removedItem;
  } catch (e) {
    console.error('Failed to remove item from watch history:', e);
    return null;
  }
}

/**
 * Restore an item back to watch history (e.g., after undoing a deletion)
 */
export function restoreWatchHistoryItem(item: HistoryItem): void {
  try {
    const current = getWatchHistory();
    const exists = current.some((v) => v.id === item.id);
    if (exists) return;

    const updated = [item, ...current]
      .sort((a, b) => (b.watchedAt || 0) - (a.watchedAt || 0))
      .slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('nesttube_watch_history_updated'));
  } catch (e) {
    console.error('Failed to restore watch history item:', e);
  }
}

/**
 * Restore a full list of history items (e.g., undoing clear all)
 */
export function restoreFullWatchHistory(items: HistoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('nesttube_watch_history_updated'));
  } catch (e) {
    console.error('Failed to restore full watch history:', e);
  }
}

/**
 * Clear all watch history from Local Storage.
 * Returns the cleared items array in case undo is requested.
 */
export function clearWatchHistory(): HistoryItem[] {
  try {
    const current = getWatchHistory();
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('nesttube_watch_history_updated'));
    return current;
  } catch (e) {
    console.error('Failed to clear watch history:', e);
    return [];
  }
}

/**
 * Compute statistics from current watch history
 */
export function getWatchHistoryStats(): WatchHistoryStats {
  const history = getWatchHistory();
  if (history.length === 0) {
    return {
      totalCount: 0,
      uniqueChannelsCount: 0,
      mostWatchedChannel: null,
      latestWatchedAt: null,
    };
  }

  const channelCounts: Record<string, number> = {};
  history.forEach((item) => {
    if (item.channelName) {
      channelCounts[item.channelName] = (channelCounts[item.channelName] || 0) + 1;
    }
  });

  const uniqueChannelsCount = Object.keys(channelCounts).length;
  let mostWatchedChannel: string | null = null;
  let maxCount = 0;

  for (const [channel, count] of Object.entries(channelCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostWatchedChannel = channel;
    }
  }

  return {
    totalCount: history.length,
    uniqueChannelsCount,
    mostWatchedChannel,
    latestWatchedAt: history[0]?.watchedAt || null,
  };
}

/**
 * Sample initial data seeder for previewing watch history
 */
export const SAMPLE_INITIAL_HISTORY: HistoryItem[] = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
    channelName: 'Rick Astley',
    channelId: 'UCuAXFkgsw1L7xaCfnd5JJOw',
    views: '1540000000',
    publishedAt: '2009-10-25T06:57:33Z',
    duration: '3:33',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=640&q=80',
    description: 'The official video for Never Gonna Give You Up by Rick Astley.',
    watchedAt: Date.now() - 1000 * 60 * 30, // 30 mins ago
    progressPercentage: 85,
  },
  {
    id: 'bMknfKXIFA8',
    title: 'React 19 Full Course – Master Modern Web Development with React',
    channelName: 'FreeCodeCamp.org',
    channelId: 'UC8butISFwT-Wl7EV0hUK0BQ',
    views: '1240000',
    publishedAt: '2025-01-15T12:00:00Z',
    duration: '1:45:20',
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=640&q=80',
    description: 'Learn React 19 from scratch including server actions, use hook, and compiler optimization.',
    watchedAt: Date.now() - 1000 * 60 * 60 * 4, // 4 hours ago
    progressPercentage: 45,
  },
  {
    id: 'jfKfPfyJRdk',
    title: 'lofi hip hop radio 📚 - beats to relax/study to',
    channelName: 'Lofi Girl',
    channelId: 'UCSJ4gkVC6NrvII8umztf0Ow',
    views: '68500000',
    publishedAt: '2024-03-01T00:00:00Z',
    duration: 'Live',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=640&q=80',
    description: 'Peaceful lofi hip hop radio to study, relax, and code.',
    watchedAt: Date.now() - 1000 * 60 * 60 * 26, // Yesterday
    progressPercentage: 92,
  },
  {
    id: '7xTGNNLPyMI',
    title: 'Beautiful Earth 4K - Relaxing Nature Scenery and Ambient Sounds',
    channelName: 'Nature Relaxation Films',
    channelId: 'UC4R8DWoMoI7CAwX8_BQQfOw',
    views: '8940000',
    publishedAt: '2024-08-10T15:30:00Z',
    duration: '2:10:00',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=640&q=80',
    description: 'Stunning 4K drone cinematography featuring waterfalls, mountain peaks, and forests.',
    watchedAt: Date.now() - 1000 * 60 * 60 * 75, // 3 days ago
    progressPercentage: 30,
  },
];
