import { queryOptions, useQuery } from "@tanstack/react-query";

import { api } from "../../../lib/api-client";
import { Route } from "../../../types/routes";
import { QueryConfig } from "../../../lib/react-query";

export const getRoutes = (): Promise<{ data: Route[] }> => {
  return api.get(`/api/routes/get_all`);
};

export const getRoutesQueryOptions = () => {
  return queryOptions({
    queryKey: ["routes"],
    queryFn: () => getRoutes(),
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
