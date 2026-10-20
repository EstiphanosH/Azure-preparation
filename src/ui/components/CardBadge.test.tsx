import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card } from './Card.tsx';
import { Badge } from './Badge.tsx';

describe('Card and Badge Components', () => {
  it('renders Card with semantic section or article tag', () => {
    const { container } = render(<Card as="article">Diagnostic Card Content</Card>);
    const article = container.querySelector('article');
    expect(article).toBeInTheDocument();
    expect(article?.textContent).toContain('Diagnostic Card Content');
  });

  it('renders Badge with correct variant classes and accessible text', () => {
    render(<Badge variant="success">READY</Badge>);
    const badge = screen.getByText('READY');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('text-emerald-300');
  });
});
