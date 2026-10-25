export type UserRole = 'viewer' | 'creator' | 'admin';

export interface AppUserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  channelName?: string;
  channelHandle?: string;
  bio?: string;
  bannerUrl?: string;
  isPremium?: boolean;
  subscribersCount?: number;
  totalViews?: number;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  uploaderUid: string;
  uploaderEmail: string;
  channelName: string;
  channelId: string;
  category: string;
  visibility: 'public' | 'unlisted' | 'private';
  views: number;
  likes: number;
  duration: string;
  status: 'approved' | 'pending' | 'flagged' | 'removed';
  tags: string[];
  createdAt: string;
}

export interface VideoReport {
  id: string;
  videoId: string;
  videoTitle: string;
  reason: string;
  reportedByUid: string;
  reportedByEmail: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface PlatformMetrics {
  totalVideos: number;
  totalUsers: number;
  totalViews: number;
  totalReports: number;
  updatedAt: string;
}
