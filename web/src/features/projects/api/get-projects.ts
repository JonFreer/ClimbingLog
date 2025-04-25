import { queryOptions, useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api-client";
import { Projects } from "../../../types/routes";
import { QueryConfig } from "../../../lib/react-query";

export const getProjects = (): Promise<Projects> => {
  return api.get(`/api/projects/me`).then((response) => response.data);
};

export const getProjectsQueryOptions = () => {
  return queryOptions({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });
};

type UseProjectsOptions = {
  queryConfig?: QueryConfig<typeof getProjectsQueryOptions>;
};

export const useProjects = ({ queryConfig = {} }: UseProjectsOptions = {}) => {
  return useQuery({
    ...getProjectsQueryOptions(),
    ...queryConfig,
    initialData: [],
  });
};
