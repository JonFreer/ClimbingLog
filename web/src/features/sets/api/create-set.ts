import { useMutation, useQueryClient } from '@tanstack/react-query';
import { date, z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Set } from '@/types/routes';

import { getSetsQueryOptions } from './get-sets';

export const createSetInputSchema = z.object({
  name: z.string().min(1, 'Required'),
  circuit_id: z.string().min(1, 'Required'),
  date: z.string().min(1, 'Required'),
});

export type CreateSetInput = z.infer<typeof createSetInputSchema>;

export const createSet = ({ data }: { data: CreateSetInput }): Promise<Set> => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('circuit_id', data.circuit_id);
  formData.append('date', data.date);
  return api.post('/sets/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

type UseCreateSetOptions = {
  mutationConfig?: MutationConfig<typeof createSet>;
};

export const useCreateSet = ({ mutationConfig }: UseCreateSetOptions) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getSetsQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createSet,
  });
};
