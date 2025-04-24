import { queryOptions, useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api-client";
import { Climb } from "../../../types/routes";
import { QueryConfig } from "../../../lib/react-query";

export const getClimbs = (): Promise<{ data: Climb[] }> => {
  return api.get(`/api/climbs/get_all`);
};

export const getClimbsQueryOptions = () => {
  return queryOptions({
    queryKey: ["climbs"],
    queryFn: () => getClimbs(),
  });
};

type UseClimbsOptions = {
  queryConfig?: QueryConfig<typeof getClimbsQueryOptions>;
};

export const useClimbs = ({ queryConfig = {} }: UseClimbsOptions = {}) => {
  return useQuery({
    ...getClimbsQueryOptions(),
    ...queryConfig,
    initialData: { data: [] },
  });
};
