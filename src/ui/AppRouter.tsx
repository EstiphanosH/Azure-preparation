import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FlagProvider } from './flags/FlagContext.tsx';
import { AuthScreen } from './features/auth/AuthScreen.tsx';
import { DashboardScreen } from './features/dashboard/DashboardScreen.tsx';
import { QuizScreen } from './features/quiz/QuizScreen.tsx';
import { ResultsScreen } from './features/results/ResultsScreen.tsx';
import { getStoredSession } from './hooks/useAuth.ts';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

export type AppRoute = 'auth' | 'dashboard' | 'quiz' | 'results';

export interface AppRouterProps {
  initialRoute?: AppRoute;
  initialSessionId?: string;
}

export const AppRouter: React.FC<AppRouterProps> = ({
  initialRoute,
  initialSessionId,
}) => {
  const stored = getStoredSession();
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(
    initialRoute || (stored ? 'dashboard' : 'auth')
  );
  const [activeSessionId, setActiveSessionId] = useState<string>(initialSessionId || 'sess-default-01');

  return (
    <QueryClientProvider client={queryClient}>
      <FlagProvider>
        <div data-testid="app-router-container" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-mono">
          {currentRoute === 'auth' && (
            <AuthScreen onAuthenticated={() => setCurrentRoute('dashboard')} />
          )}

          {currentRoute === 'dashboard' && (
            <DashboardScreen
              onStartSession={(id) => {
                setActiveSessionId(id);
                setCurrentRoute('quiz');
              }}
              onLogout={() => setCurrentRoute('auth')}
            />
          )}

          {currentRoute === 'quiz' && (
            <QuizScreen
              sessionId={activeSessionId}
              onSessionFinalized={(_finalScore) => {
                setCurrentRoute('results');
              }}
            />
          )}

          {currentRoute === 'results' && (
            <ResultsScreen
              sessionId={activeSessionId}
              onNavigateDashboard={() => setCurrentRoute('dashboard')}
              onRetakeQuiz={() => setCurrentRoute('quiz')}
            />
          )}
        </div>
      </FlagProvider>
    </QueryClientProvider>
  );
};
