// Local storage caching for YouTube API feeds, video details, comments, and channels

const FEED_CACHE_KEY_PREFIX = 'nesttube_feed_';
const VIDEO_CACHE_KEY_PREFIX = 'nesttube_video_';
const COMMENTS_CACHE_KEY_PREFIX = 'nesttube_comments_';
const CHANNEL_CACHE_KEY_PREFIX = 'nesttube_channel_';
const ALL_VIDEOS_INDEX_KEY = 'nesttube_all_videos_index';
const LAST_FEED_KEY = 'nesttube_last_feed';

// Maximum cached items in video index to prevent localStorage bloat
const MAX_CACHED_VIDEOS = 120;

/**
 * Save video items to local storage video index
 */
export const cacheVideoItems = (videos: any[]) => {
  if (!Array.isArray(videos) || videos.length === 0) return;

  try {
    const existingStr = localStorage.getItem(ALL_VIDEOS_INDEX_KEY);
    const indexMap: Record<string, any> = existingStr ? JSON.parse(existingStr) : {};

    videos.forEach((item) => {
      const id = typeof item.id === 'string' ? item.id : item.id?.videoId;
      if (id) {
        indexMap[id] = {
          ...item,
          _cachedAt: Date.now(),
        };
      }
    });

    // Prune if exceeds max limit
    const keys = Object.keys(indexMap);
    if (keys.length > MAX_CACHED_VIDEOS) {
      const sortedKeys = keys.sort((a, b) => (indexMap[b]._cachedAt || 0) - (indexMap[a]._cachedAt || 0));
      const prunedMap: Record<string, any> = {};
      sortedKeys.slice(0, MAX_CACHED_VIDEOS).forEach((k) => {
        prunedMap[k] = indexMap[k];
      });
      localStorage.setItem(ALL_VIDEOS_INDEX_KEY, JSON.stringify(prunedMap));
    } else {
      localStorage.setItem(ALL_VIDEOS_INDEX_KEY, JSON.stringify(indexMap));
    }
  } catch (err) {
    console.warn('Failed to cache video items in localStorage', err);
  }
};

/**
 * Get cached video by videoId
 */
export const getCachedVideoDetails = (videoId: string): any | null => {
  if (!videoId) return null;

  try {
    // Check specific video key
    const directStr = localStorage.getItem(`${VIDEO_CACHE_KEY_PREFIX}${videoId}`);
    if (directStr) {
      return JSON.parse(directStr);
    }

    // Check video index
    const indexStr = localStorage.getItem(ALL_VIDEOS_INDEX_KEY);
    if (indexStr) {
      const indexMap = JSON.parse(indexStr);
      if (indexMap[videoId]) {
        return indexMap[videoId];
      }
    }

    // Check watch history
    const historyStr = localStorage.getItem('nesttube_watch_history');
    if (historyStr) {
      const historyList = JSON.parse(historyStr);
      const match = historyList.find((h: any) => h.id === videoId);
      if (match) {
        return {
          id: match.id,
          snippet: {
            title: match.title,
            channelTitle: match.channelName,
            channelId: match.channelId,
            publishedAt: match.publishedAt,
            thumbnails: {
              medium: { url: match.thumbnailUrl },
              default: { url: match.thumbnailUrl },
            },
            description: match.description || 'Offline cached video description.',
          },
          contentDetails: {
            duration: match.duration || 'PT10M',
          },
          statistics: {
            viewCount: match.views || '10000',
            likeCount: '500',
          },
        };
      }
    }
  } catch (err) {
    console.warn('Error reading cached video details', err);
  }

  return null;
};

/**
 * Save single video detail
 */
export const cacheSingleVideoDetail = (videoId: string, videoObj: any) => {
  if (!videoId || !videoObj) return;
  try {
    localStorage.setItem(`${VIDEO_CACHE_KEY_PREFIX}${videoId}`, JSON.stringify(videoObj));
    cacheVideoItems([videoObj]);
  } catch (err) {
    console.warn('Error saving single video detail to localStorage', err);
  }
};

/**
 * Cache feed result by category
 */
export const cacheFeedResponse = (categoryKey: string, responseData: any) => {
  if (!responseData || !Array.isArray(responseData.items)) return;
  try {
    const cacheData = {
      ...responseData,
      _cachedAt: Date.now(),
    };
    localStorage.setItem(`${FEED_CACHE_KEY_PREFIX}${categoryKey}`, JSON.stringify(cacheData));
    localStorage.setItem(LAST_FEED_KEY, JSON.stringify(cacheData));
    cacheVideoItems(responseData.items);
  } catch (err) {
    console.warn('Error caching feed response', err);
  }
};

/**
 * Retrieve cached feed by category or general fallback
 */
export const getCachedFeed = (categoryKey: string): any | null => {
  try {
    const specificStr = localStorage.getItem(`${FEED_CACHE_KEY_PREFIX}${categoryKey}`);
    if (specificStr) {
      return JSON.parse(specificStr);
    }

    const lastFeedStr = localStorage.getItem(LAST_FEED_KEY);
    if (lastFeedStr) {
      return JSON.parse(lastFeedStr);
    }

    // Fallback: build response from index items
    const indexStr = localStorage.getItem(ALL_VIDEOS_INDEX_KEY);
    if (indexStr) {
      const indexMap = JSON.parse(indexStr);
      const items = Object.values(indexMap);
      if (items.length > 0) {
        return {
          kind: 'youtube#videoListResponse',
          items: items.slice(0, 30),
          pageInfo: { totalResults: items.length, resultsPerPage: 30 },
          _fromOfflineCache: true,
        };
      }
    }
  } catch (err) {
    console.warn('Error retrieving cached feed', err);
  }
  return null;
};

/**
 * Cache comments for a video
 */
export const cacheComments = (videoId: string, commentsData: any) => {
  if (!videoId || !commentsData) return;
  try {
    localStorage.setItem(`${COMMENTS_CACHE_KEY_PREFIX}${videoId}`, JSON.stringify(commentsData));
  } catch (err) {
    console.warn('Error caching comments', err);
  }
};

/**
 * Get cached comments for a video
 */
export const getCachedComments = (videoId: string): any | null => {
  if (!videoId) return null;
  try {
    const str = localStorage.getItem(`${COMMENTS_CACHE_KEY_PREFIX}${videoId}`);
    if (str) {
      return JSON.parse(str);
    }
  } catch (err) {
    console.warn('Error retrieving cached comments', err);
  }
  return null;
};

/**
 * Cache channel details
 */
export const cacheChannel = (channelId: string, channelData: any) => {
  if (!channelId || !channelData) return;
  try {
    localStorage.setItem(`${CHANNEL_CACHE_KEY_PREFIX}${channelId}`, JSON.stringify(channelData));
  } catch (err) {
    console.warn('Error caching channel', err);
  }
};

/**
 * Get cached channel details
 */
export const getCachedChannel = (channelId: string): any | null => {
  if (!channelId) return null;
  try {
    const str = localStorage.getItem(`${CHANNEL_CACHE_KEY_PREFIX}${channelId}`);
    if (str) {
      return JSON.parse(str);
    }
  } catch (err) {
    console.warn('Error retrieving cached channel', err);
  }
  return null;
};
