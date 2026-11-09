/**
 * High-performance asynchronous IndexedDB storage for large M3U playlists
 * and persistent playback progress tracking for "Continue Watching".
 */

const DB_NAME = 'nesttube_m3u_db';
const DB_VERSION = 3;
const STORE_PLAYLISTS = 'playlists';
const STORE_METADATA = 'metadata';
const STORE_PLAYBACK = 'playback_progress';
const STORE_RECENT_STREAMS = 'recent_streams';

export interface RecentStreamEntry {
  url: string;
  title: string;
  type: 'single' | 'm3u';
  channelCount?: number;
  updatedAt: number;
}

export interface PlaybackProgress {
  mediaId: string; // unique ID for movie or series
  type: 'movie' | 'series';
  title: string;
  cleanTitle: string;
  poster: string;
  streamUrl: string;
  currentTime: number; // in seconds
  duration: number; // in seconds
  percentage: number; // 0 - 100
  updatedAt: number; // timestamp
  // Series specific:
  seasonNumber?: number;
  episodeNumber?: number;
  episodeTitle?: string;
  category?: string;
}

interface CacheMetadata {
  key: string;
  timestamp: number;
  count: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_PLAYLISTS)) {
        db.createObjectStore(STORE_PLAYLISTS);
      }
      if (!db.objectStoreNames.contains(STORE_METADATA)) {
        db.createObjectStore(STORE_METADATA, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORE_PLAYBACK)) {
        const store = db.createObjectStore(STORE_PLAYBACK, { keyPath: 'mediaId' });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_RECENT_STREAMS)) {
        const recentStore = db.createObjectStore(STORE_RECENT_STREAMS, { keyPath: 'url' });
        recentStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      dbPromise = null;
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });

  return dbPromise;
}

/**
 * Retrieve cached playlist from IndexedDB
 */
export async function getCachedPlaylist<T>(key: string): Promise<{ data: T[] | null; timestamp: number }> {
  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_PLAYLISTS, STORE_METADATA], 'readonly');
      const playlistStore = tx.objectStore(STORE_PLAYLISTS);
      const metaStore = tx.objectStore(STORE_METADATA);

      const playlistReq = playlistStore.get(key);
      const metaReq = metaStore.get(key);

      let data: T[] | null = null;
      let timestamp = 0;

      playlistReq.onsuccess = () => {
        if (playlistReq.result) {
          data = playlistReq.result as T[];
        }
      };

      metaReq.onsuccess = () => {
        if (metaReq.result) {
          timestamp = (metaReq.result as CacheMetadata).timestamp || 0;
        }
      };

      tx.oncomplete = () => {
        resolve({ data, timestamp });
      };

      tx.onerror = () => {
        resolve({ data: null, timestamp: 0 });
      };
    });
  } catch (err) {
    console.warn(`[IndexedDB] Error reading cache for ${key}:`, err);
    return { data: null, timestamp: 0 };
  }
}

/**
 * Save playlist data to IndexedDB asynchronously
 */
export async function setCachedPlaylist<T>(key: string, data: T[]): Promise<boolean> {
  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_PLAYLISTS, STORE_METADATA], 'readwrite');
      const playlistStore = tx.objectStore(STORE_PLAYLISTS);
      const metaStore = tx.objectStore(STORE_METADATA);

      playlistStore.put(data, key);
      metaStore.put({
        key,
        timestamp: Date.now(),
        count: data.length,
      } as CacheMetadata);

      tx.oncomplete = () => {
        resolve(true);
      };

      tx.onerror = (e) => {
        console.warn(`[IndexedDB] Error saving cache for ${key}:`, e);
        resolve(false);
      };
    });
  } catch (err) {
    console.warn(`[IndexedDB] Save exception for ${key}:`, err);
    return false;
  }
}

/**
 * Save or update playback progress for a specific film or series episode
 */
