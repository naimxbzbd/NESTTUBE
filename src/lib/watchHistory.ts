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
  watchedAt: number;
}

const STORAGE_KEY = 'nesttube_watch_history';

export function getWatchHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to parse watch history', e);
    return [];
  }
}

export function addToWatchHistory(item: Omit<HistoryItem, 'watchedAt'>) {
  try {
    if (!item.id) return;
    const current = getWatchHistory();
    const filtered = current.filter((v) => v.id !== item.id);
    const newItem: HistoryItem = {
      ...item,
      watchedAt: Date.now(),
    };
    const updated = [newItem, ...filtered].slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('nesttube_watch_history_updated'));
  } catch (e) {
    console.error('Failed to add to watch history', e);
  }
}

export function removeFromWatchHistory(id: string) {
  try {
    const current = getWatchHistory();
    const updated = current.filter((v) => v.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('nesttube_watch_history_updated'));
  } catch (e) {
    console.error('Failed to remove from watch history', e);
  }
}

export function clearWatchHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('nesttube_watch_history_updated'));
  } catch (e) {
    console.error('Failed to clear watch history', e);
  }
}
