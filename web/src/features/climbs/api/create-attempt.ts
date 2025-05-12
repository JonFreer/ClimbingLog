import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import { MutationConfig } from '../../../lib/react-query';
import { Route } from '../../../types/routes';

import { getClimbsQueryOptions } from './get-climbs';

export const createAttempt = ({
  route_id,
}: {
  route_id: string;
}): Promise<Route> => {
  return api.post(`/climbs/me/add_attempt/${route_id}`);
};

type UseCreateAttemptOptions = {
  mutationConfig?: MutationConfig<typeof createAttempt>;
};

export const useCreateAttempt = ({
  mutationConfig,
}: UseCreateAttemptOptions) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getClimbsQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createAttempt,
  });
};
