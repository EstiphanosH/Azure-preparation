import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { FlagProvider, FeatureGate } from './FlagContext.tsx';

describe('FeatureGate and FlagProvider Invariants', () => {
  it('renders children when feature flag is enabled', () => {
    render(
      <FlagProvider initialOverrides={{ ff_progressive_hint_ladder: true }}>
        <FeatureGate flag="ff_progressive_hint_ladder">
          <div>Hint Ladder Active</div>
        </FeatureGate>
      </FlagProvider>
    );

    expect(screen.getByText('Hint Ladder Active')).toBeInTheDocument();
  });

  it('renders inert fallback (or nothing) when feature flag is disabled', () => {
    render(
      <FlagProvider initialOverrides={{ ff_progressive_hint_ladder: false }}>
        <FeatureGate
          flag="ff_progressive_hint_ladder"
          fallback={<div data-testid="inert-fallback">Feature Disabled</div>}
        >
          <div>Hint Ladder Active</div>
        </FeatureGate>
      </FlagProvider>
    );

    expect(screen.queryByText('Hint Ladder Active')).toBeNull();
    expect(screen.getByTestId('inert-fallback')).toBeInTheDocument();
  });
});
