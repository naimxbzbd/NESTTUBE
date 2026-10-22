/**
 * NESTTube Personalized Recommendation Engine
 * Analyzes user search queries, watch history, liked videos, and channel affinities
 * to deliver personalized video feeds for the Homepage and Player (Watch) page.
 */

import { getSearchHistory } from './searchSuggestions';
import { getWatchHistory, HistoryItem } from '../lib/watchHistory';
import { useUserStore } from '../store/useUserStore';
import { ALL_CURATED_VIDEOS, CuratedVideoItem, normalizeCategory } from './curatedVideos';

export interface UserInterestProfile {
  searchQueries: string[];
  topKeywords: string[];
  topCategories: { category: string; count: number }[];
  favoriteChannels: { channel: string; count: number }[];
  totalSignals: number;
  hasInterests: boolean;
  primaryInterestsText: string;
}

export interface RecommendedVideoItem extends CuratedVideoItem {
  recommendationScore?: number;
  recommendationReason?: string;
  recommendationType?: 'search' | 'interest' | 'channel' | 'related' | 'trending';
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'up', 'about', 'into', 'over', 'after', 'beneath', 'under',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'video', 'official', 'full', 'new', 'best', 'top',
  '2025', '2026', 'hd', '4k', 'vs', 'how', 'what', 'why', 'who', 'where'
]);

/**
 * Extract clean meaningful keywords from text
 */
function extractKeywords(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

/**
 * Build dynamic user interest profile by aggregating:
 * 1. Saved search queries from SearchInput & VoiceSearch
 * 2. Persisted watch history
 * 3. Liked videos & watch later
 */
export function getUserInterestProfile(): UserInterestProfile {
  const searchQueries = getSearchHistory();
  const watchHistory = getWatchHistory();
  const userStore = useUserStore.getState();
  const likedVideos = userStore.likedVideos || [];
  const watchLaterVideos = userStore.watchLaterVideos || [];

  const categoryScores: Record<string, number> = {};
  const channelScores: Record<string, number> = {};
  const keywordScores: Record<string, number> = {};

  // 1. Process Search Queries (highest immediate intent weight: 4.0)
  searchQueries.forEach((q, idx) => {
    const recencyWeight = Math.max(1, 4 - idx * 0.3);
    const cat = normalizeCategory(q);
    if (cat && cat !== 'All') {
      categoryScores[cat] = (categoryScores[cat] || 0) + recencyWeight * 3;
    }

    extractKeywords(q).forEach((kw) => {
      keywordScores[kw] = (keywordScores[kw] || 0) + recencyWeight * 2;
    });
  });

  // 2. Process Watch History (weight: 2.5)
  watchHistory.slice(0, 30).forEach((item: HistoryItem, idx) => {
    const recencyWeight = Math.max(1, 3 - idx * 0.1);

    if (item.channelName) {
      channelScores[item.channelName] = (channelScores[item.channelName] || 0) + recencyWeight * 2;
    }

    const cat = normalizeCategory(item.title + ' ' + (item.description || ''));
    if (cat && cat !== 'All') {
      categoryScores[cat] = (categoryScores[cat] || 0) + recencyWeight * 2;
    }

    extractKeywords(item.title).forEach((kw) => {
      keywordScores[kw] = (keywordScores[kw] || 0) + recencyWeight * 1.5;
    });
  });

  // 3. Process Liked Videos (weight: 2.0)
  likedVideos.forEach((item) => {
    if (item.channelName) {
      channelScores[item.channelName] = (channelScores[item.channelName] || 0) + 2.5;
    }
    const cat = normalizeCategory(item.title);
    if (cat && cat !== 'All') {
      categoryScores[cat] = (categoryScores[cat] || 0) + 2.5;
    }
    extractKeywords(item.title).forEach((kw) => {
      keywordScores[kw] = (keywordScores[kw] || 0) + 2;
    });
  });

  // 4. Process Watch Later Videos (weight: 1.5)
  watchLaterVideos.forEach((item) => {
    const cat = normalizeCategory(item.title);
    if (cat && cat !== 'All') {
      categoryScores[cat] = (categoryScores[cat] || 0) + 1.5;
    }
    extractKeywords(item.title).forEach((kw) => {
      keywordScores[kw] = (keywordScores[kw] || 0) + 1.2;
    });
  });

  // Sort categories by affinity score
  const topCategories = Object.entries(categoryScores)
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => ({ category, count }));

  // Sort channels by affinity score
  const favoriteChannels = Object.entries(channelScores)
    .sort((a, b) => b[1] - a[1])
    .map(([channel, count]) => ({ channel, count }));

  // Sort keywords
  const topKeywords = Object.entries(keywordScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([kw]) => kw);

  const totalSignals =
    searchQueries.length + watchHistory.length + likedVideos.length + watchLaterVideos.length;

  // Build user facing interest summary chips
  const primaryInterestsList: string[] = [];
  if (searchQueries[0]) {
    primaryInterestsList.push(`"${searchQueries[0]}"`);
  }
  topCategories.slice(0, 2).forEach((c) => {
    if (!primaryInterestsList.includes(c.category)) {
      primaryInterestsList.push(c.category);
    }
  });
  if (favoriteChannels[0] && primaryInterestsList.length < 3) {
    primaryInterestsList.push(favoriteChannels[0].channel);
  }

  const primaryInterestsText = primaryInterestsList.join(' • ');

  return {
    searchQueries,
    topKeywords,
    topCategories,
    favoriteChannels,
    totalSignals,
    hasInterests: totalSignals > 0,
    primaryInterestsText,
  };
}

