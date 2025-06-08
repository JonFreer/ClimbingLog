import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Set } from '@/types/routes';

import { getGymsQueryOptions } from './get-gyms';

export const createGymInputSchema = z.object({
  name: z.string().min(1, 'Required'),
  location: z.string().min(1, 'Required'),
  about: z.string().min(1, 'Required'),
  layout: z.string(),
  file: z.instanceof(File),
});

export type CreateGymInput = z.infer<typeof createGymInputSchema>;

export const createGym = ({ data }: { data: CreateGymInput }): Promise<Set> => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('location', data.location);
  formData.append('about', data.about);
  formData.append('layout', data.layout);
  formData.append('file', data.file);

  return api.post('/gyms', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

type UseCreateGymOptions = {
  mutationConfig?: MutationConfig<typeof createGym>;
};

export const useCreateGym = ({ mutationConfig }: UseCreateGymOptions) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getGymsQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createGym,
  });
};
