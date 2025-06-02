import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { Set } from '@/types/routes';
import { QueryConfig } from '@/lib/react-query';

export const getSets = (gym_id: string): Promise<Record<string, Set>> => {
  return api.get(`/sets/${gym_id}`).then((response) => {
    const setArray = Array.isArray(response) ? response : [];
    const setDict = setArray.reduce((dict: Record<string, Set>, set: Set) => {
      dict[set.id] = set; // Use `id` as the key
      return dict;
    }, {} as Record<string, Set>);
    return setDict;
  });
};

export const getSetsQueryOptions = (gym_id: string) => {
  return queryOptions({
    queryKey: ['sets', gym_id],
    queryFn: () => getSets(gym_id),
    placeholderData: {},
  });
};

type UseSetsOptions = {
  queryConfig?: QueryConfig<typeof getSetsQueryOptions>;
};

export const useSets = ({
  gym_id,
  queryConfig = {},
}: UseSetsOptions & { gym_id: string }) => {
  return useQuery({
    ...getSetsQueryOptions(gym_id),
    ...queryConfig,
  });
};
