import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { getClimbsQueryOptions } from './get-climbs';
import { getRoutesQueryOptions } from '@/features/routes/api/get-routes';

export const deleteClimb = ({ climb_id }: { climb_id: string }) => {
  return api.delete(`/climbs/me/${climb_id}`);
};

type UseDeleteClimbOptions = {
  mutationConfig?: MutationConfig<typeof deleteClimb>;
};

export const useDeleteClimb = ({ mutationConfig }: UseDeleteClimbOptions) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getClimbsQueryOptions().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getRoutesQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: deleteClimb,
  });
};
