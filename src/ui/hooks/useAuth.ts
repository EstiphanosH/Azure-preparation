import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authUseCase } from '../../api/useCases/authUseCase.ts';
import { RegisterRequestSchema, LoginRequestSchema } from '../../api/schemas/index.ts';
import { z } from 'zod';

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
  username: string;
}

const STORAGE_KEY = 'cloudfix_auth_session';

export function getStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStoredSession(session: AuthSession | null): void {
  try {
    if (!session) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
  } catch {
    // Ignore storage quota / restricted context errors
  }
}

export function useAuth() {
  const queryClient = useQueryClient();
  const session = getStoredSession();

  const registerMutation = useMutation({
    mutationFn: async (input: z.infer<typeof RegisterRequestSchema>) => {
      const res = await authUseCase.register(input);
      if (!res.ok) {
        throw new Error(res.error.message);
      }
      const authData: AuthSession = {
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
        userId: res.data.user.id,
        email: res.data.user.email,
        username: res.data.user.username,
      };
      saveStoredSession(authData);
      return authData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (input: z.infer<typeof LoginRequestSchema>) => {
      const res = await authUseCase.login(input);
      if (!res.ok) {
        throw new Error(res.error.message);
      }
      const authData: AuthSession = {
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
        userId: res.data.user.id,
        email: res.data.user.email,
        username: res.data.user.username,
      };
      saveStoredSession(authData);
      return authData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const current = getStoredSession();
      if (current) {
        await authUseCase.logout({ refreshToken: current.refreshToken }, current.accessToken);
      }
      saveStoredSession(null);
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });

  return {
    session,
    isAuthenticated: !!session?.accessToken,
    userId: session?.userId ?? 'usr-guest',
    accessToken: session?.accessToken ?? '',
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error?.message ?? null,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error?.message ?? null,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
}
