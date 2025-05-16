import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { getVideosQueryOptions } from './get-videos';

export const deleteVideo = ({ video_id }: { video_id: string }) => {
  return api.delete(`/video/${video_id}`);
};

type UseDeleteVideoOptions = {
  mutationConfig?: MutationConfig<typeof deleteVideo>;
  route_id: string;
};

export const useDeleteVideo = ({
  mutationConfig,
  route_id,
}: UseDeleteVideoOptions) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getVideosQueryOptions(route_id).queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: deleteVideo,
  });
};
