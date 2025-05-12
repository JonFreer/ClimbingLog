import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { getAllUsersQueryOptions } from './get-all-users';
import { User } from '@/types/routes';

export const demoteRouteSetter = ({
  user_id,
}: {
  user_id: string;
}): Promise<User> => {
  return api.post(`/admin/users/demote/route_setter/${user_id}`);
};

type UseDemoteRouteSetterOptions = {
  mutationConfig?: MutationConfig<typeof demoteRouteSetter>;
};

export const useDemoteRouteSetter = ({
  mutationConfig,
}: UseDemoteRouteSetterOptions) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getAllUsersQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: demoteRouteSetter,
  });
};
