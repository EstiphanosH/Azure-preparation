import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Disclaimer } from './Disclaimer.tsx';

describe('Disclaimer Component Contract', () => {
  it('strictly contains the mandatory text "Unofficial — not affiliated with Microsoft"', () => {
    render(<Disclaimer />);
    const footerElement = screen.getByTestId('unofficial-footer');
    expect(footerElement).toBeInTheDocument();
    expect(footerElement.textContent).toContain('Unofficial — not affiliated with Microsoft');
  });

  it('contains zero proprietary vendor assets or trademark insignias', () => {
    const { container } = render(<Disclaimer />);
    const html = container.innerHTML.toLowerCase();
    expect(html).not.toMatch(/brand[-_\s]?asset/i);
    expect(html).not.toMatch(/trademark[-_\s]?badge/i);
  });
});
