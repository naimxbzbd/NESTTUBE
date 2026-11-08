/**
 * Service to fetch, parse, and structure Series & Episodes from GitHub raw M3U playlist.
 * Source: https://raw.githubusercontent.com/MRM3UK/New-try/refs/heads/main/Seires%20llll.m3u
 */

import { getCachedPlaylist, setCachedPlaylist } from './indexedDbStorage';
import { sanitizeStreamUrl } from './m3uService';
import { sanitizeImageUrl, prewarmImages } from './imageAssetCache';

export interface EpisodeItem {
  id: string;
  seriesId: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  cleanTitle: string;
  streamUrl: string;
  cleanUrl: string;
}

export interface SeasonGroup {
  seasonNumber: number;
  seasonLabel: string;
  episodes: EpisodeItem[];
}

export interface SeriesItem {
  id: string;
  title: string;
  cleanTitle: string;
  category: string;
  poster: string;
  seasons: SeasonGroup[];
  totalEpisodes: number;
}

export const SERIES_M3U_URL =
  'https://raw.githubusercontent.com/MRM3UK/New-try/refs/heads/main/Seires%20llll.m3u';

const SERIES_CACHE_KEY = 'nesttube_series_v1';
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours cache freshness

/**
 * Parses series name, season number, episode number, and episode title
 */
export function extractSeriesEpisodeMeta(rawTitle: string, groupTitle: string): {
  seriesName: string;
  seasonNumber: number;
  episodeNumber: number;
  episodeTitle: string;
} {
  let title = rawTitle.trim();
  let seriesName = groupTitle || 'Web Series';
  let seasonNumber = 1;
  let episodeNumber = 1;
  let episodeTitle = title;

  // Patterns like S01 E02, S1 E02, S01E02, Season 1 Episode 2
  const sPattern = /S(?:eason)?\s*(\d+)[\s._-]*E(?:pisode)?\s*(\d+)/i;
  const match = title.match(sPattern);

  if (match) {
    seasonNumber = parseInt(match[1], 10) || 1;
    episodeNumber = parseInt(match[2], 10) || 1;

    // Series title is typically before the S01E02 marker
    const splitIndex = title.search(sPattern);
    if (splitIndex > 0) {
      const parsedSeriesName = title.substring(0, splitIndex).trim().replace(/[-_:]+$/, '').trim();
      if (parsedSeriesName.length > 1) {
        seriesName = parsedSeriesName;
      }
    }

    // Episode title is typically after the S01E02 marker
    const afterPart = title.substring(splitIndex + match[0].length).replace(/^[-_: ]+/, '').trim();
    episodeTitle = afterPart || `Episode ${episodeNumber}`;
  } else {
    // Alternative: EP 01, Episode 1
    const epPattern = /(?:EP|Episode)\s*(\d+)/i;
    const epMatch = title.match(epPattern);
    if (epMatch) {
      episodeNumber = parseInt(epMatch[1], 10) || 1;
      const splitIdx = title.search(epPattern);
      if (splitIdx > 0) {
        const parsedName = title.substring(0, splitIdx).trim().replace(/[-_:]+$/, '').trim();
        if (parsedName.length > 1) seriesName = parsedName;
      }
      episodeTitle = `Episode ${episodeNumber}`;
    }
  }

  // Clean series name from surrounding symbols
  seriesName = seriesName.replace(/\[.*?\]/g, '').trim() || 'Web Series';

  return {
    seriesName,
    seasonNumber,
    episodeNumber,
    episodeTitle,
  };
}

/**
 * Generate safe ID
 */
function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item';
}

/**
 * Parses raw Series M3U text and groups episodes into Series -> Seasons -> Episodes
 */
export function parseSeriesM3u(text: string): SeriesItem[] {
  const lines = text.split('\n');
  const seriesMap = new Map<string, {
    title: string;
    category: string;
    poster: string;
    episodes: EpisodeItem[];
  }>();

  let currentMeta: {
    rawTitle: string;
    group: string;
    poster: string;
  } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      const groupMatch = line.match(/group-title="([^"]*)"/);
      const group = groupMatch ? groupMatch[1].trim() : 'Web Series';

      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      const poster = logoMatch ? sanitizeImageUrl(logoMatch[1]) : '';

      const commaIndex = line.lastIndexOf(',');
      const rawTitle = commaIndex !== -1 ? line.substring(commaIndex + 1).trim() : 'Series Episode';

      currentMeta = {
        rawTitle,
        group,
        poster,
      };
    } else if (line.startsWith('http://') || line.startsWith('https://')) {
      if (currentMeta) {
        const { cleanUrl } = sanitizeStreamUrl(line);
        const { seriesName, seasonNumber, episodeNumber, episodeTitle } = extractSeriesEpisodeMeta(
          currentMeta.rawTitle,
          currentMeta.group
        );

        const seriesKey = seriesName.toLowerCase();
        let existing = seriesMap.get(seriesKey);

        if (!existing) {
          existing = {
            title: seriesName,
            category: currentMeta.group || 'Web Series',
            poster: currentMeta.poster,
            episodes: [],
          };
          seriesMap.set(seriesKey, existing);
        } else if (!existing.poster && currentMeta.poster) {
          existing.poster = currentMeta.poster;
        }

        const seriesId = `series-${slugify(seriesName)}`;
        existing.episodes.push({
          id: `${seriesId}-s${seasonNumber}-e${episodeNumber}`,
          seriesId,
          seasonNumber,
          episodeNumber,
          title: episodeTitle,
          cleanTitle: episodeTitle,
          streamUrl: line,
          cleanUrl: cleanUrl || line,
        });

        currentMeta = null;
      }
    }
  }

  // Convert seriesMap to structured SeriesItem[]
  const result: SeriesItem[] = [];

  seriesMap.forEach((entry, key) => {
    const seriesId = `series-${slugify(entry.title)}`;

    // Group episodes by season
    const seasonMap = new Map<number, EpisodeItem[]>();
    entry.episodes.forEach((ep) => {
      const list = seasonMap.get(ep.seasonNumber) || [];
      list.push(ep);
      seasonMap.set(ep.seasonNumber, list);
    });

    const seasons: SeasonGroup[] = [];
    const sortedSeasonNumbers = Array.from(seasonMap.keys()).sort((a, b) => a - b);

    sortedSeasonNumbers.forEach((sNum) => {
      const episodes = seasonMap.get(sNum) || [];
      // Sort episodes in season
      episodes.sort((a, b) => a.episodeNumber - b.episodeNumber);
      seasons.push({
        seasonNumber: sNum,
        seasonLabel: `সিজন ${sNum} (Season ${sNum})`,
        episodes,
      });
    });

    result.push({
      id: seriesId,
      title: entry.title,
      cleanTitle: entry.title,
      category: entry.category,
      poster: entry.poster,
      seasons,
      totalEpisodes: entry.episodes.length,
    });
  });

  if (result.length > 0) {
    prewarmImages(result.slice(0, 30).map((s) => s.poster), 30);
  }

  return result;
}

