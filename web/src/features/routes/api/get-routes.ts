import { queryOptions, useQuery } from "@tanstack/react-query";

import { api } from "../../../lib/api-client";
import { Route } from "../../../types/routes";
import { QueryConfig } from "../../../lib/react-query";

export const getRoutes = (): Promise<Record<string, Route>> => {
  return api.get(`/api/routes/get_all`).then((response) => {
    const routeArray = response;
    const routeDict = routeArray.reduce(
      (dict: Record<string, Route>, set: Route) => {
        dict[set.id] = set; // Use `id` as the key
        return dict;
      },
      {} as Record<string, Route>
    );
    return routeDict;
  });
};

export const getRoutesQueryOptions = () => {
  return queryOptions({
    queryKey: ["routes"],
    queryFn: () => getRoutes(),
    placeholderData: {},
  });
};

type UseRoutesOptions = {
  queryConfig?: QueryConfig<typeof getRoutesQueryOptions>;
};

export const useRoutes = ({ queryConfig = {} }: UseRoutesOptions = {}) => {
  return useQuery({
    ...getRoutesQueryOptions(),
    ...queryConfig,
  });
};
