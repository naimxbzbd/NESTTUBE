/**
 * Cache API strategy for media posters and channel thumbnails.
 * Caches image responses in CacheStorage ('nesttube-thumbnails-v1')
 * for instantaneous subsequent loads and zero image flickering.
 */

const CACHE_NAME = 'nesttube-thumbnails-v1';
const memoryUrlCache = new Map<string, string>();
const inFlightRequests = new Set<string>();

/**
 * Sanitizes image URLs by decoding HTML entities (&amp;), trimming whitespace,
 * and stripping any trailing header pipes.
 */
export function sanitizeImageUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  // Strip trailing pipe params if any (e.g. url|Referer=...)
  if (url.includes('|')) {
    url = url.split('|')[0].trim();
  }
  // Decode &amp;
  url = url.replace(/&amp;/g, '&');
  return url;
}

/**
 * Pre-warms or caches an image URL using the browser Cache API.
 * Returns a cached object URL or original sanitized URL.
 */
export async function getCachedImageUrl(rawUrl: string): Promise<string> {
  const url = sanitizeImageUrl(rawUrl);
  if (!url || !url.startsWith('http')) return url;

  // Check memory cache first
  if (memoryUrlCache.has(url)) {
    return memoryUrlCache.get(url)!;
  }

  if (typeof window === 'undefined' || !('caches' in window)) {
    return url;
  }

  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(url);

    if (cachedResponse) {
      const blob = await cachedResponse.blob();
      const objectUrl = URL.createObjectURL(blob);
      memoryUrlCache.set(url, objectUrl);
      return objectUrl;
    }

    // Avoid duplicate concurrent fetches for the same image
    if (!inFlightRequests.has(url)) {
      inFlightRequests.add(url);
      fetch(url, { mode: 'no-cors' })
        .then(async (response) => {
          if (response.status === 200 || response.type === 'opaque') {
            await cache.put(url, response.clone());
          }
        })
        .catch(() => {
          // Ignore CORS or network errors quietly
        })
        .finally(() => {
          inFlightRequests.delete(url);
        });
    }

    return url;
  } catch {
    return url;
  }
}

/**
 * Pre-warms an array of image URLs in the background during idle moments
 * so they load instantly without network latency when rendered on screen.
 */
export function prewarmImages(urls: (string | undefined | null)[], limit = 40): void {
  if (typeof window === 'undefined' || !('caches' in window)) return;

  const validUrls = Array.from(
    new Set(
      urls
        .map((u) => sanitizeImageUrl(u))
        .filter((u): u is string => Boolean(u && u.startsWith('http') && !memoryUrlCache.has(u)))
    )
  ).slice(0, limit);

  if (validUrls.length === 0) return;

  const executeWarmup = () => {
    // Process in batches of 4 with a short breather
    let index = 0;
    const batchSize = 4;

    const processBatch = () => {
      const slice = validUrls.slice(index, index + batchSize);
      index += batchSize;

      slice.forEach((url) => {
        getCachedImageUrl(url);
      });

      if (index < validUrls.length) {
        if ('requestIdleCallback' in window) {
          (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(processBatch);
        } else {
          setTimeout(processBatch, 100);
        }
      }
    };

    processBatch();
  };

  if ('requestIdleCallback' in window) {
    (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(executeWarmup);
  } else {
    setTimeout(executeWarmup, 300);
  }
}

/**
 * Purges old thumbnail cache if needed
 */
export async function clearThumbnailCache(): Promise<void> {
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      await caches.delete(CACHE_NAME);
      memoryUrlCache.clear();
      inFlightRequests.clear();
    } catch (e) {
      console.warn('Failed to clear thumbnail cache:', e);
    }
  }
}

