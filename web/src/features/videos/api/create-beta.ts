import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Set } from '@/types/routes';
import { getVideosQueryOptions } from './get-videos';
import { useState } from 'react';

export const createVideoInputSchema = z.object({
  route_id: z.string().min(1, 'Required'),
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size > 0,
      'File is required and must be larger than 0 bytes',
    ),
});

export type CreateVideoInput = z.infer<typeof createVideoInputSchema>;

export type UseCreateVideoOptions = {
  route_id: string;
  mutationConfig?: MutationConfig<
    ({ data }: { data: CreateVideoInput }) => Promise<Set>
  >;
};

export const useCreateVideo = ({
  mutationConfig,
  route_id,
}: UseCreateVideoOptions) => {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);
  const { onSuccess, ...restConfig } = mutationConfig || {};

  const createVideo = ({ data }: { data: CreateVideoInput }): Promise<Set> => {
    console.log('createVideo', data);
    const formData = new FormData();
    formData.append('route', data.route_id);
    formData.append('file', data.file);
    return api.post('/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (ev) => {
        if (ev.total) {
          setProgress(Math.round((ev.loaded * 100) / ev.total));
        }
      },
    });
  };

  return {
    ...useMutation({
      onSuccess: (...args) => {
        queryClient.invalidateQueries({
          queryKey: getVideosQueryOptions(route_id).queryKey,
        });
        onSuccess?.(...args);
      },
      ...restConfig,
      mutationFn: createVideo,
    }),
    progress,
  };
};
