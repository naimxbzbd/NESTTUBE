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
import {
  ALL_CURATED_VIDEOS,
  normalizeCategory,
  getCuratedVideosByCategory,
} from './curatedVideos';
import {
  getPersonalizedHomeFeed,
  getPlayerRecommendations,
  getUserInterestProfile,
} from './recommendationEngine';

export {
  normalizeCategory,
  getCuratedVideosByCategory,
  getPersonalizedHomeFeed,
  getPlayerRecommendations,
  getUserInterestProfile,
};

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
  Podcasts: ['top podcast episode 2026', 'inspiring conversation podcast', 'tech & science podcast', 'deep discussion podcast', 'popular creator podcast'],
  'AI & Tech': ['latest tech review 2026', 'ai technology future', 'smartphone unboxing', 'coding tech news', 'future gadget review', 'artificial intelligence 2026'],
  Coding: ['web development 2026', 'react js full course', 'python programming tutorial', 'software engineering 2026', 'system design coding'],
  Live: ['live stream gaming', 'live music stream', 'live news broadcast', 'live podcast show', 'live chat stream'],
  Comedy: ['standup comedy special', 'funny sketches 2026', 'hilarious comedy moments', 'improv comedy clip', 'comedy club show'],
  News: ['breaking news today', 'latest world news', 'tech news update', 'daily news report', 'global headlines'],
  Sports: ['sports highlights 2026', 'best football goals', 'nba top plays', 'cricket match highlights', 'extreme sports 4k'],
  'Science & Nature': ['educational documentary', 'science explained 4k', 'space exploration nasa', 'nature documentary 4k', 'how things work'],
  Cooking: ['street food 4k tour', 'gordon ramsay cooking', 'delicious easy recipes', 'masterchef cooking techniques', 'baking dessert tutorial'],
  Travel: ['travel vlog 4k', 'japan travel guide', 'beautiful places to visit', 'solo backpacking adventure', 'luxury resort tour'],
  Animation: ['animation short film', 'anime trailer 2026', 'cgi 3d animation', 'japanese anime moments', 'studio ghibli style'],
  Movies: ['movie trailer 2026', 'film scene breakdown', 'cinema action trailer', 'blockbuster movie clip', 'behind the scenes movie'],
  Fitness: ['full body workout', 'gym motivation workout', 'calisthenics training', 'hiit home exercise', 'yoga for beginners'],
  Trending: ['trending videos today', 'viral hits 2026', 'top trending music & gaming', 'most watched videos', 'internet viral trends']
};

export const REAL_CURATED_VIDEOS = ALL_CURATED_VIDEOS;

export const getMockFallbackVideos = (
  category = 'All',
  pageToken = '',
  maxResults = 24,
  refreshSeed = 0
) => {
  return getCuratedVideosByCategory(category, pageToken, maxResults, refreshSeed);
};

export const getVideos = async (categoryId = '', maxResults = 50, pageToken = '') => {
  const normCategory = normalizeCategory(categoryId);

  if (API_KEY) {
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
      if (response.data?.items && response.data.items.length > 0) {
        cacheVideoItems(response.data.items);
        return response.data;
      }
    } catch (error) {
      console.warn('Error fetching videos from YouTube API:', error);
    }
  }

  const cached = getCachedFeed(normCategory);
  if (cached && cached.items && cached.items.length > 0) {
    return cached;
  }

  const fallback = getCuratedVideosByCategory(normCategory, pageToken, maxResults);
  cacheVideoItems(fallback.items);
  return fallback;
};

