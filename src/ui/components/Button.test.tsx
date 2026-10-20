import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button.tsx';

describe('Button Component A11y & Behavior', () => {
  it('renders happy state with label and triggers click handler', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit Answer</Button>);
    const btn = screen.getByRole('button', { name: /Submit Answer/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders loading state with aria-busy="true" and disabled attributes', () => {
    render(<Button isLoading>Save Data</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(btn).toBeDisabled();
    expect(btn.textContent).toContain('Loading...');
  });

  it('renders disabled state with aria-disabled="true"', () => {
    render(<Button disabled>Disabled Action</Button>);
    const btn = screen.getByRole('button', { name: /Disabled Action/i });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-disabled', 'true');
  });
});
