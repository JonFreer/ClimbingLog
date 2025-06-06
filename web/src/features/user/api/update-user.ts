import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { User } from '@/types/routes';

export const updateUserInputSchema = z.object({
  username: z.string().min(1, 'Required').optional(),
  about: z.string().optional(),
  profile_visible: z.boolean().optional(),
  send_visible: z.boolean().optional(),
  home_gym: z.string().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;

export const updateUser = ({
  data,
}: {
  data: UpdateUserInput;
}): Promise<User> => {
  return api.patch('/users/me', data);
};

type UseUpdateUserOptions = {
  mutationConfig?: MutationConfig<typeof updateUser>;
};

export const useUpdateUser = ({ mutationConfig }: UseUpdateUserOptions) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['authenticated-user'],
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: updateUser,
  });
};
