import { create } from 'zustand';
import { getVideos, searchVideos, getChannelDetails } from '../services/youtube';

interface YoutubeState {
  videos: any[];
  searchResults: any[];
  channelData: any | null;
  
  isLoadingVideos: boolean;
  isLoadingSearch: boolean;
  isLoadingChannel: boolean;
  
  videosError: string | null;
  searchError: string | null;
  channelError: string | null;
  
  fetchVideos: (categoryId?: string, maxResults?: number, pageToken?: string) => Promise<void>;
  fetchSearchResults: (query: string, maxResults?: number, pageToken?: string) => Promise<void>;
  fetchChannelData: (channelId: string) => Promise<void>;
}

export const useYoutubeStore = create<YoutubeState>((set) => ({
  videos: [],
  searchResults: [],
  channelData: null,
  
  isLoadingVideos: false,
  isLoadingSearch: false,
  isLoadingChannel: false,
  
  videosError: null,
  searchError: null,
  channelError: null,
  
  fetchVideos: async (categoryId = '', maxResults = 50, pageToken = '') => {
    set({ isLoadingVideos: true, videosError: null });
    try {
      const data = await getVideos(categoryId, maxResults, pageToken);
      set({ videos: data.items, isLoadingVideos: false });
    } catch (error: any) {
      set({ videosError: error.message || 'Failed to fetch videos', isLoadingVideos: false });
    }
  },
  
  fetchSearchResults: async (query: string, maxResults = 50, pageToken = '') => {
    set({ isLoadingSearch: true, searchError: null });
    try {
      const data = await searchVideos(query, maxResults, pageToken);
      set({ searchResults: data.items, isLoadingSearch: false });
    } catch (error: any) {
      set({ searchError: error.message || 'Failed to search videos', isLoadingSearch: false });
    }
  },
  
  fetchChannelData: async (channelId: string) => {
    set({ isLoadingChannel: true, channelError: null });
    try {
      const data = await getChannelDetails(channelId);
      set({ channelData: data.items?.[0] || null, isLoadingChannel: false });
    } catch (error: any) {
      set({ channelError: error.message || 'Failed to fetch channel data', isLoadingChannel: false });
    }
  },
}));
