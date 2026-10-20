import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import axe from 'axe-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FlagProvider } from '../../src/ui/flags/FlagContext.tsx';
import { AuthView } from '../../src/ui/features/auth/AuthView.tsx';
import { DashboardView } from '../../src/ui/features/dashboard/DashboardView.tsx';
import { QuizView } from '../../src/ui/features/quiz/QuizView.tsx';
import { ResultsView } from '../../src/ui/features/results/ResultsView.tsx';

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <FlagProvider>{ui}</FlagProvider>
    </QueryClientProvider>
  );
}

describe('Axe-Core Automated Accessibility Audits (Zero Critical/Serious Violations per Route)', () => {
  it('Route 1: /auth/login passes axe-core accessibility audit with 0 critical violations', async () => {
    const { container } = renderWithProviders(
      <AuthView
        mode="login"
        onToggleMode={() => {}}
        onSubmitLogin={async () => {}}
        onSubmitRegister={async () => {}}
        isLoading={false}
        errorMessage={null}
      />
    );

    const results = await axe.run(container);
    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalViolations).toHaveLength(0);
  });

  it('Route 2: /dashboard passes axe-core accessibility audit with 0 critical violations', async () => {
    const { container } = renderWithProviders(
      <DashboardView
        userEmail="candidate@cloudfix.edu"
        username="candidate_alpha"
        overallScore={80}
        evaluationGrade="READY"
        domainBreakdown={[
          {
            domainId: 'DOM-CONCEPTS',
            domainTitle: 'Cloud Fundamentals',
            weightPct: 28,
            accuracyPct: 100,
            weightedScore: 28,
            attemptsCount: 2,
          },
        ]}
        totalAttempts={2}
        onStartQuiz={() => {}}
        onExportData={() => {}}
        onDeleteAccount={() => {}}
        onLogout={() => {}}
        isLoading={false}
        isStartingQuiz={false}
        isDeleting={false}
        errorMessage={null}
      />
    );

    const results = await axe.run(container);
    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalViolations).toHaveLength(0);
  });

  it('Route 3: /quiz passes axe-core accessibility audit with 0 critical violations', async () => {
    const { container } = renderWithProviders(
      <QuizView
        currentQuestion={{
          id: 'Q-01',
          prompt: 'Which service model provides on-demand virtual compute instances?',
          options: ['IaaS', 'PaaS', 'SaaS', 'Serverless Functions'],
          explanation: 'IaaS provides raw infrastructure virtualization.',
        }}
        currentIndex={0}
        totalQuestions={3}
        selectedIndex={null}
        onSelectOption={() => {}}
        onSubmitAttempt={() => {}}
        isSubmitting={false}
        hasSubmittedCurrent={false}
        isCurrentCorrect={null}
        onNextQuestion={() => {}}
        onFinalize={() => {}}
        isFinalizing={false}
        activeHint={null}
        onRequestHint={() => {}}
        isLoadingSession={false}
        errorMessage={null}
      />
    );

    const results = await axe.run(container);
    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalViolations).toHaveLength(0);
  });

  it('Route 4: /quiz/results passes axe-core accessibility audit with 0 critical violations', async () => {
    const { container } = renderWithProviders(
      <ResultsView
        score={80}
        grade="READY"
        sessionId="sess-test-01"
        totalQuestions={10}
        correctCount={8}
        domainBreakdown={[
          {
            domainId: 'DOM-SERVICES',
            domainTitle: 'Cloud Services & Architecture',
            weightPct: 37,
            accuracyPct: 80,
            weightedScore: 30,
            attemptsCount: 10,
          },
        ]}
        onReturnDashboard={() => {}}
        onRetakeQuiz={() => {}}
        isLoading={false}
      />
    );

    const results = await axe.run(container);
    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalViolations).toHaveLength(0);
  });
});
