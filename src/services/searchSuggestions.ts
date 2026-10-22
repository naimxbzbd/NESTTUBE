// Search Suggestions Service & History Manager

const HISTORY_STORAGE_KEY = 'nesttube_search_history';
const MAX_HISTORY_ITEMS = 10;

// Curated popular topics & search queries for instant local fallback
export const POPULAR_SUGGESTIONS = [
  'React 19 full tutorial for beginners',
  'JavaScript async await explained',
  'Tailwind CSS v4 responsive design',
  'LoFi Hip Hop Radio - Beats to Relax/Study',
  'Next.js 15 Full Stack Web App',
  'TypeScript complete guide 2026',
  'Top 10 Coding Tips for Web Developers',
  'AI Web Development & Coding Tools',
  '4K Ultra HD Nature Relaxation Video',
  'Space Exploration & Universe Documentary',
  'Modern Web Design Trends 2026',
  'Node.js REST API Architecture',
  'Python Data Science & Machine Learning',
  'Gaming Highlights 2026',
  'Acoustic Guitar Chill Music Mix'
];

/**
 * Get saved search history from localStorage
 */
export const getSearchHistory = (): string[] => {
  try {
    const historyJson = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!historyJson) return [];
    const parsed = JSON.parse(historyJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to parse search history', e);
    return [];
  }
};

/**
 * Save a search query into search history
 */
export const saveSearchQuery = (query: string): string[] => {
  const trimmed = query.trim();
  if (!trimmed) return getSearchHistory();

  try {
    const existing = getSearchHistory();
    // Remove if already exists and prepend to top
    const filtered = existing.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save search query', e);
    return getSearchHistory();
  }
};

/**
 * Remove an item from search history
 */
export const removeSearchHistoryItem = (queryToRemove: string): string[] => {
  try {
    const existing = getSearchHistory();
    const updated = existing.filter((q) => q.toLowerCase() !== queryToRemove.toLowerCase());
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to remove search history item', e);
    return getSearchHistory();
  }
};

/**
 * Fetch real-time YouTube autocomplete query predictions via JSONP
 * JSONP dynamically inserts a script tag which bypasses browser CORS restrictions
 */
const fetchViaJsonp = (query: string, timeout = 2500): Promise<string[]> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return resolve([]);
    }

    const callbackName = `yt_suggest_cb_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    let timer: any = null;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      try {
        delete (window as any)[callbackName];
      } catch {
        (window as any)[callbackName] = undefined;
      }
      const el = document.getElementById(callbackName);
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    };

    (window as any)[callbackName] = (data: any) => {
      cleanup();
      try {
        if (Array.isArray(data) && Array.isArray(data[1])) {
          const suggestions = data[1].map((item: any) =>
            Array.isArray(item) ? String(item[0]) : String(item)
          );
          resolve(suggestions.slice(0, 10));
        } else {
          resolve([]);
        }
      } catch {
        resolve([]);
      }
    };

    timer = setTimeout(() => {
      cleanup();
      resolve([]);
    }, timeout);

    const script = document.createElement('script');
    script.id = callbackName;
    script.src = `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(
      query
    )}&jsonp=${callbackName}`;
    script.onerror = () => {
      cleanup();
      resolve([]);
    };

    document.head.appendChild(script);
  });
};

/**
 * Fetch YouTube suggestions via local dev server proxy
 */
const fetchViaProxy = async (query: string): Promise<string[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(
      `/api/youtube-suggest?client=firefox&ds=yt&q=${encodeURIComponent(query)}`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && Array.isArray(data[1])) {
        return data[1].slice(0, 10);
      }
    }
  } catch {
    // Ignore and proceed to next fallback
  }

  return [];
};

/**
 * Fetch suggestions from YouTube Data API v3 search predictions if API key is configured
 */
const fetchViaYouTubeDataApi = async (query: string): Promise<string[]> => {
  const apiKey = (import.meta as any).env?.VITE_YOUTUBE_API_KEY;
  if (!apiKey) return [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=6&q=${encodeURIComponent(
        query
      )}&key=${apiKey}`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data?.items)) {
        return data.items
          .map((item: any) => item?.snippet?.title)
          .filter(Boolean)
          .slice(0, 6);
      }
    }
  } catch {
    // Ignore error
  }

  return [];
};

/**
 * Fetch real-time YouTube query predictions as the user types
 * Combines JSONP, local proxy, YouTube Data API, and local matching
 */
export const fetchYouTubeSuggestions = async (query: string): Promise<string[]> => {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // 1. Try real-time JSONP (browser-native, zero CORS blockage)
  const jsonpResults = await fetchViaJsonp(trimmed);
  if (jsonpResults.length > 0) {
    return jsonpResults;
  }

  // 2. Try proxy endpoint
  const proxyResults = await fetchViaProxy(trimmed);
  if (proxyResults.length > 0) {
    return proxyResults;
  }

  // 3. Try YouTube Data API search prediction endpoint
  const apiResults = await fetchViaYouTubeDataApi(trimmed);
  if (apiResults.length > 0) {
    return apiResults;
  }

  // 4. Local fallback from curated search topics
  const lower = trimmed.toLowerCase();
  return POPULAR_SUGGESTIONS.filter((s) => s.toLowerCase().includes(lower)).slice(0, 6);
};
