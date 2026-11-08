/**
 * Network Stream Service
 * Handles custom stream URL sniffing, M3U playlist parsing,
 * Firestore cross-device synchronization, and IndexedDB local fallback.
 */

import { parseM3u, M3uChannel, sanitizeStreamUrl } from './m3uService';
import { db, collection, doc, setDoc, getDocs, deleteDoc, query, orderBy, handleFirestoreError, OperationType } from '../firebase';

export interface SavedNetworkStream {
  id: string;
  title: string;
  url: string;
  type: 'single' | 'm3u';
  ownerUid?: string;
  channelCount?: number;
  lastPlayedAt?: number;
  createdAt: number;
}

const LOCAL_STORAGE_KEY = 'nesttube_custom_streams_v1';

export const SAMPLE_STREAMS = [
  {
    name: 'Big Buck Bunny (1080p HLS)',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    type: 'single' as const,
    description: 'High-definition HLS VOD multi-bitrate test stream',
  },
  {
    name: 'Sintel 4K Cinema Stream',
    url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    type: 'single' as const,
    description: 'Akamai multi-audio multi-bitrate streaming test',
  },
  {
    name: 'Tears of Steel HLS',
    url: 'https://content.jwplatform.com/manifests/vM7nH0Kl.m3u8',
    type: 'single' as const,
    description: 'Dolby audio & cinematic adaptive bitrate test',
  },
  {
    name: 'Apple BipBop Advanced HLS',
    url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_4x3/bipbop_4x3_variant.m3u8',
    type: 'single' as const,
    description: 'Official Apple HLS reference test feed',
  },
  {
    name: 'XBZ Prime Live TV (M3U Playlist)',
    url: 'https://raw.githubusercontent.com/naimxbzbd/XBZ-Prime-TV/refs/heads/main/playlist.m3u',
    type: 'm3u' as const,
    description: 'Full multi-channel M3U playlist with 200+ channels',
  },
];

/**
 * Sniffs stream URL to determine if it is a single stream or full M3U playlist
 */
export async function detectStreamType(rawUrl: string): Promise<{
  type: 'single' | 'm3u';
  content?: string;
  channels?: M3uChannel[];
}> {
  const cleanUrl = rawUrl.trim();
  const lower = cleanUrl.toLowerCase();

  // If clearly single mp4 or direct m3u8 stream with no m3u in base path
  if (lower.endsWith('.mp4') || lower.endsWith('.webm')) {
    return { type: 'single' };
  }

  try {
    const res = await fetch(cleanUrl, {
      headers: { Accept: 'text/plain, application/vnd.apple.mpegurl, */*' },
      cache: 'no-cache',
    });

    if (!res.ok) {
      return { type: 'single' };
    }

    const text = await res.text();

    // Check if it is a multi-channel M3U playlist (contains multiple #EXTINF lines)
    const extinfMatches = text.match(/#EXTINF:/g);
    if (extinfMatches && extinfMatches.length > 1) {
      const channels = parseM3u(text);
      return {
        type: 'm3u',
        content: text,
        channels,
      };
    }

    // If only 1 EXTINF or standard master m3u8 playlist, treat as single stream
    return { type: 'single', content: text };
  } catch {
    // If CORS or network prevents fetch, infer from URL pattern
    if (lower.includes('.m3u') && !lower.includes('.m3u8')) {
      return { type: 'm3u' };
    }
    return { type: 'single' };
  }
}

/**
 * Save custom stream to Firestore (if authenticated) and local storage
 */
export async function saveCustomStream(
  stream: SavedNetworkStream,
  userUid?: string
): Promise<boolean> {
  // Always persist locally
  saveToLocalStorage(stream);

  if (!userUid) return true;

  try {
    const streamDocRef = doc(db, 'users', userUid, 'network_streams', stream.id);
    await setDoc(streamDocRef, {
      id: stream.id,
      title: stream.title,
      url: stream.url,
      type: stream.type,
      ownerUid: userUid,
      channelCount: stream.channelCount || 1,
      lastPlayedAt: stream.lastPlayedAt || Date.now(),
      createdAt: stream.createdAt || Date.now(),
    });
    return true;
  } catch (err) {
    console.warn('[NetworkStream] Failed to sync to Firestore:', err);
    return false;
  }
}

/**
 * Fetch saved network streams from Firestore and local cache
 */
export async function getCustomStreams(userUid?: string): Promise<SavedNetworkStream[]> {
  const localStreams = getFromLocalStorage();

  if (!userUid) {
    return localStreams;
  }

  try {
    const collRef = collection(db, 'users', userUid, 'network_streams');
    const q = query(collRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const firestoreStreams: SavedNetworkStream[] = [];
    snapshot.forEach((d) => {
      firestoreStreams.push(d.data() as SavedNetworkStream);
    });

    // Merge Firestore with local without duplicates
    const map = new Map<string, SavedNetworkStream>();
    firestoreStreams.forEach((s) => map.set(s.id, s));
    localStreams.forEach((s) => {
      if (!map.has(s.id)) map.set(s.id, s);
    });

    const merged = Array.from(map.values());
    merged.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return merged;
  } catch (err) {
    console.warn('[NetworkStream] Failed to read from Firestore:', err);
    return localStreams;
  }
}

/**
 * Delete a custom stream from Firestore and local storage
 */
export async function deleteCustomStream(streamId: string, userUid?: string): Promise<boolean> {
  removeFromLocalStorage(streamId);

  if (!userUid) return true;

  try {
    const streamDocRef = doc(db, 'users', userUid, 'network_streams', streamId);
    await deleteDoc(streamDocRef);
    return true;
  } catch (err) {
    console.warn('[NetworkStream] Delete from Firestore error:', err);
    return false;
  }
}

// Local storage fallback helpers
function getFromLocalStorage(): SavedNetworkStream[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedNetworkStream[];
  } catch {
    return [];
  }
}

function saveToLocalStorage(stream: SavedNetworkStream) {
  try {
    const list = getFromLocalStorage();
    const filtered = list.filter((s) => s.id !== stream.id);
    filtered.unshift(stream);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered.slice(0, 50)));
  } catch {
    // Ignore quota errors
  }
}

function removeFromLocalStorage(streamId: string) {
  try {
    const list = getFromLocalStorage();
    const filtered = list.filter((s) => s.id !== streamId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // Ignore
  }
}
