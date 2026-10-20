import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { DomainBreakdownChart } from './DomainBreakdownChart.tsx';
import { ReadinessGauge } from './ReadinessGauge.tsx';

describe('DomainBreakdownChart and ReadinessGauge A11y', () => {
  it('renders DomainBreakdownChart with progressbar roles and values', () => {
    const breakdown = [
      {
        domainId: 'DOM-CONCEPTS',
        domainTitle: 'Cloud Fundamentals',
        weightPct: 28,
        accuracyPct: 75,
        weightedScore: 21,
        attemptsCount: 4,
      },
    ];

    render(<DomainBreakdownChart breakdown={breakdown} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute('aria-valuenow', '75');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(screen.getByText('Cloud Fundamentals')).toBeInTheDocument();
  });

  it('renders ReadinessGauge with meter role and accessible valuetext', () => {
    render(<ReadinessGauge score={85} grade="READY" />);
    const meter = screen.getByRole('meter');
    expect(meter).toBeInTheDocument();
    expect(meter).toHaveAttribute('aria-valuenow', '85');
    expect(meter).toHaveAttribute('aria-valuetext', expect.stringContaining('85% — Exam Ready'));
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('READY')).toBeInTheDocument();
  });
});
