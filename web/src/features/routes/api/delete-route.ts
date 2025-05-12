import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { getRoutesQueryOptions } from './get-routes';

export const deleteRoute = ({ routeId }: { routeId: string }) => {
  return api.delete(`/routes/${routeId}`);
};

type UseDeleteRouteOptions = {
  mutationConfig?: MutationConfig<typeof deleteRoute>;
};

export const useDeleteRoute = ({ mutationConfig }: UseDeleteRouteOptions) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getRoutesQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: deleteRoute,
  });
};
