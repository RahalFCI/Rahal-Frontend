import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateExplorerProfile, type UpdateExplorerDto } from '../api/authApi';

export function useUpdateProfile(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateExplorerDto) => updateExplorerProfile(userId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });
}
