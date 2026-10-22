import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FlagProvider } from './flags/FlagContext.tsx';
import { ThemeProvider } from './theme/ThemeContext.tsx';
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
  initialQuestionCount?: number;
}

export const AppRouter: React.FC<AppRouterProps> = ({
  initialRoute,
  initialSessionId,
  initialQuestionCount = 10,
}) => {
  const stored = getStoredSession();
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(
    initialRoute || (stored ? 'dashboard' : 'auth')
  );
  const [activeSessionId, setActiveSessionId] = useState<string>(initialSessionId || 'sess-default-01');
  const [activeQuestionCount, setActiveQuestionCount] = useState<number>(initialQuestionCount);
  const [activeTimedConfig, setActiveTimedConfig] = useState<{
    isTimed?: boolean;
    timeLimitMinutes?: number;
    examMode?: 'timed_exam' | 'practice';
  }>({ isTimed: false, timeLimitMinutes: 45, examMode: 'practice' });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <FlagProvider>
          <div
            data-testid="app-router-container"
            className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors"
          >
            {currentRoute === 'auth' && (
              <AuthScreen onAuthenticated={() => setCurrentRoute('dashboard')} />
            )}

            {currentRoute === 'dashboard' && (
              <DashboardScreen
                onStartSession={(id, count, timedConfig) => {
                  setActiveSessionId(id);
                  if (count) setActiveQuestionCount(count);
                  if (timedConfig) setActiveTimedConfig(timedConfig);
                  setCurrentRoute('quiz');
                }}
                onLogout={() => setCurrentRoute('auth')}
              />
            )}

            {currentRoute === 'quiz' && (
              <QuizScreen
                sessionId={activeSessionId}
                questionCount={activeQuestionCount}
                isTimed={activeTimedConfig.isTimed}
                timeLimitMinutes={activeTimedConfig.timeLimitMinutes}
                examMode={activeTimedConfig.examMode}
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
      </ThemeProvider>
    </QueryClientProvider>
  );
};
