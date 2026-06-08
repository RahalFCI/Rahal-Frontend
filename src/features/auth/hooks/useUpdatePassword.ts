import { useMutation } from '@tanstack/react-query';
import { updatePassword, type UpdatePasswordDto } from '../api/authApi';

export function useUpdatePassword(userId: string) {
  return useMutation({
    mutationFn: (body: UpdatePasswordDto) => updatePassword(userId, body),
  });
}
