/**
 * Generates a clean fallback channel avatar URL if YouTube API image is missing or loading.
 */
export function getFallbackChannelAvatar(channelName?: string, channelId?: string): string {
  const name = (channelName || channelId || 'YouTube Channel').trim();
  const encodedName = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encodedName}&background=2563eb&color=fff&bold=true&font-size=0.45&rounded=true`;
}
