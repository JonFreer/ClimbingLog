import { queryOptions, useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api-client";
import { Activity } from "../../../types/routes";
import { QueryConfig } from "../../../lib/react-query";

export const getActivities = (): Promise<{ data: Activity[] }> => {
  return api.get(`/api/activities/get_all`);
};

export const getActivitiesQueryOptions = () => {
  return queryOptions({
    queryKey: ["activities"],
    queryFn: () => getActivities(),
    select: (response) => response?.data ?? [],
    placeholderData: { data: [] },
  });
};

type UseActivitiesOptions = {
  queryConfig?: QueryConfig<typeof getActivitiesQueryOptions>;
};

export const useActivities = ({
  queryConfig = {},
}: UseActivitiesOptions = {}) => {
  return useQuery({
    ...getActivitiesQueryOptions(),
    ...queryConfig,
  });
};
