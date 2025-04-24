import { queryOptions, useQuery } from "@tanstack/react-query";

import { api } from "../../../lib/api-client";
import { Set } from "../../../types/routes";
import { QueryConfig } from "../../../lib/react-query";

export const getSets = (): Promise<{ data: Record<string, Set> }> => {
  return api.get(`/api/sets/get_all`).then((response) => {
    const setArray = response.data;
    const setDict = setArray.reduce((dict: Record<string, Set>, set: Set) => {
      dict[set.id] = set; // Use `id` as the key
      return dict;
    }, {} as Record<string, Set>);
    return { data: setDict };
  });
};

export const getSetsQueryOptions = () => {
  return queryOptions({
    queryKey: ["sets"],
    queryFn: () => getSets(),
  });
};

type UseSetsOptions = {
  queryConfig?: QueryConfig<typeof getSetsQueryOptions>;
};

export const useSets = ({ queryConfig = {} }: UseSetsOptions = {}) => {
  return useQuery({
    ...getSetsQueryOptions(),
    ...queryConfig,
    initialData: { data: {} },
  });
};