export async function savePlaybackProgress(progress: PlaybackProgress): Promise<boolean> {
  if (!progress.mediaId || !progress.duration || progress.duration <= 0) return false;

  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_PLAYBACK, 'readwrite');
      const store = tx.objectStore(STORE_PLAYBACK);

      store.put({
        ...progress,
        updatedAt: Date.now(),
      });

      tx.oncomplete = () => {
        resolve(true);
      };

      tx.onerror = () => {
        resolve(false);
      };
    });
  } catch (err) {
    console.warn('[IndexedDB] Save playback progress error:', err);
    return false;
  }
}

/**
 * Retrieve saved progress for a movie or series
 */
export async function getPlaybackProgress(mediaId: string): Promise<PlaybackProgress | null> {
  if (!mediaId) return null;

  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_PLAYBACK, 'readonly');
      const store = tx.objectStore(STORE_PLAYBACK);
      const req = store.get(mediaId);

      req.onsuccess = () => {
        resolve(req.result ? (req.result as PlaybackProgress) : null);
      };

      req.onerror = () => {
        resolve(null);
      };
    });
  } catch (err) {
    console.warn('[IndexedDB] Get playback progress error:', err);
    return null;
  }
}

/**
 * Retrieve the list of media items in "Continue Watching" order (most recently watched first).
 * Excludes items that are practically finished (>95%) or barely started (<1.5%).
 */
export async function getContinueWatchingList(type?: 'movie' | 'series'): Promise<PlaybackProgress[]> {
  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_PLAYBACK, 'readonly');
      const store = tx.objectStore(STORE_PLAYBACK);
      const req = store.getAll();

      req.onsuccess = () => {
        let items = (req.result || []) as PlaybackProgress[];

        if (type) {
          items = items.filter((item) => item.type === type);
        }

        // Filter out completed (>95%) or very beginning (<5 seconds)
        items = items.filter(
          (item) => item.currentTime >= 4 && item.percentage < 96
        );

        // Sort descending by most recently updated
        items.sort((a, b) => b.updatedAt - a.updatedAt);

        resolve(items.slice(0, 20));
      };

      req.onerror = () => {
        resolve([]);
      };
    });
  } catch (err) {
    console.warn('[IndexedDB] Continue watching list error:', err);
    return [];
  }
}

/**
 * Dismiss or remove a media item from Continue Watching
 */
export async function removePlaybackProgress(mediaId: string): Promise<boolean> {
  if (!mediaId) return false;

  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_PLAYBACK, 'readwrite');
      const store = tx.objectStore(STORE_PLAYBACK);
      const req = store.delete(mediaId);

      tx.oncomplete = () => {
        resolve(true);
      };

      tx.onerror = () => {
        resolve(false);
      };
    });
  } catch (err) {
    console.warn('[IndexedDB] Remove playback progress error:', err);
    return false;
  }
}

/**
 * Clears an individual cached playlist or all cached data
 */
export async function clearCachedPlaylist(key?: string): Promise<void> {
  try {
    const db = await getDb();
    const tx = db.transaction([STORE_PLAYLISTS, STORE_METADATA], 'readwrite');
    if (key) {
      tx.objectStore(STORE_PLAYLISTS).delete(key);
      tx.objectStore(STORE_METADATA).delete(key);
    } else {
      tx.objectStore(STORE_PLAYLISTS).clear();
      tx.objectStore(STORE_METADATA).clear();
    }
  } catch (err) {
    console.warn('[IndexedDB] Clear cache error:', err);
  }
}

const MAX_RECENT_STREAMS = 10;

/**
 * Persists an input stream URL into IndexedDB, maintaining the most recent 10 items.
 */
