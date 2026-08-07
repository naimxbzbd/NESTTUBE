import axios from 'axios';
import {
  cacheFeedResponse,
  getCachedFeed,
  cacheSingleVideoDetail,
  getCachedVideoDetails,
  cacheComments,
  getCachedComments,
  cacheChannel,
  getCachedChannel,
  cacheVideoItems,
} from './youtubeCache';

const API_KEY = (import.meta as any).env?.VITE_YOUTUBE_API_KEY || '';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

const youtubeApi = axios.create({
  baseURL: BASE_URL,
  params: {
    key: API_KEY,
  },
});

export class YouTubeApiError extends Error {
  constructor(public message: string, public status?: number, public code?: string) {
    super(message);
    this.name = 'YouTubeApiError';
  }
}

youtubeApi.interceptors.response.use(
  (response) => response,
  (error) => {
    let customError = new YouTubeApiError('An unknown error occurred');
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;
      const message = data?.error?.message || error.message;
      
      if (status === 403 && message.toLowerCase().includes('quota')) {
        customError = new YouTubeApiError('YouTube API quota exceeded. Please try again later.', status, 'QUOTA_EXCEEDED');
      } else if (status === 400 || status === 403) {
        customError = new YouTubeApiError(`YouTube API error: ${message}`, status, 'API_ERROR');
      } else if (status === 429) {
        customError = new YouTubeApiError('Rate limit exceeded. Please try again later.', status, 'RATE_LIMIT_EXCEEDED');
      } else if (status === 404) {
        customError = new YouTubeApiError('Requested resource not found.', status, 'NOT_FOUND');
      } else if (!error.response) {
        customError = new YouTubeApiError('Network error. Please check your connection.', status, 'NETWORK_ERROR');
      } else {
        customError = new YouTubeApiError(message, status, 'UNKNOWN_ERROR');
      }
    }
    
    return Promise.reject(customError);
  }
);

export const CATEGORY_QUERY_VARIATIONS: Record<string, string[]> = {
  All: ['trending videos', 'popular viral 2026', 'top youtube videos', 'must watch videos', 'trending content 2026'],
  Music: ['music 2026 new release', 'official music video', 'top hit music mix', 'live acoustic concert', 'chill music playlist'],
  Gaming: ['gaming 2026', 'gameplay walkthrough 4k', 'esports highlights', 'funny gaming moments', 'new game trailer 2026'],
  News: ['breaking news today', 'latest world news', 'tech news update', 'daily news report', 'global headlines'],
  Live: ['live stream gaming', 'live music stream', 'live news broadcast', 'live podcast show', 'live chat stream'],
  Tech: ['latest tech review 2026', 'ai technology future', 'smartphone unboxing', 'coding tech news', 'future gadget review'],
  Podcasts: ['top podcast episode 2026', 'inspiring conversation podcast', 'tech & science podcast', 'deep discussion podcast', 'popular creator podcast'],
  Entertainment: ['funny comedy clip', 'viral entertainment video', 'top show moments', 'reaction video 2026', 'celebrity interview'],
  Sports: ['sports highlights 2026', 'best football goals', 'nba top plays', 'cricket match highlights', 'extreme sports 4k'],
  Education: ['educational documentary', 'science explained 4k', 'history documentary', 'learning crash course', 'how things work'],
  Movies: ['movie trailer 2026', 'film scene breakdown', 'cinema action trailer', 'blockbuster movie clip', 'behind the scenes movie'],
  Fashion: ['fashion trend 2026', 'streetwear outfit ideas', 'runway fashion show', 'style guide 2026', 'beauty vlog'],
  Coding: ['web development 2026', 'react js full course', 'python programming tutorial', 'software engineering 2026', 'system design coding'],
  Trending: ['trending videos today', 'viral hits 2026', 'top trending music & gaming', 'most watched videos', 'internet viral trends']
};

