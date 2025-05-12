import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Activity, Meta } from '@/types/routes';

export const getActivities = ({
  page = 1,
}: {
  page?: number;
}): Promise<{ data: Activity[]; meta: Meta }> => {
  return api.get(`/api/activities/get_paginated`, { params: { page } });
};

export const getInfiniteActivitiesQueryOptions = () => {
  return infiniteQueryOptions({
    queryKey: ['activities'],
    queryFn: ({ pageParam = 1 }) => {
      return getActivities({ page: pageParam as number });
    },
    getNextPageParam: (lastPage: { data: Activity[]; meta: Meta }) => {
      if (lastPage?.meta?.page === lastPage?.meta?.totalPages) return undefined;
      const nextPage = lastPage.meta.page + 1;
      return nextPage;
    },
    initialPageParam: 1,
  });
};

export const useInfiniteActivities = () => {
  return useInfiniteQuery({
    ...getInfiniteActivitiesQueryOptions(),
  });
};
