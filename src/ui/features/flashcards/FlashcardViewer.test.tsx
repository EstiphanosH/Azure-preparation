/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FlashcardViewer } from './FlashcardViewer.tsx';
import { resetFlashcardMastery } from '../../../domain/flashcards/flashcardDeck.ts';

describe('FlashcardViewer Component', () => {
  beforeEach(() => {
    resetFlashcardMastery();
  });

  it('renders flashcard deck with domain tabs and mastery tracker', () => {
    render(<FlashcardViewer />);

    expect(screen.getByText(/AZ-900 High-Yield Flashcards/i)).toBeInTheDocument();
    expect(screen.getByText(/40 CORE CONCEPTS/i)).toBeInTheDocument();
    expect(screen.getByText(/All Domains \(40\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Cloud Concepts \(13\)/i)).toBeInTheDocument();
  });

  it('flips card to reveal definition and exam tips when clicked', () => {
    render(<FlashcardViewer />);

    // Initially front side shows "Click to reveal definition"
    expect(screen.getByText(/reveal definition/i)).toBeInTheDocument();

    // Click flip button
    const flipButton = screen.getByTestId('flip-action-btn');
    fireEvent.click(flipButton);

    // Back side should reveal EXAM TIP and SCENARIO NOTE
    expect(screen.getByText(/EXAM TIP/i)).toBeInTheDocument();
    expect(screen.getByText(/SCENARIO NOTE/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Key Architectural Differentiators/i).length).toBeGreaterThanOrEqual(1);
  });

  it('navigates to next and previous flashcards', () => {
    render(<FlashcardViewer />);

    expect(screen.getByText(/Card 1 of 40/i)).toBeInTheDocument();

    const nextBtn = screen.getByRole('button', { name: /Next \(→\)/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText(/Card 2 of 40/i)).toBeInTheDocument();

    const prevBtn = screen.getByRole('button', { name: /Previous \(←\)/i });
    fireEvent.click(prevBtn);

    expect(screen.getByText(/Card 1 of 40/i)).toBeInTheDocument();
  });

  it('marks card as mastered and updates progress', () => {
    render(<FlashcardViewer />);

    const markBtn = screen.getByRole('button', { name: /Mark as Mastered/i });
    fireEvent.click(markBtn);

    expect(screen.getByTestId('mastery-progress-label')).toHaveTextContent(
      'Mastery: 1 / 40 cards (3%)'
    );
  });
});
