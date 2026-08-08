import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface VideoItem {
  id: string;
  title: string;
  channelName: string;
  channelId?: string;
  views?: string | number;
  publishedAt?: string;
  duration?: string;
  thumbnailUrl?: string;
  avatarColor?: string;
  description?: string;
}

export interface ChannelSubscription {
  id: string;
  title: string;
  avatarUrl?: string;
  handle?: string;
  subscribedAt: number;
}

export interface CustomPlaylist {
  id: string;
  title: string;
  description?: string;
  createdAt: number;
  videos: VideoItem[];
}

export interface UserComment {
  id: string;
  videoId: string;
  author: string;
  authorAvatar?: string;
  text: string;
  createdAt: string;
  likes: number;
}

export interface UserNotification {
  id: string;
  title: string;
  channelTitle: string;
  timeAgo: string;
  isRead: boolean;
  videoId?: string;
  thumbnailUrl?: string;
  avatarUrl?: string;
}

export interface UserAccount {
  email: string;
  password?: string;
  name: string;
  isPremium: boolean;
}

export interface UserStoreState {
  // Subscriptions
  subscribedChannels: ChannelSubscription[];
  toggleSubscribe: (channel: ChannelSubscription) => void;
  isSubscribed: (channelId: string) => boolean;

  // Watch Later
  watchLaterVideos: VideoItem[];
  toggleWatchLater: (video: VideoItem) => void;
  isInWatchLater: (videoId: string) => boolean;

  // Liked / Disliked Videos
  likedVideos: VideoItem[];
  dislikedVideoIds: string[];
  toggleLikeVideo: (video: VideoItem) => void;
  toggleDislikeVideo: (videoId: string) => boolean; // returns true if now disliked
  isLiked: (videoId: string) => boolean;
  isDisliked: (videoId: string) => boolean;

  // Custom Playlists
  playlists: CustomPlaylist[];
  createPlaylist: (title: string, description?: string, initialVideo?: VideoItem) => void;
  deletePlaylist: (playlistId: string) => void;
  addVideoToPlaylist: (playlistId: string, video: VideoItem) => void;
  removeVideoFromPlaylist: (playlistId: string, videoId: string) => void;
  isVideoInPlaylist: (playlistId: string, videoId: string) => boolean;

  // Custom Uploads
  customVideos: VideoItem[];
  addCustomVideo: (video: Omit<VideoItem, 'id'> & { videoUrl?: string }) => void;

  // User Comments
  customComments: Record<string, UserComment[]>;
  addComment: (videoId: string, text: string) => void;
  likeComment: (videoId: string, commentId: string) => void;

  // Notifications
  notifications: UserNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  unreadNotificationCount: () => number;

  // Stats / Watch time
  watchTimeMinutesToday: number;
  addWatchTime: (minutes: number) => void;

  // User Auth
  accounts: UserAccount[];
  currentUser: UserAccount | null;
  register: (email: string, password: string, name: string) => boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  applyCoupon: (couponCode: string) => boolean;

  // Premium / Ad-Free Membership
  isPremium: boolean;
  togglePremium: () => void;
  setIsPremium: (isPremium: boolean) => void;
}

