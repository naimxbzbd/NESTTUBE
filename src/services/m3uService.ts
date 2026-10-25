/**
 * Service to fetch, parse, and cache M3U live TV playlists.
 * Source: https://raw.githubusercontent.com/naimxbzbd/XBZ-Prime-TV/refs/heads/main/playlist.m3u
 */

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

const CACHE_KEY = 'nesttube_m3u_channels_v2';
const CACHE_TIME_KEY = 'nesttube_m3u_channels_v2_time';
const CACHE_DURATION_MS = 1000 * 60 * 30; // 30 minutes cache

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
      const logo = logoMatch ? logoMatch[1].trim() : '';

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

  return channels;
}

/**
 * Fetches the M3U playlist from GitHub raw URL with fallback caching
 */
export async function fetchM3uPlaylist(forceRefresh = false): Promise<M3uChannel[]> {
  // Check localStorage cache first if not forced refresh
  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const cacheTime = localStorage.getItem(CACHE_TIME_KEY);
      if (cached && cacheTime) {
        const age = Date.now() - parseInt(cacheTime, 10);
        if (age < CACHE_DURATION_MS) {
          const parsed = JSON.parse(cached) as M3uChannel[];
          if (parsed && parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch {
      // Local storage issue, proceed to fetch
    }
  }

  try {
    const res = await fetch(M3U_PLAYLIST_URL, {
      headers: {
        Accept: 'text/plain, */*',
      },
      cache: forceRefresh ? 'no-cache' : 'default',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch playlist: HTTP ${res.status}`);
    }

    const text = await res.text();
    const channels = parseM3u(text);

    if (channels.length > 0) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(channels));
        localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
      } catch {
        // LocalStorage quota may be exceeded, ignore
      }
      return channels;
    }
  } catch (err) {
    console.warn('Failed to fetch M3U playlist online:', err);
    // If network fails, try to return any cached version even if expired
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as M3uChannel[];
        if (parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore
    }
  }

  // Fallback to essential curated channels if network fails completely
  return getFallbackChannels();
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
