/**
 * Service to fetch, parse, and cache M3U live TV playlists.
 * Source: https://raw.githubusercontent.com/naimxbzbd/XBZ-Prime-TV/refs/heads/main/playlist.m3u
 */

import { getCachedPlaylist, setCachedPlaylist } from './indexedDbStorage';
import { prewarmImages, sanitizeImageUrl } from './imageAssetCache';

export interface M3uChannel {
  id: string;
  name: string;
  cleanName: string;
  group: string;
  rawGroup: string;
  logo: string;
  streamUrl: string;
  cleanUrl: string;
  tvgId?: string;
  httpReferrer?: string;
  userAgent?: string;
}

export interface M3uCategory {
  id: string;
  name: string;
  banglaName: string;
  count: number;
}

export const M3U_PLAYLIST_URL =
  'https://raw.githubusercontent.com/naimxbzbd/XBZ-Prime-TV/refs/heads/main/playlist.m3u';

const CACHE_KEY = 'nesttube_m3u_channels_v3_idb';
const CACHE_DURATION_MS = 1000 * 60 * 60 * 4; // 4 hours freshness

/**
 * Normalizes Unicode stylized characters (e.g. 𝐁𝐚𝐧𝐠𝐥𝐚𝐝𝐞𝐬𝐡𝐢 -> Bangladeshi)
 */
export function normalizeGroupTitle(raw: string): string {
  if (!raw) return 'Other';
  const normalized = raw.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').trim();
  
  const lower = normalized.toLowerCase();
  if (lower.includes('bangladeshi') || lower.includes('bangladesh')) return 'Bangladeshi';
  if (lower.includes('indian bangla')) return 'Indian Bangla';
  if (lower.includes('indian hindi')) return 'Indian Hindi';
  if (lower.includes('indian news')) return 'Indian News';
  if (lower.includes('sports') || lower.includes('sport')) return 'Sports';
  if (lower.includes('islamic') || lower.includes('islam')) return 'Islamic';
  if (lower.includes('music')) return 'Music';
  if (lower.includes('kids') || lower.includes('kid')) return 'Kids';
  if (lower.includes('documentary') || lower.includes('documentory')) return 'Documentary';
  if (lower.includes('movies') || lower.includes('movie')) return 'Movies';
  if (lower.includes('promo')) return 'Promo';
  
  return normalized || 'General';
}

/**
 * Maps category name to Bengali label for localized UI
 */
export function getCategoryBanglaLabel(group: string): string {
  switch (group) {
    case 'Bangladeshi':
      return 'বাংলাদেশি চ্যানেল';
    case 'Sports':
      return 'খেলাধুলা (Sports)';
    case 'Indian Bangla':
      return 'ভারতীয় বাংলা';
    case 'Indian Hindi':
      return 'হিন্দি চ্যানেল';
    case 'Indian News':
      return 'ভারতীয় খবর';
    case 'Islamic':
      return 'ইসলামিক টিভি';
    case 'Music':
      return 'গান ও মিউজিক';
    case 'Kids':
      return 'কার্টুন ও কিডস';
    case 'Documentary':
      return 'ডকুমেন্টারি ও তথ্যচিত্র';
    case 'Movies':
      return 'মুভি ও সিনেমা';
    case 'Promo':
      return 'প্রমো';
    default:
      return group;
  }
}

/**
 * Sanitizes stream URL, removing trailing pipe headers like |Referer=...
 */
export function sanitizeStreamUrl(rawUrl: string): { cleanUrl: string; httpReferrer?: string; userAgent?: string } {
  let cleanUrl = rawUrl.trim();
  let httpReferrer: string | undefined;
  let userAgent: string | undefined;

  if (cleanUrl.includes('|')) {
    const [baseUrl, params] = cleanUrl.split('|');
    cleanUrl = baseUrl.trim();
    if (params) {
      const refMatch = params.match(/Referer=([^&]+)/i);
      if (refMatch) httpReferrer = refMatch[1];
      const uaMatch = params.match(/User-Agent=([^&]+)/i);
      if (uaMatch) userAgent = uaMatch[1];
    }
  }

  return { cleanUrl, httpReferrer, userAgent };
}

/**
 * Generates URL-safe and unique channel ID
 */
