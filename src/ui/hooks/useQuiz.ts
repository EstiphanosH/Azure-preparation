import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { quizUseCase } from '../../api/useCases/quizUseCase.ts';
import { quizRepository } from '../../api/repositories/quizRepository.ts';
import { makeSessionId } from '../../domain/model/Ids.ts';
import {
  StartSessionInputSchema,
  SubmitAttemptInputSchema,
  FinalizeSessionInputSchema,
} from '../../api/schemas/index.ts';
import { z } from 'zod';

export const quizQueryKeys = {
  all: ['quiz'] as const,
  session: (id: string) => [...quizQueryKeys.all, 'session', id] as const,
  questions: (domainId?: string | null) => [...quizQueryKeys.all, 'questions', domainId ?? 'all'] as const,
};

export function useQuestions(domainId?: string | null) {
  return useQuery({
    queryKey: quizQueryKeys.questions(domainId),
    queryFn: async () => {
      const questions = await quizRepository.getQuestionsByDomain(null, 10);
      return questions;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSessionDetails(sessionId: string | null) {
  return useQuery({
    queryKey: quizQueryKeys.session(sessionId ?? 'none'),
    queryFn: async () => {
      if (!sessionId) return null;
      const session = await quizRepository.getSessionById(makeSessionId(sessionId));
      if (!session) throw new Error('Session not found');
      const attempts = await quizRepository.getAttemptsBySessionId(makeSessionId(sessionId));
      return { session, attempts };
    },
    enabled: !!sessionId,
  });
}

export function useQuiz(userId: string) {
  const queryClient = useQueryClient();

  const startSessionMutation = useMutation({
    mutationFn: async (input: z.infer<typeof StartSessionInputSchema>) => {
      const res = await quizUseCase.startSession(input, userId);
      if (!res.ok) {
        throw new Error(res.error.message);
      }
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: quizQueryKeys.all });
    },
  });

  const submitAttemptMutation = useMutation({
    mutationFn: async (input: z.infer<typeof SubmitAttemptInputSchema>) => {
      const res = await quizUseCase.submitAttempt(input, userId);
      if (!res.ok) {
        throw new Error(res.error.message);
      }
      return res.data;
    },
    // Optimistic update for responsive attempt tracking
    onMutate: async (newAttempt) => {
      await queryClient.cancelQueries({ queryKey: quizQueryKeys.session(newAttempt.sessionId) });
      const previousSession = queryClient.getQueryData(quizQueryKeys.session(newAttempt.sessionId));
      return { previousSession };
    },
    onError: (_err, newAttempt, context) => {
      if (context?.previousSession) {
        queryClient.setQueryData(quizQueryKeys.session(newAttempt.sessionId), context.previousSession);
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: quizQueryKeys.session(variables.sessionId) });
    },
  });

  const finalizeSessionMutation = useMutation({
    mutationFn: async (input: z.infer<typeof FinalizeSessionInputSchema>) => {
      const res = await quizUseCase.finalizeSession(input, userId);
      if (!res.ok) {
        throw new Error(res.error.message);
      }
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: quizQueryKeys.session(data.sessionId) });
      queryClient.invalidateQueries({ queryKey: ['readiness'] });
    },
  });

  return {
    startSession: startSessionMutation.mutateAsync,
    isStarting: startSessionMutation.isPending,
    startError: startSessionMutation.error?.message ?? null,
    submitAttempt: submitAttemptMutation.mutateAsync,
    isSubmitting: submitAttemptMutation.isPending,
    submitError: submitAttemptMutation.error?.message ?? null,
    finalizeSession: finalizeSessionMutation.mutateAsync,
    isFinalizing: finalizeSessionMutation.isPending,
    finalizeError: finalizeSessionMutation.error?.message ?? null,
  };
}
