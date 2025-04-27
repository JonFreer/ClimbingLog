import { queryOptions, useQuery } from "@tanstack/react-query";

import { api } from "../../../lib/api-client";
import { Circuit, Route } from "../../../types/routes";
import { QueryConfig } from "../../../lib/react-query";

export const getCircuits = (): Promise<{ data: Record<string, Circuit> }> => {
  return api.get(`/api/circuits/get_all`).then((response) => {
    const circuitsArray = response.data;
    const circuitsDict = circuitsArray.reduce(
      (dict: Record<string, Circuit>, circuit: Circuit) => {
        dict[circuit.id] = circuit; // Use `id` as the key
        return dict;
      },
      {} as Record<string, Circuit>
    );
    return { data: circuitsDict };
  });
};

export const getCircuitsQueryOptions = () => {
  return queryOptions({
    queryKey: ["circuits"],
    queryFn: () => getCircuits(),
    placeholderData: { data: {} },
    select: (response) => response?.data,
  });
};

type UseCircuitsOptions = {
  queryConfig?: QueryConfig<typeof getCircuitsQueryOptions>;
};

export const useCircuits = ({ queryConfig = {} }: UseCircuitsOptions = {}) => {
  return useQuery({
    ...getCircuitsQueryOptions(),
    ...queryConfig,
  });
};