export async function saveRecentStreamUrl(item: {
  url: string;
  title?: string;
  type?: 'single' | 'm3u';
  channelCount?: number;
}): Promise<boolean> {
  const cleanUrl = item.url.trim();
  if (!cleanUrl) return false;

  const streamType = item.type || (cleanUrl.toLowerCase().includes('.m3u') && !cleanUrl.toLowerCase().includes('.m3u8') ? 'm3u' : 'single');

  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_RECENT_STREAMS, 'readwrite');
      const store = tx.objectStore(STORE_RECENT_STREAMS);

      const entry: RecentStreamEntry = {
        url: cleanUrl,
        title: item.title?.trim() || (streamType === 'm3u' ? 'কাস্টম M3U প্লেলিস্ট' : 'লাইভ নেটওয়ার্ক ফিড'),
        type: streamType,
        channelCount: item.channelCount || (streamType === 'm3u' ? 1 : undefined),
        updatedAt: Date.now(),
      };

      store.put(entry);

      // Prune older entries if exceeding MAX_RECENT_STREAMS
      const getAllReq = store.getAll();
      getAllReq.onsuccess = () => {
        const allItems = (getAllReq.result || []) as RecentStreamEntry[];
        if (allItems.length > MAX_RECENT_STREAMS) {
          allItems.sort((a, b) => a.updatedAt - b.updatedAt);
          const excess = allItems.length - MAX_RECENT_STREAMS;
          for (let i = 0; i < excess; i++) {
            store.delete(allItems[i].url);
          }
        }
      };

      tx.oncomplete = () => {
        resolve(true);
      };

      tx.onerror = (e) => {
        console.warn('[IndexedDB] Save recent stream error:', e);
        resolve(false);
      };
    });
  } catch (err) {
    console.warn('[IndexedDB] saveRecentStreamUrl exception:', err);
    return false;
  }
}

/**
 * Returns the last 10 input stream URLs from IndexedDB, ordered from most recent to oldest.
 */
export async function getRecentStreamUrls(): Promise<RecentStreamEntry[]> {
  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_RECENT_STREAMS, 'readonly');
      const store = tx.objectStore(STORE_RECENT_STREAMS);
      const req = store.getAll();

      req.onsuccess = () => {
        const items = (req.result || []) as RecentStreamEntry[];
        items.sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(items.slice(0, MAX_RECENT_STREAMS));
      };

      req.onerror = () => {
        resolve([]);
      };
    });
  } catch (err) {
    console.warn('[IndexedDB] getRecentStreamUrls error:', err);
    return [];
  }
}

/**
 * Deletes a single URL from recent streams in IndexedDB.
 */
export async function deleteRecentStreamUrl(url: string): Promise<boolean> {
  if (!url) return false;
  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_RECENT_STREAMS, 'readwrite');
      const store = tx.objectStore(STORE_RECENT_STREAMS);
      store.delete(url);

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * Clears all recent streams from IndexedDB.
 */
export async function clearRecentStreamUrls(): Promise<boolean> {
  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_RECENT_STREAMS, 'readwrite');
      const store = tx.objectStore(STORE_RECENT_STREAMS);
      store.clear();

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * Cache Health & Storage statistics interface
 */
