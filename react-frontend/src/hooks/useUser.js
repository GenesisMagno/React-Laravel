import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as userService from '../services/userService';

export const useUsers = (page , perPage , search = '') => {
  return useQuery({
    queryKey: ['users', page, perPage, search], // include search in the cache key
    queryFn: () => userService.getUsers(page, perPage, search),
    keepPreviousData: true,
    staleTime: 1000 * 60, // optional caching
  });
};


export const useUser = (id) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUserById(id),
    enabled: !!id, // only fetch if id exists
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userService.updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};