/**
 * Score a candidate video against the user's interest profile
 */
export function scoreVideoForUser(
  video: CuratedVideoItem,
  profile: UserInterestProfile
): { score: number; reason: string; type: RecommendedVideoItem['recommendationType'] } {
  let score = 0;
  let reason = 'Trending pick';
  let type: RecommendedVideoItem['recommendationType'] = 'trending';

  const titleLower = video.snippet.title.toLowerCase();
  const descLower = (video.snippet.description || '').toLowerCase();
  const channelLower = video.snippet.channelTitle.toLowerCase();
  const videoCat = video.category;

  // 1. Search Query direct match (strongest signal)
  for (const query of profile.searchQueries) {
    const qLower = query.toLowerCase();
    if (titleLower.includes(qLower)) {
      score += 75;
      reason = `From your search: "${query}"`;
      type = 'search';
      break;
    }
    const qWords = extractKeywords(qLower);
    const matchingWords = qWords.filter((w) => titleLower.includes(w) || descLower.includes(w));
    if (matchingWords.length > 0) {
      score += matchingWords.length * 20;
      reason = `Matches search for "${query}"`;
      type = 'search';
    }
  }

  // 2. Favorite Channel match
  const channelMatch = profile.favoriteChannels.find(
    (c) => c.channel.toLowerCase() === channelLower
  );
  if (channelMatch) {
    score += 45 + Math.min(20, channelMatch.count * 3);
    if (type !== 'search') {
      reason = `Because you watch ${video.snippet.channelTitle}`;
      type = 'channel';
    }
  }

  // 3. Category affinity match
  const catMatch = profile.topCategories.find((c) => c.category === videoCat);
  if (catMatch) {
    score += 35 + Math.min(25, catMatch.count * 2);
    if (type === 'trending') {
      reason = `Recommended based on your interest in ${videoCat}`;
      type = 'interest';
    }
  }

  // 4. Keyword matches from watch/liked history
  let keywordMatchCount = 0;
  for (const kw of profile.topKeywords) {
    if (titleLower.includes(kw) || descLower.includes(kw)) {
      keywordMatchCount++;
      score += 15;
    }
  }

  if (keywordMatchCount >= 2 && type === 'trending') {
    reason = 'Recommended for you';
    type = 'interest';
  }

  // 5. Popularity baseline (slight tie breaker)
  const views = parseInt(video.statistics.viewCount, 10) || 0;
  score += Math.min(10, Math.log10(views + 1));

  return { score, reason, type };
}

/**
 * Generate a personalized homepage feed tailored to user searches and interests
 */
export function getPersonalizedHomeFeed(
  category = 'All',
  pageToken = '',
  pageSize = 24,
  refreshSeed = 0
) {
  const profile = getUserInterestProfile();
  const normalized = normalizeCategory(category);

  // If user has zero history yet, return standard curated feed
  if (!profile.hasInterests && normalized === 'All') {
    return null;
  }

  let candidates: CuratedVideoItem[];
  if (normalized !== 'All') {
    candidates = ALL_CURATED_VIDEOS.filter((v) => v.category === normalized);
  } else {
    candidates = [...ALL_CURATED_VIDEOS];
  }

  // Score all candidate videos
  const scoredVideos: RecommendedVideoItem[] = candidates.map((video) => {
    const { score, reason, type } = scoreVideoForUser(video, profile);
    return {
      ...video,
      recommendationScore: score,
      recommendationReason: reason,
      recommendationType: type,
    };
  });

  // Sort by recommendation score descending
  scoredVideos.sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0));

  // If a refresh seed is present, slightly shuffle within top bands to maintain variety
  let rankedItems = scoredVideos;
  if (refreshSeed > 0) {
    rankedItems = scoredVideos.map((item, idx) => {
      // High-scoring items stay at top with minor perturbation
      const jitter = Math.sin(refreshSeed + idx) * 8;
      return {
        ...item,
        recommendationScore: (item.recommendationScore || 0) + jitter,
      };
    }).sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0));
  }

  // Deduplicate ranked items by video ID
  const seenRankedIds = new Set<string>();
  const uniqueRanked = rankedItems.filter((item) => {
    if (!item?.id || seenRankedIds.has(item.id)) return false;
    seenRankedIds.add(item.id);
    return true;
  });

  // Pagination support
  const pageIndex = pageToken ? parseInt(pageToken, 10) || 0 : 0;
  const start = pageIndex * pageSize;
  const pagedItems = uniqueRanked.slice(start, start + pageSize);

  const hasNext = start + pageSize < uniqueRanked.length;
  const nextPageToken = hasNext ? String(pageIndex + 1) : undefined;

  return {
    kind: 'youtube#videoListResponse',
    items: pagedItems,
    nextPageToken,
    pageInfo: {
      totalResults: rankedItems.length,
      resultsPerPage: pageSize,
    },
    _isPersonalized: true,
    _interestSummary: profile.primaryInterestsText,
    _topCategories: profile.topCategories.map((c) => c.category),
    _fromOfflineCache: true,
  };
}