export const getVideos = async (categoryId = '', maxResults = 50, pageToken = '') => {
  try {
    const response = await youtubeApi.get('/videos', {
      params: {
        part: 'snippet,contentDetails,statistics',
        chart: 'mostPopular',
        regionCode: 'US',
        maxResults,
        pageToken,
        videoCategoryId: categoryId || undefined,
      },
    });
    if (response.data?.items) {
      cacheVideoItems(response.data.items);
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching videos, checking cache:', error);
    const cached = getCachedFeed(categoryId || 'popular');
    if (cached) {
      return cached;
    }
    throw error;
  }
};

export const searchVideos = async (query: string, maxResults = 50, pageToken = '', channelId = '', order?: string) => {
  try {
    const response = await youtubeApi.get('/search', {
      params: {
        part: 'snippet',
        maxResults,
        q: query,
        type: 'video',
        pageToken,
        order: order || undefined,
        channelId: channelId || undefined
      },
    });
    if (response.data?.items) {
      cacheVideoItems(response.data.items);
    }
    return response.data;
  } catch (error) {
    console.error('Error searching videos, checking cache:', error);
    const cached = getCachedFeed(query) || getCachedFeed('All');
    if (cached) {
      return cached;
    }
    throw error;
  }
};

/**
 * Fetch fresh category videos with query variation & optional order randomization
 */
export const fetchCategoryVideos = async (
  category = 'All',
  maxResults = 24,
  pageToken = '',
  refreshSeed = 0
) => {
  try {
    let result: any = null;

    // If category is "All" and initial page, alternate between mostPopular chart and dynamic search queries
    if (category === 'All' && !pageToken && refreshSeed % 2 === 0) {
      const popularData = await getVideos('', maxResults, pageToken);
      if (popularData?.items?.length) {
        // Slightly shuffle items on refresh for variety
        const items = [...popularData.items];
        if (refreshSeed > 0) {
          items.sort(() => Math.random() - 0.5);
        }
        result = { ...popularData, items };
      }
    }

    if (!result) {
      // Pick dynamic query variation based on category and seed
      const variations = CATEGORY_QUERY_VARIATIONS[category] || [category];
      const queryIndex = refreshSeed ? Math.abs(refreshSeed) % variations.length : Math.floor(Math.random() * variations.length);
      const searchQuery = variations[queryIndex] || category;

      // Randomize sort order options for search queries
      const orders = ['relevance', 'date', 'viewCount', 'rating'];
      const selectedOrder = orders[refreshSeed ? Math.abs(refreshSeed) % orders.length : Math.floor(Math.random() * orders.length)];

      const searchData = await searchVideos(searchQuery, maxResults, pageToken, '', selectedOrder);

      // If initial load, shuffle slightly to maximize visual freshness
      if (searchData?.items?.length && !pageToken) {
        const items = [...searchData.items];
        if (refreshSeed > 0) {
          items.sort(() => Math.random() - 0.5);
        }
        result = { ...searchData, items };
      } else {
        result = searchData;
      }
    }

    if (result) {
      cacheFeedResponse(category, result);
    }

    return result;
  } catch (error) {
    console.warn(`Falling back to cached feed for category: ${category}`, error);
    const cached = getCachedFeed(category);
    if (cached) {
      return cached;
    }
    return getVideos('', maxResults, pageToken);
  }
};

export const getChannels = async (channelIds: string[]): Promise<Record<string, string>> => {
  const uniqueIds = Array.from(new Set(channelIds.filter(Boolean)));
  if (!uniqueIds.length) return {};

  try {
    const response = await youtubeApi.get('/channels', {
      params: {
        part: 'snippet',
        id: uniqueIds.join(','),
      },
    });

    const map: Record<string, string> = {};
    response.data?.items?.forEach((item: any) => {
      if (item.id && item.snippet?.thumbnails?.default?.url) {
        map[item.id] = item.snippet.thumbnails.default.url;
      }
    });
    return map;
  } catch (error) {
    console.error('Error fetching channel avatars:', error);
    return {};
  }
};

export const getChannelDetails = async (channelId: string) => {
  try {
    const response = await youtubeApi.get('/channels', {
      params: {
        part: 'snippet,statistics,brandingSettings',
        id: channelId,
      },
    });
    if (response.data) {
      cacheChannel(channelId, response.data);
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching channel details, checking cache:', error);
    const cached = getCachedChannel(channelId);
    if (cached) {
      return cached;
    }
    throw error;
  }
};

export const getVideoDetails = async (videoId: string) => {
  try {
    const response = await youtubeApi.get('/videos', {
      params: {
        part: 'snippet,contentDetails,statistics',
        id: videoId,
      },
    });
    if (response.data?.items?.[0]) {
      cacheSingleVideoDetail(videoId, response.data.items[0]);
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching video details, checking cache:', error);
    const cachedObj = getCachedVideoDetails(videoId);
    if (cachedObj) {
      return {
        kind: 'youtube#videoListResponse',
        items: [cachedObj],
        _fromOfflineCache: true,
      };
    }
    throw error;
  }
};

export const getComments = async (videoId: string, maxResults = 20) => {
  try {
    const response = await youtubeApi.get('/commentThreads', {
      params: {
        part: 'snippet,replies',
        videoId,
        maxResults,
      },
    });
    if (response.data) {
      cacheComments(videoId, response.data);
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching comments, checking cache:', error);
    const cached = getCachedComments(videoId);
    if (cached) {
      return cached;
    }
    return { kind: 'youtube#commentThreadListResponse', items: [], _fromOfflineCache: true };
  }
};
