import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Route } from '@/types/routes';

import { getClimbsQueryOptions } from './get-climbs';

export const createSend = ({
  route_id,
}: {
  route_id: string;
}): Promise<Route> => {
  return api.post(`/climbs/me/add_send/${route_id}`);
};

type UseCreateSendOptions = {
  mutationConfig?: MutationConfig<typeof createSend>;
};

export const useCreateSend = ({ mutationConfig }: UseCreateSendOptions) => {
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
    mutationFn: createSend,
  });
};
