/**
 * Service to fetch, parse, and persistently cache Movies from GitHub raw M3U playlist.
 * Source: https://raw.githubusercontent.com/MRM3UK/New-try/refs/heads/main/Metflix_Playlist_1792332597030.m3u
 */

import { getCachedPlaylist, setCachedPlaylist } from './indexedDbStorage';
import { sanitizeStreamUrl } from './m3uService';
import { sanitizeImageUrl, prewarmImages } from './imageAssetCache';

export interface MovieItem {
  id: string;
  title: string;
  cleanTitle: string;
  category: string;
  rawCategory: string;
  poster: string;
  streamUrl: string;
  cleanUrl: string;
  year?: string;
  quality?: string;
}

export const MOVIES_M3U_URL =
  'https://raw.githubusercontent.com/MRM3UK/New-try/refs/heads/main/Metflix_Playlist_1792332597030.m3u';

const MOVIES_CACHE_KEY = 'nesttube_movies_v1';
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours cache freshness

/**
 * Clean up movie title, extracting resolution and release year
 */
export function parseMovieMeta(rawName: string): {
  cleanTitle: string;
  year?: string;
  quality?: string;
} {
  let cleanTitle = rawName.trim();
  let year: string | undefined;
  let quality: string | undefined;

  // Extract year (e.g., (2023) or [2024])
  const yearMatch = cleanTitle.match(/[\(\[]?(19\d{2}|20\d{2})[\)\]]?/);
  if (yearMatch) {
    year = yearMatch[1];
  }

  // Extract quality
  const qualityMatch = cleanTitle.match(/(4K|UHD|1080p|720p|HDRip|WEB-DL|CAM|HD)/i);
  if (qualityMatch) {
    quality = qualityMatch[1].toUpperCase();
  }

  // Remove brackets, parentheses tags from cleanTitle
  cleanTitle = cleanTitle
    .replace(/\[.*?\]|\(.*?\)/g, '')
    .replace(/(4K|UHD|1080p|720p|HDRip|WEB-DL|CAM|HD)/gi, '')
    .replace(/[-_]+/g, ' ')
    .trim();

  return {
    cleanTitle: cleanTitle || rawName,
    year,
    quality,
  };
}

/**
 * Parse raw M3U text into an array of MovieItem objects
 */
export function parseMoviesM3u(text: string): MovieItem[] {
  const lines = text.split('\n');
  const movies: MovieItem[] = [];

  let currentMeta: {
    title: string;
    category: string;
    rawCategory: string;
    poster: string;
  } | null = null;

  let movieIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      const groupMatch = line.match(/group-title="([^"]*)"/);
      const rawCategory = groupMatch ? groupMatch[1].trim() : 'Movies';
      const category = rawCategory || 'All Movies';

      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      const poster = logoMatch ? sanitizeImageUrl(logoMatch[1]) : '';

      const commaIndex = line.lastIndexOf(',');
      const rawTitle = commaIndex !== -1 ? line.substring(commaIndex + 1).trim() : `Movie ${movieIndex + 1}`;

      currentMeta = {
        title: rawTitle,
        category,
        rawCategory,
        poster,
      };
    } else if (line.startsWith('http://') || line.startsWith('https://')) {
      if (currentMeta) {
        const { cleanUrl } = sanitizeStreamUrl(line);
        const { cleanTitle, year, quality } = parseMovieMeta(currentMeta.title);

        movies.push({
          id: `movie-${movieIndex + 1}-${encodeURIComponent(cleanTitle.slice(0, 15).toLowerCase().replace(/[^a-z0-9]/g, '-'))}`,
          title: currentMeta.title,
          cleanTitle,
          category: currentMeta.category,
          rawCategory: currentMeta.rawCategory,
          poster: currentMeta.poster,
          streamUrl: line,
          cleanUrl: cleanUrl || line,
          year,
          quality,
        });

        movieIndex++;
        currentMeta = null;
      }
    }
  }

  if (movies.length > 0) {
    prewarmImages(movies.slice(0, 40).map((m) => m.poster), 40);
  }

  return movies;
}

/**
 * Fetch and persistently cache movies with stale-while-revalidate
 */
export async function fetchMovies(forceRefresh = false): Promise<MovieItem[]> {
  // Check IndexedDB
  const { data: cached, timestamp } = await getCachedPlaylist<MovieItem>(MOVIES_CACHE_KEY);

  const isCacheFresh = cached && cached.length > 0 && Date.now() - timestamp < CACHE_TTL_MS;

  if (isCacheFresh && !forceRefresh) {
    prewarmImages(cached.slice(0, 30).map((m) => m.poster), 30);
    // Return cached immediately and trigger background sync if cache > 1 hour old
    if (Date.now() - timestamp > 1000 * 60 * 60) {
      setTimeout(() => {
        syncMoviesInBackground();
      }, 2000);
    }
    return cached;
  }

  // If we have stale cache and not explicitly forced, return stale while updating in background
  if (cached && cached.length > 0 && !forceRefresh) {
    prewarmImages(cached.slice(0, 30).map((m) => m.poster), 30);
    syncMoviesInBackground();
    return cached;
  }

  return fetchFreshMovies();
}

/**
 * Fetch fresh data directly from GitHub and cache in IndexedDB
 */
async function fetchFreshMovies(): Promise<MovieItem[]> {
  try {
    const res = await fetch(MOVIES_M3U_URL, {
      headers: { Accept: 'text/plain, */*' },
      cache: 'no-cache',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch movies playlist: HTTP ${res.status}`);
    }

    const text = await res.text();
    const movies = parseMoviesM3u(text);

    if (movies.length > 0) {
      await setCachedPlaylist(MOVIES_CACHE_KEY, movies);
      return movies;
    }
  } catch (err) {
    console.warn('[MoviesService] Online fetch failed, falling back to cache:', err);
    const { data: cached } = await getCachedPlaylist<MovieItem>(MOVIES_CACHE_KEY);
    if (cached && cached.length > 0) return cached;
  }

  return getFallbackMovies();
}

/**
 * Background synchronizer for stale-while-revalidate
 */
async function syncMoviesInBackground() {
  try {
    const res = await fetch(MOVIES_M3U_URL, { cache: 'no-cache' });
    if (res.ok) {
      const text = await res.text();
      const movies = parseMoviesM3u(text);
      if (movies.length > 0) {
        await setCachedPlaylist(MOVIES_CACHE_KEY, movies);
      }
    }
  } catch {
    // Silent fail in background
  }
}

function getFallbackMovies(): MovieItem[] {
  return [
    {
      id: 'movie-fb-1',
      title: 'Bengali Classic Cinema',
      cleanTitle: 'Bengali Classic Cinema',
      category: 'Bangla Cinema',
      rawCategory: 'Bangla Cinema',
      poster: '',
      streamUrl: 'https://tvsen6.aynaott.com/opREbXLqJ2HFYPCXTJBa/index.m3u8',
      cleanUrl: 'https://tvsen6.aynaott.com/opREbXLqJ2HFYPCXTJBa/index.m3u8',
      quality: 'HD',
    },
  ];
}
