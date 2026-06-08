import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createExplorerProfile, type CreateExplorerDto } from '../api/authApi';

export function useCreateProfile(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateExplorerDto) => createExplorerProfile(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });
}
