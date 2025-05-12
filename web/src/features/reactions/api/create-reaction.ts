import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import { MutationConfig } from '../../../lib/react-query';
import { getInfiniteActivitiesQueryOptions } from '../../activities/api/get-activities';

export const createReaction = ({
  activity_id,
}: {
  activity_id: string;
}): Promise<String> => {
  return api.post(`/reactions/${activity_id}`);
};

type UseCreateReactionOptions = {
  mutationConfig?: MutationConfig<typeof createReaction>;
};

export const useCreateReaction = ({
  mutationConfig,
}: UseCreateReactionOptions) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getInfiniteActivitiesQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createReaction,
  });
};