/**
 * Generate intelligent recommendations for the Watch (Player) page
 * Combines:
 * - Content similarity (same category, shared topics, same creator)
 * - User search history & interest affinity
 */
export function getPlayerRecommendations(
  currentVideoId?: string,
  currentVideoTitle?: string,
  currentChannelTitle?: string,
  currentCategory?: string,
  filterTab: 'All' | 'Related' | 'For You' | 'From Channel' | 'From Searches' = 'All',
  maxResults = 25
): RecommendedVideoItem[] {
  const profile = getUserInterestProfile();
  const titleLower = (currentVideoTitle || '').toLowerCase();
  const currentKeywords = extractKeywords(titleLower);
  const normalizedCurrentCat = normalizeCategory(currentCategory || currentVideoTitle || '');

  const otherVideos = ALL_CURATED_VIDEOS.filter((v) => v.id !== currentVideoId);

  const scored: RecommendedVideoItem[] = otherVideos.map((video) => {
    let score = 0;
    let reason = 'Related video';
    let type: RecommendedVideoItem['recommendationType'] = 'related';

    const vTitleLower = video.snippet.title.toLowerCase();
    const vChannel = video.snippet.channelTitle.toLowerCase();
    const isSameChannel = currentChannelTitle && vChannel === currentChannelTitle.toLowerCase();
    const isSameCat = video.category === normalizedCurrentCat;

    // A. Content similarity to the currently playing video
    if (isSameChannel) {
      score += 55;
      reason = `More from ${video.snippet.channelTitle}`;
      type = 'channel';
    }

    if (isSameCat) {
      score += 35;
      if (!isSameChannel) {
        reason = `Related to ${video.category}`;
      }
    }

    // Keyword overlap with current video
    let currentOverlap = 0;
    currentKeywords.forEach((kw) => {
      if (vTitleLower.includes(kw)) {
        currentOverlap++;
        score += 20;
      }
    });

    if (currentOverlap >= 2 && !isSameChannel) {
      reason = 'Similar content';
      type = 'related';
    }

    // B. User Interest & Search Affinity Boost
    const userScoreObj = scoreVideoForUser(video, profile);
    if (userScoreObj.score > 25) {
      score += userScoreObj.score * 0.7; // Blended weight
      // If user has a strong search or interest signal for this video, promote the reason
      if (userScoreObj.type === 'search') {
        reason = userScoreObj.reason;
        type = 'search';
      } else if (userScoreObj.type === 'interest' && !isSameChannel && currentOverlap < 2) {
        reason = userScoreObj.reason;
        type = 'interest';
      }
    }

    // Baseline view count tie breaker
    const views = parseInt(video.statistics.viewCount, 10) || 0;
    score += Math.min(8, Math.log10(views + 1));

    return {
      ...video,
      recommendationScore: score,
      recommendationReason: reason,
      recommendationType: type,
    };
  });

  // Apply Sidebar Filter Tab if selected
  let filtered = scored;
  if (filterTab === 'Related') {
    filtered = scored.filter((v) => v.recommendationType === 'related' || v.category === normalizedCurrentCat);
  } else if (filterTab === 'For You') {
    filtered = scored.filter((v) => v.recommendationType === 'interest' || v.recommendationType === 'search');
  } else if (filterTab === 'From Channel') {
    filtered = scored.filter((v) => v.recommendationType === 'channel');
  } else if (filterTab === 'From Searches') {
    filtered = scored.filter((v) => v.recommendationType === 'search');
  }

  // If the specific filter resulted in very few items, fall back to scored
  if (filtered.length < 3) {
    filtered = scored;
  }

  // Sort descending by calculated recommendation score
  filtered.sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0));

  // Deduplicate before slicing to guarantee unique items
  const seenPlayerIds = new Set<string>();
  const uniquePlayerVideos: RecommendedVideoItem[] = [];
  for (const item of filtered) {
    if (item && item.id && !seenPlayerIds.has(item.id)) {
      seenPlayerIds.add(item.id);
      uniquePlayerVideos.push(item);
    }
  }

  return uniquePlayerVideos.slice(0, maxResults);
}
