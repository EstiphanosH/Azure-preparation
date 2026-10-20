import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input.tsx';

describe('Input Component A11y & Behavior', () => {
  it('correctly associates label with input element via htmlFor and id', () => {
    render(<Input id="test-email" label="Candidate Email" value="" onChange={() => {}} />);
    const input = screen.getByLabelText(/Candidate Email/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('id', 'test-email');
  });

  it('sets aria-invalid="true" and connects error message via aria-describedby', () => {
    render(
      <Input
        id="test-pass"
        label="Password"
        value=""
        onChange={() => {}}
        errorMessage="Password must contain an uppercase letter."
      />
    );
    const input = screen.getByLabelText(/Password/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'test-pass-error');

    const alertMessage = screen.getByRole('alert');
    expect(alertMessage.textContent).toContain('Password must contain an uppercase letter.');
  });
});
