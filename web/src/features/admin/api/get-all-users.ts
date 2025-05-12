import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import { User } from '../../../types/routes';
import { QueryConfig } from '../../../lib/react-query';

export const getAllUsers = (): Promise<User[]> => {
  return api.get(`/admin/users/get_all`);
};

export const getAllUsersQueryOptions = () => {
  return queryOptions({
    queryKey: ['users_all'],
    queryFn: () => getAllUsers(),
    placeholderData: [],
  });
};

type UseAllUsersOptions = {
  queryConfig?: QueryConfig<typeof getAllUsersQueryOptions>;
};

export const useAllUsers = ({ queryConfig = {} }: UseAllUsersOptions = {}) => {
  return useQuery({
    ...getAllUsersQueryOptions(),
    ...queryConfig,
  });
};
