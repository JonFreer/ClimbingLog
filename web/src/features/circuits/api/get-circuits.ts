import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { Circuit } from '@/types/routes';
import { QueryConfig } from '@/lib/react-query';

export const orderedColors = [
  'Green',
  'White',
  'Blue',
  'Black',
  'Pink',
  'Red',
  'Purple',
  'Yellow',
  'Orange',
];

export const getCircuits = (): Promise<{
  data: Record<string, Circuit>;
  order: string[];
}> => {
  return api.get(`/api/circuits/get_all`).then((response) => {
    const circuitsArray = response;
    const circuitsDict = circuitsArray.reduce(
      (dict: Record<string, Circuit>, circuit: Circuit) => {
        dict[circuit.id] = circuit; // Use `id` as the key
        return dict;
      },
      {} as Record<string, Circuit>,
    );

    const order = circuitsArray
      .map((circuit: Circuit) => {
        return {
          id: circuit.id,
          name: circuit.name,
          color: circuit.color,
          order: orderedColors.indexOf(circuit.name),
        };
      })
      .sort((a, b) => a.order - b.order)
      .map((circuit: Circuit) => circuit.id);

    console.log('Circuits order', order);

    return { data: circuitsDict, order: order };
  });
};

export const getCircuitsQueryOptions = () => {
  return queryOptions({
    queryKey: ['circuits'],
    queryFn: () => getCircuits(),
    placeholderData: { data: {}, order: [] },
    // select: (response) => response,
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
