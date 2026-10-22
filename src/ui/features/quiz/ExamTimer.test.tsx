/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { ExamTimer } from './ExamTimer.tsx';

describe('ExamTimer Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders initial formatted time in MM:SS and calculates pacing', () => {
    const handleExpired = vi.fn();
    render(
      <ExamTimer
        initialSeconds={2700} // 45 minutes
        onTimeExpired={handleExpired}
        totalQuestions={50}
        answeredCount={10}
      />
    );

    expect(screen.getByText('45:00')).toBeInTheDocument();
    expect(screen.getByText(/40 left/i)).toBeInTheDocument();
  });

  it('ticks down seconds and calls onTimeExpired when countdown reaches zero', () => {
    const handleExpired = vi.fn();
    render(
      <ExamTimer
        initialSeconds={3}
        onTimeExpired={handleExpired}
        totalQuestions={5}
        answeredCount={2}
      />
    );

    expect(screen.getByText('00:03')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('00:02')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(handleExpired).toHaveBeenCalledTimes(1);
    expect(screen.getByText('00:00')).toBeInTheDocument();
  });

  it('supports pausing and resuming timer', () => {
    const handleExpired = vi.fn();
    render(
      <ExamTimer
        initialSeconds={30}
        onTimeExpired={handleExpired}
        totalQuestions={10}
        answeredCount={0}
      />
    );

    // Pause timer
    const pauseBtn = screen.getByLabelText(/Pause exam countdown/i);
    fireEvent.click(pauseBtn);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Time should remain unchanged
    expect(screen.getByText('00:30')).toBeInTheDocument();

    // Resume timer
    const resumeBtn = screen.getByLabelText(/Resume exam countdown/i);
    fireEvent.click(resumeBtn);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText('00:28')).toBeInTheDocument();
  });
});
