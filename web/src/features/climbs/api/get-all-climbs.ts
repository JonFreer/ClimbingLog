import { queryOptions, useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api-client";
import { Climb } from "../../../types/routes";
import { QueryConfig } from "../../../lib/react-query";

export const getAllClimbs = (): Promise<{ data: Climb[] }> => {
  return api.get(`/api/climbs/get_all`);
};

export const getAllClimbsQueryOptions = () => {
  return queryOptions({
    queryKey: ["climbs_all"],
    queryFn: () => getAllClimbs(),
    placeholderData: { data: [] },
    select: (response) => response?.data,
  });
};

type UseClimbsOptions = {
  queryConfig?: QueryConfig<typeof getAllClimbsQueryOptions>;
};

export const useAllClimbs = ({ queryConfig = {} }: UseClimbsOptions = {}) => {
  return useQuery({
    ...getAllClimbsQueryOptions(),
    ...queryConfig,
  });
};
