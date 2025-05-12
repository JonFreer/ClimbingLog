import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '../../../lib/api-client';
import { MutationConfig } from '../../../lib/react-query';
import { Route } from '../../../types/routes';

import { getRoutesQueryOptions } from './get-routes';

export const updateRouteInputSchema = z.object({
  route_id: z.string().min(1, 'Required'),
  name: z.string().min(1, 'Required'),
  set_id: z.string().min(1, 'Required'),
  x: z.string().min(1, 'Required'),
  y: z.string().min(1, 'Required'),
  grade: z.string().min(1, 'Required'),
  style: z.string().min(1, 'Required'),
  location: z.string().min(1, 'Required'),
  file: z.instanceof(File).nullable(),
});

export type UpdateRouteInput = z.infer<typeof updateRouteInputSchema>;

export const updateRoute = ({
  data,
}: {
  data: UpdateRouteInput;
}): Promise<Route> => {
  const formData = new FormData();
  formData.append('route_id', data.route_id);
  formData.append('name', data.name);
  formData.append('set_id', data.set_id);
  formData.append('x', data.x);
  formData.append('y', data.y);
  formData.append('grade', data.grade);
  formData.append('style', data.style);
  formData.append('location', data.location);

  if (data.file) {
    formData.append('file', data.file);
  }

  return api.patch('/routes/update', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

type UseUpdateRouteOptions = {
  mutationConfig?: MutationConfig<typeof updateRoute>;
};

export const useUpdateRoute = ({ mutationConfig }: UseUpdateRouteOptions) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getRoutesQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: updateRoute,
  });
};