function generateChannelId(name: string, index: number): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slug || 'channel'}-${index + 1}`;
}

/**
 * Parses raw M3U text into an array of M3uChannel objects
 */
export function parseM3u(text: string): M3uChannel[] {
  const lines = text.split('\n');
  const channels: M3uChannel[] = [];

  let currentInf: {
    rawInf: string;
    group: string;
    rawGroup: string;
    logo: string;
    name: string;
    tvgId?: string;
    referrer?: string;
    userAgent?: string;
  } | null = null;

  let channelIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      const groupMatch = line.match(/group-title="([^"]*)"/);
      const rawGroup = groupMatch ? groupMatch[1] : '';
      const group = normalizeGroupTitle(rawGroup);

      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      const logo = logoMatch ? sanitizeImageUrl(logoMatch[1]) : '';

      const idMatch = line.match(/tvg-id="([^"]*)"/);
      const tvgId = idMatch ? idMatch[1].trim() : undefined;

      const commaIndex = line.lastIndexOf(',');
      const rawName = commaIndex !== -1 ? line.substring(commaIndex + 1).trim() : 'Live Channel';
      const cleanName = rawName.replace(/\[.*?\]|\(.*?\)/g, '').trim() || rawName;

      currentInf = {
        rawInf: line,
        group,
        rawGroup,
        logo,
        name: rawName,
        tvgId,
      };
    } else if (line.startsWith('#EXTVLCOPT:http-referrer=')) {
      if (currentInf) {
        currentInf.referrer = line.replace('#EXTVLCOPT:http-referrer=', '').trim();
      }
    } else if (line.startsWith('#EXTVLCOPT:http-user-agent=')) {
      if (currentInf) {
        currentInf.userAgent = line.replace('#EXTVLCOPT:http-user-agent=', '').trim();
      }
    } else if (line.startsWith('http://') || line.startsWith('https://')) {
      if (currentInf) {
        const { cleanUrl, httpReferrer: pipeRef, userAgent: pipeUa } = sanitizeStreamUrl(line);

        channels.push({
          id: generateChannelId(currentInf.name, channelIndex),
          name: currentInf.name,
          cleanName: currentInf.name,
          group: currentInf.group,
          rawGroup: currentInf.rawGroup,
          logo:
            currentInf.logo ||
            `https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=160&auto=format&fit=crop&q=80`,
          streamUrl: line,
          cleanUrl: cleanUrl || line,
          tvgId: currentInf.tvgId,
          httpReferrer: currentInf.referrer || pipeRef,
          userAgent: currentInf.userAgent || pipeUa,
        });

        channelIndex++;
        currentInf = null;
      }
    }
  }

  // Prewarm initial batch of channel logos
  if (channels.length > 0) {
    prewarmImages(channels.slice(0, 40).map((c) => c.logo), 40);
  }

  return channels;
}

/**
 * Fetches the M3U playlist with IndexedDB persistent storage and background synchronization
 */
export async function fetchM3uPlaylist(forceRefresh = false): Promise<M3uChannel[]> {
  // Check IndexedDB cache first
  const { data: cached, timestamp } = await getCachedPlaylist<M3uChannel>(CACHE_KEY);

  const isCacheFresh = cached && cached.length > 0 && Date.now() - timestamp < CACHE_DURATION_MS;

  if (isCacheFresh && !forceRefresh) {
    prewarmImages(cached.slice(0, 30).map((c) => c.logo), 30);
    // If cache is somewhat old (>30m), trigger background sync quietly
    if (Date.now() - timestamp > 1000 * 60 * 30) {
      setTimeout(() => {
        syncM3uInBackground();
      }, 2000);
    }
    return cached;
  }

  // If we have any cached data and not forced, return cached immediately while updating in background
  if (cached && cached.length > 0 && !forceRefresh) {
    prewarmImages(cached.slice(0, 30).map((c) => c.logo), 30);
    syncM3uInBackground();
    return cached;
  }

  return fetchFreshM3u();
}

/**
 * Fetch fresh data directly from GitHub and cache in IndexedDB
 */
async function fetchFreshM3u(): Promise<M3uChannel[]> {
  try {
    const res = await fetch(M3U_PLAYLIST_URL, {
      headers: {
        Accept: 'text/plain, */*',
      },
      cache: 'no-cache',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch playlist: HTTP ${res.status}`);
    }

    const text = await res.text();
    const channels = parseM3u(text);

    if (channels.length > 0) {
      await setCachedPlaylist(CACHE_KEY, channels);
      return channels;
    }
  } catch (err) {
    console.warn('Failed to fetch M3U playlist online:', err);
    const { data: cached } = await getCachedPlaylist<M3uChannel>(CACHE_KEY);
    if (cached && cached.length > 0) return cached;
  }

  // Fallback to essential curated channels if network fails completely
  return getFallbackChannels();
}

/**
 * Background synchronizer for Live TV channels
 */
async function syncM3uInBackground() {
  try {
    const res = await fetch(M3U_PLAYLIST_URL, { cache: 'no-cache' });
    if (res.ok) {
      const text = await res.text();
      const channels = parseM3u(text);
      if (channels.length > 0) {
        await setCachedPlaylist(CACHE_KEY, channels);
      }
    }
  } catch {
    // Silent fail in background
  }
}

/**
 * Fallback curated list in case offline or GitHub raw is unreachable
 */
