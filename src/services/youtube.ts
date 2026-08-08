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

export const REAL_CURATED_VIDEOS = [
  {
    id: 'L_LUpnjgPso',
    category: 'Music',
    snippet: {
      title: 'lofi hip hop radio 📚 - beats to relax/study to',
      channelTitle: 'Lofi Girl',
      channelId: 'UCvjjWv6K0qM1M8i64QWz4aw',
      publishedAt: '2026-01-01T00:00:00Z',
      thumbnails: {
        medium: { url: 'https://i.ytimg.com/vi/L_LUpnjgPso/hqdefault.jpg' },
        default: { url: 'https://i.ytimg.com/vi/L_LUpnjgPso/hqdefault.jpg' },
        high: { url: 'https://i.ytimg.com/vi/L_LUpnjgPso/hqdefault.jpg' },
      },
      description: 'Peaceful lofi hip hop beats to relax, study, work, or code to. Stream 24/7 with Lofi Girl.',
    },
    contentDetails: { duration: 'PT3H45M12S' },
    statistics: { viewCount: '78291024', likeCount: '3410000' }
  },
  {
    id: 'mP0RAo9SKZc',
    category: 'Coding',
    snippet: {
      title: 'React JS Full Course 2026 - Build 5 Production Web Apps',
      channelTitle: 'CodeWithHarry',
      channelId: 'UCeVMnSShP_Iinef-RI5NWxa',
      publishedAt: '2026-02-10T12:00:00Z',
      thumbnails: {
        medium: { url: 'https://i.ytimg.com/vi/mP0RAo9SKZc/hqdefault.jpg' },
        default: { url: 'https://i.ytimg.com/vi/mP0RAo9SKZc/hqdefault.jpg' },
        high: { url: 'https://i.ytimg.com/vi/mP0RAo9SKZc/hqdefault.jpg' },
      },
      description: 'Learn modern React 18+, Hooks, Context, Tailwind CSS, Zustand, and full-stack integration from scratch.',
    },
    contentDetails: { duration: 'PT11H24M05S' },
    statistics: { viewCount: '1820490', likeCount: '124000' }
  },
  {
    id: 'fHI8X4OX73U',
    category: 'Coding',
    snippet: {
      title: 'Python Full Course for Beginners [2026 Updated]',
      channelTitle: 'Programming with Mosh',
      channelId: 'UCWv7vMbMWH4-V0ZXgPYzbTY',
      publishedAt: '2026-01-15T09:30:00Z',
      thumbnails: {
        medium: { url: 'https://i.ytimg.com/vi/fHI8X4OX73U/hqdefault.jpg' },
        default: { url: 'https://i.ytimg.com/vi/fHI8X4OX73U/hqdefault.jpg' },
        high: { url: 'https://i.ytimg.com/vi/fHI8X4OX73U/hqdefault.jpg' },
      },
      description: 'Python tutorial for beginners - Learn Python for Web Development, Automation, and Data Science.',
    },
    contentDetails: { duration: 'PT6H14M20S' },
    statistics: { viewCount: '3890120', likeCount: '210000' }
  },
  {
    id: 'LXb3EKWsInQ',
    category: 'Tech',
    snippet: {
      title: 'The Ultimate Tech Setup 2026 - M4 Max & AI Workstation',
      channelTitle: 'Marques Brownlee',
      channelId: 'UCBJycSMxDv_9LWSk6504_0w',
      publishedAt: '2026-03-01T18:00:00Z',
      thumbnails: {
        medium: { url: 'https://i.ytimg.com/vi/LXb3EKWsInQ/hqdefault.jpg' },
        default: { url: 'https://i.ytimg.com/vi/LXb3EKWsInQ/hqdefault.jpg' },
        high: { url: 'https://i.ytimg.com/vi/LXb3EKWsInQ/hqdefault.jpg' },
      },
      description: 'Complete desk setup tour for 2026 featuring custom OLED displays, studio acoustics, and flagship hardware.',
    },
    contentDetails: { duration: 'PT18M45S' },
    statistics: { viewCount: '4920100', likeCount: '380000' }
  },
  {
    id: 'bMknfKXIFA8',
    category: 'Tech',
    snippet: {
      title: '10 JavaScript Mistakes Everyone Makes (And How to Fix Them)',
      channelTitle: 'Fireship',
      channelId: 'UCsBjURrPoezykLs9EqgamOA',
      publishedAt: '2026-02-28T16:00:00Z',
      thumbnails: {
        medium: { url: 'https://i.ytimg.com/vi/bMknfKXIFA8/hqdefault.jpg' },
        default: { url: 'https://i.ytimg.com/vi/bMknfKXIFA8/hqdefault.jpg' },
        high: { url: 'https://i.ytimg.com/vi/bMknfKXIFA8/hqdefault.jpg' },
      },
      description: 'Quick breakdown of async/await pitfalls, scope bugs, memory leaks, and modern JavaScript best practices.',
    },
    contentDetails: { duration: 'PT5M12S' },
    statistics: { viewCount: '2150900', likeCount: '195000' }
  },
  {
    id: 'sBws8MSXN7A',
    category: 'Gaming',
    snippet: {
      title: 'Top 50 Unbelievable Gaming Moments Of 2026',
      channelTitle: 'IGN',
      channelId: 'UCKy1dAqELo0BqmtFOmYy1Kw',
      publishedAt: '2026-02-20T14:00:00Z',
      thumbnails: {
        medium: { url: 'https://i.ytimg.com/vi/sBws8MSXN7A/hqdefault.jpg' },
        default: { url: 'https://i.ytimg.com/vi/sBws8MSXN7A/hqdefault.jpg' },
        high: { url: 'https://i.ytimg.com/vi/sBws8MSXN7A/hqdefault.jpg' },
      },
      description: 'From clutch multiplayer victories to breathtaking open-world discoveries, here are 2026’s top gaming plays.',
    },
    contentDetails: { duration: 'PT22M30S' },
    statistics: { viewCount: '3109200', likeCount: '185000' }
  },
  {
    id: 'kXYiU_JCYtU',
    category: 'Gaming',
    snippet: {
      title: 'GTA 6 Gameplay - Everything We Know So Far!',
      channelTitle: 'gameranx',
      channelId: 'UCA2AAGrfS_h5e1B1oM38Ubg',
      publishedAt: '2026-01-28T20:00:00Z',
      thumbnails: {
        medium: { url: 'https://i.ytimg.com/vi/kXYiU_JCYtU/hqdefault.jpg' },
        default: { url: 'https://i.ytimg.com/vi/kXYiU_JCYtU/hqdefault.jpg' },
        high: { url: 'https://i.ytimg.com/vi/kXYiU_JCYtU/hqdefault.jpg' },
      },
      description: 'Breakdown of Vice City map size, graphics physics engine, AI npc routines, and mission mechanics.',
    },
    contentDetails: { duration: 'PT15M10S' },
    statistics: { viewCount: '5890200', likeCount: '410000' }
  },
  {
    id: '8jPQjjsBb68',
    category: 'Music',
    snippet: {
      title: 'Ed Sheeran - Shape of You (Official Music Video)',
      channelTitle: 'Ed Sheeran',
      channelId: 'UC0C-w0YjGpqDXGB8IHb662A',
      publishedAt: '2025-11-10T00:00:00Z',
      thumbnails: {
        medium: { url: 'https://i.ytimg.com/vi/8jPQjjsBb68/hqdefault.jpg' },
        default: { url: 'https://i.ytimg.com/vi/8jPQjjsBb68/hqdefault.jpg' },
        high: { url: 'https://i.ytimg.com/vi/8jPQjjsBb68/hqdefault.jpg' },
      },
      description: 'Official music video for Shape of You by Ed Sheeran.',
    },
    contentDetails: { duration: 'PT4M23S' },
    statistics: { viewCount: '6200000000', likeCount: '32000000' }
  },
  {
    id: 'dQw4w9WgXcQ',
    category: 'Music',
    snippet: {
      title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
      channelTitle: 'Rick Astley',
      channelId: 'UCuAXFkgsw1L7xaCfnd5JJOw',
      publishedAt: '2025-10-25T00:00:00Z',
      thumbnails: {
        medium: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg' },
        default: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg' },
        high: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg' },
      },
      description: 'The official video for “Never Gonna Give You Up” by Rick Astley.',
    },
    contentDetails: { duration: 'PT3M33S' },
    statistics: { viewCount: '1500000000', likeCount: '16000000' }
  },
  {
    id: 'kJQP7kiw5Fk',
    category: 'Music',
    snippet: {
      title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
      channelTitle: 'Luis Fonsi',
      channelId: 'UC1I_m3OAC7P_rM1N8pIn2eA',
      publishedAt: '2025-08-12T00:00:00Z',
      thumbnails: {
        medium: { url: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg' },
        default: { url: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg' },
        high: { url: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg' },
      },
      description: 'Despacito ft. Daddy Yankee official music video.',
    },
    contentDetails: { duration: 'PT4M41S' },
    statistics: { viewCount: '8300000000', likeCount: '52000000' }
  },
  {
    id: 'fJ9rUzIMcZQ',
    category: 'Entertainment',
    snippet: {
      title: 'Queen – Bohemian Rhapsody (Official Video Remastered)',
      channelTitle: 'Queen Official',
      channelId: 'UC209C8o32Rz_q_0O4u4m-6w',
      publishedAt: '2025-07-01T00:00:00Z',
      thumbnails: {
        medium: { url: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg' },
        default: { url: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg' },
        high: { url: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg' },
      },
      description: 'Remastered HD video for Bohemian Rhapsody by Queen.',
    },
    contentDetails: { duration: 'PT5M59S' },
    statistics: { viewCount: '1700000000', likeCount: '12000000' }
  },
  {
    id: 'OPf0YbXqDm0',
    category: 'Entertainment',
    snippet: {
      title: 'I Built A $10,000,000 Secret Underground City!',
      channelTitle: 'MrBeast',
      channelId: 'UCX6OQ3DkcsbYNE6H8uQQuVA',
      publishedAt: '2026-02-14T21:00:00Z',
      thumbnails: {
        medium: { url: 'https://i.ytimg.com/vi/OPf0YbXqDm0/hqdefault.jpg' },
        default: { url: 'https://i.ytimg.com/vi/OPf0YbXqDm0/hqdefault.jpg' },
        high: { url: 'https://i.ytimg.com/vi/OPf0YbXqDm0/hqdefault.jpg' },
      },
      description: 'We spent 100 days constructing a fully self-sustained underground city deep inside a mountain.',
    },
    contentDetails: { duration: 'PT25M14S' },
    statistics: { viewCount: '84100200', likeCount: '4900000' }
  },
  {
    id: '3JZ_D3ELwOQ',
    category: 'Education',
    snippet: {
      title: 'How SpaceX Starship Reaches Orbit - Physics & Rocket Science',
      channelTitle: 'Everyday Astronaut',
      channelId: 'UC6uKrU_wqJ1E2452FZ5AnHg',
      publishedAt: '2026-02-05T15:00:00Z',
      thumbnails: {
        medium: { url: 'https://i.ytimg.com/vi/3JZ_D3ELwOQ/hqdefault.jpg' },
        default: { url: 'https://i.ytimg.com/vi/3JZ_D3ELwOQ/hqdefault.jpg' },
        high: { url: 'https://i.ytimg.com/vi/3JZ_D3ELwOQ/hqdefault.jpg' },
      },
      description: 'In-depth engineering breakdown of Raptor engines, staging dynamics, and heat shield tiles.',
    },
    contentDetails: { duration: 'PT38M10S' },
    statistics: { viewCount: '2890100', likeCount: '210000' }
  },
  {
    id: 'D9W3B1K13eU',
    category: 'Podcasts',
    snippet: {
      title: 'The Future of Artificial Intelligence & Human Consciousness',
      channelTitle: 'Lex Fridman Podcast',
      channelId: 'UCSHZKyawb77ixDdsGog4iWA',
      publishedAt: '2026-03-02T11:00:00Z',
      thumbnails: {
        medium: { url: 'https://i.ytimg.com/vi/D9W3B1K13eU/hqdefault.jpg' },
        default: { url: 'https://i.ytimg.com/vi/D9W3B1K13eU/hqdefault.jpg' },
        high: { url: 'https://i.ytimg.com/vi/D9W3B1K13eU/hqdefault.jpg' },
      },
      description: 'Deep conversation about neural networks, quantum computing, ethics, and future space exploration.',
    },
    contentDetails: { duration: 'PT2H45M00S' },
    statistics: { viewCount: '1940200', likeCount: '145000' }
  },
  {
    id: '50VNCymT-Cs',
    category: 'News',
    snippet: {
      title: 'Planet Earth 4K Ultra HD - Deep Ocean Discoveries',
      channelTitle: 'BBC Earth',
      channelId: 'UCwmZiGryb-Uee86PBEubxMA',
      publishedAt: '2026-01-10T10:00:00Z',
      thumbnails: {
        medium: { url: 'https://i.ytimg.com/vi/50VNCymT-Cs/hqdefault.jpg' },
        default: { url: 'https://i.ytimg.com/vi/50VNCymT-Cs/hqdefault.jpg' },
        high: { url: 'https://i.ytimg.com/vi/50VNCymT-Cs/hqdefault.jpg' },
      },
      description: 'Explore breathtaking underwater ecosystems narrated by David Attenborough in native 4K resolution.',
    },
    contentDetails: { duration: 'PT48M20S' },
    statistics: { viewCount: '6200100', likeCount: '390000' }
  },
  {
    id: '2g811Ko7g9I',
    category: 'News',
    snippet: {
      title: 'Global Tech & Innovation Summit 2026 Breaking Highlights',
      channelTitle: 'TechCrunch',
      channelId: 'UCC2345091_2391039',
      publishedAt: '2026-03-04T08:00:00Z',
      thumbnails: {
        medium: { url: 'https://i.ytimg.com/vi/2g811Ko7g9I/hqdefault.jpg' },
        default: { url: 'https://i.ytimg.com/vi/2g811Ko7g9I/hqdefault.jpg' },
        high: { url: 'https://i.ytimg.com/vi/2g811Ko7g9I/hqdefault.jpg' },
      },
      description: 'Latest breakthroughs in renewable energy, robotics, autonomous flight, and AI hardware.',
    },
    contentDetails: { duration: 'PT14M05S' },
    statistics: { viewCount: '980100', likeCount: '78000' }
  },
  {
    id: '0e3GPea1Tyg',
    category: 'Music',
    snippet: {
      title: 'Coldplay - Paradise (Official Video)',
      channelTitle: 'Coldplay',
      channelId: 'UCR28Yf29239102931',
      publishedAt: '2025-06-15T00:00:00Z',
      thumbnails: {
        medium: { url: 'https://i.ytimg.com/vi/0e3GPea1Tyg/hqdefault.jpg' },
        default: { url: 'https://i.ytimg.com/vi/0e3GPea1Tyg/hqdefault.jpg' },
        high: { url: 'https://i.ytimg.com/vi/0e3GPea1Tyg/hqdefault.jpg' },
      },
      description: 'Official video for Paradise by Coldplay.',
    },
    contentDetails: { duration: 'PT4M20S' },
    statistics: { viewCount: '1890000000', likeCount: '11000000' }
  },
  {
    id: '9bZkp7q19f0',
    category: 'Trending',
    snippet: {
      title: 'PSY - GANGNAM STYLE (강남스타일) M/V',
      channelTitle: 'officialpsy',
      channelId: 'UC912039102391',
      publishedAt: '2025-05-01T00:00:00Z',
      thumbnails: {
        medium: { url: 'https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg' },
        default: { url: 'https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg' },
        high: { url: 'https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg' },
      },
      description: 'Official music video for Gangnam Style by PSY.',
    },
    contentDetails: { duration: 'PT4M13S' },
    statistics: { viewCount: '5100000000', likeCount: '28000000' }
  }
];

export const getMockFallbackVideos = (category = 'All') => {
  let matched = REAL_CURATED_VIDEOS;
  if (category && category !== 'All') {
    const filtered = REAL_CURATED_VIDEOS.filter(
      (v) => v.category.toLowerCase() === category.toLowerCase()
    );
    if (filtered.length > 0) {
      matched = filtered;
    }
  }

  return {
    kind: 'youtube#videoListResponse',
    items: matched,
    _fromOfflineCache: true,
  };
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
    if (response.data?.items && response.data.items.length > 0) {
      cacheVideoItems(response.data.items);
      return response.data;
    }
    return getMockFallbackVideos(categoryId);
  } catch (error) {
    console.warn('Error fetching videos, checking cache:', error);
    const cached = getCachedFeed(categoryId || 'popular');
    if (cached && cached.items && cached.items.length > 0) {
      return cached;
    }
    return getMockFallbackVideos(categoryId);
  }
};

export const searchVideos = async (query: string, maxResults = 50, pageToken = '', channelId = '', order?: string, videoDuration?: string, videoCategoryId?: string) => {
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
        videoCategoryId: videoCategoryId || undefined
      },
    });
    if (response.data?.items && response.data.items.length > 0) {
      cacheVideoItems(response.data.items);
      return response.data;
    }
    return getMockFallbackVideos(query);
  } catch (error) {
    console.warn('Error searching videos, checking cache:', error);
    const cached = getCachedFeed(query) || getCachedFeed('All');
    if (cached && cached.items && cached.items.length > 0) {
      return cached;
    }
    return getMockFallbackVideos(query);
  }
};

/**
 * Fetch fresh category videos with query variation & optional order randomization
 */
export const CATEGORY_ID_MAP: Record<string, string> = {
  Music: '10',
  Gaming: '20',
  News: '25',
  Tech: '28',
  Entertainment: '24',
  Sports: '17',
  Education: '27',
  Movies: '1',
  Fashion: '26',
};

export const fetchCategoryVideos = async (
  category = 'All',
  maxResults = 24,
  pageToken = '',
  refreshSeed = 0
) => {
  try {
    let result: any = null;

    let searchQuery = category;
    let selectedOrder = 'relevance';
    let videoDuration: string | undefined = undefined;
    let categoryId: string | undefined = undefined;

    if (category === 'All') {
      // Simulate personalized recommendations based on usage
      const interests = [
        'technology', 'programming', 'movie reviews', 'podcast', 'documentary',
        'gaming highlights', 'standup comedy', 'science experiments', 'travel vlogs',
        'productivity', 'cooking recipes', 'car reviews', 'tech unboxing',
        'artificial intelligence', 'space exploration', 'funny clips',
        'history documentary', 'wildlife 4k', 'fitness workout'
      ];
      // Pick random interests based on refreshSeed
      const seedIndex = refreshSeed ? Math.abs(refreshSeed) : Math.floor(Math.random() * 1000);
      searchQuery = interests[seedIndex % interests.length] + ' -shorts';
      
      const orders = ['relevance', 'date', 'viewCount'];
      selectedOrder = orders[seedIndex % orders.length];
      
      // Exclude short videos (Shorts/Reels) by requiring medium or long duration
      // Randomly pick between medium (4-20m) and any (but with -shorts query) to ensure variety
      videoDuration = seedIndex % 2 === 0 ? 'medium' : undefined;
    } else {
      const variations = CATEGORY_QUERY_VARIATIONS[category] || [category];
      const queryIndex = refreshSeed ? Math.abs(refreshSeed) % variations.length : Math.floor(Math.random() * variations.length);
      searchQuery = variations[queryIndex] || category;
      const orders = ['relevance', 'date', 'viewCount', 'rating'];
      selectedOrder = orders[refreshSeed ? Math.abs(refreshSeed) % orders.length : Math.floor(Math.random() * orders.length)];
      categoryId = CATEGORY_ID_MAP[category];
    }

    const searchData = await searchVideos(searchQuery, maxResults, pageToken, '', selectedOrder, videoDuration, categoryId);

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
