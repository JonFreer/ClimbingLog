import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { Video } from '@/types/routes';
import { QueryConfig } from '@/lib/react-query';

export const getVideos = ({
  route_id,
}: {
  route_id: string;
}): Promise<Video[]> => {
  if (!route_id) {
    return Promise.resolve([]);
  }
  return api.get(`/route_videos/${route_id}`);
};

export const getVideosQueryOptions = (route_id: string) => {
  return queryOptions({
    queryKey: ['videos', route_id],
    queryFn: () => getVideos({ route_id }),
    placeholderData: [],
  });
};

type UseVideosOptions = {
  queryConfig?: QueryConfig<typeof getVideosQueryOptions>;
  route_id: string;
};

export const useVideos = (
  { queryConfig = {}, route_id }: UseVideosOptions = { route_id: '' },
) => {
  return useQuery({
    ...getVideosQueryOptions(route_id),
    ...queryConfig,
  });
};
