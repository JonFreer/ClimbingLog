import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { Video } from '@/types/routes';
import { QueryConfig } from '@/lib/react-query';

export const getAllVideos = (): Promise<Video[]> => {
  return api.get(`/videos/`);
};

export const getAllVideosQueryOptions = () => {
  return queryOptions({
    queryKey: ['videos'],
    queryFn: () => getAllVideos(),
    placeholderData: [],
  });
};

type UseAllVideosOptions = {
  queryConfig?: QueryConfig<typeof getAllVideosQueryOptions>;
};

export const useAllVideos = ({
  queryConfig = {},
}: UseAllVideosOptions = {}) => {
  return useQuery({
    ...getAllVideosQueryOptions(),
    ...queryConfig,
  });
};