export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      subscribedChannels: [
        {
          id: 'UCX6OQ3DkcsbYNE6H8uQQuVA',
          title: 'MrBeast',
          handle: '@MrBeast',
          subscribedAt: Date.now() - 86400000 * 30,
        },
        {
          id: 'UC8butISFwT-Wl7EV0hUK0BQ',
          title: 'freeCodeCamp.org',
          handle: '@freecodecamp',
          subscribedAt: Date.now() - 86400000 * 15,
        },
      ],
      toggleSubscribe: (channel) => {
        const { subscribedChannels } = get();
        const exists = subscribedChannels.some((c) => c.id === channel.id);
        if (exists) {
          set({
            subscribedChannels: subscribedChannels.filter((c) => c.id !== channel.id),
          });
        } else {
          set({
            subscribedChannels: [{ ...channel, subscribedAt: Date.now() }, ...subscribedChannels],
          });
        }
      },
      isSubscribed: (channelId) => {
        return get().subscribedChannels.some((c) => c.id === channelId);
      },

      watchLaterVideos: [],
      toggleWatchLater: (video) => {
        const { watchLaterVideos } = get();
        const exists = watchLaterVideos.some((v) => v.id === video.id);
        if (exists) {
          set({ watchLaterVideos: watchLaterVideos.filter((v) => v.id !== video.id) });
        } else {
          set({ watchLaterVideos: [video, ...watchLaterVideos] });
        }
      },
      isInWatchLater: (videoId) => {
        return get().watchLaterVideos.some((v) => v.id === videoId);
      },

      likedVideos: [],
      dislikedVideoIds: [],
      toggleLikeVideo: (video) => {
        const { likedVideos, dislikedVideoIds } = get();
        const isLikedAlready = likedVideos.some((v) => v.id === video.id);
        if (isLikedAlready) {
          set({ likedVideos: likedVideos.filter((v) => v.id !== video.id) });
        } else {
          set({
            likedVideos: [video, ...likedVideos],
            dislikedVideoIds: dislikedVideoIds.filter((id) => id !== video.id),
          });
        }
      },
      toggleDislikeVideo: (videoId) => {
        const { dislikedVideoIds, likedVideos } = get();
        const isDislikedAlready = dislikedVideoIds.includes(videoId);
        if (isDislikedAlready) {
          set({ dislikedVideoIds: dislikedVideoIds.filter((id) => id !== videoId) });
          return false;
        } else {
          set({
            dislikedVideoIds: [...dislikedVideoIds, videoId],
            likedVideos: likedVideos.filter((v) => v.id !== videoId),
          });
          return true;
        }
      },
      isLiked: (videoId) => {
        return get().likedVideos.some((v) => v.id === videoId);
      },
      isDisliked: (videoId) => {
        return get().dislikedVideoIds.includes(videoId);
      },

      playlists: [
        {
          id: 'favorites',
          title: 'Favorites',
          description: 'My favorite YouTube videos',
          createdAt: Date.now() - 86400000 * 5,
          videos: [],
        },
        {
          id: 'tech-coding',
          title: 'Coding & Tech',
          description: 'Web development, AI, and programming tutorials',
          createdAt: Date.now() - 86400000 * 2,
          videos: [],
        },
      ],
      createPlaylist: (title, description, initialVideo) => {
        const newPlaylist: CustomPlaylist = {
          id: `playlist_${Date.now()}`,
          title: title.trim() || 'New Playlist',
          description,
          createdAt: Date.now(),
          videos: initialVideo ? [initialVideo] : [],
        };
        set((state) => ({ playlists: [newPlaylist, ...state.playlists] }));
      },
      deletePlaylist: (playlistId) => {
        set((state) => ({
          playlists: state.playlists.filter((p) => p.id !== playlistId),
        }));
      },
      addVideoToPlaylist: (playlistId, video) => {
        set((state) => ({
          playlists: state.playlists.map((p) => {
            if (p.id === playlistId && !p.videos.some((v) => v.id === video.id)) {
              return { ...p, videos: [video, ...p.videos] };
            }
            return p;
          }),
        }));
      },
      removeVideoFromPlaylist: (playlistId, videoId) => {
        set((state) => ({
          playlists: state.playlists.map((p) => {
            if (p.id === playlistId) {
              return { ...p, videos: p.videos.filter((v) => v.id !== videoId) };
            }
            return p;
          }),
        }));
      },
      isVideoInPlaylist: (playlistId, videoId) => {
        const playlist = get().playlists.find((p) => p.id === playlistId);
        return playlist ? playlist.videos.some((v) => v.id === videoId) : false;
      },

      customVideos: [],
      addCustomVideo: (video) => {
        const newVideo: VideoItem = {
          ...video,
          id: `custom_${Date.now()}`,
          views: '1',
          publishedAt: new Date().toISOString(),
          duration: video.duration || '05:30',
          avatarColor: 'bg-emerald-600',
        };
        set((state) => ({ customVideos: [newVideo, ...state.customVideos] }));
      },

      customComments: {},
      addComment: (videoId, text) => {
        if (!text.trim()) return;
        const newComment: UserComment = {
          id: `comment_${Date.now()}`,
          videoId,
          author: 'Naim Xbz',
          authorAvatar: '',
          text: text.trim(),
          createdAt: new Date().toISOString(),
          likes: 0,
        };
        set((state) => {
          const current = state.customComments[videoId] || [];
          return {
            customComments: {
              ...state.customComments,
              [videoId]: [newComment, ...current],
            },
          };
        });
      },
      likeComment: (videoId, commentId) => {
        set((state) => {
          const comments = state.customComments[videoId] || [];
          const updated = comments.map((c) =>
            c.id === commentId ? { ...c, likes: c.likes + 1 } : c
          );
          return {
            customComments: { ...state.customComments, [videoId]: updated },
          };
        });
      },

      notifications: [
        {
          id: 'n1',
          title: 'uploaded a new video: Building a YouTube Clone in 2026',
          channelTitle: 'freeCodeCamp.org',
          timeAgo: '2 hours ago',
          isRead: false,
          videoId: 'dQw4w9WgXcQ',
        },
        {
          id: 'n2',
          title: 'I Gave $1,000,000 To Random People!',
          channelTitle: 'MrBeast',
          timeAgo: '1 day ago',
          isRead: false,
          videoId: '0e3GPea1Tyg',
        },
        {
          id: 'n3',
          title: 'Welcome to NESTTUBE! Check out trending videos today.',
          channelTitle: 'NESTTUBE Team',
          timeAgo: '3 days ago',
          isRead: true,
        },
      ],
      markNotificationAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        }));
      },
      markAllNotificationsAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        }));
      },
      unreadNotificationCount: () => {
        return get().notifications.filter((n) => !n.isRead).length;
      },

      watchTimeMinutesToday: 45,
      addWatchTime: (minutes) => {
        set((state) => ({ watchTimeMinutesToday: state.watchTimeMinutesToday + minutes }));
      },

      accounts: [],
      currentUser: null,
      register: (email, password, name) => {
        const { accounts } = get();
        if (accounts.some(a => a.email === email)) return false;
        
        const newUser = { email, password, name, isPremium: false };
        set({
          accounts: [...accounts, newUser],
          currentUser: newUser,
          isPremium: false
        });
        return true;
      },
      login: (email, password) => {
        const { accounts } = get();
        const user = accounts.find(a => a.email === email && a.password === password);
        if (user) {
          set({ currentUser: user, isPremium: user.isPremium });
          return true;
        }
        return false;
      },
      logout: () => {
        set({ currentUser: null, isPremium: false });
      },
      applyCoupon: (couponCode) => {
        const { currentUser, accounts } = get();
        if (!currentUser) return false;
        
        // Let's say valid coupon is 'PREMIUM2026' or 'FREEPREMIUM'
        const validCoupons = ['PREMIUM2026', 'FREEPREMIUM'];
        if (validCoupons.includes(couponCode.toUpperCase())) {
          const updatedUser = { ...currentUser, isPremium: true };
          set({
            currentUser: updatedUser,
            isPremium: true,
            accounts: accounts.map(a => a.email === currentUser.email ? updatedUser : a)
          });
          return true;
        }
        return false;
      },

      isPremium: false,
      togglePremium: () => set((state) => ({ isPremium: !state.isPremium })),
      setIsPremium: (isPremium: boolean) => set({ isPremium }),
    }),
    {
      name: 'nesttube_user_store_v1',
    }
  )
);
