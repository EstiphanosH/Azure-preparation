import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateDataUseCase } from '../../api/useCases/candidateDataUseCase.ts';

export const userQueryKeys = {
  export: (userId: string) => ['user', 'export', userId] as const,
};

export function useUserData(userId: string) {
  const queryClient = useQueryClient();

  const exportQuery = useQuery({
    queryKey: userQueryKeys.export(userId),
    queryFn: async () => {
      const res = await candidateDataUseCase.exportData({ includeAttempts: true }, userId);
      if (!res.ok) {
        throw new Error(res.error.message);
      }
      return res.data;
    },
    enabled: !!userId,
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await candidateDataUseCase.deleteAccount(
        { confirmation: 'DELETE_MY_ACCOUNT_PERMANENTLY' },
        userId
      );
      if (!res.ok) {
        throw new Error(res.error.message);
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.clear();
      localStorage.clear();
    },
  });

  return {
    exportData: exportQuery.data ?? null,
    isExportLoading: exportQuery.isLoading,
    exportError: exportQuery.error?.message ?? null,
    deleteAccount: deleteAccountMutation.mutateAsync,
    isDeleting: deleteAccountMutation.isPending,
  };
}