export interface CacheHealthStats {
  supported: boolean;
  dbName: string;
  version: number;
  totalStores: number;
  stores: {
    name: string;
    count: number;
    description: string;
  }[];
  playlistKeys: string[];
  totalRecords: number;
  storageEstimate?: {
    usageBytes: number;
    quotaBytes: number;
    usagePercent: number;
    usageFormatted: string;
    quotaFormatted: string;
  };
  thumbnailCacheCount: number;
  lastChecked: number;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Monitors the health of the IndexedDB cache and browser storage quota
 */
export async function getIndexedDbHealthStats(): Promise<CacheHealthStats> {
  const supported = typeof window !== 'undefined' && 'indexedDB' in window;

  const stats: CacheHealthStats = {
    supported,
    dbName: DB_NAME,
    version: DB_VERSION,
    totalStores: 4,
    stores: [],
    playlistKeys: [],
    totalRecords: 0,
    thumbnailCacheCount: 0,
    lastChecked: Date.now(),
  };

  if (!supported) return stats;

  try {
    const db = await getDb();
    const storeNames = [STORE_PLAYLISTS, STORE_METADATA, STORE_PLAYBACK, STORE_RECENT_STREAMS];

    const storeDescriptions: Record<string, string> = {
      [STORE_PLAYLISTS]: 'M3U লাইভ টিভি, সিনেমা ও সিরিজের সংরক্ষিত প্লেলিস্ট',
      [STORE_METADATA]: 'প্লেলিস্টের টাইমস্ট্যাম্প ও ভ্যালিডেশন মেটাডাটা',
      [STORE_PLAYBACK]: 'Continue Watching - সিনেমা ও সিরিজের প্লেব্যাক প্রগ্রেস',
      [STORE_RECENT_STREAMS]: 'নেটওয়ার্ক স্ট্রিমের সর্বশেষ ১০টি ইনপুট URL',
    };

    const counts = await new Promise<{ countsMap: Record<string, number>; playlistKeys: string[] }>((resolve) => {
      const tx = db.transaction(storeNames, 'readonly');
      const countsMap: Record<string, number> = {
        [STORE_PLAYLISTS]: 0,
        [STORE_METADATA]: 0,
        [STORE_PLAYBACK]: 0,
        [STORE_RECENT_STREAMS]: 0,
      };
      let playlistKeys: string[] = [];

      storeNames.forEach((sName) => {
        const store = tx.objectStore(sName);
        const countReq = store.count();
        countReq.onsuccess = () => {
          countsMap[sName] = countReq.result || 0;
        };

        if (sName === STORE_PLAYLISTS) {
          const keysReq = store.getAllKeys();
          keysReq.onsuccess = () => {
            playlistKeys = (keysReq.result || []).map((k) => String(k));
          };
        }
      });

      tx.oncomplete = () => resolve({ countsMap, playlistKeys });
      tx.onerror = () => resolve({ countsMap, playlistKeys });
    });

    stats.playlistKeys = counts.playlistKeys || [];
    stats.stores = storeNames.map((sName) => ({
      name: sName,
      count: counts.countsMap[sName] || 0,
      description: storeDescriptions[sName] || '',
    }));

    stats.totalRecords = stats.stores.reduce((acc, s) => acc + s.count, 0);

    // Browser Storage Quota Estimate (Cache API + IndexedDB)
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        const usageBytes = estimate.usage || 0;
        const quotaBytes = estimate.quota || 1;
        const usagePercent = Math.min(100, Math.round((usageBytes / quotaBytes) * 10000) / 100);

        stats.storageEstimate = {
          usageBytes,
          quotaBytes,
          usagePercent,
          usageFormatted: formatBytes(usageBytes),
          quotaFormatted: formatBytes(quotaBytes),
        };
      } catch (err) {
        console.warn('Storage estimate error:', err);
      }
    }

    // Thumbnail CacheStorage count
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const cache = await caches.open('nesttube-thumbnails-v1');
        const keys = await cache.keys();
        stats.thumbnailCacheCount = keys.length;
      } catch {
        stats.thumbnailCacheCount = 0;
      }
    }

    return stats;
  } catch (err) {
    console.warn('[IndexedDB] getIndexedDbHealthStats error:', err);
    return stats;
  }
}

/**
 * Clears all IndexedDB stores and CacheStorage thumbnail cache to free up local storage
 */
export async function clearAllLocalCaches(): Promise<{ success: boolean; clearedStores: string[] }> {
  const cleared: string[] = [];

  try {
    const db = await getDb();
    const storeNames = [STORE_PLAYLISTS, STORE_METADATA, STORE_PLAYBACK, STORE_RECENT_STREAMS];

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeNames, 'readwrite');
      storeNames.forEach((sName) => {
        tx.objectStore(sName).clear();
        cleared.push(sName);
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    // Also clear Cache API thumbnails
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        await caches.delete('nesttube-thumbnails-v1');
        cleared.push('CacheStorage (nesttube-thumbnails-v1)');
      } catch (e) {
        console.warn('Failed to clear CacheStorage:', e);
      }
    }

    return { success: true, clearedStores: cleared };
  } catch (err) {
    console.error('[IndexedDB] clearAllLocalCaches error:', err);
    return { success: false, clearedStores: cleared };
  }
}