export const searchVideos = async (
  query: string,
  maxResults = 50,
  pageToken = '',
  channelId = '',
  order?: string,
  videoDuration?: string,
  videoCategoryId?: string
) => {
  if (API_KEY) {
    try {
      const response = await youtubeApi.get('/search', {
        params: {
          part: 'snippet',
          maxResults,
          q: query,
          type: 'video',
          pageToken,
          order: order || undefined,
          channelId: channelId || undefined,
          videoDuration: videoDuration || undefined,
          videoCategoryId: videoCategoryId || undefined,
        },
      });
      if (response.data?.items && response.data.items.length > 0) {
        cacheVideoItems(response.data.items);
        return response.data;
      }
    } catch (error) {
      console.warn('Error searching videos from YouTube API:', error);
    }
  }

  const normCategory = normalizeCategory(query || videoCategoryId || '');
  const cached = getCachedFeed(normCategory);
  if (cached && cached.items && cached.items.length > 0) {
    return cached;
  }

  const fallback = getCuratedVideosByCategory(normCategory, pageToken, maxResults);
  cacheVideoItems(fallback.items);
  return fallback;
};

export const CATEGORY_ID_MAP: Record<string, string> = {
  Music: '10',
  Gaming: '20',
  News: '25',
  'AI & Tech': '28',
  Tech: '28',
  Coding: '27',
  Sports: '17',
  Comedy: '23',
  Cooking: '26',
  Travel: '19',
  Animation: '1',
  Movies: '1',
  Fitness: '26',
  Entertainment: '24',
  Education: '27',
};

export const fetchCategoryVideos = async (
  category = 'All',
  maxResults = 24,
  pageToken = '',
  refreshSeed = 0
) => {
  const normCategory = normalizeCategory(category);

  // Check if personalized recommendations match user searches and interests
  const personalized = getPersonalizedHomeFeed(normCategory, pageToken, maxResults, refreshSeed);
  if (personalized && personalized.items && personalized.items.length > 0) {
    cacheVideoItems(personalized.items);
    return personalized;
  }

  // If live API is configured with an active key, try live YouTube search
  if (API_KEY) {
    try {
      const variations = CATEGORY_QUERY_VARIATIONS[normCategory] || [normCategory];
      const queryIndex = refreshSeed
        ? Math.abs(refreshSeed) % variations.length
        : Math.floor(Math.random() * variations.length);
      const searchQuery = variations[queryIndex] || normCategory;
      const categoryId = CATEGORY_ID_MAP[normCategory];

      const searchData = await searchVideos(
        searchQuery,
        maxResults,
        pageToken,
        '',
        'relevance',
        undefined,
        categoryId
      );

      if (searchData?.items && searchData.items.length > 0) {
        cacheFeedResponse(normCategory, searchData);
        return searchData;
      }
    } catch (error) {
      console.warn(`Live search failed for ${normCategory}:`, error);
    }
  }

  // Check category-specific cache
  const cached = getCachedFeed(normCategory);
  if (cached && cached.items && cached.items.length > 0) {
    return cached;
  }

  // Fallback directly to category-specific curated videos
  const fallback = getCuratedVideosByCategory(normCategory, pageToken, maxResults, refreshSeed);
  cacheFeedResponse(normCategory, fallback);
  return fallback;
};

export const getChannels = async (channelIds: string[]): Promise<Record<string, string>> => {
  const uniqueIds = Array.from(new Set(channelIds.filter(Boolean)));
  if (!uniqueIds.length) return {};

  const map: Record<string, string> = {};

  try {
    // YouTube API limits to 50 IDs per request
    for (let i = 0; i < uniqueIds.length; i += 50) {
      const batchIds = uniqueIds.slice(i, i + 50);
      const response = await youtubeApi.get('/channels', {
        params: {
          part: 'snippet',
          id: batchIds.join(','),
        },
      });

      response.data?.items?.forEach((item: any) => {
        if (item.id && item.snippet?.thumbnails?.default?.url) {
          map[item.id] = item.snippet.thumbnails.default.url;
        }
      });
    }
    return map;
  } catch (error) {
    console.warn('Error fetching channel avatars:', error);
    return map; // Return whatever we managed to fetch
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
    console.warn('Error fetching channel details, checking cache:', error);
    const cached = getCachedChannel(channelId);
    if (cached) {
      return cached;
    }
    return {
      kind: 'youtube#channelListResponse',
      items: [
        {
          id: channelId,
          snippet: {
            title: 'Mock Channel',
            description: 'This is a mock channel due to API limits.',
            thumbnails: {
              default: { url: `https://picsum.photos/seed/${channelId}/250/250` },
              medium: { url: `https://picsum.photos/seed/${channelId}/250/250` },
              high: { url: `https://picsum.photos/seed/${channelId}/250/250` },
            },
          },
          statistics: {
            subscriberCount: '1000000',
            videoCount: '100',
            viewCount: '50000000',
          },
          brandingSettings: {
            image: {
              bannerExternalUrl: `https://picsum.photos/seed/${channelId}banner/1280/360`,
            },
          },
        },
      ],
    };
  }
};

