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
 * Fetch YouTube autocomplete suggestions via Google's suggest API with timeout
 */
export const fetchYouTubeSuggestions = async (query: string): Promise<string[]> => {
  const trimmed = query.trim();
  if (!trimmed) return [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(
      `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(trimmed)}`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && Array.isArray(data[1])) {
        return data[1].slice(0, 8);
      }
    }
  } catch (error) {
    // Gracefully handle CORS / network abort / rate-limits by returning empty array
    // so client-side fallback suggestions take over seamlessly
  }

  return [];
};