/**
 * Fetch and persistently cache series with stale-while-revalidate
 */
export async function fetchSeries(forceRefresh = false): Promise<SeriesItem[]> {
  const { data: cached, timestamp } = await getCachedPlaylist<SeriesItem>(SERIES_CACHE_KEY);

  const isCacheFresh = cached && cached.length > 0 && Date.now() - timestamp < CACHE_TTL_MS;

  if (isCacheFresh && !forceRefresh) {
    prewarmImages(cached.slice(0, 30).map((s) => s.poster), 30);
    if (Date.now() - timestamp > 1000 * 60 * 60) {
      setTimeout(() => {
        syncSeriesInBackground();
      }, 2000);
    }
    return cached;
  }

  if (cached && cached.length > 0 && !forceRefresh) {
    prewarmImages(cached.slice(0, 30).map((s) => s.poster), 30);
    syncSeriesInBackground();
    return cached;
  }

  return fetchFreshSeries();
}

/**
 * Fetch fresh data directly from GitHub and cache in IndexedDB
 */
async function fetchFreshSeries(): Promise<SeriesItem[]> {
  try {
    const res = await fetch(SERIES_M3U_URL, {
      headers: { Accept: 'text/plain, */*' },
      cache: 'no-cache',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch series playlist: HTTP ${res.status}`);
    }

    const text = await res.text();
    const series = parseSeriesM3u(text);

    if (series.length > 0) {
      await setCachedPlaylist(SERIES_CACHE_KEY, series);
      return series;
    }
  } catch (err) {
    console.warn('[SeriesService] Online fetch failed, falling back to cache:', err);
    const { data: cached } = await getCachedPlaylist<SeriesItem>(SERIES_CACHE_KEY);
    if (cached && cached.length > 0) return cached;
  }

  return getFallbackSeries();
}

/**
 * Background sync
 */
async function syncSeriesInBackground() {
  try {
    const res = await fetch(SERIES_M3U_URL, { cache: 'no-cache' });
    if (res.ok) {
      const text = await res.text();
      const series = parseSeriesM3u(text);
      if (series.length > 0) {
        await setCachedPlaylist(SERIES_CACHE_KEY, series);
      }
    }
  } catch {
    // Silent fail in background
  }
}

function getFallbackSeries(): SeriesItem[] {
  return [
    {
      id: 'series-money-heist',
      title: 'Money Heist (La Casa de Papel)',
      cleanTitle: 'Money Heist',
      category: 'Drama / Crime',
      poster: '',
      totalEpisodes: 2,
      seasons: [
        {
          seasonNumber: 1,
          seasonLabel: 'সিজন ১ (Season 1)',
          episodes: [
            {
              id: 'series-money-heist-s1-e1',
              seriesId: 'series-money-heist',
              seasonNumber: 1,
              episodeNumber: 1,
              title: 'পর্ব ১ (Episode 1)',
              cleanTitle: 'Episode 1',
              streamUrl: 'https://tvsen6.aynaott.com/opREbXLqJ2HFYPCXTJBa/index.m3u8',
              cleanUrl: 'https://tvsen6.aynaott.com/opREbXLqJ2HFYPCXTJBa/index.m3u8',
            },
            {
              id: 'series-money-heist-s1-e2',
              seriesId: 'series-money-heist',
              seasonNumber: 1,
              episodeNumber: 2,
              title: 'পর্ব ২ (Episode 2)',
              cleanTitle: 'Episode 2',
              streamUrl: 'https://tvsen6.aynaott.com/opREbXLqJ2HFYPCXTJBa/index.m3u8',
              cleanUrl: 'https://tvsen6.aynaott.com/opREbXLqJ2HFYPCXTJBa/index.m3u8',
            },
          ],
        },
      ],
    },
  ];
}
