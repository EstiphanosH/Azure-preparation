import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionCard } from './QuestionCard.tsx';

describe('QuestionCard Component A11y & Keyboard Navigation', () => {
  const options = ['Rapid Elasticity', 'Resource Pooling', 'Measured Service', 'Broad Network Access'] as const;

  it('renders radiogroup and options with accessible roles', () => {
    render(
      <QuestionCard
        questionId="Q-01"
        prompt="Which characteristic scales dynamically?"
        options={options}
        selectedIndex={null}
        onSelectOption={() => {}}
        onSubmitAttempt={() => {}}
      />
    );

    const group = screen.getByRole('radiogroup');
    expect(group).toBeInTheDocument();

    const radioOptions = screen.getAllByRole('radio');
    expect(radioOptions).toHaveLength(4);
    expect(radioOptions[0]).toHaveAttribute('aria-checked', 'false');
  });

  it('responds to keyboard 1-4 shortcuts to select options', () => {
    const handleSelect = vi.fn();
    render(
      <QuestionCard
        questionId="Q-01"
        prompt="Which characteristic scales dynamically?"
        options={options}
        selectedIndex={null}
        onSelectOption={handleSelect}
        onSubmitAttempt={() => {}}
      />
    );

    fireEvent.keyDown(window, { key: '2' });
    expect(handleSelect).toHaveBeenCalledWith(1); // 0-indexed

    fireEvent.keyDown(window, { key: '4' });
    expect(handleSelect).toHaveBeenCalledWith(3);
  });

  it('displays live region status when attempt has been submitted', () => {
    render(
      <QuestionCard
        questionId="Q-01"
        prompt="Which characteristic scales dynamically?"
        options={options}
        selectedIndex={0}
        onSelectOption={() => {}}
        onSubmitAttempt={() => {}}
        hasSubmitted={true}
        isCorrect={true}
        explanation="Rapid elasticity automatically scales compute capacity."
      />
    );

    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toBeInTheDocument();
    expect(statusRegion).toHaveAttribute('aria-live', 'polite');
    expect(statusRegion.textContent).toContain('Correct!');
    expect(statusRegion.textContent).toContain('Rapid elasticity automatically scales compute capacity.');
  });
});
