/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuickQuizSection } from './QuickQuizSection.tsx';
import { clearQuickQuizHistory, saveQuickQuizRecord } from '../../../domain/quiz/quickQuizGenerator.ts';

describe('QuickQuizSection Component', () => {
  beforeEach(() => {
    clearQuickQuizHistory();
  });

  it('renders Quick Quiz feature banner with 50-question badge and domain options', () => {
    const handleStart = vi.fn();
    render(<QuickQuizSection onStartQuickQuiz={handleStart} isStarting={false} />);

    expect(screen.getByText(/AZ-900 Quick Quiz/i)).toBeInTheDocument();
    expect(screen.getAllByText(/50 QUESTIONS/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Cloud Concepts/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Security & Identity/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Azure Architecture/i).length).toBeGreaterThanOrEqual(1);
  });

  it('triggers onStartQuickQuiz with 50 questions and selected domain when launch button clicked', () => {
    const handleStart = vi.fn();
    render(<QuickQuizSection onStartQuickQuiz={handleStart} isStarting={false} />);

    // Click "Security & Identity" domain filter
    const securityBtn = screen.getByRole('button', { name: /Security & Identity/i });
    fireEvent.click(securityBtn);

    // Click launch button
    const launchBtn = screen.getByRole('button', { name: /Launch 50-Question Quick Quiz/i });
    fireEvent.click(launchBtn);

    expect(handleStart).toHaveBeenCalledWith({
      totalQuestions: 50,
      domainId: 'DOM-SECURITY',
    });
  });

  it('displays progress analytics and domain accuracy bars when past records exist', () => {
    saveQuickQuizRecord({
      sessionId: 'sess-test-progress',
      date: 'Oct 21, 10:00 AM',
      score: 84,
      correctCount: 42,
      totalQuestions: 50,
      grade: 'READY',
      domainBreakdown: [
        { domainId: 'DOM-CONCEPTS', domainTitle: 'Cloud Concepts', correct: 14, total: 15, percentage: 93.3 },
        { domainId: 'DOM-SECURITY', domainTitle: 'Security & Pricing', correct: 15, total: 18, percentage: 83.3 },
        { domainId: 'DOM-SERVICES', domainTitle: 'Azure Architecture', correct: 13, total: 17, percentage: 76.5 },
      ],
    });

    const handleStart = vi.fn();
    render(<QuickQuizSection onStartQuickQuiz={handleStart} isStarting={false} />);

    expect(screen.getByText(/Quick Quiz Progress & Analytics Tracker/i)).toBeInTheDocument();
    const scoreElements = screen.getAllByText(/84%/i);
    expect(scoreElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/AZ-900 EXAM READY/i)).toBeInTheDocument();
  });
});
