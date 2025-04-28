import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api-client";
import { MutationConfig } from "../../../lib/react-query";
import { getActivitiesQueryOptions } from "../../activities/api/get-activities";

export const deleteReaction = ({ activity_id }: { activity_id: string }) => {
  return api.delete(`/reactions/${activity_id}`);
};

type UseDeleteReactiontOptions = {
  mutationConfig?: MutationConfig<typeof deleteReaction>;
};

export const useDeleteReaction = ({
  mutationConfig,
}: UseDeleteReactiontOptions) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getActivitiesQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: deleteReaction,
  });
};
