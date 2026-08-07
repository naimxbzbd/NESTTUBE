import { useQuery } from '@tanstack/react-query';
import { getChannels } from '../services/youtube';

export function useChannelAvatars(channelIds: string[]) {
  const uniqueIds = Array.from(new Set(channelIds.filter(Boolean)));

  const { data: channelAvatarMap = {} } = useQuery({
    queryKey: ['channelAvatars', uniqueIds.sort().join(',')],
    queryFn: () => getChannels(uniqueIds),
    enabled: uniqueIds.length > 0,
    staleTime: 1000 * 60 * 30, // cache for 30 minutes
  });

  return channelAvatarMap;
}
