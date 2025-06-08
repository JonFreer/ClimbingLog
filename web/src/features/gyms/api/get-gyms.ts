import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Gym } from '@/types/gym';

export const getGyms = (): Promise<Record<string, Gym>> => {
  return api.get(`/api/gyms`).then((response) => {
    const gymArray = Array.isArray(response) ? response : [];
    const gymDict = gymArray.reduce((dict: Record<string, Gym>, gym: Gym) => {
      gym.layout = JSON.parse(gym.layout);
      dict[gym.id] = gym; // Use `id` as the key
      return dict;
    }, {} as Record<string, Gym>);

    return gymDict;
  });
};

export const getGymsQueryOptions = () => {
  return queryOptions({
    queryKey: ['gyms'],
    queryFn: () => getGyms(),
    placeholderData: {},
  });
};

type UseGymsOptions = {
  queryConfig?: QueryConfig<typeof getGymsQueryOptions>;
};

export const useGyms = ({ queryConfig = {} }: UseGymsOptions = {}) => {
  return useQuery({
    ...getGymsQueryOptions(),
    ...queryConfig,
  });
};
