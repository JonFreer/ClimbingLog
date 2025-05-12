import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import { MutationConfig } from '../../../lib/react-query';
import { getAllUsersQueryOptions } from './get-all-users';
import { User } from '../../../types/routes';

export const demoteSuperUser = ({
  user_id,
}: {
  user_id: string;
}): Promise<User> => {
  return api.post(`/admin/users/demote/${user_id}`);
};

type UseDemoteSuperUserOptions = {
  mutationConfig?: MutationConfig<typeof demoteSuperUser>;
};

export const useDemoteSuperUser = ({
  mutationConfig,
}: UseDemoteSuperUserOptions) => {
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
    mutationFn: demoteSuperUser,
  });
};