function getFallbackChannels(): M3uChannel[] {
  return [
    {
      id: 'btv-1',
      name: 'BTV',
      cleanName: 'BTV',
      group: 'Bangladeshi',
      rawGroup: '𝐁𝐚𝐧𝐠𝐥𝐚𝐝𝐞𝐬𝐡𝐢',
      logo: 'https://raw.githubusercontent.com/ahan443/logo/refs/heads/main/btv.png',
      streamUrl: 'https://tvsen6.aynaott.com/opREbXLqJ2HFYPCXTJBa/index.m3u8',
      cleanUrl: 'https://tvsen6.aynaott.com/opREbXLqJ2HFYPCXTJBa/index.m3u8',
    },
    {
      id: 'btv-news-2',
      name: 'BTV News',
      cleanName: 'BTV News',
      group: 'Bangladeshi',
      rawGroup: '𝐁𝐚𝐧𝐠𝐥𝐚𝐝𝐞𝐬𝐡𝐢',
      logo: 'https://raw.githubusercontent.com/ahan443/logo/refs/heads/main/btv%20news.png',
      streamUrl: 'https://tvsen6.aynaott.com/opREbXLqJ2HFYPCXTJBa/index.m3u8',
      cleanUrl: 'https://tvsen6.aynaott.com/opREbXLqJ2HFYPCXTJBa/index.m3u8',
    },
    {
      id: 'toffee-drama-3',
      name: 'Toffee Drama',
      cleanName: 'Toffee Drama',
      group: 'Bangladeshi',
      rawGroup: '𝐁𝐚𝐧𝐠𝐥𝐚𝐝𝐞𝐬𝐡𝐢',
      logo: 'https://raw.githubusercontent.com/ahan443/logo/refs/heads/main/circle-512.jpg',
      streamUrl: 'https://bldcmprod-cdn.toffeelive.com/cdn/live/toffee_drama/playlist.m3u8',
      cleanUrl: 'https://bldcmprod-cdn.toffeelive.com/cdn/live/toffee_drama/playlist.m3u8',
    },
    {
      id: 'atn-bangla-4',
      name: 'ATN Bangla',
      cleanName: 'ATN Bangla',
      group: 'Bangladeshi',
      rawGroup: '𝐁𝐚𝐧𝐠𝐥𝐚𝐝𝐞𝐬𝐡𝐢',
      logo: 'https://raw.githubusercontent.com/ahan443/logo/refs/heads/main/atn%20bangla.png',
      streamUrl: 'https://tvsen5.aynaott.com/P3y2URgG7LDe/index.m3u8',
      cleanUrl: 'https://tvsen5.aynaott.com/P3y2URgG7LDe/index.m3u8',
    },
    {
      id: 'atn-news-5',
      name: 'ATN News',
      cleanName: 'ATN News',
      group: 'Bangladeshi',
      rawGroup: '𝐁𝐚𝐧𝐠𝐥𝐚𝐝𝐞𝐬𝐡𝐢',
      logo: 'https://i.postimg.cc/W4SwWtd3/20240822-225840.png',
      streamUrl: 'https://tvsen6.aynaott.com/da6WMXAk/index.m3u8',
      cleanUrl: 'https://tvsen6.aynaott.com/da6WMXAk/index.m3u8',
    },
    {
      id: 'boishakhi-6',
      name: 'Boishakhi TV',
      cleanName: 'Boishakhi TV',
      group: 'Bangladeshi',
      rawGroup: '𝐁𝐚𝐧𝐠𝐥𝐚𝐝𝐞𝐬𝐡𝐢',
      logo: 'https://i.postimg.cc/5NFp4xR7/20240822-225600.png',
      streamUrl: 'https://tvsen6.aynaott.com/1d3uG9VCgrR9DRtWZM57/index.m3u8',
      cleanUrl: 'https://tvsen6.aynaott.com/1d3uG9VCgrR9DRtWZM57/index.m3u8',
    },
    {
      id: 'channel-i-7',
      name: 'Channel i',
      cleanName: 'Channel i',
      group: 'Bangladeshi',
      rawGroup: '𝐁𝐚𝐧𝐠𝐥𝐚𝐝𝐞𝐬𝐡𝐢',
      logo: 'https://i.postimg.cc/W3WS3tVK/20240822-225402.png',
      streamUrl: 'https://tvsen6.aynaott.com/FNHpYvGZ7FkCE10PwTHm/index.m3u8',
      cleanUrl: 'https://tvsen6.aynaott.com/FNHpYvGZ7FkCE10PwTHm/index.m3u8',
    },
    {
      id: 'rtv-8',
      name: 'RTV HD',
      cleanName: 'RTV HD',
      group: 'Bangladeshi',
      rawGroup: '𝐁𝐚𝐧𝐠𝐥𝐚𝐝𝐞𝐬𝐡𝐢',
      logo: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=120&auto=format&fit=crop&q=80',
      streamUrl: 'https://tvsen5.aynaott.com/RtvHD/index.m3u8',
      cleanUrl: 'https://tvsen5.aynaott.com/RtvHD/index.m3u8',
    },
    {
      id: 'independent-tv-9',
      name: 'Independent TV',
      cleanName: 'Independent TV',
      group: 'Bangladeshi',
      rawGroup: '𝐁𝐚𝐧𝐠𝐥𝐚𝐝𝐞𝐬𝐡𝐢',
      logo: 'https://raw.githubusercontent.com/ahan443/logo/refs/heads/main/independent.png',
      streamUrl: 'https://bldcmprod-cdn.toffeelive.com/cdn/live/independent_tv/playlist.m3u8',
      cleanUrl: 'https://bldcmprod-cdn.toffeelive.com/cdn/live/independent_tv/playlist.m3u8',
    },
  ];
}
