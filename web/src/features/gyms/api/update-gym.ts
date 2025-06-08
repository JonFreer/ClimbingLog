import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Set } from '@/types/routes';

import { getGymsQueryOptions } from './get-gyms';

export const createGymInputSchema = z.object({
  name: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  about: z.string().min(1).optional(),
  layout: z.string().optional(),
  file: z.instanceof(File).optional(),
});

export type CreateGymInput = z.infer<typeof createGymInputSchema>;

export const editGym = ({
  data,
  gym_id,
}: {
  data: CreateGymInput;
  gym_id: string;
}): Promise<Set> => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) formData.append(key, value);
  });

  console.log('Editing gym with data:', formData);

  return api.patch(`/gyms/${gym_id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

type UseEditGymOptions = {
  mutationConfig?: MutationConfig<typeof editGym>;
};

export const useEditGym = ({ mutationConfig }: UseEditGymOptions) => {
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
    mutationFn: editGym,
  });
};
