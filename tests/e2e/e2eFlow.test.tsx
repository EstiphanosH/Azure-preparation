import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppRouter } from '../../src/ui/AppRouter.tsx';
import { dispatchApiRequest } from '../../src/api/router.ts';
import { quizRepository } from '../../src/api/repositories/quizRepository.ts';
import { rateLimiter } from '../../src/api/rateLimit.ts';
import { saveStoredSession } from '../../src/ui/hooks/useAuth.ts';

describe('E2E Lifecycle & Negative Security Isolation', () => {
  beforeEach(() => {
    localStorage.clear();
    rateLimiter.reset();
  });

  // =========================================================================
  // 1. Full E2E Flow: Auth -> Start Quiz -> Answer (1-4) -> Finalize -> Results -> Reload -> Dashboard
  // =========================================================================
  it('completes the full candidate flow end-to-end including keyboard navigation & session persistence', async () => {
    // 1. Set initial authenticated session
    saveStoredSession({
      accessToken: 'tok-access-candidateA',
      refreshToken: 'tok-refresh-candidateA',
      userId: 'usr-candidate-A',
      email: 'candidate_a@cloudfix.edu',
      username: 'candidate_a',
    });

    // 2. Render application at dashboard
    const { unmount } = render(<AppRouter initialRoute="dashboard" />);
    await waitFor(() => {
      expect(screen.getByText(/CANDIDATE DASHBOARD/i)).toBeInTheDocument();
      expect(screen.getByText(/candidate_a@cloudfix.edu/i)).toBeInTheDocument();
    });


    // Verify "Unofficial" footer is visible on dashboard
    expect(screen.getByTestId('unofficial-footer')).toBeInTheDocument();
    expect(screen.getByTestId('unofficial-footer').textContent).toContain('Unofficial — not affiliated with Microsoft');

    // 3. Click "Start New Diagnostic Session"
    const startBtn = screen.getByRole('button', { name: /Start New Diagnostic Session/i });
    fireEvent.click(startBtn);

    // Wait for quiz screen
    await waitFor(() => {
      expect(screen.getByText(/DIAGNOSTIC EXAM SESSION/i)).toBeInTheDocument();
    });

    // Verify footer on quiz route
    expect(screen.getByTestId('unofficial-footer')).toBeInTheDocument();

    // 4. Keyboard walkthrough: press "1" to select option 1
    fireEvent.keyDown(window, { key: '1' });
    const radioOptions = screen.getAllByRole('radio');
    expect(radioOptions[0]).toHaveAttribute('aria-checked', 'true');

    // Submit answer
    const submitBtn = screen.getByRole('button', { name: /Submit Answer/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    // Finalize or next
    const finalizeBtn = screen.queryByRole('button', { name: /Finalize & Score Session/i });
    if (finalizeBtn) {
      fireEvent.click(finalizeBtn);
    } else {
      const nextBtn = screen.getByRole('button', { name: /Next Question/i });
      fireEvent.click(nextBtn);
    }

    // 5. Verify Results screen
    unmount();
    const resultsRender = render(
      <AppRouter initialRoute="results" initialSessionId="sess-default-01" />
    );

    await waitFor(() => {
      expect(screen.getByText(/DIAGNOSTIC OUTCOME & SCORE REPORT/i)).toBeInTheDocument();
      expect(screen.getByTestId('unofficial-footer')).toBeInTheDocument();
      expect(screen.getByRole('meter')).toBeInTheDocument();
    });


    // 6. Test persistence across reloads
    resultsRender.unmount();
    render(<AppRouter initialRoute="dashboard" />);
    await waitFor(() => {
      expect(screen.getByText(/CANDIDATE DASHBOARD/i)).toBeInTheDocument();
      expect(screen.getByText(/candidate_a@cloudfix.edu/i)).toBeInTheDocument();
    });
  });


  // =========================================================================
  // 2. RLS-Negative Isolation: User B cannot access or finalize User A's session
  // =========================================================================
  describe('RLS-Negative Security Test (PostgREST / API Isolation)', () => {
    it('User B cannot submit attempts or finalize User A session (401/403 RLS violation)', async () => {
      // Step A: Register User A and create a session
      const userAReg = await dispatchApiRequest({
        method: 'POST',
        path: '/api/auth/register',
        body: {
          email: 'user_a_secure@cloudfix.edu',
          password: 'EnterpriseCandidate#1',
          username: 'user_a_owner',
          fullName: 'User A Owner',
        },
      });
      const userAAuth = userAReg.body as { accessToken: string };

      const userASession = await dispatchApiRequest({
        method: 'POST',
        path: '/api/quiz/sessions',
        headers: { authorization: `Bearer ${userAAuth.accessToken}` },
        body: { totalQuestions: 10 },
      });
      const userASessionId = (userASession.body as { id: string }).id;

      // Step B: Register User B
      const userBReg = await dispatchApiRequest({
        method: 'POST',
        path: '/api/auth/register',
        body: {
          email: 'user_b_attacker@cloudfix.edu',
          password: 'EnterpriseCandidate#1',
          username: 'user_b_attacker',
          fullName: 'User B Attacker',
        },
      });
      const userBAuth = userBReg.body as { accessToken: string };

      // Step C: User B attempts to hijack User A's session by submitting an attempt
      const hostileAttempt = await dispatchApiRequest({
        method: 'POST',
        path: '/api/quiz/attempts',
        headers: { authorization: `Bearer ${userBAuth.accessToken}` },
        body: {
          sessionId: userASessionId,
          questionId: 'Q-01',
          selectedIndex: 0,
          timeTakenMs: 4000,
        },
      });

      // Strict failure expected: 401 Unauthorized / RLS Deny
      expect(hostileAttempt.status).toBe(401);
      const attemptErr = hostileAttempt.body as { error: { code: string; message: string } };
      expect(attemptErr.error.code).toBe('UNAUTHORIZED');
      expect(attemptErr.error.message).toContain('Unauthorized attempt access');

      // Step D: User B attempts to finalize User A's session
      const hostileFinalize = await dispatchApiRequest({
        method: 'POST',
        path: `/api/quiz/sessions/${userASessionId}/finalize`,
        headers: { authorization: `Bearer ${userBAuth.accessToken}` },
        body: {},
      });

      expect(hostileFinalize.status).toBe(401);
      const finErr = hostileFinalize.body as { error: { code: string; message: string } };
      expect(finErr.error.code).toBe('UNAUTHORIZED');
      expect(finErr.error.message).toContain('Unauthorized finalize attempt');
    });
  });

  // =========================================================================
  // 3. Mandatory "Unofficial" Footer Asserted on Every Route
  // =========================================================================
  describe('Mandatory Unofficial Footer Verification', () => {
    it('asserts "Unofficial — not affiliated with Microsoft" on /auth', () => {
      render(<AppRouter initialRoute="auth" />);
      const footer = screen.getByTestId('unofficial-footer');
      expect(footer.textContent).toContain('Unofficial — not affiliated with Microsoft');
    });

    it('asserts "Unofficial — not affiliated with Microsoft" on /dashboard', () => {
      saveStoredSession({
        accessToken: 'tok-dummy',
        refreshToken: 'tok-dummy',
        userId: 'usr-test',
        email: 'test@cloudfix.edu',
        username: 'test',
      });
      render(<AppRouter initialRoute="dashboard" />);
      const footer = screen.getByTestId('unofficial-footer');
      expect(footer.textContent).toContain('Unofficial — not affiliated with Microsoft');
    });

    it('asserts "Unofficial — not affiliated with Microsoft" on /quiz', () => {
      render(<AppRouter initialRoute="quiz" />);
      const footer = screen.getByTestId('unofficial-footer');
      expect(footer.textContent).toContain('Unofficial — not affiliated with Microsoft');
    });

    it('asserts "Unofficial — not affiliated with Microsoft" on /results', () => {
      render(<AppRouter initialRoute="results" />);
      const footer = screen.getByTestId('unofficial-footer');
      expect(footer.textContent).toContain('Unofficial — not affiliated with Microsoft');
    });
  });
});
