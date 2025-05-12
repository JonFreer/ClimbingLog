import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import { Climb } from '../../../types/routes';
import { QueryConfig } from '../../../lib/react-query';

export const getClimbs = (): Promise<Climb[]> => {
  return api.get(`/api/climbs/me`);
};

export const getClimbsQueryOptions = () => {
  return queryOptions({
    queryKey: ['climbs'],
    queryFn: () => getClimbs(),
    placeholderData: [],
  });
};

type UseClimbsOptions = {
  queryConfig?: QueryConfig<typeof getClimbsQueryOptions>;
};

export const useClimbs = ({ queryConfig = {} }: UseClimbsOptions = {}) => {
  return useQuery({
    ...getClimbsQueryOptions(),
    ...queryConfig,
  });
};
