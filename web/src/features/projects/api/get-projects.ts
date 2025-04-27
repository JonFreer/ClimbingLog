import { queryOptions, useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api-client";
import { Projects } from "../../../types/routes";
import { QueryConfig } from "../../../lib/react-query";

export const getProjects = (): Promise<{data: Projects}> => {
  return api.get(`/api/projects/me`);
};

export const getProjectsQueryOptions = () => {
  return queryOptions({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
    select: (response) => response?.data ?? [],
    placeholderData: { data: [] },
  });
};

type UseProjectsOptions = {
  queryConfig?: QueryConfig<typeof getProjectsQueryOptions>;
};

export const useProjects = ({ queryConfig = {} }: UseProjectsOptions = {}) => {
  return useQuery({
    ...getProjectsQueryOptions(),
    ...queryConfig,
  });
};
