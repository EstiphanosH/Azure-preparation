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

  it('triggers onStartQuickQuiz with timed exam parameters when Timed Exam Mode is toggled', () => {
    const handleStart = vi.fn();
    render(<QuickQuizSection onStartQuickQuiz={handleStart} isStarting={false} />);

    // Click Timed Exam Mode button
    const timedBtn = screen.getByRole('button', { name: /Timed Exam Mode/i });
    fireEvent.click(timedBtn);

    // Click 30 Questions button
    const q30Btn = screen.getByRole('button', { name: /30 Questions/i });
    fireEvent.click(q30Btn);

    // Launch
    const launchBtn = screen.getByRole('button', { name: /Launch 30-Question Quick Quiz/i });
    fireEvent.click(launchBtn);

    expect(handleStart).toHaveBeenCalledWith({
      totalQuestions: 30,
      domainId: null,
      isTimed: true,
      timeLimitMinutes: 30,
      examMode: 'timed_exam',
    });
  });

  it('renders all 10 scenario-based preset quizzes with enterprise case studies and filters', () => {
    const handleStart = vi.fn();
    render(<QuickQuizSection onStartQuickQuiz={handleStart} isStarting={false} />);

    expect(screen.getByText(/Themed Architectural Scenario Quizzes/i)).toBeInTheDocument();
    expect(screen.getByText(/10 PRESETS/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Contoso Health System/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Fabrikam Global Logistics/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Woodgrove Financial Services/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Tailspin Toys Retail/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Full 50-Question Comprehensive Mock Exam/i).length).toBeGreaterThanOrEqual(1);

    // Verify all 10 launch buttons exist
    const scenarioLaunchButtons = screen.getAllByRole('button', { name: /Launch Scenario Quiz/i });
    expect(scenarioLaunchButtons.length).toBe(10);
  });

  it('launches a scenario quiz with preset question count, domain, and time limit when clicked', () => {
    const handleStart = vi.fn();
    render(<QuickQuizSection onStartQuickQuiz={handleStart} isStarting={false} />);

    // Click "Launch Scenario Quiz 1" (Lift-and-Shift Migration: 15 questions, DOM-CONCEPTS, 15 mins)
    const launchQuiz1Btn = screen.getByRole('button', { name: /Launch Scenario Quiz 1$/i });
    fireEvent.click(launchQuiz1Btn);

    expect(handleStart).toHaveBeenCalledWith({
      totalQuestions: 15,
      domainId: 'DOM-CONCEPTS',
      isTimed: true,
      timeLimitMinutes: 15,
      examMode: 'timed_exam',
    });
  });
});

