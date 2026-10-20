import { useQuery } from '@tanstack/react-query';
import { readinessUseCase } from '../../api/useCases/readinessUseCase.ts';

export const readinessQueryKeys = {
  readiness: (userId: string, halfLifeDays?: number) =>
    ['readiness', userId, halfLifeDays ?? 14] as const,
};

export function useReadiness(userId: string, halfLifeDays: number = 14) {
  return useQuery({
    queryKey: readinessQueryKeys.readiness(userId, halfLifeDays),
    queryFn: async () => {
      const res = await readinessUseCase.getReadiness({ halfLifeDays }, userId);
      if (!res.ok) {
        throw new Error(res.error.message);
      }
      return res.data;
    },
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}