export const getVideoDetails = async (videoId: string) => {
  // Check if this is a Firestore community uploaded video
  if (videoId && videoId.startsWith('vid_')) {
    try {
      const { db, doc, getDoc } = await import('../firebase');
      const snap = await getDoc(doc(db, 'videos', videoId));
      if (snap.exists()) {
        const data = snap.data();
        return {
          kind: 'youtube#videoListResponse',
          items: [
            {
              id: videoId,
              snippet: {
                title: data.title,
                description: data.description,
                channelTitle: data.channelName,
                channelId: data.channelId || 'channel_' + data.uploaderUid,
                publishedAt: data.createdAt,
                thumbnails: {
                  default: { url: data.thumbnailUrl },
                  medium: { url: data.thumbnailUrl },
                  high: { url: data.thumbnailUrl },
                },
              },
              contentDetails: {
                duration: data.duration || 'PT12M00S',
              },
              statistics: {
                viewCount: String(data.views || 0),
                likeCount: String(data.likes || 0),
                commentCount: '0',
              },
              _videoUrl: data.videoUrl,
            },
          ],
        };
      }
    } catch (err) {
      console.warn('Error reading Firestore video details:', err);
    }
  }

  try {
    const response = await youtubeApi.get('/videos', {
      params: {
        part: 'snippet,contentDetails,statistics',
        id: videoId,
      },
    });
    if (response.data?.items?.[0]) {
      cacheSingleVideoDetail(videoId, response.data.items[0]);
      return response.data;
    }
  } catch (error) {
    console.warn('Error fetching video details, using curated/cached fallback:', error);
  }

  // Check curated list
  const curatedMatch = REAL_CURATED_VIDEOS.find((v) => v.id === videoId);
  if (curatedMatch) {
    return {
      kind: 'youtube#videoListResponse',
      items: [curatedMatch],
      _fromOfflineCache: true,
    };
  }

  // Check cache
  const cachedObj = getCachedVideoDetails(videoId);
  if (cachedObj) {
    return {
      kind: 'youtube#videoListResponse',
      items: [cachedObj],
      _fromOfflineCache: true,
    };
  }

  // General playable fallback
  return {
    kind: 'youtube#videoListResponse',
    items: [
      {
        id: videoId,
        snippet: {
          title: 'NESTTube Video Stream',
          channelTitle: 'Official Creator Channel',
          channelId: 'channel_creator',
          publishedAt: new Date().toISOString(),
          description: 'Enjoy high-definition YouTube video streaming on NESTTube.',
          thumbnails: {
            default: { url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` },
            medium: { url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` },
            high: { url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` },
          },
        },
        contentDetails: {
          duration: 'PT10M30S',
        },
        statistics: {
          viewCount: '1280000',
          likeCount: '85000',
          commentCount: '2400',
        },
      },
    ],
    _fromOfflineCache: true,
  };
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
    console.warn('Error fetching comments, checking cache:', error);
    const cached = getCachedComments(videoId);
    if (cached) {
      return cached;
    }
    return { kind: 'youtube#commentThreadListResponse', items: [], _fromOfflineCache: true };
  }
};
